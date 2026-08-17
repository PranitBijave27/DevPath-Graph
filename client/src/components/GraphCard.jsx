const nodeClass = {
  JobRole: "node-role",
  Skill: "node-skill",
  Project: "node-project",
  Company: "node-company"
};

export default function GraphCard({ nodes, role }) {
  const visible = nodes?.slice(0, 18) || [];

  return (
    <div className="graph-card">
      <div className="section-heading">
        <div>
          <span className="eyebrow">CONNECTED GRAPH</span>
          <h2>{role}</h2>
        </div>
        <span className="pill">{visible.length} nodes</span>
      </div>

      <div className="graph-canvas">
        {visible.length === 0 ? (
          <div className="empty-state">No graph nodes found for this role.</div>
        ) : (
          <div className="node-cloud">
            {visible.map((node, index) => (
              <div
                className={`graph-node ${nodeClass[node.label] || ""}`}
                key={`${node.label}-${node.name}-${index}`}
              >
                <span>{node.label}</span>
                <strong>{node.name}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

      <p className="graph-note">
        The graph view surfaces the nodes reached from the selected role.
        The detailed panels below show the exact relationship traversals.
      </p>
    </div>
  );
}
