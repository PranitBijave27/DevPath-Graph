import neo4j from "neo4j-driver";
import "dotenv/config";

const driver = neo4j.driver(
  process.env.COGNODB_URI,
  neo4j.auth.basic(
    process.env.COGNODB_USERNAME,
    process.env.COGNODB_PASSWORD
  )
);

const skills = [
  ["JavaScript", "Language", "Beginner", "Core language for modern web applications."],
  ["TypeScript", "Language", "Intermediate", "Typed superset of JavaScript used for scalable applications."],
  ["Node.js", "Runtime", "Intermediate", "JavaScript runtime commonly used for backend services."],
  ["Express.js", "Framework", "Intermediate", "Minimal Node.js framework for HTTP APIs."],
  ["REST APIs", "Backend", "Intermediate", "Resource-oriented HTTP API design."],
  ["MongoDB", "Database", "Intermediate", "Document database useful for flexible application data."],
  ["SQL", "Database", "Intermediate", "Declarative language for relational databases."],
  ["PostgreSQL", "Database", "Intermediate", "Relational database with strong SQL support."],
  ["Redis", "Infrastructure", "Intermediate", "In-memory data store used for caching and fast lookups."],
  ["Docker", "DevOps", "Intermediate", "Containerization platform for reproducible deployments."],
  ["Kubernetes", "DevOps", "Advanced", "Container orchestration platform."],
  ["Git", "Tools", "Beginner", "Version control system used by software teams."],
  ["System Design", "Architecture", "Advanced", "Design of reliable and scalable software systems."],
  ["Data Structures", "Computer Science", "Intermediate", "Core structures used to organize and access data."],
  ["Algorithms", "Computer Science", "Intermediate", "Procedures for solving computational problems."],
  ["Graph Theory", "Computer Science", "Advanced", "Study of nodes, edges and network relationships."],
  ["Authentication", "Security", "Intermediate", "Identity verification for applications and APIs."],
  ["JWT", "Security", "Intermediate", "Token format commonly used for stateless authentication."],
  ["Testing", "Engineering", "Intermediate", "Practices for verifying application correctness."],
  ["CI/CD", "DevOps", "Intermediate", "Automated build, test and deployment workflows."],
  ["AWS", "Cloud", "Intermediate", "Cloud platform used to deploy and operate applications."],
  ["Python", "Language", "Beginner", "General-purpose language used across backend and data workloads."],
  ["FastAPI", "Framework", "Intermediate", "Python framework for building APIs."],
  ["Java", "Language", "Intermediate", "General-purpose language widely used in enterprise systems."],
  ["Spring Boot", "Framework", "Intermediate", "Java framework for production backend services."]
];

const roles = [
  ["Backend Developer", "Entry / Mid", "Builds APIs, services, business logic and backend infrastructure."],
  ["Full Stack Developer", "Entry / Mid", "Builds both client-facing interfaces and backend services."],
  ["Software Engineer", "Entry / Mid", "Designs, implements and maintains production software."],
  ["DevOps Engineer", "Mid", "Automates deployment, infrastructure and software delivery."],
  ["Cloud Engineer", "Mid", "Builds and operates cloud infrastructure and services."],
  ["Data Engineer", "Entry / Mid", "Builds reliable pipelines and systems for data processing."],
  ["Frontend Developer", "Entry / Mid", "Builds interactive user interfaces for web applications."],
  ["Platform Engineer", "Mid", "Builds internal platforms and infrastructure used by engineering teams."]
];

const companies = [
  ["NovaPay", "FinTech"],
  ["CloudCart", "E-commerce"],
  ["Orbit Systems", "SaaS"],
  ["DataForge", "Data Platform"],
  ["ShipFast", "Logistics"],
  ["HealthStack", "HealthTech"],
  ["ScaleGrid", "Cloud Infrastructure"],
  ["BrightLabs", "Developer Tools"]
];

const projects = [
  ["Movie Booking API", "Transactional backend for theaters, shows, seats and bookings.", ["Node.js", "Express.js", "MongoDB", "REST APIs", "JWT"]],
  ["Realtime Chat", "WebSocket-based chat service with authentication and caching.", ["Node.js", "Express.js", "Redis", "Authentication", "Testing"]],
  ["E-commerce Platform", "Full-stack store with catalog, orders and customer accounts.", ["JavaScript", "Node.js", "PostgreSQL", "REST APIs", "Docker"]],
  ["Cloud Deployment Pipeline", "Containerized CI/CD pipeline for deploying web services.", ["Docker", "Kubernetes", "AWS", "CI/CD", "Git"]],
  ["Analytics Data Pipeline", "Service that ingests, transforms and stores operational events.", ["Python", "PostgreSQL", "Docker", "Testing"]],
  ["Developer Portal", "Internal portal for service documentation and API discovery.", ["TypeScript", "Node.js", "REST APIs", "React"]],
  ["URL Shortener", "Scalable service that maps short URLs to destinations.", ["Node.js", "Redis", "PostgreSQL", "Docker", "System Design"]],
  ["Learning Tracker", "Application that tracks learning goals, skills and projects.", ["JavaScript", "Express.js", "MongoDB", "REST APIs"]]
];

const requires = {
  "Backend Developer": ["Node.js", "Express.js", "REST APIs", "SQL", "Authentication", "Git", "Testing", "Data Structures"],
  "Full Stack Developer": ["JavaScript", "Node.js", "Express.js", "REST APIs", "MongoDB", "Git", "Testing"],
  "Software Engineer": ["Data Structures", "Algorithms", "Git", "Testing", "System Design", "Java", "SQL"],
  "DevOps Engineer": ["Docker", "Kubernetes", "CI/CD", "AWS", "Linux", "Git"],
  "Cloud Engineer": ["AWS", "Docker", "Kubernetes", "System Design", "CI/CD", "Git"],
  "Data Engineer": ["Python", "SQL", "PostgreSQL", "Docker", "Testing", "Algorithms"],
  "Frontend Developer": ["JavaScript", "TypeScript", "Testing", "Git", "REST APIs"],
  "Platform Engineer": ["Docker", "Kubernetes", "AWS", "System Design", "CI/CD", "Go", "Git"]
};

// Skills referenced only by role relationships above are added as lightweight nodes.
const extraSkills = [
  ["Linux", "Infrastructure", "Intermediate", "Operating system fundamentals for servers and development environments."],
  ["React", "Frontend", "Intermediate", "Library for building component-based user interfaces."],
  ["Go", "Language", "Intermediate", "Compiled language often used for infrastructure and backend systems."]
];

const relatedPairs = [
  ["JavaScript", "TypeScript"], ["JavaScript", "Node.js"], ["Node.js", "Express.js"],
  ["Express.js", "REST APIs"], ["REST APIs", "Authentication"], ["Authentication", "JWT"],
  ["Node.js", "Redis"], ["Node.js", "Docker"], ["Docker", "Kubernetes"],
  ["Kubernetes", "AWS"], ["Docker", "CI/CD"], ["Git", "CI/CD"],
  ["SQL", "PostgreSQL"], ["SQL", "PostgreSQL"], ["Python", "FastAPI"],
  ["PostgreSQL", "Docker"], ["System Design", "Docker"], ["System Design", "Kubernetes"],
  ["Data Structures", "Algorithms"], ["Algorithms", "Graph Theory"],
  ["Testing", "CI/CD"], ["TypeScript", "React"], ["Java", "Spring Boot"],
  ["Linux", "Docker"], ["Go", "Kubernetes"]
];

const roleCompanies = {
  "Backend Developer": ["NovaPay", "Orbit Systems", "ShipFast"],
  "Full Stack Developer": ["CloudCart", "BrightLabs"],
  "Software Engineer": ["NovaPay", "Orbit Systems", "HealthStack"],
  "DevOps Engineer": ["ScaleGrid", "ShipFast"],
  "Cloud Engineer": ["ScaleGrid", "Orbit Systems"],
  "Data Engineer": ["DataForge", "HealthStack"],
  "Frontend Developer": ["CloudCart", "BrightLabs"],
  "Platform Engineer": ["ScaleGrid", "BrightLabs"]
};

async function seed() {
  const session = driver.session();

  try {
    await session.run(`
      CREATE CONSTRAINT skill_name IF NOT EXISTS
      FOR (s:Skill) REQUIRE s.name IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT role_name IF NOT EXISTS
      FOR (j:JobRole) REQUIRE j.name IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT company_name IF NOT EXISTS
      FOR (c:Company) REQUIRE c.name IS UNIQUE
    `);
    await session.run(`
      CREATE CONSTRAINT project_name IF NOT EXISTS
      FOR (p:Project) REQUIRE p.name IS UNIQUE
    `);

    await session.run(
      `UNWIND $rows AS row
       MERGE (s:Skill {name: row[0]})
       SET s.category = row[1], s.difficulty = row[2], s.description = row[3]`,
      { rows: [...skills, ...extraSkills] }
    );

    await session.run(
      `UNWIND $rows AS row
       MERGE (j:JobRole {name: row[0]})
       SET j.level = row[1], j.description = row[2]`,
      { rows: roles }
    );

    await session.run(
      `UNWIND $rows AS row
       MERGE (c:Company {name: row[0]})
       SET c.industry = row[1]`,
      { rows: companies }
    );

    await session.run(
      `UNWIND $rows AS row
       MERGE (p:Project {name: row[0]})
       SET p.description = row[1]`,
      { rows: projects.map(([name, description]) => [name, description]) }
    );

    for (const [role, skillNames] of Object.entries(requires)) {
      await session.run(
        `MATCH (j:JobRole {name: $role})
         UNWIND $skills AS skillName
         MATCH (s:Skill {name: skillName})
         MERGE (j)-[:REQUIRES]->(s)`,
        { role, skills: skillNames.filter((name) => name !== "Data Engineering" && name !== "Go" && name !== "Linux" || true) }
      );
    }

    for (const [a, b] of relatedPairs) {
      // Ignore optional pairs whose node is not part of the seeded model.
      await session.run(
        `MATCH (a:Skill {name: $a}), (b:Skill {name: $b})
         MERGE (a)-[:RELATED_TO]->(b)
         MERGE (b)-[:RELATED_TO]->(a)`,
        { a, b }
      );
    }

    for (const [projectName, , skillNames] of projects) {
      await session.run(
        `MATCH (p:Project {name: $project})
         UNWIND $skills AS skillName
         MATCH (s:Skill {name: skillName})
         MERGE (p)-[:USES]->(s)`,
        { project: projectName, skills: skillNames }
      );
    }

    for (const [role, companyNames] of Object.entries(roleCompanies)) {
      await session.run(
        `MATCH (j:JobRole {name: $role})
         UNWIND $companies AS companyName
         MATCH (c:Company {name: companyName})
         MERGE (c)-[:HIRES_FOR]->(j)`,
        { role, companies: companyNames }
      );
    }

    console.log("DevPath graph seeded successfully.");
  } finally {
    await session.close();
    await driver.close();
  }
}

seed().catch((error) => {
  console.error("Seed failed:", error);
  process.exit(1);
});
