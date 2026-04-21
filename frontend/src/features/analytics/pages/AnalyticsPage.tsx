import { useDeferredValue, useEffect, useMemo, useState } from 'react';

import { translateAppText } from '../../../shared/i18n/appText';
import { getCurrentMonthKey, shiftMonthKey } from '../../../shared/lib/date/months';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatPercentage } from '../../../shared/lib/formatters/percentage';
import { CategoriesSummaryCard } from '../../finance/components/CategoriesSummaryCard';
import { FinancePageHeader } from '../../finance/components/FinancePageHeader';
import { useFinanceData } from '../../finance/useFinanceData';
import { useDisplayPreferences } from '../../settings/useDisplayPreferences';
import type { AnalyticsRangePreset } from '../analytics.types';
import { AnalyticsComparisonPanel } from '../components/AnalyticsComparisonPanel';
import { AnalyticsExpenseList } from '../components/AnalyticsExpenseList';
import { AnalyticsTabBar } from '../components/AnalyticsTabBar';
import { CategorySpendingChart } from '../components/CategorySpendingChart';
import { MonthlyCashflowChart } from '../components/MonthlyCashflowChart';
import { SavingsRateChart } from '../components/SavingsRateChart';
import { resolveAnalyticsRange } from '../lib/analyticsRange';
import { buildAnalyticsComparison } from '../lib/buildAnalyticsComparison';
import { buildAnalyticsExpenseTransactions } from '../lib/buildAnalyticsExpenseTransactions';
import { buildCategorySpendSeries } from '../lib/buildCategorySpendSeries';
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
    return translateAppText('analytics.insightTopCategory', {
      category: currentMonthCategory,
      amount: formatCurrency(expenseDelta),
    });
  }

  if (savingsRate < 0) {
    return translateAppText('analytics.insightNegativeSavings');
  }

  return translateAppText('analytics.insightDefault');
}

export function AnalyticsPage() {
  const financeData = useFinanceData();
  const {
    preferences: { monthStartDay },
  } = useDisplayPreferences();
  const currentMonth = useMemo(() => getCurrentMonthKey(new Date(), monthStartDay), [monthStartDay]);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories'>('overview');
  const [preset, setPreset] = useState<AnalyticsRangePreset>('3m');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedEndMonth, setSelectedEndMonth] = useState(currentMonth);
  const [customStartMonth, setCustomStartMonth] = useState(shiftMonthKey(currentMonth, -2));
  const [customEndMonth, setCustomEndMonth] = useState(currentMonth);

  useEffect(() => {
    setSelectedEndMonth(currentMonth);
    setCustomEndMonth(currentMonth);
    setCustomStartMonth(shiftMonthKey(currentMonth, -2));
  }, [currentMonth]);

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
        monthStartDay,
        transactions: financeData.transactions,
      }),
    [
      deferredRange.months,
      financeData.budgetOverrides,
      financeData.budgets,
      financeData.categories,
      financeData.transactions,
      monthStartDay,
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
        monthStartDay,
        transactions: financeData.transactions,
      }),
    [deferredRange.months, financeData.categories, financeData.transactions, monthStartDay],
  );
  const totalIncome = sumValues(monthlySeries.map((point) => point.income));
  const totalExpenses = sumValues(monthlySeries.map((point) => point.expenses));
  const averageSavingsRate = comparison.averageSavingsRate;
  const topCategory = categoryTrends[0]?.categoryName ?? null;
  const availableCategoryOptions = useMemo(
    () =>
      categoryTrends.map((trend) => ({
        value: trend.categoryId,
        label: trend.categoryName,
      })),
    [categoryTrends],
  );
  const selectedCategorySeries = useMemo(
    () =>
      buildCategorySpendSeries({
        selectedCategoryId: selectedCategoryId === 'all' ? null : selectedCategoryId,
        trends: categoryTrends,
        months: deferredRange.months,
      }),
    [categoryTrends, deferredRange.months, selectedCategoryId],
  );
  const expenseTransactions = useMemo(
    () =>
      buildAnalyticsExpenseTransactions({
        transactions: financeData.transactions,
        months: deferredRange.months,
        monthStartDay,
        selectedCategoryId: selectedCategoryId === 'all' ? null : selectedCategoryId,
      }),
    [deferredRange.months, financeData.transactions, monthStartDay, selectedCategoryId],
  );
  const currentPoint = monthlySeries[monthlySeries.length - 1] ?? null;
  const hasWorkspaceTransactions = financeData.transactions.length > 0;
  const hasActivityInSelectedRange = hasRangeActivity(monthlySeries);
  const presetLabel =
    preset === '3m'
      ? translateAppText('analytics.last3Months')
      : preset === '6m'
        ? translateAppText('analytics.last6Months')
        : preset === '12m'
          ? translateAppText('analytics.last12Months')
          : translateAppText('analytics.customRange');

  useEffect(() => {
    if (selectedCategoryId === 'all') {
      return;
    }

    if (!availableCategoryOptions.some((option) => option.value === selectedCategoryId)) {
      setSelectedCategoryId('all');
    }
  }, [availableCategoryOptions, selectedCategoryId]);

  return (
    <div className="finance-page finance-page--analytics">
      <FinancePageHeader
        description={translateAppText('analytics.description')}
        eyebrow={translateAppText('analytics.eyebrow')}
        title={translateAppText('analytics.title')}
      />

      <section className="finance-panel dashboard-toolbar">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('analytics.historicalLens')}</p>
          <h2>{presetLabel}</h2>
        </div>
        <label className="finance-field dashboard-toolbar__field">
          <span>{translateAppText('analytics.anchorMonth')}</span>
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
          <span>{translateAppText('analytics.rangePreset')}</span>
          <select
            name="analyticsPreset"
            onChange={(event) => setPreset(event.target.value as AnalyticsRangePreset)}
            value={preset}
          >
            <option value="3m">{translateAppText('analytics.last3Months')}</option>
            <option value="6m">{translateAppText('analytics.last6Months')}</option>
            <option value="12m">{translateAppText('analytics.last12Months')}</option>
            <option value="custom">{translateAppText('analytics.customRange')}</option>
          </select>
        </label>

        {preset === 'custom' ? (
          <>
            <label className="finance-field">
              <span>{translateAppText('analytics.startMonth')}</span>
              <input
                name="analyticsStartMonth"
                onChange={(event) => setCustomStartMonth(event.target.value)}
                type="month"
                value={customStartMonth}
              />
            </label>
            <label className="finance-field">
              <span>{translateAppText('analytics.endMonth')}</span>
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
        <CategoriesSummaryCard label={translateAppText('analytics.monthsInScope')} value={String(deferredRange.months.length)} />
        <CategoriesSummaryCard label={translateAppText('analytics.totalIncome')} value={formatCurrency(totalIncome)} />
        <CategoriesSummaryCard label={translateAppText('analytics.totalExpenses')} value={formatCurrency(totalExpenses)} />
        <CategoriesSummaryCard label={translateAppText('analytics.averageSavingsRate')} value={formatPercentage(averageSavingsRate)} />
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
          <p className="finance-empty-state">{translateAppText('analytics.loading')}</p>
        </section>
      ) : !hasWorkspaceTransactions ? (
        <section aria-live="polite" className="finance-panel">
          <p className="finance-empty-state">{translateAppText('analytics.addTransactions')}</p>
        </section>
      ) : activeTab === 'overview' && !hasActivityInSelectedRange ? (
        <section aria-live="polite" className="finance-panel">
          <p className="finance-empty-state">{translateAppText('analytics.noActivityRange')}</p>
        </section>
      ) : (
        <>
          <section className="insight-panel">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">{translateAppText('analytics.historicalReadout')}</p>
                <h3>{translateAppText('analytics.trendSignal')}</h3>
              </div>
              {currentPoint ? (
                <span className="status-pill">
                  {translateAppText('analytics.currentNet', {
                    amount: formatCurrency(currentPoint.netBalance),
                  })}
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
            <>
              <section className="finance-panel analytics-filters">
                <label className="finance-field">
                  <span>{translateAppText('analytics.categoryFilter')}</span>
                  <select
                    name="analyticsCategory"
                    onChange={(event) => setSelectedCategoryId(event.target.value)}
                    value={selectedCategoryId}
                  >
                    <option value="all">{translateAppText('analytics.allCategories')}</option>
                    {availableCategoryOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>
              </section>
              <div className="analytics-overview-grid">
                <CategorySpendingChart series={selectedCategorySeries} />
                <AnalyticsExpenseList
                  categories={financeData.categories}
                  subcategories={financeData.subcategories}
                  transactions={expenseTransactions}
                />
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
