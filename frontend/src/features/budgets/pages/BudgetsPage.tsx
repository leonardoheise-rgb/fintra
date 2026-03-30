import { useMemo, useState } from 'react';

import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { CategoriesSummaryCard } from '../../finance/components/CategoriesSummaryCard';
import { FinancePageHeader } from '../../finance/components/FinancePageHeader';
import type { BudgetInput, BudgetRecord } from '../../finance/finance.types';
import { useFinanceData } from '../../finance/useFinanceData';
import { BudgetForm } from '../components/BudgetForm';
import { BudgetsList } from '../components/BudgetsList';
import { calculateAllocatedBudget } from '../lib/budgetSelectors';

function countCategoriesCovered(budgets: BudgetRecord[]) {
  return new Set(budgets.map((budget) => budget.categoryId)).size;
}

export function BudgetsPage() {
  const financeData = useFinanceData();
  const [budgetToEdit, setBudgetToEdit] = useState<BudgetRecord | null>(null);

  const allocatedBudget = useMemo(
    () => calculateAllocatedBudget(financeData.budgets),
    [financeData.budgets],
  );
  const coveredCategories = useMemo(
    () => countCategoriesCovered(financeData.budgets),
    [financeData.budgets],
  );

  async function handleSubmit(input: BudgetInput) {
    if (budgetToEdit) {
      await financeData.updateBudget(budgetToEdit.id, input);
      setBudgetToEdit(null);
      return;
    }

    await financeData.createBudget(input);
  }

  return (
    <div className="finance-page">
      <FinancePageHeader
        description="Define the default monthly budget envelope for each category or subcategory. These plans now feed the live dashboard and will become the base layer for monthly overrides next."
        eyebrow="Sprint 3"
        title="Budgets"
      />

      <section className="finance-summary-grid">
        <CategoriesSummaryCard
          label="Budget plans"
          value={String(financeData.budgets.length)}
        />
        <CategoriesSummaryCard
          label="Allocated total"
          value={formatCurrency(allocatedBudget)}
        />
        <CategoriesSummaryCard
          label="Covered categories"
          value={String(coveredCategories)}
        />
      </section>

      {financeData.errorMessage ? (
        <section className="finance-panel">
          <p className="finance-message finance-message--error">{financeData.errorMessage}</p>
        </section>
      ) : null}

      {financeData.status === 'loading' ? (
        <section className="finance-panel">
          <p className="finance-empty-state">Loading budgets...</p>
        </section>
      ) : (
        <div className="finance-grid">
          <BudgetForm
            budgetToEdit={budgetToEdit}
            categories={financeData.categories}
            onCancelEdit={() => setBudgetToEdit(null)}
            onSubmit={handleSubmit}
            subcategories={financeData.subcategories}
          />
          <BudgetsList
            budgets={financeData.budgets}
            categories={financeData.categories}
            onDelete={financeData.deleteBudget}
            onEdit={setBudgetToEdit}
            subcategories={financeData.subcategories}
          />
        </div>
      )}
    </div>
  );
}
