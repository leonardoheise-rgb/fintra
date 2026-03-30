import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import type {
  BudgetOverrideRecord,
  CategoryRecord,
  SubcategoryRecord,
} from '../../finance/finance.types';
import {
  calculateAllocatedOverrideBudget,
  formatBudgetAmount,
  getBudgetScopeLabel,
  getBudgetScopeTypeLabel,
  sortBudgetOverridesByScope,
} from '../lib/budgetSelectors';

type BudgetOverridesListProps = {
  budgetOverrides: BudgetOverrideRecord[];
  categories: CategoryRecord[];
  month: string;
  onDelete(budgetOverrideId: string): Promise<void>;
  onEdit(budgetOverride: BudgetOverrideRecord): void;
  subcategories: SubcategoryRecord[];
};

export function BudgetOverridesList({
  budgetOverrides,
  categories,
  month,
  onDelete,
  onEdit,
  subcategories,
}: BudgetOverridesListProps) {
  const scopedOverrides = sortBudgetOverridesByScope(
    budgetOverrides.filter((item) => item.month === month),
    categories,
    subcategories,
  );

  return (
    <section className="finance-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">Override registry</p>
          <h2>{formatMonthLabel(month)} overrides</h2>
        </div>
        <p className="budget-registry__summary">
          {formatBudgetAmount(calculateAllocatedOverrideBudget(scopedOverrides))} overridden
        </p>
      </div>

      {scopedOverrides.length === 0 ? (
        <p className="finance-empty-state">
          No overrides are active for {formatMonthLabel(month)}. Delete-free reset behavior is ready when you add one.
        </p>
      ) : (
        <div className="finance-list">
          {scopedOverrides.map((budgetOverride) => (
            <article className="budget-plan-card budget-plan-card--override" key={budgetOverride.id}>
              <div className="budget-plan-card__header">
                <div>
                  <p className="budget-plan-card__eyebrow">
                    {getBudgetScopeTypeLabel(budgetOverride)}
                  </p>
                  <h3>{getBudgetScopeLabel(categories, subcategories, budgetOverride)}</h3>
                </div>
                <strong className="budget-plan-card__amount">
                  {formatBudgetAmount(budgetOverride.amount)}
                </strong>
              </div>

              <div className="transaction-card__actions">
                <button
                  className="secondary-button"
                  onClick={() => onEdit(budgetOverride)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="secondary-button secondary-button--danger"
                  onClick={() => void onDelete(budgetOverride.id)}
                  type="button"
                >
                  Reset to default
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
