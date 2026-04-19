import { useEffect, useState } from 'react';

import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { translateAppText } from '../../../shared/i18n/appText';
import type { MonthReviewInput, MonthReviewRecord } from '../finance.types';
import type { PlannedExpenseItem } from '../lib/monthReviews';

type MonthReviewPromptProps = {
  currentMonth: string;
  errorMessage: string | null;
  existingReview: MonthReviewRecord | null;
  isSubmitting: boolean;
  plannedExpenseItems: PlannedExpenseItem[];
  plannedExpenseTotal: number;
  suggestedCarryOverAmount: number;
  onClose(): void;
  onSubmit(input: MonthReviewInput): void;
};

type StepId = 'expenses' | 'income' | 'carryOver';
type Choice = 'yes' | 'no';

export function MonthReviewPrompt({
  currentMonth,
  errorMessage,
  existingReview,
  isSubmitting,
  plannedExpenseItems,
  plannedExpenseTotal,
  suggestedCarryOverAmount,
  onClose,
  onSubmit,
}: MonthReviewPromptProps) {
  const [step, setStep] = useState<StepId>('expenses');
  const [incomeChoice, setIncomeChoice] = useState<Choice>('no');
  const [plannedIncomeAmount, setPlannedIncomeAmount] = useState('0');
  const [plannedIncomeDescription, setPlannedIncomeDescription] = useState('');
  const [carryOverChoice, setCarryOverChoice] = useState<Choice>('no');
  const [carryOverAmount, setCarryOverAmount] = useState('0');

  useEffect(() => {
    setStep('expenses');
    setIncomeChoice((existingReview?.plannedIncomeAmount ?? 0) > 0 ? 'yes' : 'no');
    setPlannedIncomeAmount(String(existingReview?.plannedIncomeAmount ?? 0));
    setPlannedIncomeDescription(existingReview?.plannedIncomeDescription ?? '');
    const resolvedCarryOverAmount = existingReview?.carryOverAmount ?? suggestedCarryOverAmount;
    setCarryOverChoice(resolvedCarryOverAmount !== 0 ? 'yes' : 'no');
    setCarryOverAmount(String(resolvedCarryOverAmount));
  }, [existingReview, suggestedCarryOverAmount]);

  function handleContinueFromIncome() {
    setStep('carryOver');
  }

  function handleSave() {
    onSubmit({
      month: currentMonth,
      plannedIncomeAmount: incomeChoice === 'yes' ? Number(plannedIncomeAmount) || 0 : 0,
      plannedIncomeDescription: incomeChoice === 'yes' ? plannedIncomeDescription : '',
      carryOverAmount: carryOverChoice === 'yes' ? Number(carryOverAmount) || 0 : 0,
    });
  }

  return (
    <div className="month-review-overlay" role="presentation">
      <section
        aria-labelledby="month-review-heading"
        aria-modal="true"
        className="finance-panel finance-panel--spotlight month-review-dialog"
        role="dialog"
      >
        <div className="finance-panel__heading">
          <div>
            <p className="finance-panel__eyebrow">{translateAppText('monthReview.eyebrow')}</p>
            <h2 id="month-review-heading">
              {translateAppText('monthReview.heading', {
                month: formatMonthLabel(currentMonth),
              })}
            </h2>
          </div>
          <button className="secondary-button" onClick={onClose} type="button">
            {translateAppText('monthReview.doLater')}
          </button>
        </div>

        <p className="finance-header__copy">
          {translateAppText('monthReview.stepIndicator', {
            current: step === 'expenses' ? 1 : step === 'income' ? 2 : 3,
            total: 3,
          })}
        </p>

        {step === 'expenses' ? (
          <div className="month-review-step">
            <p className="finance-header__copy">
              {translateAppText('monthReview.expensesDescription', {
                amount: formatCurrency(plannedExpenseTotal),
              })}
            </p>
            {plannedExpenseItems.length > 0 ? (
              <div className="month-review-expense-list">
                {plannedExpenseItems.map((item) => (
                  <article className="settings-preview-card" key={item.id}>
                    <span className="finance-summary-card__label">
                      {translateAppText(`monthReview.expenseType.${item.type}`)}
                    </span>
                    <strong>{item.description}</strong>
                    <span>{formatCurrency(item.amount)}</span>
                  </article>
                ))}
              </div>
            ) : (
              <p className="finance-empty-state">{translateAppText('monthReview.noPlannedExpenses')}</p>
            )}
            <div className="transaction-card__actions">
              <button className="primary-button" onClick={() => setStep('income')} type="button">
                {translateAppText('monthReview.continue')}
              </button>
            </div>
          </div>
        ) : null}

        {step === 'income' ? (
          <div className="month-review-step">
            <p className="finance-header__copy">{translateAppText('monthReview.incomeQuestion')}</p>
            <div className="month-review-choice-list">
              <label className="month-review-choice">
                <input
                  checked={incomeChoice === 'yes'}
                  name="plannedIncomeChoice"
                  onChange={() => setIncomeChoice('yes')}
                  type="radio"
                />
                <span>{translateAppText('monthReview.yesAddIncome')}</span>
              </label>
              <label className="month-review-choice">
                <input
                  checked={incomeChoice === 'no'}
                  name="plannedIncomeChoice"
                  onChange={() => setIncomeChoice('no')}
                  type="radio"
                />
                <span>{translateAppText('monthReview.noIncome')}</span>
              </label>
            </div>
            {incomeChoice === 'yes' ? (
              <div className="finance-form">
                <label className="finance-field">
                  <span>{translateAppText('monthReview.incomeAmount')}</span>
                  <input
                    min="0"
                    onChange={(event) => setPlannedIncomeAmount(event.target.value)}
                    step="0.01"
                    type="number"
                    value={plannedIncomeAmount}
                  />
                </label>
                <label className="finance-field">
                  <span>{translateAppText('monthReview.incomeDescription')}</span>
                  <input
                    onChange={(event) => setPlannedIncomeDescription(event.target.value)}
                    placeholder={translateAppText('monthReview.incomePlaceholder')}
                    type="text"
                    value={plannedIncomeDescription}
                  />
                </label>
              </div>
            ) : null}
            <div className="transaction-card__actions">
              <button className="secondary-button" onClick={() => setStep('expenses')} type="button">
                {translateAppText('monthReview.back')}
              </button>
              <button className="primary-button" onClick={handleContinueFromIncome} type="button">
                {translateAppText('monthReview.continue')}
              </button>
            </div>
          </div>
        ) : null}

        {step === 'carryOver' ? (
          <div className="month-review-step">
            <p className="finance-header__copy">
              {translateAppText('monthReview.carryOverQuestion', {
                amount: formatCurrency(suggestedCarryOverAmount),
              })}
            </p>
            <div className="month-review-choice-list">
              <label className="month-review-choice">
                <input
                  checked={carryOverChoice === 'yes'}
                  name="carryOverChoice"
                  onChange={() => {
                    setCarryOverChoice('yes');
                    setCarryOverAmount(String(existingReview?.carryOverAmount ?? suggestedCarryOverAmount));
                  }}
                  type="radio"
                />
                <span>{translateAppText('monthReview.yesCarryOver')}</span>
              </label>
              <label className="month-review-choice">
                <input
                  checked={carryOverChoice === 'no'}
                  name="carryOverChoice"
                  onChange={() => setCarryOverChoice('no')}
                  type="radio"
                />
                <span>{translateAppText('monthReview.noCarryOver')}</span>
              </label>
            </div>
            {carryOverChoice === 'yes' ? (
              <label className="finance-field">
                <span>{translateAppText('monthReview.carryOverAmount')}</span>
                <input
                  onChange={(event) => setCarryOverAmount(event.target.value)}
                  step="0.01"
                  type="number"
                  value={carryOverAmount}
                />
              </label>
            ) : null}
            {errorMessage ? <p className="finance-message finance-message--error">{errorMessage}</p> : null}
            <div className="transaction-card__actions">
              <button className="secondary-button" onClick={() => setStep('income')} type="button">
                {translateAppText('monthReview.back')}
              </button>
              <button className="primary-button" disabled={isSubmitting} onClick={handleSave} type="button">
                {isSubmitting
                  ? translateAppText('monthReview.saving')
                  : translateAppText('monthReview.finish')}
              </button>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
