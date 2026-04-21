import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { translateAppText } from '../../../shared/i18n/appText';
import type {
  SubcategoryRecord,
  TransactionRecord,
} from '../../finance/finance.types';
import { getSubcategoryName } from '../../finance/lib/financeSelectors';

type CategoryTransactionsDialogProps = {
  categoryName: string;
  month: string;
  onClose(): void;
  subcategories: SubcategoryRecord[];
  transactions: TransactionRecord[];
};

export function CategoryTransactionsDialog({
  categoryName,
  month,
  onClose,
  subcategories,
  transactions,
}: CategoryTransactionsDialogProps) {
  return (
    <div
      aria-labelledby="category-transactions-title"
      aria-modal="true"
      className="month-review-overlay"
      role="dialog"
    >
      <section className="finance-panel month-review-dialog">
        <div className="finance-panel__heading">
          <div>
            <p className="finance-panel__eyebrow">
              {translateAppText('dashboard.categoryTransactionsEyebrow')}
            </p>
            <h2 id="category-transactions-title">
              {translateAppText('dashboard.categoryTransactionsTitle', {
                category: categoryName,
                month: formatMonthLabel(month),
              })}
            </h2>
          </div>
          <button className="secondary-button" onClick={onClose} type="button">
            {translateAppText('dashboard.closeCategoryTransactions')}
          </button>
        </div>

        {transactions.length === 0 ? (
          <p className="finance-empty-state">
            {translateAppText('dashboard.noCategoryTransactions', { category: categoryName })}
          </p>
        ) : (
          <div className="finance-list">
            {transactions.map((transaction) => (
              <article className="analytics-transaction-card" key={transaction.id}>
                <div>
                  <strong>
                    {transaction.description || translateAppText('transactions.noDescription')}
                  </strong>
                  <p className="analytics-transaction-card__meta">
                    {transaction.date} · {getSubcategoryName(subcategories, transaction.subcategoryId)}
                  </p>
                </div>
                <div className="analytics-transaction-card__amounts">
                  <strong
                    className={
                      transaction.type === 'income'
                        ? 'transaction-card__amount transaction-card__amount--income'
                        : 'transaction-card__amount transaction-card__amount--expense'
                    }
                  >
                    {transaction.type === 'income' ? '+' : '-'}
                    {formatCurrency(transaction.amount)}
                  </strong>
                  <span>
                    {transaction.type === 'income'
                      ? translateAppText('transactions.incomeOption')
                      : translateAppText('transactions.expense')}
                  </span>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
