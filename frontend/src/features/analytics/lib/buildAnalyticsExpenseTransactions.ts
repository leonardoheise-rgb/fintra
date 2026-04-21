import { getMonthKey } from '../../../shared/lib/date/months';
import { sortTransactionsByDateDesc } from '../../finance/lib/financeSelectors';
import type { TransactionRecord } from '../../finance/finance.types';
import type { AnalyticsExpenseTransaction } from '../analytics.types';

type BuildAnalyticsExpenseTransactionsOptions = {
  transactions: TransactionRecord[];
  months: string[];
  monthStartDay: number;
  selectedCategoryId: string | null;
};

export function buildAnalyticsExpenseTransactions({
  transactions,
  months,
  monthStartDay,
  selectedCategoryId,
}: BuildAnalyticsExpenseTransactionsOptions): AnalyticsExpenseTransaction[] {
  const monthsInRange = new Set(months);

  return sortTransactionsByDateDesc(
    transactions.filter((transaction) => {
      if (transaction.type !== 'expense') {
        return false;
      }

      if (!monthsInRange.has(getMonthKey(transaction.date, monthStartDay))) {
        return false;
      }

      if (selectedCategoryId && transaction.categoryId !== selectedCategoryId) {
        return false;
      }

      return true;
    }),
  ).map((transaction) => ({
    id: transaction.id,
    amount: transaction.amount,
    categoryId: transaction.categoryId,
    subcategoryId: transaction.subcategoryId,
    date: transaction.date,
    description: transaction.description,
  }));
}
