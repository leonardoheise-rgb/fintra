import type { SetAsideRecord } from '../finance.types';
import { filterSetAsidesByMonth, getDueSetAsides } from './setAsides';

const setAsides: SetAsideRecord[] = [
  {
    id: 'set-aside-1',
    amount: 120,
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-03-22',
    description: 'Birthday dinner',
  },
  {
    id: 'set-aside-2',
    amount: 80,
    categoryId: 'category-food',
    subcategoryId: null,
    date: '2026-03-10',
    description: 'Gift',
  },
];

describe('set-asides helpers', () => {
  it('filters set-asides by finance month', () => {
    expect(filterSetAsidesByMonth(setAsides, '2026-03')).toHaveLength(2);
    expect(filterSetAsidesByMonth(setAsides, '2026-02', 21)).toHaveLength(1);
  });

  it('returns only overdue set-asides one day after the planned date', () => {
    expect(getDueSetAsides(setAsides, '2026-03-11').map((item) => item.id)).toEqual([
      'set-aside-2',
    ]);
    expect(getDueSetAsides(setAsides, '2026-03-25').map((item) => item.id)).toEqual([
      'set-aside-2',
      'set-aside-1',
    ]);
  });
});
