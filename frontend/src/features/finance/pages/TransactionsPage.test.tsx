import { screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';

async function waitForTransactionsToLoad() {
  const loadingState = screen.queryByText(/loading transactions/i);

  if (loadingState) {
    await waitForElementToBeRemoved(loadingState, { timeout: 8000 });
  }
}

describe('TransactionsPage', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('renders existing preview transactions on the protected route', async () => {
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/transactions', authService.service);

    await waitForTransactionsToLoad();

    expect(
      await screen.findByRole('heading', { name: /^transactions$/i, level: 1 }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /recent entries/i }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/money flow/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/tracked records/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/items in view/i)).not.toBeInTheDocument();
    expect(
      (await screen.findAllByRole('button', { name: /edit transaction monthly salary/i }, { timeout: 8000 })).length,
    ).toBeGreaterThan(0);
  }, 10000);

  it('creates a split transaction from the form', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    const { container } = await renderAppAtPath('/transactions', authService.service);

    await waitForTransactionsToLoad();

    const amountInput = container.querySelector<HTMLInputElement>('input[name="amount"]');
    const categorySelect = container.querySelector<HTMLSelectElement>('select[name="categoryId"]');
    const subcategorySelect = container.querySelector<HTMLSelectElement>('select[name="subcategoryId"]');
    const dateInput = container.querySelector<HTMLInputElement>('input[name="date"]');
    const installmentInput = container.querySelector<HTMLInputElement>('input[name="installmentCount"]');
    const descriptionInput = container.querySelector<HTMLTextAreaElement>('textarea[name="description"]');

    expect(amountInput).not.toBeNull();
    expect(categorySelect).not.toBeNull();
    expect(subcategorySelect).not.toBeNull();
    expect(dateInput).not.toBeNull();
    expect(installmentInput).not.toBeNull();
    expect(descriptionInput).not.toBeNull();

    await user.clear(amountInput!);
    await user.type(amountInput!, '45');
    await user.selectOptions(categorySelect!, 'category-food');
    await user.selectOptions(subcategorySelect!, 'subcategory-restaurants');
    await user.clear(dateInput!);
    await user.type(dateInput!, '2026-03-18');
    await user.clear(installmentInput!);
    await user.type(installmentInput!, '3');
    await user.type(descriptionInput!, 'Coffee with client');
    await user.click(screen.getByRole('button', { name: /create transaction/i }));

    await waitFor(() => {
      const persistedWorkspace = JSON.parse(
        window.localStorage.getItem('fintra.preview.workspace.test-finance-user') ?? '{}',
      );
      const createdInstallments = persistedWorkspace.transactions.filter(
        (transaction: { description: string }) => transaction.description === 'Coffee with client',
      );

      expect(createdInstallments).toHaveLength(3);
    });
  });

  it('accepts decimal comma input and masks the amount using portuguese formatting', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    window.localStorage.setItem(
      'fintra.display-preferences.user-1',
      JSON.stringify({
        currency: 'BRL',
        locale: 'pt-BR',
        monthStartDay: 1,
      }),
    );

    const { container } = await renderAppAtPath('/transactions', authService.service);

    await waitForTransactionsToLoad();

    const amountInput = container.querySelector<HTMLInputElement>('input[name="amount"]');
    const categorySelect = container.querySelector<HTMLSelectElement>('select[name="categoryId"]');
    const subcategorySelect = container.querySelector<HTMLSelectElement>('select[name="subcategoryId"]');
    const dateInput = container.querySelector<HTMLInputElement>('input[name="date"]');
    const descriptionInput = container.querySelector<HTMLTextAreaElement>('textarea[name="description"]');

    expect(amountInput).not.toBeNull();
    expect(categorySelect).not.toBeNull();
    expect(subcategorySelect).not.toBeNull();
    expect(dateInput).not.toBeNull();
    expect(descriptionInput).not.toBeNull();

    await user.clear(amountInput!);
    await user.type(amountInput!, '455');
    expect(amountInput).toHaveValue('4,55');

    await user.selectOptions(categorySelect!, 'category-food');
    await user.selectOptions(subcategorySelect!, 'subcategory-restaurants');
    await user.clear(dateInput!);
    await user.type(dateInput!, '2026-03-18');
    await user.type(descriptionInput!, 'Cafe com cliente');
    await user.click(screen.getByRole('button', { name: /create transaction|criar transa/i }));

    await waitFor(() => {
      const persistedWorkspace = JSON.parse(
        window.localStorage.getItem('fintra.preview.workspace.test-finance-user') ?? '{}',
      );

      expect(
        persistedWorkspace.transactions.some(
          (transaction: { description: string }) => transaction.description === 'Cafe com cliente',
        ),
      ).toBe(true);
    });
  });

  it('restores the in-progress transaction draft after a remount', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    const firstRender = await renderAppAtPath('/transactions', authService.service);

    await waitForTransactionsToLoad();

    const amountInput = firstRender.container.querySelector<HTMLInputElement>('input[name="amount"]');
    const descriptionInput = firstRender.container.querySelector<HTMLTextAreaElement>('textarea[name="description"]');

    expect(amountInput).not.toBeNull();
    expect(descriptionInput).not.toBeNull();

    await user.type(amountInput!, '1234');
    await user.type(descriptionInput!, 'Draft transaction');

    firstRender.unmount();

    const secondRender = await renderAppAtPath('/transactions', authService.service);

    await waitForTransactionsToLoad();

    const restoredAmountInput = secondRender.container.querySelector<HTMLInputElement>('input[name="amount"]');
    const restoredDescriptionInput = secondRender.container.querySelector<HTMLTextAreaElement>('textarea[name="description"]');

    expect(restoredAmountInput).not.toBeNull();
    expect(restoredDescriptionInput).not.toBeNull();
    expect(restoredAmountInput).toHaveValue('12.34');
    expect(restoredDescriptionInput).toHaveValue('Draft transaction');
  });

  it('creates a new set-aside from the reserve form', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    const { container } = await renderAppAtPath('/transactions', authService.service);

    await waitForTransactionsToLoad();
    await user.click(screen.getByRole('tab', { name: /reserve/i }));

    const amountInput = container.querySelector<HTMLInputElement>('input[name="setAsideAmount"]');
    const categorySelect = container.querySelector<HTMLSelectElement>('select[name="setAsideCategoryId"]');
    const subcategorySelect = container.querySelector<HTMLSelectElement>('select[name="setAsideSubcategoryId"]');
    const dateInput = container.querySelector<HTMLInputElement>('input[name="setAsideDate"]');
    const descriptionInput = container.querySelector<HTMLTextAreaElement>('textarea[name="setAsideDescription"]');

    expect(amountInput).not.toBeNull();
    expect(categorySelect).not.toBeNull();
    expect(subcategorySelect).not.toBeNull();
    expect(dateInput).not.toBeNull();
    expect(descriptionInput).not.toBeNull();

    await user.type(amountInput!, '120');
    await user.selectOptions(categorySelect!, 'category-food');
    await user.selectOptions(subcategorySelect!, 'subcategory-restaurants');
    await user.clear(dateInput!);
    await user.type(dateInput!, '2099-04-15');
    await user.type(descriptionInput!, 'Summer trip dinner');
    await user.click(screen.getByRole('button', { name: /set aside money/i }));

    await waitFor(() => {
      const persistedWorkspace = JSON.parse(
        window.localStorage.getItem('fintra.preview.workspace.test-finance-user') ?? '{}',
      );

      expect(
        persistedWorkspace.setAsides.some(
          (setAside: { description: string }) => setAside.description === 'Summer trip dinner',
        ),
      ).toBe(true);
    });
  });

  it('offers to rebalance the month after an expense pushes a category over budget', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    const { container } = await renderAppAtPath('/transactions', authService.service);

    await waitForTransactionsToLoad();

    const amountInput = container.querySelector<HTMLInputElement>('input[name="amount"]');
    const categorySelect = container.querySelector<HTMLSelectElement>('select[name="categoryId"]');
    const subcategorySelect = container.querySelector<HTMLSelectElement>('select[name="subcategoryId"]');
    const dateInput = container.querySelector<HTMLInputElement>('input[name="date"]');
    const descriptionInput = container.querySelector<HTMLTextAreaElement>('textarea[name="description"]');

    expect(amountInput).not.toBeNull();
    expect(categorySelect).not.toBeNull();
    expect(subcategorySelect).not.toBeNull();
    expect(dateInput).not.toBeNull();
    expect(descriptionInput).not.toBeNull();

    await user.clear(amountInput!);
    await user.type(amountInput!, '50000');
    await user.selectOptions(categorySelect!, 'category-food');
    await user.selectOptions(subcategorySelect!, 'subcategory-restaurants');
    await user.clear(dateInput!);
    await user.type(dateInput!, '2026-03-18');
    await user.type(descriptionInput!, 'Big team dinner');
    await user.click(screen.getByRole('button', { name: /create transaction/i }));

    expect(await screen.findByRole('heading', { name: /move budget for this month/i })).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/take budget from/i), 'category-housing');
    await user.click(screen.getByRole('button', { name: /update monthly budgets/i }));

    await waitFor(() => {
      expect(screen.queryByRole('heading', { name: /move budget for this month/i })).not.toBeInTheDocument();
    });
  });

  it('shows a CSV-style table view beside export controls', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/transactions', authService.service);

    await waitForTransactionsToLoad();
    await user.click(screen.getByRole('button', { name: /table view/i }));

    const tableView = screen.getByRole('table', { name: /transactions table view/i });

    expect(tableView).toBeInTheDocument();
    expect(within(tableView).getByRole('columnheader', { name: /date/i })).toBeInTheDocument();
    expect(within(tableView).getAllByRole('cell', { name: /monthly salary/i }).length).toBeGreaterThan(0);
  });

  it('edits an existing transaction inline from the entry card', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/transactions', authService.service);

    await waitForTransactionsToLoad();

    const salaryEditButton = screen.getAllByRole('button', { name: /edit transaction monthly salary/i })[0];
    const salaryCard = salaryEditButton.closest('article');

    expect(salaryCard).not.toBeNull();

    await user.click(salaryEditButton);

    const inlineAmountInput = within(salaryCard!).getByRole('textbox', { name: /^amount$/i });
    const inlineDescriptionInput = within(salaryCard!).getByRole('textbox', {
      name: /^description$/i,
    });

    await user.clear(inlineAmountInput);
    await user.type(inlineAmountInput, '3500');
    await user.clear(inlineDescriptionInput);
    await user.type(inlineDescriptionInput, 'Updated salary');
    await user.click(within(salaryCard!).getByRole('button', { name: /update transaction/i }));

    await waitFor(() => {
      expect(screen.getByText(/updated salary/i)).toBeInTheDocument();
    });

    const persistedWorkspace = JSON.parse(
      window.localStorage.getItem('fintra.preview.workspace.test-finance-user') ?? '{}',
    );

    expect(
      persistedWorkspace.transactions.find(
        (transaction: { description: string }) => transaction.description === 'Updated salary',
      ),
    ).toBeTruthy();
  });
});
