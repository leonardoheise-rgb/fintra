import { createPreviewWorkspace } from '../../finance/lib/previewWorkspace';
import type { FinanceWorkspace } from '../../finance/finance.types';
import { buildFinanceNotifications } from './buildNotifications';

function createWorkspaceForNotifications(): FinanceWorkspace {
  const workspace = createPreviewWorkspace();

  workspace.transactions = [
    {
      id: 'transaction-salary',
      amount: 6500,
      type: 'income',
      categoryId: 'category-salary',
      subcategoryId: null,
      date: '2026-04-01',
      description: 'Monthly salary',
      installmentGroupId: null,
      installmentIndex: null,
      installmentCount: null,
    },
    {
      id: 'transaction-restaurants-overrun',
      amount: 420,
      type: 'expense',
      categoryId: 'category-food',
      subcategoryId: 'subcategory-restaurants',
      date: '2026-04-03',
      description: 'Team dinner',
      installmentGroupId: null,
      installmentIndex: null,
      installmentCount: null,
    },
    {
      id: 'transaction-transport-buffer',
      amount: 40,
      type: 'expense',
      categoryId: 'category-transport',
      subcategoryId: 'subcategory-transit',
      date: '2026-04-04',
      description: 'Transit pass',
      installmentGroupId: null,
      installmentIndex: null,
      installmentCount: null,
    },
    {
      id: 'transaction-laptop-1',
      amount: 200,
      type: 'expense',
      categoryId: 'category-housing',
      subcategoryId: 'subcategory-rent',
      date: '2026-03-10',
      description: 'Laptop',
      installmentGroupId: 'installment-group-laptop',
      installmentIndex: 1,
      installmentCount: 2,
    },
    {
      id: 'transaction-laptop-2',
      amount: 200,
      type: 'expense',
      categoryId: 'category-housing',
      subcategoryId: 'subcategory-rent',
      date: '2026-04-10',
      description: 'Laptop',
      installmentGroupId: 'installment-group-laptop',
      installmentIndex: 2,
      installmentCount: 2,
    },
  ];
  workspace.setAsides = [
    {
      id: 'set-aside-due',
      amount: 125,
      categoryId: 'category-food',
      subcategoryId: 'subcategory-restaurants',
      date: '2026-04-04',
      description: 'Birthday dinner',
    },
  ];
  workspace.budgets = [
    {
      id: 'budget-food-restaurants',
      categoryId: 'category-food',
      subcategoryId: 'subcategory-restaurants',
      amount: 220,
    },
    {
      id: 'budget-transport',
      categoryId: 'category-transport',
      subcategoryId: null,
      amount: 400,
    },
    {
      id: 'budget-housing',
      categoryId: 'category-housing',
      subcategoryId: null,
      amount: 2500,
    },
  ];
  workspace.budgetOverrides = [];

  return workspace;
}

describe('buildFinanceNotifications', () => {
  it('builds notifications for budget overruns, reallocations, due set-asides, and installment completion', () => {
    const notifications = buildFinanceNotifications(createWorkspaceForNotifications(), {
      currency: 'USD',
      locale: 'en-US',
      monthStartDay: 1,
      todayIsoDate: '2026-04-15',
    });

    expect(notifications.map((notification) => notification.type)).toEqual([
      'set-aside-due',
      'budget-overrun',
      'budget-reallocation',
      'installment-complete',
    ]);
    expect(notifications[0]).toMatchObject({
      actionHref: '/transactions',
      requiresAction: true,
      title: 'Reserved money needs a decision for Birthday dinner',
    });
    expect(notifications[1]).toMatchObject({
      actionHref: '/budgets',
      requiresAction: true,
      title: 'Food and dining is over budget',
    });
    expect(notifications[2].description).toContain('Move');
    expect(notifications[3]).toMatchObject({
      actionHref: '/transactions',
      requiresAction: false,
      title: 'Laptop installment plan is finished',
    });
  });
});
