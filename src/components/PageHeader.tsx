// The quieter hero every inner page opens with.
export function PageHeader({ kicker, title, lead }: { kicker: string; title: string; lead?: string }) {
  return (
    <section className="hero" style={{ paddingBlock: 'clamp(3rem, 7vw, 4.5rem)' }}>
      <div className="container rise">
        <span className="kicker">{kicker}</span>
        <h1>{title}</h1>
        {lead && <p className="lead">{lead}</p>}
      </div>
    </section>
  );
}
