import type {
  BudgetOverrideRecord,
  BudgetRecord,
  CategoryRecord,
  SubcategoryRecord,
} from '../../finance/finance.types';
import { translateAppText } from '../../../shared/i18n/appText';
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
          <p className="finance-panel__eyebrow">{translateAppText('budgets.registry')}</p>
          <h2>{translateAppText('budgets.defaultPlansHeading')}</h2>
        </div>
        <p className="budget-registry__summary">
          {translateAppText('budgets.allocated', {
            amount: formatBudgetAmount(calculateAllocatedBudget(budgets)),
          })}
        </p>
      </div>

      {sortedBudgets.length === 0 ? (
        <p className="finance-empty-state">{translateAppText('budgets.empty')}</p>
      ) : (
        <div className="finance-list">
          {sortedBudgets.map((budget) => (
            <article
              aria-label={translateAppText('budgets.defaultBudgetAria', {
                name: getBudgetScopeLabel(categories, subcategories, budget),
              })}
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
                  {translateAppText('budgets.overrideActiveFor', { month })}
                </p>
              ) : null}

              <div className="transaction-card__actions">
                <button
                  aria-label={translateAppText('budgets.editBudget', {
                    name: getBudgetScopeLabel(categories, subcategories, budget),
                  })}
                  className="secondary-button"
                  onClick={() => onEdit(budget)}
                  type="button"
                >
                  {translateAppText('transactions.edit')}
                </button>
                <button
                  aria-label={translateAppText('budgets.deleteBudget', {
                    name: getBudgetScopeLabel(categories, subcategories, budget),
                  })}
                  className="secondary-button secondary-button--danger"
                  onClick={() => void onDelete(budget.id)}
                  type="button"
                >
                  {translateAppText('transactions.delete')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
