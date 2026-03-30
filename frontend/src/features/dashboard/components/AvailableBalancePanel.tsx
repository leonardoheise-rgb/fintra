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
          <p className="hero-panel__eyebrow">{translateAppText('dashboard.totalNetPosition')}</p>
          <p className="metric-value">{formatCurrency(snapshot.totalAvailable)}</p>
        </div>
      </div>

      <div className="available-balance-panel__section">
        <h3 id="available-balance-title">{translateAppText('dashboard.availableByCategory')}</h3>

        {snapshot.categoryAvailability.length === 0 ? (
          <p className="insight-panel__copy">{translateAppText('dashboard.noBudgets')}</p>
        ) : (
          <div className="available-balance-list">
            {snapshot.categoryAvailability.map((category) => (
              <div className="available-balance-list__item" key={category.id}>
                <span>{category.name}</span>
                <strong
                  className={
                    category.available < 0
                      ? 'available-balance-list__amount available-balance-list__amount--negative'
                      : 'available-balance-list__amount'
                  }
                >
                  {formatCurrency(category.available)}
                </strong>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
