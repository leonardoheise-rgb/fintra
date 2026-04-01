import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { translateAppText } from '../../../shared/i18n/appText';

type BudgetReallocationOption = {
  categoryId: string;
  categoryName: string;
};

type BudgetReallocationPromptProps = {
  amount: number;
  errorMessage: string | null;
  isSubmitting: boolean;
  month: string;
  onDismiss(): void;
  onSubmit(): void;
  onUpdateSelectedCategory(categoryId: string): void;
  options: BudgetReallocationOption[];
  selectedCategoryId: string;
  sourceCategoryName: string;
};

export function BudgetReallocationPrompt({
  amount,
  errorMessage,
  isSubmitting,
  month,
  onDismiss,
  onSubmit,
  onUpdateSelectedCategory,
  options,
  selectedCategoryId,
  sourceCategoryName,
}: BudgetReallocationPromptProps) {
  return (
    <section className="finance-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('transactions.reallocationEyebrow')}</p>
          <h2>{translateAppText('transactions.reallocationHeading')}</h2>
        </div>
        <button className="secondary-button" onClick={onDismiss} type="button">
          {translateAppText('transactions.reallocationSkip')}
        </button>
      </div>

      <p className="finance-message">
        {translateAppText('transactions.reallocationDescription', {
          category: sourceCategoryName,
          amount: formatCurrency(amount),
          month: formatMonthLabel(month),
        })}
      </p>

      {options.length > 0 ? (
        <div className="finance-form">
          <label className="finance-field">
            <span>{translateAppText('transactions.reallocationDonorCategory')}</span>
            <select
              name="budgetDonorCategory"
              onChange={(event) => onUpdateSelectedCategory(event.target.value)}
              value={selectedCategoryId}
            >
              {options.map((option) => (
                <option key={option.categoryId} value={option.categoryId}>
                  {option.categoryName}
                </option>
              ))}
            </select>
          </label>

          {errorMessage ? <p className="finance-message finance-message--error">{errorMessage}</p> : null}

          <button className="primary-button finance-form__submit" disabled={isSubmitting} onClick={onSubmit} type="button">
            {isSubmitting
              ? translateAppText('transactions.reallocationSaving')
              : translateAppText('transactions.reallocationConfirm')}
          </button>
        </div>
      ) : (
        <p className="finance-message finance-message--error">
          {translateAppText('transactions.reallocationNoOptions')}
        </p>
      )}
    </section>
  );
}
