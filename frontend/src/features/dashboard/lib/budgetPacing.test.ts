import { resolveBudgetPacing } from './budgetPacing';

describe('resolveBudgetPacing', () => {
  it('marks a budget as above the ideal pace when spending is ahead of elapsed days', () => {
    expect(
      resolveBudgetPacing(50, '2026-03', 1, new Date('2026-03-04T12:00:00.000Z')),
    ).toMatchObject({
      status: 'above',
    });
  });

  it('marks a budget as below the ideal pace when spending is behind elapsed days', () => {
    expect(
      resolveBudgetPacing(10, '2026-03', 1, new Date('2026-03-20T12:00:00.000Z')),
    ).toMatchObject({
      status: 'below',
    });
  });

  it('uses the configured month start day when calculating elapsed time', () => {
    const pacing = resolveBudgetPacing(12, '2026-03', 15, new Date('2026-03-18T12:00:00.000Z'));

    expect(pacing.elapsedPercentage).toBeLessThan(15);
    expect(pacing.status).toBe('aligned');
  });
});
