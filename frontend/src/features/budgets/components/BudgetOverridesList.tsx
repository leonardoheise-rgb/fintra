import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { translateAppText } from '../../../shared/i18n/appText';
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
          <p className="finance-panel__eyebrow">{translateAppText('budgets.overrideRegistry')}</p>
          <h2>{translateAppText('budgets.overridesHeading', { month: formatMonthLabel(month) })}</h2>
        </div>
        <p className="budget-registry__summary">
          {translateAppText('budgets.overridden', {
            amount: formatBudgetAmount(calculateAllocatedOverrideBudget(scopedOverrides)),
          })}
        </p>
      </div>

      {scopedOverrides.length === 0 ? (
        <p className="finance-empty-state">
          {translateAppText('budgets.noOverrides', { month: formatMonthLabel(month) })}
        </p>
      ) : (
        <div className="finance-list">
          {scopedOverrides.map((budgetOverride) => (
            <article
              aria-label={translateAppText('budgets.overrideAria', {
                name: getBudgetScopeLabel(categories, subcategories, budgetOverride),
              })}
              className="budget-plan-card budget-plan-card--override"
              key={budgetOverride.id}
            >
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
                  aria-label={translateAppText('budgets.editOverride', {
                    name: getBudgetScopeLabel(categories, subcategories, budgetOverride),
                  })}
                  className="secondary-button"
                  onClick={() => onEdit(budgetOverride)}
                  type="button"
                >
                  {translateAppText('transactions.edit')}
                </button>
                <button
                  aria-label={translateAppText('budgets.resetOverride', {
                    name: getBudgetScopeLabel(categories, subcategories, budgetOverride),
                  })}
                  className="secondary-button secondary-button--danger"
                  onClick={() => void onDelete(budgetOverride.id)}
                  type="button"
                >
                  {translateAppText('budgets.resetToDefault')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
