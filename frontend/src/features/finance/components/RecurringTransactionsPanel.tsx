import { translateAppText } from '../../../shared/i18n/appText';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import type { RecurringTransactionRecord } from '../finance.types';

type RecurringTransactionsPanelProps = {
  onCancel(recurringTransactionId: string): Promise<void>;
  recurringTransactions: RecurringTransactionRecord[];
};

export function RecurringTransactionsPanel({
  onCancel,
  recurringTransactions,
}: RecurringTransactionsPanelProps) {
  if (recurringTransactions.length === 0) {
    return null;
  }

  return (
    <section className="finance-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('transactions.subscriptionsEyebrow')}</p>
          <h2>{translateAppText('transactions.subscriptionsHeading')}</h2>
        </div>
      </div>
      <div className="finance-list">
        {recurringTransactions.map((transaction) => (
          <article className="transaction-card" key={transaction.id}>
            <div>
              <h3>{transaction.description || translateAppText('transactions.noDescription')}</h3>
              <p className="transaction-card__meta">{translateAppText('transactions.repeatsMonthly')}</p>
            </div>
            <div className="transaction-card__actions">
              <strong>{formatCurrency(transaction.amount)}</strong>
              <button
                className="secondary-button secondary-button--danger"
                onClick={() => void onCancel(transaction.id)}
                type="button"
              >
                {translateAppText('transactions.cancelSubscription')}
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
