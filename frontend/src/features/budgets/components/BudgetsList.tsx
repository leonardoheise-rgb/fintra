import { useState } from 'react';

import { resolveAppErrorMessage } from '../../../shared/i18n/appErrors';
import type {
  BudgetOverrideRecord,
  BudgetInput,
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
  onUpdate(budgetId: string, input: BudgetInput): Promise<void>;
  subcategories: SubcategoryRecord[];
};

export function BudgetsList({
  budgetOverrides,
  budgets,
  categories,
  month,
  onDelete,
  onUpdate,
  subcategories,
}: BudgetsListProps) {
  const [editingBudgetId, setEditingBudgetId] = useState<string | null>(null);
  const [editingAmount, setEditingAmount] = useState('');
  const [editingError, setEditingError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const sortedBudgets = sortBudgetsByScope(budgets, categories, subcategories);
  const overrideScopeKeys = new Set(
    budgetOverrides
      .filter((item) => item.month === month)
      .map((item) => getBudgetScopeKey(item.categoryId, item.subcategoryId)),
  );

  function handleStartEdit(budget: BudgetRecord) {
    setEditingBudgetId(budget.id);
    setEditingAmount(String(budget.amount));
    setEditingError(null);
  }

  function handleCancelEdit() {
    setEditingBudgetId(null);
    setEditingAmount('');
    setEditingError(null);
  }

  async function handleSave(budget: BudgetRecord) {
    const parsedAmount = Number(editingAmount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setEditingError(translateAppText('budgets.errorAmount'));
      return;
    }

    setEditingError(null);
    setIsSubmitting(true);

    try {
      await onUpdate(budget.id, {
        categoryId: budget.categoryId,
        subcategoryId: budget.subcategoryId,
        amount: parsedAmount,
      });
      handleCancelEdit();
    } catch (error) {
      setEditingError(resolveAppErrorMessage(error, 'budgets.errorSave'));
    } finally {
      setIsSubmitting(false);
    }
  }

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
                {editingBudgetId === budget.id ? (
                  <label className="finance-field budget-plan-card__amount-editor">
                    <span>{translateAppText('transactions.amount')}</span>
                    <input
                      autoFocus
                      className="budget-plan-card__amount-input"
                      inputMode="decimal"
                      name={`budget-inline-amount-${budget.id}`}
                      onChange={(event) => setEditingAmount(event.target.value)}
                      type="number"
                      value={editingAmount}
                    />
                  </label>
                ) : (
                  <strong className="budget-plan-card__amount">
                    {formatBudgetAmount(budget.amount)}
                  </strong>
                )}
              </div>

              {overrideScopeKeys.has(
                getBudgetScopeKey(budget.categoryId, budget.subcategoryId),
              ) ? (
                <p className="budget-plan-card__status">
                  {translateAppText('budgets.overrideActiveFor', { month })}
                </p>
              ) : null}

              {editingBudgetId === budget.id && editingError ? (
                <p className="finance-message finance-message--error">{editingError}</p>
              ) : null}

              <div className="transaction-card__actions">
                {editingBudgetId === budget.id ? (
                  <>
                    <button
                      className="primary-button"
                      disabled={isSubmitting}
                      onClick={() => void handleSave(budget)}
                      type="button"
                    >
                      {isSubmitting
                        ? translateAppText('transactions.saving')
                        : translateAppText('budgets.updateDefault')}
                    </button>
                    <button
                      className="secondary-button"
                      disabled={isSubmitting}
                      onClick={handleCancelEdit}
                      type="button"
                    >
                      {translateAppText('transactions.cancelEdit')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      aria-label={translateAppText('budgets.editBudget', {
                        name: getBudgetScopeLabel(categories, subcategories, budget),
                      })}
                      className="secondary-button"
                      onClick={() => handleStartEdit(budget)}
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
                  </>
                )}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
