import { useEffect, useMemo, useState } from 'react';

import { translateAppText } from '../../../shared/i18n/appText';
import { getCurrentMonthKey } from '../../../shared/lib/date/months';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { useDisplayPreferences } from '../../settings/useDisplayPreferences';
import { sortTransactionsByDateDesc } from '../../finance/lib/financeSelectors';
import { useFinanceData } from '../../finance/useFinanceData';
import { AvailableBalancePanel } from '../components/AvailableBalancePanel';
import { BudgetHighlights } from '../components/BudgetHighlights';
import { InsightsPanel } from '../components/InsightsPanel';
import { RecentTransactionsPanel } from '../components/RecentTransactionsPanel';
import { buildDashboardSnapshot } from '../lib/buildDashboardSnapshot';

export function DashboardPage() {
  const financeData = useFinanceData();
  const {
    preferences: { monthStartDay },
  } = useDisplayPreferences();
  const currentMonth = useMemo(() => getCurrentMonthKey(new Date(), monthStartDay), [monthStartDay]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  useEffect(() => {
    setSelectedMonth(currentMonth);
  }, [currentMonth]);

  if (financeData.status === 'loading') {
    return (
      <section aria-live="polite" className="finance-panel">
        <p className="finance-empty-state">{translateAppText('dashboard.loading')}</p>
      </section>
    );
  }

  const snapshot = buildDashboardSnapshot(
    {
      categories: financeData.categories,
      budgets: financeData.budgets,
      budgetOverrides: financeData.budgetOverrides,
      transactions: financeData.transactions,
      setAsides: financeData.setAsides,
    },
    selectedMonth,
    monthStartDay,
  );
  const recentTransactions = sortTransactionsByDateDesc(financeData.transactions);
  const overdrawnCategory =
    snapshot.categoryAvailability.find((category) => category.available < 0) ?? null;

  return (
    <div className="dashboard-page">
      <section className="finance-panel dashboard-toolbar dashboard-toolbar--compact">
        <label className="finance-field dashboard-toolbar__field">
          <span>{translateAppText('dashboard.selectedMonth')}</span>
          <input
            name="dashboardMonth"
            onChange={(event) => setSelectedMonth(event.target.value)}
            type="month"
            value={selectedMonth}
          />
        </label>
      </section>

      {financeData.errorMessage ? (
        <section aria-live="assertive" className="finance-panel">
          <p className="finance-message finance-message--error" role="alert">
            {financeData.errorMessage}
          </p>
        </section>
      ) : null}

      {overdrawnCategory ? (
        <section className="finance-panel finance-panel--alert">
          <div className="finance-panel__heading">
            <div>
              <p className="finance-panel__eyebrow">{translateAppText('dashboard.needsAttention')}</p>
              <h2>{overdrawnCategory.name}</h2>
            </div>
          </div>
          <p className="finance-header__copy">
            {overdrawnCategory.name} is over budget by {formatCurrency(Math.abs(overdrawnCategory.available))}.
          </p>
        </section>
      ) : null}

      <AvailableBalancePanel snapshot={snapshot} />
      <InsightsPanel insight={snapshot.insight} />
      <BudgetHighlights cards={snapshot.cards} month={selectedMonth} />
      <RecentTransactionsPanel
        categories={financeData.categories}
        subcategories={financeData.subcategories}
        transactions={recentTransactions}
      />
    </div>
  );
}
