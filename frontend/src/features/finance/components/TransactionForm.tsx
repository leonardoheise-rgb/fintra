import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { resolveAppErrorMessage } from '../../../shared/i18n/appErrors';
import { translateAppText } from '../../../shared/i18n/appText';
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
    installmentCount: '1',
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
  const [installmentCount, setInstallmentCount] = useState('1');
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
      setInstallmentCount(String(transactionToEdit.installmentCount ?? 1));
      return;
    }

    const initialState = createInitialFormState(categories);
    setAmount(initialState.amount);
    setType(initialState.type);
    setCategoryId(initialState.categoryId);
    setSubcategoryId(initialState.subcategoryId);
    setDate(initialState.date);
    setDescription(initialState.description);
    setInstallmentCount(initialState.installmentCount);
  }, [categories, transactionToEdit]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId) {
      setFormError(translateAppText('transactions.errorNeedCategory'));
      return;
    }

    const parsedAmount = Number(amount);

    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError(translateAppText('transactions.errorAmount'));
      return;
    }

    if (!date) {
      setFormError(translateAppText('transactions.errorDate'));
      return;
    }

    const parsedInstallmentCount = Number(installmentCount);

    if (
      !Number.isInteger(parsedInstallmentCount) ||
      parsedInstallmentCount <= 0
    ) {
      setFormError(translateAppText('transactions.errorInstallmentCount'));
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
        installmentCount: transactionToEdit ? 1 : parsedInstallmentCount,
      });

      const initialState = createInitialFormState(categories);
      setAmount(initialState.amount);
      setType(initialState.type);
      setCategoryId(initialState.categoryId);
      setSubcategoryId(initialState.subcategoryId);
      setDate(initialState.date);
      setDescription(initialState.description);
      setInstallmentCount(initialState.installmentCount);
    } catch (error) {
      setFormError(resolveAppErrorMessage(error, 'transactions.errorSave'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="finance-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('transactions.formEyebrow')}</p>
          <h2>
            {transactionToEdit
              ? translateAppText('transactions.editHeading')
              : translateAppText('transactions.addHeading')}
          </h2>
        </div>
        {transactionToEdit ? (
          <button className="secondary-button" onClick={onCancelEdit} type="button">
            {translateAppText('transactions.cancelEdit')}
          </button>
        ) : null}
      </div>

      <form className="finance-form" onSubmit={handleSubmit}>
        <label className="finance-field">
          <span>{translateAppText('transactions.amount')}</span>
          <input
            inputMode="decimal"
            name="amount"
            onChange={(event) => setAmount(event.target.value)}
            type="number"
            value={amount}
          />
        </label>

        <label className="finance-field">
          <span>{translateAppText('transactions.type')}</span>
          <select name="type" onChange={(event) => setType(event.target.value as TransactionInput['type'])} value={type}>
            <option value="expense">{translateAppText('transactions.expense')}</option>
            <option value="income">{translateAppText('transactions.incomeOption')}</option>
          </select>
        </label>

        <label className="finance-field">
          <span>{translateAppText('transactions.category')}</span>
          <select
            name="categoryId"
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
            name="subcategoryId"
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
          <span>{translateAppText('transactions.date')}</span>
          <input name="date" onChange={(event) => setDate(event.target.value)} type="date" value={date} />
        </label>

        {!transactionToEdit ? (
          <label className="finance-field">
            <span>{translateAppText('transactions.installmentCount')}</span>
            <input
              inputMode="numeric"
              min="1"
              name="installmentCount"
              onChange={(event) => setInstallmentCount(event.target.value)}
              type="number"
              value={installmentCount}
            />
          </label>
        ) : null}

        <label className="finance-field finance-field--full">
          <span>{translateAppText('transactions.descriptionLabel')}</span>
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
            ? translateAppText('transactions.saving')
            : transactionToEdit
              ? translateAppText('transactions.updateTransaction')
              : translateAppText('transactions.createTransaction')}
        </button>
      </form>
    </section>
  );
}
