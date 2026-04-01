import { describe, expect, it } from 'vitest';

import { buildInstallmentDates, splitAmountIntoInstallments } from './installments';

describe('installments helpers', () => {
  it('splits an amount evenly and keeps the rounding remainder on the last month', () => {
    expect(splitAmountIntoInstallments(100, 3)).toEqual([33.33, 33.33, 33.34]);
  });

  it('creates one date per month in the installment plan', () => {
    expect(buildInstallmentDates('2026-03-18', 3)).toEqual([
      '2026-03-18',
      '2026-04-18',
      '2026-05-18',
    ]);
  });
});
