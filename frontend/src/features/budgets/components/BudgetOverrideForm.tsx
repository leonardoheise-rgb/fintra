import { useEffect, useMemo, useState, type FormEvent } from 'react';

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
      setFormError('Create a default budget scope before defining an override.');
      return;
    }

    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Override amount must be greater than zero.');
      return;
    }

    if (!overrideMonth) {
      setFormError('Override month is required.');
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
      setFormError(error instanceof Error ? error.message : 'Unable to save the override.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="finance-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">Monthly override form</p>
          <h2>{overrideToEdit ? 'Edit monthly override' : 'Add monthly override'}</h2>
        </div>
        {overrideToEdit ? (
          <button className="secondary-button" onClick={onCancelEdit} type="button">
            Cancel edit
          </button>
        ) : null}
      </div>

      <form className="finance-form" onSubmit={handleSubmit}>
        <label className="finance-field">
          <span>Month</span>
          <input
            name="overrideMonth"
            onChange={(event) => setOverrideMonth(event.target.value)}
            type="month"
            value={overrideMonth}
          />
        </label>

        <label className="finance-field">
          <span>Category</span>
          <select
            name="overrideCategory"
            onChange={(event) => {
              setCategoryId(event.target.value);
              setSubcategoryId('');
            }}
            value={categoryId}
          >
            {categories.length === 0 ? <option value="">No categories yet</option> : null}
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>

        <label className="finance-field">
          <span>Subcategory</span>
          <select
            disabled={!categoryId || availableSubcategories.length === 0}
            name="overrideSubcategory"
            onChange={(event) => setSubcategoryId(event.target.value)}
            value={subcategoryId}
          >
            <option value="">No subcategory</option>
            {availableSubcategories.map((subcategory) => (
              <option key={subcategory.id} value={subcategory.id}>
                {subcategory.name}
              </option>
            ))}
          </select>
        </label>

        <label className="finance-field">
          <span>Amount</span>
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
            ? 'Saving...'
            : overrideToEdit
              ? 'Update monthly override'
              : 'Create monthly override'}
        </button>
      </form>
    </section>
  );
}
