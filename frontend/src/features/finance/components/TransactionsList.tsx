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
  function getTransactionTitle(transaction: TransactionRecord) {
    return transaction.description || 'No description';
  }

  return (
    <section className="finance-panel ledger-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">Transaction ledger</p>
          <h2>Recent entries</h2>
        </div>
        <p className="analytics-panel__caption">{transactions.length} items in view</p>
      </div>

      {transactions.length === 0 ? (
        <p className="finance-empty-state">
          Create your first transaction to verify the CRUD flow and see records appear instantly.
        </p>
      ) : (
        <div aria-label="Transactions ledger" className="ledger-table" role="table">
          <div className="ledger-table__head" role="row">
            <span>Date</span>
            <span>Description</span>
            <span>Category</span>
            <span>Amount</span>
            <span>Type</span>
            <span>Actions</span>
          </div>

          {transactions.map((transaction) => (
            <article className="ledger-row" key={transaction.id} role="row">
              <div className="ledger-row__date">
                <span>{transaction.date}</span>
              </div>

              <div className="ledger-row__description">
                <div className="ledger-row__icon" aria-hidden="true">
                  {transaction.type === 'income' ? 'IN' : 'EX'}
                </div>
                <div>
                  <h3>{getTransactionTitle(transaction)}</h3>
                  <p className="ledger-row__subcopy">
                    {transaction.description ? 'Workspace movement' : 'No detail added'}
                  </p>
                </div>
              </div>

              <div className="ledger-row__category">
                <p className="transaction-card__meta">
                  {getCategoryName(categories, transaction.categoryId)}
                </p>
                <span className="ledger-row__tag">
                  {getSubcategoryName(subcategories, transaction.subcategoryId)}
                </span>
              </div>

              <div className="transaction-card__amounts ledger-row__amounts">
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
              </div>

              <div className="ledger-row__type">
                <span
                  className={
                    transaction.type === 'income'
                      ? 'ledger-row__type-pill ledger-row__type-pill--income'
                      : 'ledger-row__type-pill ledger-row__type-pill--expense'
                  }
                >
                  {transaction.type}
                </span>
              </div>

              <div className="transaction-card__actions ledger-row__actions">
                <button
                  aria-label={`Edit transaction ${getTransactionTitle(transaction)}`}
                  className="secondary-button"
                  onClick={() => onEdit(transaction)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  aria-label={`Delete transaction ${getTransactionTitle(transaction)}`}
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
