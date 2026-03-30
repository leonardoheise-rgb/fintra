import { Link } from 'react-router-dom';

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
        <div className="hero-panel__topline">
          <div>
            <p className="hero-panel__eyebrow">Total net position</p>
            <p className="metric-value">{formatCurrency(snapshot.remainingBalance)}</p>
          </div>
          <div className="metric-inline">
            <span className="status-pill status-pill--success">
              {formatMonthLabel(snapshot.month)}
            </span>
            <span className="status-pill">
              {formatCurrency(snapshot.remainingBudget)} budget left
            </span>
          </div>
        </div>

        <div>
          <h1>Wealth in motion</h1>
          <p className="hero-panel__copy">
            Default budgets, live transaction totals, and monthly pacing now share the same source
            of truth.
          </p>
        </div>

        <div className="hero-panel__metrics-grid">
          <article className="hero-stat">
            <span className="hero-stat__label">Monthly allowance</span>
            <strong>{formatCurrency(snapshot.totalBudget)}</strong>
          </article>
          <article className="hero-stat">
            <span className="hero-stat__label">Monthly income</span>
            <strong>{formatCurrency(snapshot.totalIncome)}</strong>
          </article>
          <article className="hero-stat hero-stat--feature">
            <span className="hero-stat__label">Savings pace</span>
            <strong>{formatCurrency(snapshot.remainingBalance)}</strong>
          </article>
        </div>
      </div>

      <div className="hero-panel__actions">
        <div className="hero-panel__action-group">
          <Link className="secondary-button" to="/transactions">
            Open ledger
          </Link>
          <Link className="primary-button" to="/analytics">
            Monthly report
          </Link>
        </div>

        <div className="hero-stat">
          <span className="hero-stat__label">Net balance</span>
          <strong>{formatCurrency(snapshot.remainingBalance)}</strong>
        </div>
        <div className="hero-stat">
          <span className="hero-stat__label">Average monthly expenses</span>
          <strong>{formatCurrency(snapshot.averageMonthlyExpenses)}</strong>
        </div>
        <Link className="secondary-button" to="/budgets">
          Configure default budgets
        </Link>
      </div>
    </section>
  );
}
