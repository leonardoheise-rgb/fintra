import { useEffect, useMemo, useState, type FormEvent } from 'react';

import { resolveAppErrorMessage } from '../../../shared/i18n/appErrors';
import { translateAppText } from '../../../shared/i18n/appText';
import { formatLocalIsoDate } from '../../../shared/lib/date/isoDates';
import {
  normalizeDecimalInput,
  parseDecimalInput,
} from '../../../shared/lib/formatters/decimalInput';
import { useDisplayPreferences } from '../../settings/useDisplayPreferences';
import type {
  CategoryRecord,
  SetAsideInput,
  SubcategoryRecord,
} from '../finance.types';
import { getSubcategoriesForCategory } from '../lib/financeSelectors';

type SetAsideFormProps = {
  categories: CategoryRecord[];
  subcategories: SubcategoryRecord[];
  onSubmit(input: SetAsideInput): Promise<void>;
};

function createInitialFormState(categories: CategoryRecord[]) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  return {
    amount: '',
    categoryId: categories[0]?.id ?? '',
    subcategoryId: '',
    date: formatLocalIsoDate(tomorrow),
    description: '',
  };
}

export function SetAsideForm({
  categories,
  onSubmit,
  subcategories,
}: SetAsideFormProps) {
  const {
    preferences: { locale },
  } = useDisplayPreferences();
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id ?? '');
  const [subcategoryId, setSubcategoryId] = useState('');
  const [date, setDate] = useState(() => createInitialFormState(categories).date);
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const availableSubcategories = useMemo(
    () => getSubcategoriesForCategory(subcategories, categoryId),
    [categoryId, subcategories],
  );

  useEffect(() => {
    if (categoryId || categories.length === 0) {
      return;
    }

    setCategoryId(categories[0].id);
  }, [categories, categoryId]);

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

    const today = formatLocalIsoDate();

    if (date <= today) {
      setFormError(translateAppText('setAsides.errorFutureDate'));
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      await onSubmit({
        amount: parsedAmount,
        categoryId,
        subcategoryId: subcategoryId || null,
        date,
        description,
      });

      const initialState = createInitialFormState(categories);
      setAmount(initialState.amount);
      setCategoryId(initialState.categoryId);
      setSubcategoryId(initialState.subcategoryId);
      setDate(initialState.date);
      setDescription(initialState.description);
    } catch (error) {
      setFormError(resolveAppErrorMessage(error, 'setAsides.errorSave'));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="finance-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('setAsides.formEyebrow')}</p>
          <h2>{translateAppText('setAsides.addHeading')}</h2>
        </div>
      </div>

      <form className="finance-form" onSubmit={handleSubmit}>
        <label className="finance-field">
          <span>{translateAppText('transactions.amount')}</span>
          <input
            inputMode="decimal"
            name="setAsideAmount"
            onBlur={(event) => setAmount(normalizeDecimalInput(event.target.value, locale))}
            onChange={(event) => setAmount(normalizeDecimalInput(event.target.value, locale))}
            type="text"
            value={amount}
          />
        </label>

        <label className="finance-field">
          <span>{translateAppText('transactions.category')}</span>
          <select
            name="setAsideCategoryId"
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
            name="setAsideSubcategoryId"
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
            name="setAsideDate"
            onChange={(event) => setDate(event.target.value)}
            type="date"
            value={date}
          />
        </label>

        <label className="finance-field finance-field--full">
          <span>{translateAppText('transactions.descriptionLabel')}</span>
          <textarea
            name="setAsideDescription"
            onChange={(event) => setDescription(event.target.value)}
            rows={3}
            value={description}
          />
        </label>

        {formError ? <p className="finance-message finance-message--error">{formError}</p> : null}

        <button className="primary-button finance-form__submit" disabled={isSubmitting} type="submit">
          {isSubmitting
            ? translateAppText('setAsides.saving')
            : translateAppText('setAsides.create')}
        </button>
      </form>
    </section>
  );
}
