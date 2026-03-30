import { useDeferredValue, useMemo, useState } from 'react';

import { getCurrentMonthKey, shiftMonthKey } from '../../../shared/lib/date/months';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatPercentage } from '../../../shared/lib/formatters/percentage';
import { CategoriesSummaryCard } from '../../finance/components/CategoriesSummaryCard';
import { FinancePageHeader } from '../../finance/components/FinancePageHeader';
import { useFinanceData } from '../../finance/useFinanceData';
import type { AnalyticsRangePreset } from '../analytics.types';
import { AnalyticsComparisonPanel } from '../components/AnalyticsComparisonPanel';
import { AnalyticsTabBar } from '../components/AnalyticsTabBar';
import { CategoryTrendList } from '../components/CategoryTrendList';
import { MonthlyCashflowChart } from '../components/MonthlyCashflowChart';
import { SavingsRateChart } from '../components/SavingsRateChart';
import { getPresetLabel, resolveAnalyticsRange } from '../lib/analyticsRange';
import { buildAnalyticsComparison } from '../lib/buildAnalyticsComparison';
import { buildCategorySpendingTrends } from '../lib/buildCategorySpendingTrends';
import { buildMonthlyAnalyticsSeries } from '../lib/buildMonthlyAnalyticsSeries';

function sumValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function hasRangeActivity(monthlySeries: { income: number; expenses: number }[]) {
  return monthlySeries.some((point) => point.income > 0 || point.expenses > 0);
}

function buildAnalyticsInsight(
  currentMonthCategory: string | null,
  savingsRate: number,
  expenseDelta: number | null,
) {
  if (currentMonthCategory && expenseDelta !== null && expenseDelta > 0) {
    return `${currentMonthCategory} is your strongest spending lane right now, and total expenses are up ${formatCurrency(
      expenseDelta,
    )} versus the previous month.`;
  }

  if (savingsRate < 0) {
    return 'The selected range is running at a negative savings rate. Review the expense trend before the next month closes.';
  }

  return 'Income, expenses, and savings behavior are now mapped across historical months from the same live workspace data.';
}

export function AnalyticsPage() {
  const financeData = useFinanceData();
  const [activeTab, setActiveTab] = useState<'overview' | 'categories'>('overview');
  const [preset, setPreset] = useState<AnalyticsRangePreset>('3m');
  const [selectedEndMonth, setSelectedEndMonth] = useState(getCurrentMonthKey());
  const [customStartMonth, setCustomStartMonth] = useState(shiftMonthKey(getCurrentMonthKey(), -2));
  const [customEndMonth, setCustomEndMonth] = useState(getCurrentMonthKey());

  const analyticsRange = useMemo(
    () =>
      resolveAnalyticsRange({
        preset,
        endMonth: selectedEndMonth,
        customStartMonth,
        customEndMonth,
      }),
    [customEndMonth, customStartMonth, preset, selectedEndMonth],
  );
  const deferredRange = useDeferredValue(analyticsRange);
  const monthlySeries = useMemo(
    () =>
      buildMonthlyAnalyticsSeries({
        categories: financeData.categories,
        budgets: financeData.budgets,
        budgetOverrides: financeData.budgetOverrides,
        months: deferredRange.months,
        transactions: financeData.transactions,
      }),
    [
      deferredRange.months,
      financeData.budgetOverrides,
      financeData.budgets,
      financeData.categories,
      financeData.transactions,
    ],
  );
  const comparison = useMemo(
    () => buildAnalyticsComparison(monthlySeries),
    [monthlySeries],
  );
  const categoryTrends = useMemo(
    () =>
      buildCategorySpendingTrends({
        categories: financeData.categories,
        months: deferredRange.months,
        transactions: financeData.transactions,
      }),
    [deferredRange.months, financeData.categories, financeData.transactions],
  );
  const totalIncome = sumValues(monthlySeries.map((point) => point.income));
  const totalExpenses = sumValues(monthlySeries.map((point) => point.expenses));
  const averageSavingsRate = comparison.averageSavingsRate;
  const topCategory = categoryTrends[0]?.categoryName ?? null;
  const currentPoint = monthlySeries[monthlySeries.length - 1] ?? null;
  const hasWorkspaceTransactions = financeData.transactions.length > 0;
  const hasActivityInSelectedRange = hasRangeActivity(monthlySeries);

  return (
    <div className="finance-page">
      <FinancePageHeader
        description="Explore historical income, expenses, savings rate, and category drift with reusable range filters and chart-ready transformations."
        eyebrow="Sprint 5"
        title="Analytics"
      />

      <section className="finance-panel dashboard-toolbar">
        <div>
          <p className="finance-panel__eyebrow">Historical lens</p>
          <h2>{getPresetLabel(preset)}</h2>
        </div>
        <label className="finance-field dashboard-toolbar__field">
          <span>Anchor month</span>
          <input
            name="analyticsEndMonth"
            onChange={(event) => {
              setSelectedEndMonth(event.target.value);

              if (preset !== 'custom') {
                setCustomEndMonth(event.target.value);
              }
            }}
            type="month"
            value={selectedEndMonth}
          />
        </label>
      </section>

      <section className="finance-panel analytics-filters">
        <label className="finance-field">
          <span>Range preset</span>
          <select
            name="analyticsPreset"
            onChange={(event) => setPreset(event.target.value as AnalyticsRangePreset)}
            value={preset}
          >
            <option value="3m">Last 3 months</option>
            <option value="6m">Last 6 months</option>
            <option value="12m">Last 12 months</option>
            <option value="custom">Custom range</option>
          </select>
        </label>

        {preset === 'custom' ? (
          <>
            <label className="finance-field">
              <span>Start month</span>
              <input
                name="analyticsStartMonth"
                onChange={(event) => setCustomStartMonth(event.target.value)}
                type="month"
                value={customStartMonth}
              />
            </label>
            <label className="finance-field">
              <span>End month</span>
              <input
                name="analyticsCustomEndMonth"
                onChange={(event) => setCustomEndMonth(event.target.value)}
                type="month"
                value={customEndMonth}
              />
            </label>
          </>
        ) : null}

        <AnalyticsTabBar activeTab={activeTab} onChange={setActiveTab} />
      </section>

      <section className="finance-summary-grid">
        <CategoriesSummaryCard label="Months in scope" value={String(deferredRange.months.length)} />
        <CategoriesSummaryCard label="Total income" value={formatCurrency(totalIncome)} />
        <CategoriesSummaryCard label="Total expenses" value={formatCurrency(totalExpenses)} />
        <CategoriesSummaryCard label="Average savings rate" value={formatPercentage(averageSavingsRate)} />
      </section>

      {financeData.errorMessage ? (
        <section aria-live="assertive" className="finance-panel">
          <p className="finance-message finance-message--error" role="alert">
            {financeData.errorMessage}
          </p>
        </section>
      ) : null}

      {financeData.status === 'loading' ? (
        <section aria-live="polite" className="finance-panel">
          <p className="finance-empty-state">Loading analytics...</p>
        </section>
      ) : !hasWorkspaceTransactions ? (
        <section aria-live="polite" className="finance-panel">
          <p className="finance-empty-state">
            Add your first income or expense in Transactions to unlock analytics trends and
            comparisons.
          </p>
        </section>
      ) : activeTab === 'overview' && !hasActivityInSelectedRange ? (
        <section aria-live="polite" className="finance-panel">
          <p className="finance-empty-state">
            No income or expense activity is available for the selected range yet. Adjust the range
            or add transactions for those months.
          </p>
        </section>
      ) : (
        <>
          <section className="insight-panel">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">Historical readout</p>
                <h3>Trend signal</h3>
              </div>
              {currentPoint ? (
                <span className="status-pill">
                  {formatCurrency(currentPoint.netBalance)} current net
                </span>
              ) : null}
            </div>
            <p className="insight-panel__copy">
              {buildAnalyticsInsight(topCategory, averageSavingsRate, comparison.expenseDelta)}
            </p>
          </section>

          {activeTab === 'overview' ? (
            <div className="analytics-overview-grid">
              <MonthlyCashflowChart monthlyPoints={monthlySeries} />
              <AnalyticsComparisonPanel comparison={comparison} />
              <SavingsRateChart monthlyPoints={monthlySeries} />
            </div>
          ) : (
            <CategoryTrendList trends={categoryTrends} />
          )}
        </>
      )}
    </div>
  );
}
