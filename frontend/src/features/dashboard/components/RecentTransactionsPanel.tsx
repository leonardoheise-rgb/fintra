import { Link } from 'react-router-dom';

import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { getCategoryName, getSubcategoryName } from '../../finance/lib/financeSelectors';
import type {
  CategoryRecord,
  SubcategoryRecord,
  TransactionRecord,
} from '../../finance/finance.types';

type RecentTransactionsPanelProps = {
  categories: CategoryRecord[];
  subcategories: SubcategoryRecord[];
  transactions: TransactionRecord[];
};

export function RecentTransactionsPanel({
  categories,
  subcategories,
  transactions,
}: RecentTransactionsPanelProps) {
  return (
    <section
      aria-labelledby="recent-activity-title"
      className="finance-panel recent-activity-panel"
    >
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">Recent activity</p>
          <h2 id="recent-activity-title">Latest ledger entries</h2>
        </div>
        <Link className="secondary-button" to="/transactions">
          View all
        </Link>
      </div>

      {transactions.length === 0 ? (
        <p className="finance-empty-state">
          Add your first transaction to start building a live activity stream.
        </p>
      ) : (
        <div className="recent-activity-list">
          {transactions.slice(0, 5).map((transaction) => (
            <article className="recent-activity-item" key={transaction.id}>
              <div className="recent-activity-item__icon" aria-hidden="true">
                {transaction.type === 'income' ? 'IN' : 'EX'}
              </div>
              <div>
                <h3>{transaction.description || 'Untitled entry'}</h3>
                <p>
                  {getCategoryName(categories, transaction.categoryId)}
                  {' / '}
                  {getSubcategoryName(subcategories, transaction.subcategoryId)}
                </p>
                <span>{transaction.date}</span>
              </div>
              <strong
                className={
                  transaction.type === 'income'
                    ? 'recent-activity-item__amount recent-activity-item__amount--income'
                    : 'recent-activity-item__amount recent-activity-item__amount--expense'
                }
              >
                {transaction.type === 'income' ? '+' : '-'}
                {formatCurrency(transaction.amount)}
              </strong>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
