import type { DashboardSnapshot } from './dashboard.types';

export const dashboardSnapshot: DashboardSnapshot = {
  month: '2026-03',
  totalBudget: 12450,
  remainingFunds: 2241.12,
  averageMonthlySpend: 9400,
  currentDelta: 1220,
  insight:
    'Food and mobility categories are the first places where monthly overrides will matter. The shell is ready for those effective-budget calculations in the next milestone.',
  cards: [
    {
      id: 'housing',
      name: 'Housing',
      shortLabel: 'HS',
      defaultBudget: 3500,
      spent: 3050,
    },
    {
      id: 'food',
      name: 'Food and dining',
      shortLabel: 'FD',
      defaultBudget: 800,
      overrideBudget: 1200,
      spent: 1324.5,
    },
    {
      id: 'transport',
      name: 'Transport',
      shortLabel: 'TR',
      defaultBudget: 600,
      spent: 280,
    },
    {
      id: 'entertainment',
      name: 'Entertainment',
      shortLabel: 'EN',
      defaultBudget: 400,
      overrideBudget: 250,
      spent: 200,
    },
    {
      id: 'shopping',
      name: 'Shopping',
      shortLabel: 'SH',
      defaultBudget: 1500,
      spent: 400,
    },
  ],
};
