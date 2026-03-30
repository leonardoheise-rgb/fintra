import { useEffect, useMemo, useState, type FormEvent } from 'react';

import type {
  BudgetInput,
  BudgetRecord,
  CategoryRecord,
  SubcategoryRecord,
} from '../../finance/finance.types';
import { getSubcategoriesForCategory } from '../../finance/lib/financeSelectors';

type BudgetFormProps = {
  budgetToEdit: BudgetRecord | null;
  categories: CategoryRecord[];
  onCancelEdit(): void;
  onSubmit(input: BudgetInput): Promise<void>;
  subcategories: SubcategoryRecord[];
};

function createInitialState(categories: CategoryRecord[]) {
  return {
    categoryId: categories[0]?.id ?? '',
    subcategoryId: '',
    amount: '',
  };
}

export function BudgetForm({
  budgetToEdit,
  categories,
  onCancelEdit,
  onSubmit,
  subcategories,
}: BudgetFormProps) {
  const [categoryId, setCategoryId] = useState(budgetToEdit?.categoryId ?? categories[0]?.id ?? '');
  const [subcategoryId, setSubcategoryId] = useState(budgetToEdit?.subcategoryId ?? '');
  const [amount, setAmount] = useState(budgetToEdit ? String(budgetToEdit.amount) : '');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSubcategories = useMemo(
    () => getSubcategoriesForCategory(subcategories, categoryId),
    [categoryId, subcategories],
  );

  useEffect(() => {
    if (budgetToEdit) {
      setCategoryId(budgetToEdit.categoryId);
      setSubcategoryId(budgetToEdit.subcategoryId ?? '');
      setAmount(String(budgetToEdit.amount));
      return;
    }

    const initialState = createInitialState(categories);
    setCategoryId(initialState.categoryId);
    setSubcategoryId(initialState.subcategoryId);
    setAmount(initialState.amount);
  }, [budgetToEdit, categories]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId) {
      setFormError('Create a category before defining a budget.');
      return;
    }

    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Budget amount must be greater than zero.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        categoryId,
        subcategoryId: subcategoryId || null,
        amount: parsedAmount,
      });

      const initialState = createInitialState(categories);
      setCategoryId(initialState.categoryId);
      setSubcategoryId(initialState.subcategoryId);
      setAmount(initialState.amount);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save the budget.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="finance-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">Default budget form</p>
          <h2>{budgetToEdit ? 'Edit default budget' : 'Add default budget'}</h2>
        </div>
        {budgetToEdit ? (
          <button className="secondary-button" onClick={onCancelEdit} type="button">
            Cancel edit
          </button>
        ) : null}
      </div>

      <form className="finance-form" onSubmit={handleSubmit}>
        <label className="finance-field">
          <span>Category</span>
          <select
            name="budgetCategory"
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
            name="budgetSubcategory"
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
            name="budgetAmount"
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            value={amount}
          />
        </label>

        {formError ? <p className="finance-message finance-message--error">{formError}</p> : null}

        <button className="primary-button finance-form__submit" disabled={isSubmitting} type="submit">
          {isSubmitting
            ? 'Saving...'
            : budgetToEdit
              ? 'Update default budget'
              : 'Create default budget'}
        </button>
      </form>
    </section>
  );
}
