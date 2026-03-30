import { Link } from 'react-router-dom';

import { translateAppText } from '../../../shared/i18n/appText';
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
            <p className="hero-panel__eyebrow">{translateAppText('dashboard.totalNetPosition')}</p>
            <p className="metric-value">{formatCurrency(snapshot.remainingBalance)}</p>
          </div>
          <div className="metric-inline">
            <span className="status-pill status-pill--success">
              {formatMonthLabel(snapshot.month)}
            </span>
            <span className="status-pill">
              {translateAppText('dashboard.budgetLeft', {
                amount: formatCurrency(snapshot.remainingBudget),
              })}
            </span>
          </div>
        </div>

        <div>
          <h1>{translateAppText('dashboard.heroTitle')}</h1>
          <p className="hero-panel__copy">{translateAppText('dashboard.heroCopy')}</p>
        </div>

        <div className="hero-panel__metrics-grid">
          <article className="hero-stat">
            <span className="hero-stat__label">{translateAppText('dashboard.monthlyAllowance')}</span>
            <strong>{formatCurrency(snapshot.totalBudget)}</strong>
          </article>
          <article className="hero-stat">
            <span className="hero-stat__label">{translateAppText('dashboard.monthlyIncome')}</span>
            <strong>{formatCurrency(snapshot.totalIncome)}</strong>
          </article>
          <article className="hero-stat hero-stat--feature">
            <span className="hero-stat__label">{translateAppText('dashboard.savingsPace')}</span>
            <strong>{formatCurrency(snapshot.remainingBalance)}</strong>
          </article>
        </div>
      </div>

      <div className="hero-panel__actions">
        <div className="hero-panel__action-group">
          <Link className="secondary-button" to="/transactions">
            {translateAppText('dashboard.openLedger')}
          </Link>
          <Link className="primary-button" to="/analytics">
            {translateAppText('dashboard.monthlyReport')}
          </Link>
        </div>

        <div className="hero-stat">
          <span className="hero-stat__label">{translateAppText('dashboard.netBalance')}</span>
          <strong>{formatCurrency(snapshot.remainingBalance)}</strong>
        </div>
        <div className="hero-stat">
          <span className="hero-stat__label">{translateAppText('dashboard.averageMonthlyExpenses')}</span>
          <strong>{formatCurrency(snapshot.averageMonthlyExpenses)}</strong>
        </div>
        <Link className="secondary-button" to="/budgets">
          {translateAppText('dashboard.configureBudgets')}
        </Link>
      </div>
    </section>
  );
}
