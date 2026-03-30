import { useMemo, useState } from 'react';

import { getCurrentMonthKey } from '../../../shared/lib/date/months';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { CategoriesSummaryCard } from '../../finance/components/CategoriesSummaryCard';
import { FinancePageHeader } from '../../finance/components/FinancePageHeader';
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
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthKey());
  const [budgetToEdit, setBudgetToEdit] = useState<BudgetRecord | null>(null);
  const [budgetOverrideToEdit, setBudgetOverrideToEdit] = useState<BudgetOverrideRecord | null>(
    null,
  );

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
    if (budgetToEdit) {
      await financeData.updateBudget(budgetToEdit.id, input);
      setBudgetToEdit(null);
      return;
    }

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
      <FinancePageHeader
        description="Shape your monthly allowance, tune override moments, and review category pacing with the same architectural calm as the dashboard."
        eyebrow="Monthly budgets"
        title="Budgets"
      />

      <section className="finance-panel dashboard-toolbar">
        <div>
          <p className="finance-panel__eyebrow">Override scope</p>
          <h2>{formatMonthLabel(selectedMonth)} effective plan</h2>
        </div>
        <label className="finance-field dashboard-toolbar__field">
          <span>Selected month</span>
          <input
            name="budgetMonth"
            onChange={(event) => setSelectedMonth(event.target.value)}
            type="month"
            value={selectedMonth}
          />
        </label>
      </section>

      <section className="finance-summary-grid">
        <CategoriesSummaryCard label="Default plans" value={String(financeData.budgets.length)} />
        <CategoriesSummaryCard label="Allocated total" value={formatCurrency(allocatedBudget)} />
        <CategoriesSummaryCard
          label={`${selectedMonth} overrides`}
          value={String(selectedMonthOverrides.length)}
        />
        <CategoriesSummaryCard label="Effective total" value={formatCurrency(effectiveTotal)} />
        <CategoriesSummaryCard label="Covered categories" value={String(coveredCategories)} />
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
          <p className="finance-empty-state">Loading budgets...</p>
        </section>
      ) : (
        <>
          <div className="finance-grid">
            <BudgetForm
              budgetToEdit={budgetToEdit}
              categories={financeData.categories}
              onCancelEdit={() => setBudgetToEdit(null)}
              onSubmit={handleSubmit}
              subcategories={financeData.subcategories}
            />
            <BudgetsList
              budgetOverrides={financeData.budgetOverrides}
              budgets={financeData.budgets}
              categories={financeData.categories}
              month={selectedMonth}
              onDelete={financeData.deleteBudget}
              onEdit={setBudgetToEdit}
              subcategories={financeData.subcategories}
            />
          </div>

          <div className="finance-grid">
            <BudgetOverrideForm
              categories={financeData.categories}
              month={selectedMonth}
              onCancelEdit={() => setBudgetOverrideToEdit(null)}
              onSubmit={handleOverrideSubmit}
              overrideToEdit={budgetOverrideToEdit}
              subcategories={financeData.subcategories}
            />
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
