import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { resolveAppErrorMessage } from '../../../shared/i18n/appErrors';
import { translateAppText } from '../../../shared/i18n/appText';
import {
  formatDecimalInput,
  normalizeDecimalInput,
  parseDecimalInput,
} from '../../../shared/lib/formatters/decimalInput';
import { useDisplayPreferences } from '../../settings/useDisplayPreferences';
import type {
  CategoryRecord,
  SubcategoryRecord,
  TransactionInput,
  TransactionRecord,
} from '../finance.types';
import { getSubcategoriesForCategory } from '../lib/financeSelectors';

type TransactionInlineEditorProps = {
  categories: CategoryRecord[];
  isSubmitting: boolean;
  onCancel(): void;
  onSubmit(input: TransactionInput): Promise<void>;
  subcategories: SubcategoryRecord[];
  transaction: TransactionRecord;
};

export function TransactionInlineEditor({
  categories,
  isSubmitting,
  onCancel,
  onSubmit,
  subcategories,
  transaction,
}: TransactionInlineEditorProps) {
  const {
    preferences: { locale },
  } = useDisplayPreferences();
  const [amount, setAmount] = useState(formatDecimalInput(transaction.amount, locale));
  const [type, setType] = useState<TransactionInput['type']>(transaction.type);
  const [categoryId, setCategoryId] = useState(transaction.categoryId);
  const [subcategoryId, setSubcategoryId] = useState(transaction.subcategoryId ?? '');
  const [date, setDate] = useState(transaction.date);
  const [description, setDescription] = useState(transaction.description);
  const [formError, setFormError] = useState<string | null>(null);

  const availableSubcategories = useMemo(
    () => getSubcategoriesForCategory(subcategories, categoryId),
    [categoryId, subcategories],
  );

  useEffect(() => {
    setAmount(formatDecimalInput(transaction.amount, locale));
    setType(transaction.type);
    setCategoryId(transaction.categoryId);
    setSubcategoryId(transaction.subcategoryId ?? '');
    setDate(transaction.date);
    setDescription(transaction.description);
    setFormError(null);
  }, [locale, transaction]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId) {
      setFormError(translateAppText('transactions.errorNeedCategory'));
      return;
    }

    const parsedAmount = parseDecimalInput(amount, locale);

    if (parsedAmount === null || parsedAmount <= 0) {
      setFormError(translateAppText('transactions.errorAmount'));
      return;
    }

    if (!date) {
      setFormError(translateAppText('transactions.errorDate'));
      return;
    }

    setFormError(null);

    try {
      await onSubmit({
        amount: parsedAmount,
        type,
        categoryId,
        subcategoryId: subcategoryId || null,
        date,
        description,
        installmentCount: 1,
      });
    } catch (error) {
      setFormError(resolveAppErrorMessage(error, 'transactions.errorSave'));
    }
  }

  return (
    <form className="finance-form finance-form--inline" onSubmit={handleSubmit}>
      <label className="finance-field">
        <span>{translateAppText('transactions.amount')}</span>
        <input
          className="finance-input--amount"
          inputMode="decimal"
          name={`inlineAmount-${transaction.id}`}
          onBlur={(event) => setAmount(normalizeDecimalInput(event.target.value, locale))}
          onChange={(event) => setAmount(normalizeDecimalInput(event.target.value, locale))}
          type="text"
          value={amount}
        />
      </label>

      <label className="finance-field">
        <span>{translateAppText('transactions.type')}</span>
        <select
          name={`inlineType-${transaction.id}`}
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
          name={`inlineCategory-${transaction.id}`}
          onChange={(event) => {
            setCategoryId(event.target.value);
            setSubcategoryId('');
          }}
          value={categoryId}
        >
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
          name={`inlineSubcategory-${transaction.id}`}
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
        <input
          name={`inlineDate-${transaction.id}`}
          onChange={(event) => setDate(event.target.value)}
          type="date"
          value={date}
        />
      </label>

      <label className="finance-field finance-field--full">
        <span>{translateAppText('transactions.descriptionLabel')}</span>
        <textarea
          name={`inlineDescription-${transaction.id}`}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          value={description}
        />
      </label>

      {formError ? <p className="finance-message finance-message--error">{formError}</p> : null}

      <div className="transaction-card__actions">
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting
            ? translateAppText('transactions.saving')
            : translateAppText('transactions.updateTransaction')}
        </button>
        <button className="secondary-button" disabled={isSubmitting} onClick={onCancel} type="button">
          {translateAppText('transactions.cancelEdit')}
        </button>
      </div>
    </form>
  );
}
