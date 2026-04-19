import type { MonthReviewRecord, SetAsideRecord, TransactionRecord } from '../finance.types';

export type PlannedExpenseItem = {
  id: string;
  amount: number;
  description: string;
  type: 'installment' | 'expense' | 'setAside';
};

export function findMonthReview(monthReviews: MonthReviewRecord[], month: string) {
  return monthReviews.find((item) => item.month === month) ?? null;
}

export function buildPlannedExpenseItems(
  transactions: TransactionRecord[],
  setAsides: SetAsideRecord[],
): PlannedExpenseItem[] {
  const transactionItems = transactions
    .filter((item) => item.type === 'expense')
    .map((item) => ({
      id: item.id,
      amount: item.amount,
      description: item.description || 'Planned expense',
      type: item.installmentCount && item.installmentCount > 1 ? ('installment' as const) : ('expense' as const),
    }));
  const setAsideItems = setAsides.map((item) => ({
    id: item.id,
    amount: item.amount,
    description: item.description || 'Set-aside',
    type: 'setAside' as const,
  }));

  return [...transactionItems, ...setAsideItems].sort((left, right) => right.amount - left.amount);
}

export function sumPlannedExpenseItems(items: PlannedExpenseItem[]) {
  return items.reduce((total, item) => total + item.amount, 0);
}
