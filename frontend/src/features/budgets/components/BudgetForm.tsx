import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { resolveAppErrorMessage } from '../../../shared/i18n/appErrors';
import { translateAppText } from '../../../shared/i18n/appText';
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
      setFormError(translateAppText('budgets.errorNeedCategory'));
      return;
    }

    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError(translateAppText('budgets.errorAmount'));
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
      setFormError(resolveAppErrorMessage(error, 'budgets.errorSave'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="finance-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('budgets.formEyebrow')}</p>
          <h2>
            {budgetToEdit
              ? translateAppText('budgets.editDefaultHeading')
              : translateAppText('budgets.addDefaultHeading')}
          </h2>
        </div>
        {budgetToEdit ? (
          <button className="secondary-button" onClick={onCancelEdit} type="button">
            {translateAppText('transactions.cancelEdit')}
          </button>
        ) : null}
      </div>

      <form className="finance-form" onSubmit={handleSubmit}>
        <label className="finance-field">
          <span>{translateAppText('transactions.category')}</span>
          <select
            name="budgetCategory"
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
            name="budgetSubcategory"
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
            name="budgetAmount"
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            value={amount}
          />
        </label>

        {formError ? <p className="finance-message finance-message--error">{formError}</p> : null}

        <button className="primary-button finance-form__submit" disabled={isSubmitting} type="submit">
          {isSubmitting
            ? translateAppText('transactions.saving')
            : budgetToEdit
              ? translateAppText('budgets.updateDefault')
              : translateAppText('budgets.createDefault')}
        </button>
      </form>
    </section>
  );
}
