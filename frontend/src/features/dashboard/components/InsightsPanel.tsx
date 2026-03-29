type InsightsPanelProps = {
  insight: string;
};

export function InsightsPanel({ insight }: InsightsPanelProps) {
  return (
    <section className="insight-panel" aria-labelledby="insight-title">
      <div>
        <p className="section-heading__eyebrow">Forward signal</p>
        <h3 id="insight-title">Architectural insight</h3>
      </div>
      <p className="insight-panel__copy">{insight}</p>
    </section>
  );
}
