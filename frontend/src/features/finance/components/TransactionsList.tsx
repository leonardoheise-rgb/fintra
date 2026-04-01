import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { translateAppText } from '../../../shared/i18n/appText';
import { getInstallmentLabel } from '../lib/installments';
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
    return transaction.description || translateAppText('transactions.noDescription');
  }

  return (
    <section className="finance-panel ledger-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('transactions.ledgerEyebrow')}</p>
          <h2>{translateAppText('transactions.recentEntries')}</h2>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="finance-empty-state">{translateAppText('transactions.empty')}</p>
      ) : (
        <div aria-label={translateAppText('transactions.tableLabel')} className="ledger-table" role="table">
          <div className="ledger-table__head" role="row">
            <span>{translateAppText('transactions.date')}</span>
            <span>{translateAppText('transactions.descriptionLabel')}</span>
            <span>{translateAppText('transactions.category')}</span>
            <span>{translateAppText('transactions.amount')}</span>
            <span>{translateAppText('transactions.type')}</span>
            <span>{translateAppText('transactions.actions')}</span>
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
                    {getInstallmentLabel(
                      transaction.installmentIndex,
                      transaction.installmentCount,
                    )
                      ? translateAppText('transactions.installmentCaption', {
                          installment: getInstallmentLabel(
                            transaction.installmentIndex,
                            transaction.installmentCount,
                          ) ?? '',
                        })
                      : transaction.description
                        ? translateAppText('transactions.workspaceMovement')
                        : translateAppText('transactions.noDetailAdded')}
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
                  {transaction.type === 'income'
                    ? translateAppText('transactions.incomeOption')
                    : translateAppText('transactions.expense')}
                </span>
              </div>

              <div className="transaction-card__actions ledger-row__actions">
                <button
                  aria-label={translateAppText('transactions.editTransaction', {
                    name: getTransactionTitle(transaction),
                  })}
                  className="secondary-button"
                  onClick={() => onEdit(transaction)}
                  type="button"
                >
                  {translateAppText('transactions.edit')}
                </button>
                <button
                  aria-label={translateAppText('transactions.deleteTransaction', {
                    name: getTransactionTitle(transaction),
                  })}
                  className="secondary-button secondary-button--danger"
                  onClick={() => void onDelete(transaction.id)}
                  type="button"
                >
                  {translateAppText('transactions.delete')}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
