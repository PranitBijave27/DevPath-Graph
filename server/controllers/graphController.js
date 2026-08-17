import { runQuery } from "../config/db.js";

function values(records) {
  return records.map((record) => record.toObject());
}

export async function health(req, res) {
  try {
    await runQuery("RETURN 1 AS ok");
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    console.error(error);
    res.status(503).json({
      status: "error",
      database: "unavailable",
      message: "Graph database is currently unavailable."
    });
  }
}

export async function overview(req, res) {
  const records = await runQuery(`
    MATCH (n)
    RETURN labels(n)[0] AS label, count(n) AS count
    ORDER BY label
  `);

  res.json({
    counts: values(records).map((r) => ({
      label: r.label,
      count: r.count.toNumber ? r.count.toNumber() : r.count
    }))
  });
}

export async function roles(req, res) {
  const records = await runQuery(`
    MATCH (j:JobRole)
    RETURN j.name AS name, j.level AS level, j.description AS description
    ORDER BY j.name
  `);

  res.json(values(records));
}

export async function roleDetails(req, res) {
  const role = req.params.role;

  const [roleRecords, relatedRecords, projectRecords] = await Promise.all([
    runQuery(`
      MATCH (j:JobRole {name: $role})
      OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
      OPTIONAL MATCH (c:Company)-[:HIRES_FOR]->(j)
      RETURN j.name AS name,
             j.level AS level,
             j.description AS description,
             collect(DISTINCT s { .name, .category, .difficulty }) AS skills,
             collect(DISTINCT c { .name, .industry }) AS companies
    `, { role }),

    runQuery(`
      MATCH (j:JobRole {name: $role})
            -[:REQUIRES]->(s:Skill)
            -[:RELATED_TO]->(related:Skill)
      RETURN DISTINCT related.name AS skill,
             related.category AS category,
             related.difficulty AS difficulty
      ORDER BY category, skill
    `, { role }),

    runQuery(`
      MATCH (j:JobRole {name: $role})
            -[:REQUIRES]->(s:Skill)
            <-[:USES]-(p:Project)
      RETURN p.name AS project,
             p.description AS description,
             collect(DISTINCT s.name) AS matchingSkills
      ORDER BY size(matchingSkills) DESC, project
    `, { role })
  ]);

  if (roleRecords.length === 0 || roleRecords[0].get("name") === null) {
    return res.status(404).json({ message: "Job role not found." });
  }

  const roleData = roleRecords[0].toObject();

  res.json({
    role: roleData,
    relatedSkills: values(relatedRecords),
    projects: values(projectRecords)
  });
}

export async function searchSkills(req, res) {
  const search = String(req.query.q || "").trim();

  if (!search) {
    return res.json([]);
  }

  const records = await runQuery(`
    MATCH (s:Skill)
    WHERE toLower(s.name) CONTAINS toLower($search)
    RETURN s.name AS name,
           s.category AS category,
           s.difficulty AS difficulty
    ORDER BY s.name
    LIMIT 12
  `, { search });

  res.json(values(records));
}

export async function skillDetails(req, res) {
  const skill = req.params.skill;

  const records = await runQuery(`
    MATCH (s:Skill {name: $skill})
    OPTIONAL MATCH (s)-[:RELATED_TO]-(related:Skill)
    OPTIONAL MATCH (j:JobRole)-[:REQUIRES]->(s)
    RETURN s.name AS name,
           s.category AS category,
           s.difficulty AS difficulty,
           s.description AS description,
           collect(DISTINCT related { .name, .category, .difficulty }) AS relatedSkills,
           collect(DISTINCT j.name) AS roles
  `, { skill });

  if (records.length === 0 || records[0].get("name") === null) {
    return res.status(404).json({ message: "Skill not found." });
  }

  res.json(records[0].toObject());
}

export async function graphForRole(req, res) {
  const role = req.params.role;

  const records = await runQuery(`
    MATCH (j:JobRole {name: $role})
    OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
    OPTIONAL MATCH (s)-[:RELATED_TO]->(related:Skill)
    WITH j,
         collect(DISTINCT j.name) +
         collect(DISTINCT s.name) +
         collect(DISTINCT related.name) AS names
    UNWIND names AS name
    WITH DISTINCT name
    MATCH (n)
    WHERE n.name = name
    RETURN labels(n)[0] AS label, n.name AS name
    ORDER BY label, name
    LIMIT 40
  `, { role });

  res.json(values(records));
}

export function errorHandler(error, req, res, next) {
  console.error(error);

  res.status(500).json({
    message: "Something went wrong while querying the graph.",
    detail: process.env.NODE_ENV === "production" ? undefined : error.message
  });
}
