import { translateAppText } from '../../../shared/i18n/appText';

type InsightsPanelProps = {
  insight: string;
};

export function InsightsPanel({ insight }: InsightsPanelProps) {
  return (
    <section className="insight-panel" aria-labelledby="insight-title">
      <div>
        <p className="section-heading__eyebrow">{translateAppText('dashboard.forwardSignal')}</p>
        <h3 id="insight-title">{translateAppText('dashboard.architecturalInsight')}</h3>
      </div>
      <p className="insight-panel__copy">{insight}</p>
    </section>
  );
}
