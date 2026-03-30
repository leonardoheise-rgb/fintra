import type {
  BudgetOverrideRecord,
  BudgetRecord,
  CategoryRecord,
  SubcategoryRecord,
} from '../../finance/finance.types';
import { getBudgetScopeKey } from '../lib/effectiveBudgetResolver';
import {
  calculateAllocatedBudget,
  formatBudgetAmount,
  getBudgetScopeLabel,
  getBudgetScopeTypeLabel,
  sortBudgetsByScope,
} from '../lib/budgetSelectors';

type BudgetsListProps = {
  budgetOverrides: BudgetOverrideRecord[];
  budgets: BudgetRecord[];
  categories: CategoryRecord[];
  month: string;
  onDelete(budgetId: string): Promise<void>;
  onEdit(budget: BudgetRecord): void;
  subcategories: SubcategoryRecord[];
};

export function BudgetsList({
  budgetOverrides,
  budgets,
  categories,
  month,
  onDelete,
  onEdit,
  subcategories,
}: BudgetsListProps) {
  const sortedBudgets = sortBudgetsByScope(budgets, categories, subcategories);
  const overrideScopeKeys = new Set(
    budgetOverrides
      .filter((item) => item.month === month)
      .map((item) => getBudgetScopeKey(item.categoryId, item.subcategoryId)),
  );

  return (
    <section className="finance-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">Budget registry</p>
          <h2>Default plans</h2>
        </div>
        <p className="budget-registry__summary">
          {formatBudgetAmount(calculateAllocatedBudget(budgets))} allocated
        </p>
      </div>

      {sortedBudgets.length === 0 ? (
        <p className="finance-empty-state">
          Add your first default budget to power the monthly dashboard and future override flows.
        </p>
      ) : (
        <div className="finance-list">
          {sortedBudgets.map((budget) => (
            <article
              aria-label={`${getBudgetScopeLabel(categories, subcategories, budget)} default budget`}
              className="budget-plan-card"
              key={budget.id}
            >
              <div className="budget-plan-card__header">
                <div>
                  <p className="budget-plan-card__eyebrow">{getBudgetScopeTypeLabel(budget)}</p>
                  <h3>{getBudgetScopeLabel(categories, subcategories, budget)}</h3>
                </div>
                <strong className="budget-plan-card__amount">
                  {formatBudgetAmount(budget.amount)}
                </strong>
              </div>

              {overrideScopeKeys.has(
                getBudgetScopeKey(budget.categoryId, budget.subcategoryId),
              ) ? (
                <p className="budget-plan-card__status">
                  Override active for {month}
                </p>
              ) : null}

              <div className="transaction-card__actions">
                <button
                  aria-label={`Edit budget ${getBudgetScopeLabel(categories, subcategories, budget)}`}
                  className="secondary-button"
                  onClick={() => onEdit(budget)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  aria-label={`Delete budget ${getBudgetScopeLabel(categories, subcategories, budget)}`}
                  className="secondary-button secondary-button--danger"
                  onClick={() => void onDelete(budget.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
