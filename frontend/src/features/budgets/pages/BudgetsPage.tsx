import { useEffect, useMemo, useState } from 'react';

import { translateAppText } from '../../../shared/i18n/appText';
import { getCurrentMonthKey } from '../../../shared/lib/date/months';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { useDisplayPreferences } from '../../settings/useDisplayPreferences';
import { CategoriesSummaryCard } from '../../finance/components/CategoriesSummaryCard';
import type {
  BudgetInput,
  BudgetOverrideInput,
  BudgetOverrideRecord,
  BudgetRecord,
} from '../../finance/finance.types';
import { useFinanceData } from '../../finance/useFinanceData';
import { BudgetForm } from '../components/BudgetForm';
import { BudgetOverrideForm } from '../components/BudgetOverrideForm';
import { BudgetOverridesList } from '../components/BudgetOverridesList';
import { BudgetsList } from '../components/BudgetsList';
import { calculateAllocatedBudget } from '../lib/budgetSelectors';
import { resolveEffectiveBudgets } from '../lib/effectiveBudgetResolver';

function countCategoriesCovered(budgets: BudgetRecord[]) {
  return new Set(budgets.map((budget) => budget.categoryId)).size;
}

export function BudgetsPage() {
  const financeData = useFinanceData();
  const {
    preferences: { monthStartDay },
  } = useDisplayPreferences();
  const currentMonth = useMemo(() => getCurrentMonthKey(new Date(), monthStartDay), [monthStartDay]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [budgetOverrideToEdit, setBudgetOverrideToEdit] = useState<BudgetOverrideRecord | null>(
    null,
  );
  const [activeFormTab, setActiveFormTab] = useState<'default' | 'override'>('default');

  useEffect(() => {
    setSelectedMonth(currentMonth);
  }, [currentMonth]);

  useEffect(() => {
    if (budgetOverrideToEdit) {
      setActiveFormTab('override');
    }
  }, [budgetOverrideToEdit]);

  const allocatedBudget = useMemo(
    () => calculateAllocatedBudget(financeData.budgets),
    [financeData.budgets],
  );
  const coveredCategories = useMemo(
    () => countCategoriesCovered(financeData.budgets),
    [financeData.budgets],
  );
  const selectedMonthOverrides = useMemo(
    () =>
      financeData.budgetOverrides.filter((budgetOverride) => budgetOverride.month === selectedMonth),
    [financeData.budgetOverrides, selectedMonth],
  );
  const effectiveBudgets = useMemo(
    () => resolveEffectiveBudgets(financeData.budgets, financeData.budgetOverrides, selectedMonth),
    [financeData.budgetOverrides, financeData.budgets, selectedMonth],
  );
  const effectiveTotal = useMemo(
    () =>
      effectiveBudgets.reduce((total, effectiveBudget) => total + effectiveBudget.effectiveAmount, 0),
    [effectiveBudgets],
  );

  async function handleSubmit(input: BudgetInput) {
    await financeData.createBudget(input);
  }

  async function handleOverrideSubmit(input: BudgetOverrideInput) {
    if (budgetOverrideToEdit) {
      await financeData.updateBudgetOverride(budgetOverrideToEdit.id, input);
      setBudgetOverrideToEdit(null);
      return;
    }

    await financeData.createBudgetOverride(input);
  }

  return (
    <div className="finance-page finance-page--budgets">
      <section className="finance-panel dashboard-toolbar">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('budgets.overrideScope')}</p>
          <h2>{translateAppText('budgets.effectivePlan', { month: formatMonthLabel(selectedMonth) })}</h2>
        </div>
        <label className="finance-field dashboard-toolbar__field">
          <span>{translateAppText('dashboard.selectedMonth')}</span>
          <input
            name="budgetMonth"
            onChange={(event) => setSelectedMonth(event.target.value)}
            type="month"
            value={selectedMonth}
          />
        </label>
      </section>

      <section className="finance-summary-grid">
        <CategoriesSummaryCard label={translateAppText('budgets.defaultPlans')} value={String(financeData.budgets.length)} />
        <CategoriesSummaryCard label={translateAppText('budgets.allocatedTotal')} value={formatCurrency(allocatedBudget)} />
        <CategoriesSummaryCard
          label={translateAppText('budgets.overridesLabel', { month: selectedMonth })}
          value={String(selectedMonthOverrides.length)}
        />
        <CategoriesSummaryCard label={translateAppText('budgets.effectiveTotal')} value={formatCurrency(effectiveTotal)} />
        <CategoriesSummaryCard label={translateAppText('budgets.coveredCategories')} value={String(coveredCategories)} />
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
          <p className="finance-empty-state">{translateAppText('budgets.loading')}</p>
        </section>
      ) : (
        <>
          <div className="finance-grid">
            <div className="finance-grid finance-grid--stacked">
              <section className="finance-panel finance-panel--segment">
                <div
                  className="analytics-tabbar"
                  role="tablist"
                  aria-label={translateAppText('budgets.formTabs')}
                >
                  <button
                    aria-selected={activeFormTab === 'default'}
                    className={`analytics-tabbar__button${
                      activeFormTab === 'default' ? ' analytics-tabbar__button--active' : ''
                    }`}
                    onClick={() => {
                      setActiveFormTab('default');
                      setBudgetOverrideToEdit(null);
                    }}
                    role="tab"
                    type="button"
                  >
                    {translateAppText('budgets.addDefaultHeading')}
                  </button>
                  <button
                    aria-selected={activeFormTab === 'override'}
                    className={`analytics-tabbar__button${
                      activeFormTab === 'override' ? ' analytics-tabbar__button--active' : ''
                    }`}
                    onClick={() => setActiveFormTab('override')}
                    role="tab"
                    type="button"
                  >
                    {translateAppText('budgets.addOverrideHeading')}
                  </button>
                </div>
              </section>

              {activeFormTab === 'default' ? (
                <BudgetForm
                  budgetToEdit={null}
                  categories={financeData.categories}
                  onCancelEdit={() => {}}
                  onSubmit={handleSubmit}
                  subcategories={financeData.subcategories}
                />
              ) : (
                <BudgetOverrideForm
                  categories={financeData.categories}
                  month={selectedMonth}
                  onCancelEdit={() => setBudgetOverrideToEdit(null)}
                  onSubmit={handleOverrideSubmit}
                  overrideToEdit={budgetOverrideToEdit}
                  subcategories={financeData.subcategories}
                />
              )}
            </div>
            <BudgetsList
              budgetOverrides={financeData.budgetOverrides}
              budgets={financeData.budgets}
              categories={financeData.categories}
              month={selectedMonth}
              onDelete={financeData.deleteBudget}
              onUpdate={financeData.updateBudget}
              subcategories={financeData.subcategories}
            />
          </div>

          <div className="finance-grid">
            <BudgetOverridesList
              budgetOverrides={financeData.budgetOverrides}
              categories={financeData.categories}
              month={selectedMonth}
              onDelete={financeData.deleteBudgetOverride}
              onEdit={setBudgetOverrideToEdit}
              subcategories={financeData.subcategories}
            />
          </div>
        </>
      )}
    </div>
  );
}
