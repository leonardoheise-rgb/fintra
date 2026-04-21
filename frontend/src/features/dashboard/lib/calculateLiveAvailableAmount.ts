import type { MonthReviewRecord, SetAsideRecord, TransactionRecord } from '../../finance/finance.types';

type CalculateLiveAvailableAmountOptions = {
  transactions: TransactionRecord[];
  setAsides: SetAsideRecord[];
  monthReview: MonthReviewRecord | null;
};

function sumValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

/**
 * The topbar should show what is still live and available right now, so this
 * amount subtracts actual expenses and reserved money instead of forecasting
 * the rest of the budget plan.
 */
export function calculateLiveAvailableAmount({
  transactions,
  setAsides,
  monthReview,
}: CalculateLiveAvailableAmountOptions) {
  const totalIncome = sumValues(
    transactions
      .filter((transaction) => transaction.type === 'income')
      .map((transaction) => transaction.amount),
  );
  const totalExpenses = sumValues(
    transactions
      .filter((transaction) => transaction.type === 'expense')
      .map((transaction) => transaction.amount),
  );
  const totalReserved = sumValues(setAsides.map((setAside) => setAside.amount));

  return (
    totalIncome +
    (monthReview?.plannedIncomeAmount ?? 0) +
    (monthReview?.carryOverAmount ?? 0) -
    totalExpenses -
    totalReserved
  );
}
