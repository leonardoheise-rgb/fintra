import { useState } from 'react';

import { getCurrentMonthKey } from '../../../shared/lib/date/months';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { CategoriesSummaryCard } from '../../finance/components/CategoriesSummaryCard';
import { useFinanceData } from '../../finance/useFinanceData';
import { BudgetHighlights } from '../components/BudgetHighlights';
import { HeroSummary } from '../components/HeroSummary';
import { InsightsPanel } from '../components/InsightsPanel';
import { buildDashboardSnapshot } from '../lib/buildDashboardSnapshot';

export function DashboardPage() {
  const financeData = useFinanceData();
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());

  if (financeData.status === 'loading') {
    return (
      <section className="finance-panel">
        <p className="finance-empty-state">Loading dashboard...</p>
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

  return (
    <div className="dashboard-page">
      <section className="finance-panel dashboard-toolbar">
        <div>
          <p className="finance-panel__eyebrow">Monthly scope</p>
          <h2>Financial overview</h2>
        </div>
        <label className="finance-field dashboard-toolbar__field">
          <span>Selected month</span>
          <input
            name="dashboardMonth"
            onChange={(event) => setSelectedMonth(event.target.value)}
            type="month"
            value={selectedMonth}
          />
        </label>
      </section>

      {financeData.errorMessage ? (
        <section className="finance-panel">
          <p className="finance-message finance-message--error">{financeData.errorMessage}</p>
        </section>
      ) : null}

      <HeroSummary snapshot={snapshot} />

      <section className="finance-summary-grid" aria-label="Dashboard summary">
        <CategoriesSummaryCard
          label="Default budget"
          value={formatCurrency(snapshot.totalBudget)}
        />
        <CategoriesSummaryCard label="Income" value={formatCurrency(snapshot.totalIncome)} />
        <CategoriesSummaryCard label="Expenses" value={formatCurrency(snapshot.totalExpenses)} />
        <CategoriesSummaryCard
          label="Net balance"
          value={formatCurrency(snapshot.remainingBalance)}
        />
      </section>

      <BudgetHighlights cards={snapshot.cards} />
      <InsightsPanel insight={snapshot.insight} />
    </div>
  );
}
