import { screen, waitFor, waitForElementToBeRemoved, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createAuthServiceStub } from '../test/createAuthServiceStub';
import { renderAppAtPath } from '../test/renderAppAtPath';

async function waitForScreenToLoad(message: RegExp) {
  const loadingState = screen.queryByText(message);

  if (loadingState) {
    await waitForElementToBeRemoved(loadingState, { timeout: 8000 });
  }
}

async function signInFromPublicRoute(user = userEvent.setup()) {
  const authService = createAuthServiceStub();

  await renderAppAtPath('/sign-in', authService.service);

  await user.type(await screen.findByLabelText(/email/i), 'user@fintra.dev');
  await user.type(screen.getByLabelText(/password/i), 'password123');
  await user.click(screen.getByRole('button', { name: /^sign in$/i }));

  return { user, authService };
}

function createAuthenticatedAuthService() {
  return createAuthServiceStub({
    initialSession: {
      user: {
        id: 'user-1',
        email: 'owner@fintra.dev',
      },
    },
  });
}

describe('Fintra smoke flows', () => {
  it('completes the auth journey from sign in to sign out', async () => {
    const { user } = await signInFromPublicRoute();

    expect(
      await screen.findByRole('heading', { name: /^dashboard$/i, level: 1 }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('user@fintra.dev')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /sign out/i }));

    expect(
      await screen.findByRole('heading', { name: /^sign in$/i }, { timeout: 8000 }),
    ).toBeInTheDocument();
  });

  it('completes a transaction create, edit, and delete flow', async () => {
    const user = userEvent.setup();
    const authService = createAuthenticatedAuthService();

    await renderAppAtPath('/transactions', authService.service);
    await waitForScreenToLoad(/loading transactions/i);

    await user.clear(await screen.findByLabelText(/amount/i, {}, { timeout: 8000 }));
    await user.type(screen.getByLabelText(/amount/i), '45');
    await user.selectOptions(screen.getByLabelText(/^category$/i), 'category-food');
    await user.selectOptions(screen.getByLabelText(/subcategor/i), 'subcategory-restaurants');
    await user.clear(screen.getByLabelText(/date/i));
    await user.type(screen.getByLabelText(/date/i), '2026-03-18');
    await user.type(screen.getByLabelText(/description/i), 'Coffee with client');
    await user.click(screen.getByRole('button', { name: /create transaction/i }));

    const createdTransactionTitle = await screen.findByText(/coffee with client/i, {}, { timeout: 8000 });
    const createdTransactionCard = createdTransactionTitle.closest('article');

    expect(createdTransactionCard).not.toBeNull();

    await user.click(
      within(createdTransactionCard!).getByRole('button', {
        name: /edit transaction coffee with client/i,
      }),
    );
    await user.clear(screen.getByLabelText(/description/i));
    await user.type(screen.getByLabelText(/description/i), 'Lunch with client');
    await user.click(screen.getByRole('button', { name: /update transaction/i }));

    const updatedTransactionTitle = await screen.findByText(/lunch with client/i, {}, { timeout: 8000 });
    const updatedTransactionCard = updatedTransactionTitle.closest('article');

    expect(updatedTransactionCard).not.toBeNull();

    await user.click(
      within(updatedTransactionCard!).getByRole('button', {
        name: /delete transaction lunch with client/i,
      }),
    );

    await waitFor(() => {
      expect(screen.queryByText(/lunch with client/i)).not.toBeInTheDocument();
    });
  });

  it('completes a budget planning flow with an override reset', async () => {
    const user = userEvent.setup();
    const authService = createAuthenticatedAuthService();

    await renderAppAtPath('/budgets', authService.service);
    await waitForScreenToLoad(/loading budgets/i);

    const [defaultCategorySelect] = await screen.findAllByLabelText(/^category$/i, {}, { timeout: 8000 });
    const [defaultSubcategorySelect] = screen.getAllByLabelText(/subcategor/i);
    const [defaultAmountInput] = screen.getAllByLabelText(/^amount$/i);

    await user.selectOptions(defaultCategorySelect, 'category-transport');
    await user.selectOptions(defaultSubcategorySelect, 'subcategory-transit');
    await user.clear(defaultAmountInput);
    await user.type(defaultAmountInput, '90');
    await user.click(screen.getByRole('button', { name: /create default budget/i }));

    expect(
      await screen.findByRole('heading', { name: /transport \/ transit/i, level: 3 }, { timeout: 8000 }),
    ).toBeInTheDocument();

    const [, overrideCategorySelect] = await screen.findAllByLabelText(/^category$/i, {}, { timeout: 8000 });
    const [, overrideAmountInput] = screen.getAllByLabelText(/^amount$/i);

    await user.selectOptions(overrideCategorySelect, 'category-transport');
    await user.clear(overrideAmountInput);
    await user.type(overrideAmountInput, '120');
    await user.click(screen.getByRole('button', { name: /create monthly override/i }));

    const overrideRegistry = screen
      .getByRole('heading', { name: /overrides$/i, level: 2 })
      .closest('section');

    expect(overrideRegistry).not.toBeNull();

    const overrideHeading = await within(overrideRegistry!).findByRole(
      'heading',
      { name: /^transport$/i, level: 3 },
      { timeout: 8000 },
    );
    const overrideCard = overrideHeading.closest('article');

    expect(overrideCard).not.toBeNull();

    await user.click(
      within(overrideCard!).getByRole('button', { name: /reset override transport/i }),
    );

    await waitFor(() => {
      expect(
        within(overrideRegistry!).queryByRole('heading', { name: /^transport$/i, level: 3 }),
      ).not.toBeInTheDocument();
    });
  });

  it('completes the analytics route smoke flow', async () => {
    const user = userEvent.setup();
    const authService = createAuthenticatedAuthService();

    await renderAppAtPath('/analytics', authService.service);
    await waitForScreenToLoad(/loading analytics/i);

    expect(
      await screen.findByRole('heading', { name: /^analytics$/i, level: 1 }, { timeout: 8000 }),
    ).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/range preset/i), 'custom');

    expect(screen.getByLabelText(/start month/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^end month$/i)).toBeInTheDocument();

    await user.click(screen.getByRole('tab', { name: /categories/i }));

    expect(
      await screen.findByRole('heading', { name: /spending by category/i }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/food and dining/i)).toBeInTheDocument();
  });
});
