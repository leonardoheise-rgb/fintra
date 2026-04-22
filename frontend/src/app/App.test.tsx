import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createPreviewWorkspace } from '../features/finance/lib/previewWorkspace';
import { createAuthServiceStub } from '../test/createAuthServiceStub';
import { renderAppAtPath } from '../test/renderAppAtPath';
import { getClosestMonthToFirstDay } from '../shared/lib/date/months';

describe('App authentication routing', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('redirects unauthenticated users to sign in', async () => {
    const authService = createAuthServiceStub();

    await renderAppAtPath('/', authService.service);

    expect(
      await screen.findByRole('heading', { name: /sign in/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
  });

  it('shows the dashboard for authenticated users', async () => {
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/', authService.service);

    expect(
      await screen.findByRole('heading', { name: /^dashboard$/i, level: 1 }, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getAllByText('owner@fintra.dev').length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/current month balance/i)).toBeInTheDocument();
  });

  it('redirects authenticated users away from the sign-in page', async () => {
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/sign-in', authService.service);

    expect(
      await screen.findByRole('heading', { name: /^dashboard$/i, level: 1 }, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it('keeps the bottom navigation focused on the three main routes', async () => {
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/', authService.service);

    const bottomNavigation = screen.getByRole('navigation', { name: /bottom navigation/i });
    const primaryNavigation = screen.getByRole('navigation', { name: /primary navigation/i });

    expect(within(bottomNavigation).getByRole('link', { name: /^dashboard$/i })).toBeInTheDocument();
    expect(
      within(bottomNavigation).getByRole('link', { name: /^transactions$/i }),
    ).toBeInTheDocument();
    expect(
      within(bottomNavigation).getByRole('link', { name: /^notifications$/i }),
    ).toBeInTheDocument();
    expect(
      within(bottomNavigation).queryByRole('link', { name: /^categories$/i }),
    ).not.toBeInTheDocument();
    expect(within(bottomNavigation).queryByRole('link', { name: /^budgets$/i })).not.toBeInTheDocument();
    expect(
      within(bottomNavigation).queryByRole('link', { name: /^analytics$/i }),
    ).not.toBeInTheDocument();
    expect(within(bottomNavigation).queryByRole('link', { name: /^settings$/i })).not.toBeInTheDocument();

    expect(within(primaryNavigation).getByRole('link', { name: /^categories$/i })).toBeInTheDocument();
    expect(within(primaryNavigation).getByRole('link', { name: /^budgets$/i })).toBeInTheDocument();
    expect(within(primaryNavigation).getByRole('link', { name: /^analytics$/i })).toBeInTheDocument();
    expect(within(primaryNavigation).getByRole('link', { name: /^settings$/i })).toBeInTheDocument();
  });

  it('signs the user out from the protected shell', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/', authService.service);

    await user.click(await screen.findByRole('button', { name: /sign out/i }));

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /sign in/i })).toBeInTheDocument();
    });
  });

  it('opens the dashboard after signing in from another protected route', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub();

    await renderAppAtPath('/transactions', authService.service);

    await user.type(await screen.findByLabelText(/email/i), 'user@fintra.dev');
    await user.type(screen.getByLabelText(/password/i), 'password123');
    await user.click(screen.getByRole('button', { name: /^sign in$/i }));

    expect(
      await screen.findByRole('heading', { name: /^dashboard$/i, level: 1 }, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('heading', { name: /^transactions$/i, level: 1 }),
    ).not.toBeInTheDocument();
  });

  it('prompts for overdue set-asides and converts them into transactions', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });
    const workspace = createPreviewWorkspace();

    workspace.setAsides = [
      {
        id: 'set-aside-overdue',
        amount: 150,
        categoryId: 'category-food',
        subcategoryId: 'subcategory-restaurants',
        date: '2000-01-01',
        description: 'Birthday dinner',
      },
    ];
    workspace.monthReviews = [
      {
        month: getClosestMonthToFirstDay(new Date()),
        plannedIncomeAmount: 0,
        plannedIncomeDescription: '',
        carryOverAmount: 0,
        reviewedAt: new Date().toISOString(),
      },
    ];

    window.localStorage.setItem(
      'fintra.preview.workspace.test-finance-user',
      JSON.stringify(workspace),
    );

    await renderAppAtPath('/', authService.service);

    expect(
      await screen.findByRole('heading', { name: /did this reserved money get spent/i }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /mark as spent/i }));

    await waitFor(() => {
      expect(
        screen.queryByRole('heading', { name: /did this reserved money get spent/i }),
      ).not.toBeInTheDocument();
    });

    const persistedWorkspace = JSON.parse(
      window.localStorage.getItem('fintra.preview.workspace.test-finance-user') ?? '{}',
    );

    expect(persistedWorkspace.setAsides).toEqual([]);
    expect(
      persistedWorkspace.transactions.some(
        (transaction: { description: string }) => transaction.description === 'Birthday dinner',
      ),
    ).toBe(true);
  });

  it('walks through the month review flow and persists the answers', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });
    const workspace = createPreviewWorkspace();
    workspace.monthReviews = [];

    window.localStorage.setItem(
      'fintra.preview.workspace.test-finance-user',
      JSON.stringify(workspace),
    );

    await renderAppAtPath('/', authService.service);

    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/step 1 of 3/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /^continue$/i }));
    await user.click(screen.getByLabelText(/yes, add planned income/i));
    await user.clear(screen.getByLabelText(/planned income amount/i));
    await user.type(screen.getByLabelText(/planned income amount/i), '1200');
    await user.type(screen.getByLabelText(/description/i), 'Freelance invoice');
    await user.click(screen.getByRole('button', { name: /^continue$/i }));
    await user.click(screen.getByLabelText(/yes, carry a balance forward/i));
    await user.clear(screen.getByLabelText(/carry-over amount/i));
    await user.type(screen.getByLabelText(/carry-over amount/i), '-80');
    await user.click(screen.getByRole('button', { name: /finish month setup/i }));

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    const persistedWorkspace = JSON.parse(
      window.localStorage.getItem('fintra.preview.workspace.test-finance-user') ?? '{}',
    );

    expect(persistedWorkspace.monthReviews).toEqual([
      expect.objectContaining({
        month: getClosestMonthToFirstDay(new Date()),
        plannedIncomeAmount: 1200,
        plannedIncomeDescription: 'Freelance invoice',
        carryOverAmount: -80,
      }),
    ]);
  });
});
