import { useState } from 'react';

import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { translateAppText } from '../../../shared/i18n/appText';
import { formatLocalIsoDate } from '../../../shared/lib/date/isoDates';
import { buildTransactionsCsvRows } from '../lib/transactionsCsv';
import { getInstallmentLabel } from '../lib/installments';
import {
  getCategoryName,
  getSubcategoryName,
  getTransactionDisplayIcon,
} from '../lib/financeSelectors';
import type {
  CategoryRecord,
  SubcategoryRecord,
  TransactionInput,
  TransactionRecord,
} from '../finance.types';
import { TransactionInlineEditor } from './TransactionInlineEditor';

type TransactionsListProps = {
  categories: CategoryRecord[];
  editingTransaction: TransactionRecord | null;
  isUpdatingTransaction: boolean;
  onCancelEdit(): void;
  onDelete(transactionId: string): Promise<void>;
  onExportCsv(): void;
  onStartEdit(transaction: TransactionRecord): void;
  onUpdate(transactionId: string, input: TransactionInput): Promise<void>;
  subcategories: SubcategoryRecord[];
  transactions: TransactionRecord[];
};

export function TransactionsList({
  categories,
  editingTransaction,
  isUpdatingTransaction,
  onCancelEdit,
  onDelete,
  onExportCsv,
  onStartEdit,
  onUpdate,
  subcategories,
  transactions,
}: TransactionsListProps) {
  const csvRows = buildTransactionsCsvRows(transactions, categories, subcategories);
  const [isTableViewVisible, setIsTableViewVisible] = useState(false);
  const [expandedFutureTransactionIds, setExpandedFutureTransactionIds] = useState<string[]>([]);
  const todayIsoDate = formatLocalIsoDate();

  function getTransactionTitle(transaction: TransactionRecord) {
    return transaction.description || translateAppText('transactions.noDescription');
  }

  function toggleFutureTransaction(transactionId: string) {
    setExpandedFutureTransactionIds((currentIds) =>
      currentIds.includes(transactionId)
        ? currentIds.filter((id) => id !== transactionId)
        : [...currentIds, transactionId],
    );
  }

  return (
    <section className="finance-panel ledger-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('transactions.ledgerEyebrow')}</p>
          <h2>{translateAppText('transactions.recentEntries')}</h2>
        </div>
        <div className="transaction-card__actions">
          <button
            className="secondary-button"
            onClick={() => setIsTableViewVisible((currentValue) => !currentValue)}
            type="button"
          >
            {isTableViewVisible
              ? translateAppText('transactions.hideTableView')
              : translateAppText('transactions.tableView')}
          </button>
          <button className="secondary-button" onClick={onExportCsv} type="button">
            {translateAppText('transactions.exportCsv')}
          </button>
        </div>
      </div>

      {transactions.length === 0 ? (
        <p className="finance-empty-state">{translateAppText('transactions.empty')}</p>
      ) : (
        <>
          {isTableViewVisible ? (
            <div className="csv-preview-table-wrapper">
              <table aria-label={translateAppText('transactions.csvTableLabel')} className="csv-preview-table">
                <thead>
                  <tr>
                    {csvRows[0].map((cell) => (
                      <th key={cell} scope="col">
                        {cell}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvRows.slice(1).map((row, rowIndex) => (
                    <tr key={`${row[0]}-${rowIndex}`}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${cellIndex}-${cell}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}

          <div aria-label={translateAppText('transactions.tableLabel')} className="ledger-table" role="table">
            <div className="ledger-table__head" role="row">
              <span>{translateAppText('transactions.date')}</span>
              <span>{translateAppText('transactions.descriptionLabel')}</span>
              <span>{translateAppText('transactions.category')}</span>
              <span>{translateAppText('transactions.amount')}</span>
              <span>{translateAppText('transactions.type')}</span>
              <span>{translateAppText('transactions.actions')}</span>
            </div>

            {transactions.map((transaction) => {
              const isEditing = editingTransaction?.id === transaction.id;
              const isFutureTransaction = transaction.date > todayIsoDate;
              const isFutureTransactionExpanded =
                isEditing || !isFutureTransaction || expandedFutureTransactionIds.includes(transaction.id);
              const transactionIcon = getTransactionDisplayIcon(categories, subcategories, transaction);

              return (
                <article
                  className={`ledger-row${isFutureTransaction && !isFutureTransactionExpanded ? ' ledger-row--collapsed' : ''}`}
                  key={transaction.id}
                  role="row"
                >
                  <div className="ledger-row__date">
                    <span>{transaction.date}</span>
                  </div>

                  <div className="ledger-row__description">
                    <div className="ledger-row__icon" aria-hidden="true">
                      {transactionIcon}
                    </div>
                    <div>
                      <h3>{getTransactionTitle(transaction)}</h3>
                      <p className="ledger-row__subcopy">
                        {isFutureTransaction && !isFutureTransactionExpanded
                          ? 'Future entry'
                          : getInstallmentLabel(
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

                  {isFutureTransaction ? (
                    <div className="ledger-row__actions ledger-row__actions--toggle">
                      <button
                        className="secondary-button"
                        onClick={() => toggleFutureTransaction(transaction.id)}
                        type="button"
                      >
                        {isFutureTransactionExpanded ? 'Collapse' : 'Expand'}
                      </button>
                    </div>
                  ) : null}

                  {isFutureTransactionExpanded ? (
                    <>
                      <div className="ledger-row__category">
                        <p className="transaction-card__meta">
                          {getCategoryName(categories, transaction.categoryId)}
                        </p>
                        <span className="ledger-row__tag">
                          {getSubcategoryName(subcategories, transaction.subcategoryId)}
                        </span>
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

                      {isEditing ? (
                        <div className="ledger-row__editor">
                          <TransactionInlineEditor
                            categories={categories}
                            isSubmitting={isUpdatingTransaction}
                            onCancel={onCancelEdit}
                            onSubmit={(input) => onUpdate(transaction.id, input)}
                            subcategories={subcategories}
                            transaction={transaction}
                          />
                        </div>
                      ) : (
                        <div className="transaction-card__actions ledger-row__actions">
                          <button
                            aria-label={translateAppText('transactions.editTransaction', {
                              name: getTransactionTitle(transaction),
                            })}
                            className="secondary-button"
                            onClick={() => onStartEdit(transaction)}
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
                      )}
                    </>
                  ) : null}
                </article>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}
