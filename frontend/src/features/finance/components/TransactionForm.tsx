import { useEffect, useMemo, useState, type FormEvent } from 'react';

import type {
  CategoryRecord,
  SubcategoryRecord,
  TransactionInput,
  TransactionRecord,
} from '../finance.types';
import { getSubcategoriesForCategory } from '../lib/financeSelectors';

type TransactionFormProps = {
  categories: CategoryRecord[];
  subcategories: SubcategoryRecord[];
  transactionToEdit: TransactionRecord | null;
  onCancelEdit(): void;
  onSubmit(input: TransactionInput): Promise<void>;
};

function createInitialFormState(categories: CategoryRecord[]) {
  return {
    amount: '',
    type: 'expense' as const,
    categoryId: categories[0]?.id ?? '',
    subcategoryId: '',
    date: new Date().toISOString().slice(0, 10),
    description: '',
  };
}

export function TransactionForm({
  categories,
  onCancelEdit,
  onSubmit,
  subcategories,
  transactionToEdit,
}: TransactionFormProps) {
  const [amount, setAmount] = useState(transactionToEdit ? String(transactionToEdit.amount) : '');
  const [type, setType] = useState<TransactionInput['type']>(transactionToEdit?.type ?? 'expense');
  const [categoryId, setCategoryId] = useState(
    transactionToEdit?.categoryId ?? categories[0]?.id ?? '',
  );
  const [subcategoryId, setSubcategoryId] = useState(transactionToEdit?.subcategoryId ?? '');
  const [date, setDate] = useState(
    transactionToEdit?.date ?? new Date().toISOString().slice(0, 10),
  );
  const [description, setDescription] = useState(transactionToEdit?.description ?? '');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const availableSubcategories = useMemo(
    () => getSubcategoriesForCategory(subcategories, categoryId),
    [categoryId, subcategories],
  );

  useEffect(() => {
    if (transactionToEdit) {
      setAmount(String(transactionToEdit.amount));
      setType(transactionToEdit.type);
      setCategoryId(transactionToEdit.categoryId);
      setSubcategoryId(transactionToEdit.subcategoryId ?? '');
      setDate(transactionToEdit.date);
      setDescription(transactionToEdit.description);
      return;
    }

    const initialState = createInitialFormState(categories);
    setAmount(initialState.amount);
    setType(initialState.type);
    setCategoryId(initialState.categoryId);
    setSubcategoryId(initialState.subcategoryId);
    setDate(initialState.date);
    setDescription(initialState.description);
  }, [categories, transactionToEdit]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId) {
      setFormError('Create a category before adding a transaction.');
      return;
    }

    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError('Amount must be greater than zero.');
      return;
    }

    if (!date) {
      setFormError('Transaction date is required.');
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        amount: parsedAmount,
        type,
        categoryId,
        subcategoryId: subcategoryId || null,
        date,
        description,
      });

      const initialState = createInitialFormState(categories);
      setAmount(initialState.amount);
      setType(initialState.type);
      setCategoryId(initialState.categoryId);
      setSubcategoryId(initialState.subcategoryId);
      setDate(initialState.date);
      setDescription(initialState.description);
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'Unable to save the transaction.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="finance-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">Transaction form</p>
          <h2>{transactionToEdit ? 'Edit transaction' : 'Add transaction'}</h2>
        </div>
        {transactionToEdit ? (
          <button className="secondary-button" onClick={onCancelEdit} type="button">
            Cancel edit
          </button>
        ) : null}
      </div>

      <form className="finance-form" onSubmit={handleSubmit}>
        <label className="finance-field">
          <span>Amount</span>
          <input
            inputMode="decimal"
            name="amount"
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            value={amount}
          />
        </label>

        <label className="finance-field">
          <span>Type</span>
          <select name="type" onChange={(event) => setType(event.target.value as TransactionInput['type'])} value={type}>
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </label>

        <label className="finance-field">
          <span>Category</span>
          <select
            name="categoryId"
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
            name="subcategoryId"
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
          <span>Date</span>
          <input name="date" onChange={(event) => setDate(event.target.value)} type="date" value={date} />
        </label>

        <label className="finance-field finance-field--full">
          <span>Description</span>
          <textarea
            name="description"
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            value={description}
          />
        </label>

        {formError ? <p className="finance-message finance-message--error">{formError}</p> : null}

        <button className="primary-button finance-form__submit" disabled={isSubmitting} type="submit">
          {isSubmitting
            ? 'Saving...'
            : transactionToEdit
              ? 'Update transaction'
              : 'Create transaction'}
        </button>
      </form>
    </section>
  );
}
