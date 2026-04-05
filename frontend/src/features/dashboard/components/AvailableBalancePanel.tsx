import { translateAppText } from '../../../shared/i18n/appText';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import type { DashboardSnapshot } from '../dashboard.types';

type AvailableBalancePanelProps = {
  snapshot: DashboardSnapshot;
};

export function AvailableBalancePanel({ snapshot }: AvailableBalancePanelProps) {
  return (
    <section className="hero-panel available-balance-panel" aria-labelledby="available-balance-title">
      <div className="available-balance-panel__header">
        <div>
          <h2 id="available-balance-title">{translateAppText('dashboard.totalNetPosition')}</h2>
          <p className="metric-value">{formatCurrency(snapshot.totalAvailable)}</p>
        </div>
      </div>

      <div className="available-balance-panel__section">
        <div className="available-balance-list">
          <div className="available-balance-list__item">
            <span>{translateAppText('dashboard.defaultBudget')}</span>
            <strong className="available-balance-list__amount">
              {formatCurrency(snapshot.totalBudget)}
            </strong>
          </div>
          <div className="available-balance-list__item">
            <span>{translateAppText('dashboard.expenses')}</span>
            <strong className="available-balance-list__amount">
              {formatCurrency(snapshot.totalExpenses)}
            </strong>
          </div>
          <div className="available-balance-list__item">
            <span>{translateAppText('setAsides.listHeading')}</span>
            <strong className="available-balance-list__amount">
              {formatCurrency(snapshot.totalReserved)}
            </strong>
          </div>
        </div>
      </div>
    </section>
  );
}
