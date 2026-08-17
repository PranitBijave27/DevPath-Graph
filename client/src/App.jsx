import { useEffect, useMemo, useState } from "react";
import { api } from "./api";
import StatCard from "./components/StatCard";
import GraphCard from "./components/GraphCard";
import DetailPanel from "./components/DetailPanel";

function App() {
  const [roles, setRoles] = useState([]);
  const [overview, setOverview] = useState([]);
  const [selectedRole, setSelectedRole] = useState("Backend Developer");
  const [details, setDetails] = useState(null);
  const [graph, setGraph] = useState([]);
  const [query, setQuery] = useState("");
  const [skillResults, setSkillResults] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [skillDetails, setSkillDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([api.roles(), api.overview()])
      .then(([roleData, overviewData]) => {
        setRoles(roleData);
        setOverview(overviewData.counts);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!selectedRole) return;

    setRoleLoading(true);
    setError("");

    Promise.all([api.role(selectedRole), api.graph(selectedRole)])
      .then(([roleData, graphData]) => {
        setDetails(roleData);
        setGraph(graphData);
      })
      .catch((err) => setError(err.message))
      .finally(() => setRoleLoading(false));
  }, [selectedRole]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (!query.trim()) {
        setSkillResults([]);
        return;
      }

      api.skillSearch(query)
        .then(setSkillResults)
        .catch(() => setSkillResults([]));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const stats = useMemo(() => {
    const map = Object.fromEntries(overview.map((item) => [item.label, item.count]));
    return {
      roles: map.JobRole || 0,
      skills: map.Skill || 0,
      projects: map.Project || 0,
      companies: map.Company || 0
    };
  }, [overview]);

  async function openSkill(name) {
    setSelectedSkill(name);
    setQuery("");
    setSkillResults([]);

    try {
      setSkillDetails(await api.skill(name));
    } catch (err) {
      setError(err.message);
    }
  }

  if (loading) {
    return <div className="page-shell center-screen"><div className="loader" /></div>;
  }

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark">D</div>
          <div>
            <strong>DevPath</strong>
            <span>Career intelligence as a graph</span>
          </div>
        </div>
        <div className="status"><i /> CognoDB connected</div>
      </header>

      <main>
        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">DEVELOPER CAREER GRAPH</span>
            <h1>See the connections<br /><em>behind the skills.</em></h1>
            <p>
              Explore how skills, projects, roles and companies connect.
              Choose a target role and let the graph reveal the next skills to learn.
            </p>

            <div className="role-picker">
              <label htmlFor="role">Target role</label>
              <select
                id="role"
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
              >
                {roles.map((role) => (
                  <option key={role.name} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="hero-visual">
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="hero-node main">ROLE<strong>{selectedRole}</strong></div>
            <div className="hero-node n1">SKILL<strong>Node.js</strong></div>
            <div className="hero-node n2">SKILL<strong>REST APIs</strong></div>
            <div className="hero-node n3">PROJECT<strong>Movie Booking API</strong></div>
            <div className="hero-node n4">COMPANY<strong>NovaPay</strong></div>
          </div>
        </section>

        <section className="stats">
          <StatCard label="Job roles" value={stats.roles} hint="career paths" />
          <StatCard label="Skills" value={stats.skills} hint="connected concepts" />
          <StatCard label="Projects" value={stats.projects} hint="learning by building" />
          <StatCard label="Companies" value={stats.companies} hint="hiring relationships" />
        </section>

        {error && (
          <div className="error-banner">
            <strong>Connection issue</strong>
            <span>{error}</span>
          </div>
        )}

        <section className="workspace">
          <div className="workspace-main">
            {roleLoading ? (
              <div className="loading-card"><div className="loader" />Loading graph relationships…</div>
            ) : details ? (
              <>
                <GraphCard nodes={graph} role={details.role.name} />

                <div className="two-column">
                  <DetailPanel eyebrow="DIRECT RELATIONSHIP" title="Required skills">
                    <p className="panel-copy">
                      Skills directly connected to <strong>{details.role.name}</strong>.
                    </p>
                    <div className="tag-list">
                      {details.role.skills.map((skill) => (
                        <button className="skill-tag" key={skill.name} onClick={() => openSkill(skill.name)}>
                          {skill.name}
                          <small>{skill.category}</small>
                        </button>
                      ))}
                    </div>
                  </DetailPanel>

                  <DetailPanel eyebrow="2-HOP TRAVERSAL" title="Related skills">
                    <p className="panel-copy">
                      Reached by traversing <strong>Role → Skill → Related Skill</strong>.
                    </p>
                    <div className="tag-list">
                      {details.relatedSkills.slice(0, 12).map((skill) => (
                        <button className="skill-tag secondary" key={skill.skill} onClick={() => openSkill(skill.skill)}>
                          {skill.skill}
                          <small>{skill.difficulty}</small>
                        </button>
                      ))}
                    </div>
                  </DetailPanel>
                </div>

                <DetailPanel eyebrow="GRAPH RECOMMENDATION" title="Projects worth building">
                  <p className="panel-copy">
                    Projects connected to this role through the skills it requires.
                  </p>
                  <div className="project-grid">
                    {details.projects.map((project) => (
                      <article className="project-card" key={project.project}>
                        <div className="project-icon">↗</div>
                        <h4>{project.project}</h4>
                        <p>{project.description}</p>
                        <div className="mini-tags">
                          {project.matchingSkills.map((skill) => <span key={skill}>{skill}</span>)}
                        </div>
                      </article>
                    ))}
                  </div>
                </DetailPanel>

                <DetailPanel eyebrow="HIRING RELATIONSHIP" title="Companies">
                  <div className="company-grid">
                    {details.role.companies.map((company) => (
                      <div className="company-row" key={company.name}>
                        <div className="company-logo">{company.name.slice(0, 1)}</div>
                        <div>
                          <strong>{company.name}</strong>
                          <span>{company.industry}</span>
                        </div>
                        <span className="arrow">→</span>
                      </div>
                    ))}
                  </div>
                </DetailPanel>
              </>
            ) : (
              <div className="empty-state">Select a role to explore the graph.</div>
            )}
          </div>

          <aside className="sidebar">
            <DetailPanel eyebrow="GLOBAL SEARCH" title="Find a skill">
              <div className="search-box">
                <span>⌕</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="e.g. Docker"
                />
              </div>

              {skillResults.length > 0 && (
                <div className="search-results">
                  {skillResults.map((skill) => (
                    <button key={skill.name} onClick={() => openSkill(skill.name)}>
                      <strong>{skill.name}</strong>
                      <span>{skill.category} · {skill.difficulty}</span>
                    </button>
                  ))}
                </div>
              )}

              {selectedSkill && skillDetails && (
                <div className="skill-focus">
                  <div className="focus-title">
                    <span>SKILL</span>
                    <strong>{skillDetails.name}</strong>
                  </div>
                  <p>{skillDetails.description}</p>

                  <small>RELATED</small>
                  <div className="mini-tags">
                    {skillDetails.relatedSkills.filter(Boolean).slice(0, 8).map((skill) => (
                      <span key={skill.name}>{skill.name}</span>
                    ))}
                  </div>

                  <small>USED BY ROLES</small>
                  <div className="role-list">
                    {skillDetails.roles.map((role) => <span key={role}>{role}</span>)}
                  </div>
                </div>
              )}
            </DetailPanel>

            <div className="why-card">
              <span className="eyebrow">WHY GRAPH?</span>
              <h3>Relationships are the product.</h3>
              <p>
                A relational schema can store these entities. The graph earns its place
                when the application needs to navigate the relationships between them.
              </p>
              <div className="path-demo">
                <span>ROLE</span><b>→</b><span>SKILL</span><b>→</b><span>RELATED</span>
              </div>
            </div>
          </aside>
        </section>
      </main>

      <footer>
        <span>DevPath · CognoDB / openCypher</span>
        <span>Built as a graph-first engineering demo</span>
      </footer>
    </div>
  );
}

export default App;
