import { useState } from 'react';

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
        description="A definitive record of wealth circulation. Review the ledger, shape new entries, and keep every movement tied to the same live workspace."
        eyebrow="Curation hub"
        title="Transactions"
      />

      <section className="finance-summary-grid">
        <CategoriesSummaryCard
          label="Tracked records"
          value={String(financeData.transactions.length)}
        />
        <CategoriesSummaryCard label="Income" value={formatCurrency(totalIncome)} />
        <CategoriesSummaryCard label="Expenses" value={formatCurrency(totalExpense)} />
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
          <p className="finance-empty-state">Loading transactions...</p>
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
