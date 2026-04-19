import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { resolveAppErrorMessage } from '../../../shared/i18n/appErrors';
import { translateAppText } from '../../../shared/i18n/appText';
import {
  formatDecimalInput,
  normalizeDecimalInput,
  normalizeImplicitCurrencyInput,
  parseDecimalInput,
  parseImplicitCurrencyInput,
} from '../../../shared/lib/formatters/decimalInput';
import { useAuth } from '../../auth/useAuth';
import { useDisplayPreferences } from '../../settings/useDisplayPreferences';
import type {
  CategoryRecord,
  SubcategoryRecord,
  TransactionInput,
  TransactionRecord,
} from '../finance.types';
import { getSubcategoriesForCategory } from '../lib/financeSelectors';
import {
  clearTransactionFormDraft,
  readTransactionFormDraft,
  writeTransactionFormDraft,
} from '../lib/transactionFormDraft';

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

function isSubcategoryValid(
  subcategories: SubcategoryRecord[],
  categoryId: string,
  subcategoryId: string,
) {
  if (!subcategoryId) {
    return true;
  }

  return subcategories.some(
    (subcategory) =>
      subcategory.id === subcategoryId && subcategory.categoryId === categoryId,
  );
}

export function TransactionForm({
  categories,
  onCancelEdit,
  onSubmit,
  subcategories,
  transactionToEdit,
}: TransactionFormProps) {
  const auth = useAuth();
  const {
    preferences: { locale },
  } = useDisplayPreferences();
  const [amount, setAmount] = useState(
    transactionToEdit ? formatDecimalInput(transactionToEdit.amount, locale) : '',
  );
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
      setAmount(formatDecimalInput(transactionToEdit.amount, locale));
      setType(transactionToEdit.type);
      setCategoryId(transactionToEdit.categoryId);
      setSubcategoryId(transactionToEdit.subcategoryId ?? '');
      setDate(transactionToEdit.date);
      setDescription(transactionToEdit.description);
      setInstallmentCount(String(transactionToEdit.installmentCount ?? 1));
      return;
    }

    const initialState = createInitialFormState(categories);
    const storedDraft = auth.user ? readTransactionFormDraft(auth.user.id) : null;

    if (!storedDraft) {
      setAmount(initialState.amount);
      setType(initialState.type);
      setCategoryId(initialState.categoryId);
      setSubcategoryId(initialState.subcategoryId);
      setDate(initialState.date);
      setDescription(initialState.description);
      setInstallmentCount(initialState.installmentCount);
      return;
    }

    const nextCategoryId = storedDraft.categoryId || initialState.categoryId;
    const nextSubcategoryId = isSubcategoryValid(
      subcategories,
      nextCategoryId,
      storedDraft.subcategoryId,
    )
      ? storedDraft.subcategoryId
      : '';

    setAmount(normalizeImplicitCurrencyInput(storedDraft.amount, locale));
    setType(storedDraft.type);
    setCategoryId(nextCategoryId);
    setSubcategoryId(nextSubcategoryId);
    setDate(storedDraft.date || initialState.date);
    setDescription(storedDraft.description);
    setInstallmentCount(storedDraft.installmentCount || '1');
  }, [auth.user, categories, locale, subcategories, transactionToEdit]);

  useEffect(() => {
    if (!auth.user || transactionToEdit) {
      return;
    }

    writeTransactionFormDraft(auth.user.id, {
      amount,
      type,
      categoryId,
      subcategoryId,
      date,
      description,
      installmentCount,
    });
  }, [
    amount,
    auth.user,
    categoryId,
    date,
    description,
    installmentCount,
    subcategoryId,
    transactionToEdit,
    type,
  ]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId) {
      setFormError(translateAppText('transactions.errorNeedCategory'));
      return;
    }

    const parsedAmount = transactionToEdit
      ? parseDecimalInput(amount, locale)
      : parseImplicitCurrencyInput(amount);

    if (parsedAmount === null || parsedAmount <= 0) {
      setFormError(translateAppText('transactions.errorAmount'));
      return;
    }

    if (!date) {
      setFormError(translateAppText('transactions.errorDate'));
      return;
    }

    const parsedInstallmentCount = Number(installmentCount);

    if (!Number.isInteger(parsedInstallmentCount) || parsedInstallmentCount <= 0) {
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

      if (auth.user && !transactionToEdit) {
        clearTransactionFormDraft(auth.user.id);
      }
    } catch (error) {
      setFormError(resolveAppErrorMessage(error, 'transactions.errorSave'));
    } finally {
      setIsSubmitting(false);
    }
  }

  const amountInputValue = transactionToEdit ? amount : normalizeImplicitCurrencyInput(amount, locale);

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
            className="finance-input--amount"
            inputMode={transactionToEdit ? 'decimal' : 'numeric'}
            name="amount"
            onBlur={(event) => {
              if (transactionToEdit) {
                setAmount(normalizeDecimalInput(event.target.value, locale));
              }
            }}
            onChange={(event) => {
              setAmount(
                transactionToEdit
                  ? normalizeDecimalInput(event.target.value, locale)
                  : normalizeImplicitCurrencyInput(event.target.value, locale),
              );
            }}
            type="text"
            value={amountInputValue}
          />
        </label>

        <label className="finance-field">
          <span>{translateAppText('transactions.type')}</span>
          <select
            name="type"
            onChange={(event) => setType(event.target.value as TransactionInput['type'])}
            value={type}
          >
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
            {categories.length === 0 ? (
              <option value="">{translateAppText('transactions.noCategoriesYet')}</option>
            ) : null}
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
