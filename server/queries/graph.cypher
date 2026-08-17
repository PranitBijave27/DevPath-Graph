// Overview
MATCH (n)
RETURN labels(n)[0] AS label, count(n) AS count
ORDER BY label;

// Roles
MATCH (j:JobRole)
RETURN j.name AS name, j.level AS level, j.description AS description
ORDER BY j.name;

// Role details
MATCH (j:JobRole {name: $role})
OPTIONAL MATCH (j)-[:REQUIRES]->(s:Skill)
OPTIONAL MATCH (c:Company)-[:HIRES_FOR]->(j)
RETURN j,
       collect(DISTINCT s { .name, .category, .difficulty }) AS skills,
       collect(DISTINCT c { .name, .industry }) AS companies;

// Multi-hop related skills
MATCH (j:JobRole {name: $role})
      -[:REQUIRES]->(s:Skill)
      -[:RELATED_TO]->(related:Skill)
RETURN DISTINCT related.name AS skill,
       related.category AS category,
       related.difficulty AS difficulty
ORDER BY category, skill;

// Projects matching a role through required skills
MATCH (j:JobRole {name: $role})
      -[:REQUIRES]->(s:Skill)
      <-[:USES]-(p:Project)
RETURN p.name AS project,
       p.description AS description,
       collect(DISTINCT s.name) AS matchingSkills
ORDER BY size(matchingSkills) DESC, project;

// Companies for a role
MATCH (c:Company)-[:HIRES_FOR]->(j:JobRole {name: $role})
RETURN c.name AS company, c.industry AS industry
ORDER BY company;

// Skill search
MATCH (s:Skill)
WHERE toLower(s.name) CONTAINS toLower($search)
RETURN s.name AS name, s.category AS category, s.difficulty AS difficulty
ORDER BY s.name
LIMIT 12;

// Skill details + adjacent skills
MATCH (s:Skill {name: $skill})
OPTIONAL MATCH (s)-[:RELATED_TO]-(related:Skill)
OPTIONAL MATCH (j:JobRole)-[:REQUIRES]->(s)
RETURN s,
       collect(DISTINCT related { .name, .category, .difficulty }) AS relatedSkills,
       collect(DISTINCT j.name) AS roles;

// Connected graph for visualization
MATCH (j:JobRole {name: $role})
OPTIONAL MATCH path=(j)-[:REQUIRES|RELATED_TO|USES|HIRES_FOR*1..2]-(connected)
WITH j, collect(DISTINCT connected)[0..30] AS nodes
UNWIND nodes AS n
RETURN DISTINCT labels(n)[0] AS label, n.name AS name;
