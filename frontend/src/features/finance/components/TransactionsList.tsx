import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { getCategoryName, getSubcategoryName } from '../lib/financeSelectors';
import type { CategoryRecord, SubcategoryRecord, TransactionRecord } from '../finance.types';

type TransactionsListProps = {
  categories: CategoryRecord[];
  onDelete(transactionId: string): Promise<void>;
  onEdit(transaction: TransactionRecord): void;
  subcategories: SubcategoryRecord[];
  transactions: TransactionRecord[];
};

export function TransactionsList({
  categories,
  onDelete,
  onEdit,
  subcategories,
  transactions,
}: TransactionsListProps) {
  return (
    <section className="finance-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">Transaction ledger</p>
          <h2>Recent entries</h2>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="finance-empty-state">
          Create your first transaction to verify the CRUD flow and see records appear instantly.
        </p>
      ) : (
        <div className="finance-list">
          {transactions.map((transaction) => (
            <article className="transaction-card" key={transaction.id}>
              <div className="transaction-card__main">
                <div>
                  <p className="transaction-card__eyebrow">{transaction.date}</p>
                  <h3>{transaction.description || 'No description'}</h3>
                  <p className="transaction-card__meta">
                    {getCategoryName(categories, transaction.categoryId)} ·{' '}
                    {getSubcategoryName(subcategories, transaction.subcategoryId)}
                  </p>
                </div>
                <div className="transaction-card__amounts">
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
                  <span>{transaction.type}</span>
                </div>
              </div>

              <div className="transaction-card__actions">
                <button className="secondary-button" onClick={() => onEdit(transaction)} type="button">
                  Edit
                </button>
                <button
                  className="secondary-button secondary-button--danger"
                  onClick={() => void onDelete(transaction.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
