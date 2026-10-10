import type { TransactionRecord } from '../../finance/finance.types';
import { calculateCategoryHistoricalMonthlyAverage } from './categoryHighlights';

function createExpense(month: string, amount: number): TransactionRecord {
  return {
    id: `${month}-${amount}`,
    amount,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: null,
    date: `${month}-10`,
    description: 'Food',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  };
}

describe('calculateCategoryHistoricalMonthlyAverage', () => {
  it('uses the last three completed financial months', () => {
    expect(
      calculateCategoryHistoricalMonthlyAverage(
        [
          createExpense('2026-01', 100),
          createExpense('2026-02', 200),
          createExpense('2026-03', 300),
          createExpense('2026-04', 900),
        ],
        'category-food',
        '2026-04',
        1,
      ),
    ).toBe(200);
  });

  it('does not show an average until three historical months are available', () => {
    expect(
      calculateCategoryHistoricalMonthlyAverage(
        [createExpense('2026-02', 100), createExpense('2026-03', 200)],
        'category-food',
        '2026-04',
        1,
      ),
    ).toBeNull();
  });
});
