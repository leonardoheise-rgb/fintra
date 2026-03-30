import { useState } from 'react';

import { translateAppText } from '../../../shared/i18n/appText';
import { getCurrentMonthKey } from '../../../shared/lib/date/months';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { CategoriesSummaryCard } from '../../finance/components/CategoriesSummaryCard';
import { sortTransactionsByDateDesc } from '../../finance/lib/financeSelectors';
import { useFinanceData } from '../../finance/useFinanceData';
import { AvailableBalancePanel } from '../components/AvailableBalancePanel';
import { BudgetHighlights } from '../components/BudgetHighlights';
import { InsightsPanel } from '../components/InsightsPanel';
import { RecentTransactionsPanel } from '../components/RecentTransactionsPanel';
import { buildDashboardSnapshot } from '../lib/buildDashboardSnapshot';

export function DashboardPage() {
  const financeData = useFinanceData();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

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
    },
    selectedMonth,
  );
  const recentTransactions = sortTransactionsByDateDesc(financeData.transactions);

  return (
    <div className="dashboard-page">
      <section className="finance-panel dashboard-toolbar">
        <div>
          <h2>{translateAppText('dashboard.financialOverview')}</h2>
        </div>
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

      <AvailableBalancePanel snapshot={snapshot} />

      <section className="finance-summary-grid" aria-label="Dashboard summary">
        <CategoriesSummaryCard
          label={translateAppText('dashboard.defaultBudget')}
          value={formatCurrency(snapshot.totalBudget)}
        />
        <CategoriesSummaryCard label={translateAppText('dashboard.income')} value={formatCurrency(snapshot.totalIncome)} />
        <CategoriesSummaryCard label={translateAppText('dashboard.expenses')} value={formatCurrency(snapshot.totalExpenses)} />
        <CategoriesSummaryCard
          label={translateAppText('dashboard.netBalance')}
          value={formatCurrency(snapshot.remainingBalance)}
        />
      </section>

      <section className="dashboard-main-grid">
        <BudgetHighlights cards={snapshot.cards} />
        <RecentTransactionsPanel
          categories={financeData.categories}
          subcategories={financeData.subcategories}
          transactions={recentTransactions}
        />
      </section>
      <InsightsPanel insight={snapshot.insight} />
    </div>
  );
}
