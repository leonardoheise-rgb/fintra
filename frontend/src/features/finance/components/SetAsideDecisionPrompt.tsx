import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { translateAppText } from '../../../shared/i18n/appText';
import type { SetAsideRecord } from '../finance.types';

type SetAsideDecisionPromptProps = {
  errorMessage: string | null;
  isSubmitting: boolean;
  onDiscard(): void;
  onMarkSpent(): void;
  setAside: SetAsideRecord;
  title: string;
};

export function SetAsideDecisionPrompt({
  errorMessage,
  isSubmitting,
  onDiscard,
  onMarkSpent,
  setAside,
  title,
}: SetAsideDecisionPromptProps) {
  return (
    <section className="finance-panel finance-panel--spotlight">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('setAsides.promptEyebrow')}</p>
          <h2>{translateAppText('setAsides.promptHeading')}</h2>
        </div>
      </div>

      <p className="finance-header__copy">
        {translateAppText('setAsides.promptDescription', {
          title,
          date: setAside.date,
          amount: formatCurrency(setAside.amount),
        })}
      </p>

      {errorMessage ? <p className="finance-message finance-message--error">{errorMessage}</p> : null}

      <div className="transaction-card__actions set-aside-prompt__actions">
        <button
          className="primary-button"
          disabled={isSubmitting}
          onClick={onMarkSpent}
          type="button"
        >
          {isSubmitting
            ? translateAppText('setAsides.processing')
            : translateAppText('setAsides.markSpent')}
        </button>
        <button
          className="secondary-button secondary-button--danger"
          disabled={isSubmitting}
          onClick={onDiscard}
          type="button"
        >
          {translateAppText('setAsides.discard')}
        </button>
      </div>
    </section>
  );
}
