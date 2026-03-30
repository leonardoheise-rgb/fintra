import { screen, waitForElementToBeRemoved } from '@testing-library/react';
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
    expect(
      (await screen.findAllByRole('button', { name: /edit transaction monthly salary/i }, { timeout: 8000 })).length,
    ).toBeGreaterThan(0);
  }, 10000);

  it('creates a new transaction from the form', async () => {
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

    await user.clear(await screen.findByLabelText(/amount/i, {}, { timeout: 8000 }));
    await user.type(screen.getByLabelText(/amount/i), '45');
    await user.selectOptions(screen.getByLabelText(/^category$/i), 'category-food');
    await user.selectOptions(screen.getByLabelText(/subcategor/i), 'subcategory-restaurants');
    await user.clear(screen.getByLabelText(/date/i));
    await user.type(screen.getByLabelText(/date/i), '2026-03-18');
    await user.type(screen.getByLabelText(/description/i), 'Coffee with client');
    await user.click(screen.getByRole('button', { name: /create transaction/i }));

    expect(await screen.findByText(/coffee with client/i)).toBeInTheDocument();
  });
});
