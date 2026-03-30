import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { resolveAppErrorMessage } from '../../../shared/i18n/appErrors';
import { translateAppText } from '../../../shared/i18n/appText';
import type {
  BudgetOverrideInput,
  BudgetOverrideRecord,
  CategoryRecord,
  SubcategoryRecord,
} from '../../finance/finance.types';
import { getSubcategoriesForCategory } from '../../finance/lib/financeSelectors';

type BudgetOverrideFormProps = {
  categories: CategoryRecord[];
  month: string;
  onCancelEdit(): void;
  onSubmit(input: BudgetOverrideInput): Promise<void>;
  overrideToEdit: BudgetOverrideRecord | null;
  subcategories: SubcategoryRecord[];
};

function createInitialState(categories: CategoryRecord[], month: string) {
  return {
    categoryId: categories[0]?.id ?? '',
    subcategoryId: '',
    month,
    amount: '',
  };
}

export function BudgetOverrideForm({
  categories,
  month,
  onCancelEdit,
  onSubmit,
  overrideToEdit,
  subcategories,
}: BudgetOverrideFormProps) {
  const [categoryId, setCategoryId] = useState(overrideToEdit?.categoryId ?? categories[0]?.id ?? '');
  const [subcategoryId, setSubcategoryId] = useState(overrideToEdit?.subcategoryId ?? '');
  const [overrideMonth, setOverrideMonth] = useState(overrideToEdit?.month ?? month);
  const [amount, setAmount] = useState(overrideToEdit ? String(overrideToEdit.amount) : '');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSubcategories = useMemo(
    () => getSubcategoriesForCategory(subcategories, categoryId),
    [categoryId, subcategories],
  );

  useEffect(() => {
    if (overrideToEdit) {
      setCategoryId(overrideToEdit.categoryId);
      setSubcategoryId(overrideToEdit.subcategoryId ?? '');
      setOverrideMonth(overrideToEdit.month);
      setAmount(String(overrideToEdit.amount));
      return;
    }

    const initialState = createInitialState(categories, month);
    setCategoryId(initialState.categoryId);
    setSubcategoryId(initialState.subcategoryId);
    setOverrideMonth(initialState.month);
    setAmount(initialState.amount);
  }, [categories, month, overrideToEdit]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId) {
      setFormError(translateAppText('budgets.errorNeedBudgetScope'));
      return;
    }

    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError(translateAppText('budgets.errorOverrideAmount'));
      return;
    }

    if (!overrideMonth) {
      setFormError(translateAppText('budgets.errorOverrideMonth'));
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        categoryId,
        subcategoryId: subcategoryId || null,
        month: overrideMonth,
        amount: parsedAmount,
      });

      const initialState = createInitialState(categories, month);
      setCategoryId(initialState.categoryId);
      setSubcategoryId(initialState.subcategoryId);
      setOverrideMonth(initialState.month);
      setAmount(initialState.amount);
    } catch (error) {
      setFormError(resolveAppErrorMessage(error, 'budgets.errorOverrideSave'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="finance-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('budgets.overrideFormEyebrow')}</p>
          <h2>
            {overrideToEdit
              ? translateAppText('budgets.editOverrideHeading')
              : translateAppText('budgets.addOverrideHeading')}
          </h2>
        </div>
        {overrideToEdit ? (
          <button className="secondary-button" onClick={onCancelEdit} type="button">
            {translateAppText('transactions.cancelEdit')}
          </button>
        ) : null}
      </div>

      <form className="finance-form" onSubmit={handleSubmit}>
        <label className="finance-field">
          <span>{translateAppText('budgets.month')}</span>
          <input
            name="overrideMonth"
            onChange={(event) => setOverrideMonth(event.target.value)}
            type="month"
            value={overrideMonth}
          />
        </label>

        <label className="finance-field">
          <span>{translateAppText('transactions.category')}</span>
          <select
            name="overrideCategory"
            onChange={(event) => {
              setCategoryId(event.target.value);
              setSubcategoryId('');
            }}
            value={categoryId}
          >
            {categories.length === 0 ? <option value="">{translateAppText('transactions.noCategoriesYet')}</option> : null}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="finance-field">
          <span>{translateAppText('categories.subcategories')}</span>
          <select
            disabled={!categoryId || availableSubcategories.length === 0}
            name="overrideSubcategory"
            onChange={(event) => setSubcategoryId(event.target.value)}
            value={subcategoryId}
          >
            <option value="">{translateAppText('transactions.noSubcategory')}</option>
            {availableSubcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </label>

        <label className="finance-field">
          <span>{translateAppText('transactions.amount')}</span>
          <input
            inputMode="decimal"
            name="overrideAmount"
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            value={amount}
          />
        </label>

        {formError ? <p className="finance-message finance-message--error">{formError}</p> : null}

        <button className="primary-button finance-form__submit" disabled={isSubmitting} type="submit">
          {isSubmitting
            ? translateAppText('transactions.saving')
            : overrideToEdit
              ? translateAppText('budgets.updateOverride')
              : translateAppText('budgets.createOverride')}
        </button>
      </form>
    </section>
  );
}
