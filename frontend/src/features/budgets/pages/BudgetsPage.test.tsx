import { screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';

async function waitForBudgetsToLoad() {
  const loadingState = screen.queryByText(/loading budgets/i);

  if (loadingState) {
    await waitForElementToBeRemoved(loadingState, { timeout: 8000 });
  }
}

describe('BudgetsPage', () => {
  it('renders existing preview budgets on the protected route', async () => {
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/budgets', authService.service);

    await waitForBudgetsToLoad();

    expect(
      await screen.findByRole('heading', { name: /^budgets$/i, level: 1 }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/monthly budgets/i)).not.toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /^housing$/i, level: 3 }, { timeout: 8000 }),
    ).toBeInTheDocument();
  });

  it('creates a new subcategory budget and displays it in the list', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/budgets', authService.service);

    await waitForBudgetsToLoad();

    const [defaultCategorySelect] = await screen.findAllByLabelText(/^category$/i, {}, { timeout: 8000 });
    const [defaultSubcategorySelect] = screen.getAllByLabelText(/subcategor/i);
    const [defaultAmountInput] = screen.getAllByLabelText(/^amount$/i);

    await user.selectOptions(
      defaultCategorySelect,
      'category-transport',
    );
    await user.selectOptions(defaultSubcategorySelect, 'subcategory-transit');
    await user.clear(defaultAmountInput);
    await user.type(defaultAmountInput, '90');
    await user.click(screen.getByRole('button', { name: /create default budget/i }));

    expect(
      await screen.findByRole('heading', { name: /transport \/ transit/i, level: 3 }, { timeout: 8000 }),
    ).toBeInTheDocument();
  });

  it('creates a monthly override and shows it in the override list', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/budgets', authService.service);

    await waitForBudgetsToLoad();
    await user.clear(screen.getByLabelText(/selected month/i));
    await user.type(screen.getByLabelText(/selected month/i), '2026-03');

    await waitFor(() => {
      expect(screen.getAllByRole('button', { name: /reset override/i }).length).toBe(1);
    });

    const [, overrideCategorySelect] = await screen.findAllByLabelText(/^category$/i, {}, { timeout: 8000 });
    const [, overrideSubcategorySelect] = screen.getAllByLabelText(/subcategor/i);
    const [, overrideAmountInput] = screen.getAllByLabelText(/^amount$/i);

    await user.selectOptions(overrideCategorySelect, 'category-transport');
    await user.clear(overrideAmountInput);
    await user.type(overrideAmountInput, '120');
    await user.click(screen.getByRole('button', { name: /create monthly override/i }));

    expect(overrideSubcategorySelect).toHaveValue('');
    await waitFor(() => {
      const persistedWorkspace = JSON.parse(
        window.localStorage.getItem('fintra.preview.workspace.test-finance-user') ?? '{}',
      );

      expect(
        persistedWorkspace.budgetOverrides.some(
          (budgetOverride: { categoryId: string; month: string }) =>
            budgetOverride.categoryId === 'category-transport' && budgetOverride.month === '2026-03',
        ),
      ).toBe(true);
    });
  });

  it('edits an existing budget inline from the budget card amount area', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/budgets', authService.service);

    await waitForBudgetsToLoad();

    await user.click(screen.getByRole('button', { name: /edit budget housing/i }));

    const housingBudgetCard = screen.getByLabelText(/housing budget/i);
    const inlineAmountInput = within(housingBudgetCard).getByRole('spinbutton', { name: /^amount$/i });
    await user.clear(inlineAmountInput);
    await user.type(inlineAmountInput, '2750');
    await user.click(within(housingBudgetCard).getByRole('button', { name: /update default budget/i }));

    await waitFor(() => {
      expect(screen.getByText(/\$2,750\.00/i)).toBeInTheDocument();
    });

    const persistedWorkspace = JSON.parse(
      window.localStorage.getItem('fintra.preview.workspace.test-finance-user') ?? '{}',
    );

    expect(
      persistedWorkspace.budgets.find((budget: { categoryId: string; amount: number }) => budget.categoryId === 'category-housing')
        ?.amount,
    ).toBe(2750);
  });
});
