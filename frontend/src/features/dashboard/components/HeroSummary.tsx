import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import type { DashboardSnapshot } from '../dashboard.types';

type HeroSummaryProps = {
  snapshot: DashboardSnapshot;
};

export function HeroSummary({ snapshot }: HeroSummaryProps) {
  return (
    <section className="hero-panel">
      <div className="hero-panel__content">
        <div>
          <p className="hero-panel__eyebrow">Foundational dashboard preview</p>
          <h1>Wealth in motion</h1>
          <p className="hero-panel__copy">
            The first milestone establishes the shell, navigation, formatting utilities, and visual
            system that later finance workflows will plug into.
          </p>
        </div>

        <div className="hero-panel__metrics">
          <div>
            <p className="metric-label">Tracked monthly allowance</p>
            <p className="metric-value">{formatCurrency(snapshot.totalBudget)}</p>
          </div>
          <div className="metric-inline">
            <span className="status-pill status-pill--success">
              {formatMonthLabel(snapshot.month)}
            </span>
            <span className="status-pill">{formatCurrency(snapshot.remainingFunds)} remaining</span>
          </div>
        </div>
      </div>

      <div className="hero-panel__actions">
        <div className="hero-stat">
          <span className="hero-stat__label">Current delta</span>
          <strong>{formatCurrency(snapshot.currentDelta)}</strong>
        </div>
        <div className="hero-stat">
          <span className="hero-stat__label">Average monthly spend</span>
          <strong>{formatCurrency(snapshot.averageMonthlySpend)}</strong>
        </div>
        <button className="primary-button" type="button">
          Configure monthly plan
        </button>
      </div>
    </section>
  );
}
