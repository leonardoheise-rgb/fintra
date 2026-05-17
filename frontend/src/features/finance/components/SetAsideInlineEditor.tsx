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
  SetAsideInput,
  SetAsideRecord,
  SubcategoryRecord,
} from '../finance.types';
import { getSubcategoriesForCategory } from '../lib/financeSelectors';

type SetAsideInlineEditorProps = {
  categories: CategoryRecord[];
  isSubmitting: boolean;
  onCancel(): void;
  onSubmit(input: SetAsideInput): Promise<void>;
  setAside: SetAsideRecord;
  subcategories: SubcategoryRecord[];
};

export function SetAsideInlineEditor({
  categories,
  isSubmitting,
  onCancel,
  onSubmit,
  setAside,
  subcategories,
}: SetAsideInlineEditorProps) {
  const {
    preferences: { locale },
  } = useDisplayPreferences();
  const [amount, setAmount] = useState(formatDecimalInput(setAside.amount, locale));
  const [categoryId, setCategoryId] = useState(setAside.categoryId);
  const [subcategoryId, setSubcategoryId] = useState(setAside.subcategoryId ?? '');
  const [date, setDate] = useState(setAside.date);
  const [description, setDescription] = useState(setAside.description);
  const [formError, setFormError] = useState<string | null>(null);

  const availableSubcategories = useMemo(
    () => getSubcategoriesForCategory(subcategories, categoryId),
    [categoryId, subcategories],
  );

  useEffect(() => {
    setAmount(formatDecimalInput(setAside.amount, locale));
    setCategoryId(setAside.categoryId);
    setSubcategoryId(setAside.subcategoryId ?? '');
    setDate(setAside.date);
    setDescription(setAside.description);
    setFormError(null);
  }, [locale, setAside]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!categoryId) {
      setFormError(translateAppText('transactions.errorNeedCategory'));
      return;
    }

    const parsedAmount = parseDecimalInput(amount, locale);

    if (parsedAmount === null || parsedAmount <= 0) {
      setFormError(translateAppText('setAsides.errorAmount'));
      return;
    }

    if (!date) {
      setFormError(translateAppText('setAsides.errorDate'));
      return;
    }

    setFormError(null);

    try {
      await onSubmit({
        amount: parsedAmount,
        categoryId,
        subcategoryId: subcategoryId || null,
        date,
        description,
      });
    } catch (error) {
      setFormError(resolveAppErrorMessage(error, 'setAsides.errorSave'));
    }
  }

  return (
    <form className="finance-form finance-form--inline" onSubmit={handleSubmit}>
      <label className="finance-field">
        <span>{translateAppText('transactions.amount')}</span>
        <input
          className="finance-input--amount"
          inputMode="decimal"
          name={`inlineSetAsideAmount-${setAside.id}`}
          onBlur={(event) => setAmount(normalizeDecimalInput(event.target.value, locale))}
          onChange={(event) => setAmount(normalizeDecimalInput(event.target.value, locale))}
          type="text"
          value={amount}
        />
      </label>

      <label className="finance-field">
        <span>{translateAppText('transactions.category')}</span>
        <select
          name={`inlineSetAsideCategory-${setAside.id}`}
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
          name={`inlineSetAsideSubcategory-${setAside.id}`}
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
        <span>{translateAppText('setAsides.targetDate')}</span>
        <input
          name={`inlineSetAsideDate-${setAside.id}`}
          onChange={(event) => setDate(event.target.value)}
          type="date"
          value={date}
        />
      </label>

      <label className="finance-field finance-field--full">
        <span>{translateAppText('transactions.descriptionLabel')}</span>
        <textarea
          name={`inlineSetAsideDescription-${setAside.id}`}
          onChange={(event) => setDescription(event.target.value)}
          rows={3}
          value={description}
        />
      </label>

      {formError ? <p className="finance-message finance-message--error">{formError}</p> : null}

      <div className="transaction-card__actions">
        <button className="primary-button" disabled={isSubmitting} type="submit">
          {isSubmitting
            ? translateAppText('setAsides.saving')
            : translateAppText('setAsides.update')}
        </button>
        <button className="secondary-button" disabled={isSubmitting} onClick={onCancel} type="button">
          {translateAppText('transactions.cancelEdit')}
        </button>
      </div>
    </form>
  );
}
