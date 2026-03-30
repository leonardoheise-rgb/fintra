import type {
  BudgetRecord,
  CategoryRecord,
  SubcategoryRecord,
} from '../../finance/finance.types';
import {
  calculateAllocatedBudget,
  formatBudgetAmount,
  getBudgetScopeLabel,
  getBudgetScopeTypeLabel,
  sortBudgetsByScope,
} from '../lib/budgetSelectors';

type BudgetsListProps = {
  budgets: BudgetRecord[];
  categories: CategoryRecord[];
  onDelete(budgetId: string): Promise<void>;
  onEdit(budget: BudgetRecord): void;
  subcategories: SubcategoryRecord[];
};

export function BudgetsList({
  budgets,
  categories,
  onDelete,
  onEdit,
  subcategories,
}: BudgetsListProps) {
  const sortedBudgets = sortBudgetsByScope(budgets, categories, subcategories);

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
            <article className="budget-plan-card" key={budget.id}>
              <div className="budget-plan-card__header">
                <div>
                  <p className="budget-plan-card__eyebrow">{getBudgetScopeTypeLabel(budget)}</p>
                  <h3>{getBudgetScopeLabel(categories, subcategories, budget)}</h3>
                </div>
                <strong className="budget-plan-card__amount">
                  {formatBudgetAmount(budget.amount)}
                </strong>
              </div>

              <div className="transaction-card__actions">
                <button className="secondary-button" onClick={() => onEdit(budget)} type="button">
                  Edit
                </button>
                <button
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
