import { useState } from 'react';

import { translateAppText } from '../../../shared/i18n/appText';
import { useFinanceData } from '../useFinanceData';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionsList } from '../components/TransactionsList';
import { sortTransactionsByDateDesc } from '../lib/financeSelectors';
import type { TransactionInput, TransactionRecord } from '../finance.types';

export function TransactionsPage() {
  const financeData = useFinanceData();
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionRecord | null>(null);
  const sortedTransactions = sortTransactionsByDateDesc(financeData.transactions);

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
