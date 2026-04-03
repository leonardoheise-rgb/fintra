import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createPreviewWorkspace } from '../features/finance/lib/previewWorkspace';
import { createAuthServiceStub } from '../test/createAuthServiceStub';
import { renderAppAtPath } from '../test/renderAppAtPath';

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
      await screen.findByRole('heading', { name: /available by category/i }, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(screen.getByText('owner@fintra.dev')).toBeInTheDocument();
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
      await screen.findByRole('heading', { name: /available by category/i }, { timeout: 3000 }),
    ).toBeInTheDocument();
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
});
