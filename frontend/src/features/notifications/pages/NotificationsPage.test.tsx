import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { formatLocalIsoDate } from '../../../shared/lib/date/isoDates';
import { getCurrentMonthKey, shiftMonthKey } from '../../../shared/lib/date/months';
import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';
import { createPreviewWorkspace } from '../../finance/lib/previewWorkspace';

function buildIsoDateFromMonth(month: string, day: string) {
  return `${month}-${day}`;
}

describe('NotificationsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders notifications and lets the user mark them as read', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });
    const todayIsoDate = formatLocalIsoDate();
    const currentMonth = getCurrentMonthKey(new Date());
    const previousMonth = shiftMonthKey(currentMonth, -1);
    const workspace = createPreviewWorkspace();

    workspace.transactions = [
      {
        id: 'transaction-salary',
        amount: 6500,
        type: 'income',
        categoryId: 'category-salary',
        subcategoryId: null,
        date: buildIsoDateFromMonth(currentMonth, '01'),
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
        date: buildIsoDateFromMonth(currentMonth, '03'),
        description: 'Team dinner',
        installmentGroupId: null,
        installmentIndex: null,
        installmentCount: null,
      },
      {
        id: 'transaction-transport-buffer',
        amount: 30,
        type: 'expense',
        categoryId: 'category-transport',
        subcategoryId: 'subcategory-transit',
        date: buildIsoDateFromMonth(currentMonth, '04'),
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
        date: buildIsoDateFromMonth(previousMonth, '10'),
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
        date: todayIsoDate,
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
        date: formatLocalIsoDate(new Date(2000, 0, 1)),
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

    window.localStorage.setItem(
      'fintra.preview.workspace.test-finance-user',
      JSON.stringify(workspace),
    );

    await renderAppAtPath('/notifications', authService.service);

    expect(
      await screen.findByRole('heading', { name: /^notifications$/i, level: 1 }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /reserved money needs a decision/i, level: 3 })).toBeInTheDocument();
    expect(screen.getAllByRole('button', { name: /mark as read/i })).toHaveLength(4);

    await user.click(screen.getAllByRole('button', { name: /mark as read/i })[0]);

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /^read$/i })).toBeDisabled();
    });
  });
});
