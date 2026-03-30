import { useState } from 'react';

import { translateAppText } from '../../../shared/i18n/appText';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { useFinanceData } from '../useFinanceData';
import { FinancePageHeader } from '../components/FinancePageHeader';
import { CategoriesSummaryCard } from '../components/CategoriesSummaryCard';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionsList } from '../components/TransactionsList';
import { sortTransactionsByDateDesc } from '../lib/financeSelectors';
import type { TransactionInput, TransactionRecord } from '../finance.types';

function calculateTotalForType(
  transactions: TransactionRecord[],
  type: TransactionInput['type'],
) {
  return transactions
    .filter((transaction) => transaction.type === type)
    .reduce((total, transaction) => total + transaction.amount, 0);
}

export function TransactionsPage() {
  const financeData = useFinanceData();
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionRecord | null>(null);
  const sortedTransactions = sortTransactionsByDateDesc(financeData.transactions);
  const totalIncome = calculateTotalForType(financeData.transactions, 'income');
  const totalExpense = calculateTotalForType(financeData.transactions, 'expense');

  async function handleSubmit(input: TransactionInput) {
    if (transactionToEdit) {
      await financeData.updateTransaction(transactionToEdit.id, input);
      setTransactionToEdit(null);
      return;
    }

    await financeData.createTransaction(input);
  }

  return (
    <div className="finance-page finance-page--transactions">
      <FinancePageHeader
        description={translateAppText('transactions.description')}
        eyebrow={translateAppText('transactions.eyebrow')}
        title={translateAppText('transactions.title')}
      />

      <section className="finance-summary-grid">
        <CategoriesSummaryCard
          label={translateAppText('transactions.trackedRecords')}
          value={String(financeData.transactions.length)}
        />
        <CategoriesSummaryCard label={translateAppText('dashboard.income')} value={formatCurrency(totalIncome)} />
        <CategoriesSummaryCard label={translateAppText('dashboard.expenses')} value={formatCurrency(totalExpense)} />
      </section>

      {financeData.errorMessage ? (
        <section aria-live="assertive" className="finance-panel">
          <p className="finance-message finance-message--error" role="alert">
            {financeData.errorMessage}
          </p>
        </section>
      ) : null}

      {financeData.status === 'loading' ? (
        <section aria-live="polite" className="finance-panel">
          <p className="finance-empty-state">{translateAppText('transactions.loading')}</p>
        </section>
      ) : (
        <div className="finance-grid finance-grid--ledger">
          <TransactionsList
            categories={financeData.categories}
            onDelete={financeData.deleteTransaction}
            onEdit={setTransactionToEdit}
            subcategories={financeData.subcategories}
            transactions={sortedTransactions}
          />
          <TransactionForm
            categories={financeData.categories}
            onCancelEdit={() => setTransactionToEdit(null)}
            onSubmit={handleSubmit}
            subcategories={financeData.subcategories}
            transactionToEdit={transactionToEdit}
          />
        </div>
      )}
    </div>
  );
}
