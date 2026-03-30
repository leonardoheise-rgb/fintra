import { screen, waitForElementToBeRemoved } from '@testing-library/react';
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
      await screen.findByRole('heading', { name: /^budgets$/i }, { timeout: 8000 }),
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

    expect(await screen.findByText('1')).toBeInTheDocument();

    const [, overrideCategorySelect] = await screen.findAllByLabelText(/^category$/i, {}, { timeout: 8000 });
    const [, overrideSubcategorySelect] = screen.getAllByLabelText(/subcategor/i);
    const [, overrideAmountInput] = screen.getAllByLabelText(/^amount$/i);

    await user.selectOptions(overrideCategorySelect, 'category-transport');
    await user.clear(overrideAmountInput);
    await user.type(overrideAmountInput, '120');
    await user.click(screen.getByRole('button', { name: /create monthly override/i }));

    expect(overrideSubcategorySelect).toHaveValue('');
    expect(await screen.findByText('2')).toBeInTheDocument();
    expect(await screen.findByRole('heading', { name: /^march 2026 overrides$/i })).toBeInTheDocument();
  });
});
