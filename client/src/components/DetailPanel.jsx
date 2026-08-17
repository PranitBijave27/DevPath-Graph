export default function DetailPanel({ title, eyebrow, children }) {
  return (
    <section className="detail-panel">
      <span className="eyebrow">{eyebrow}</span>
      <h3>{title}</h3>
      {children}
    </section>
  );
}
