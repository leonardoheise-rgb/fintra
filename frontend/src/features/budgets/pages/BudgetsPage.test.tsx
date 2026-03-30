import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';

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

    renderAppAtPath('/budgets', authService.service);

    expect(
      await screen.findByRole('heading', { name: /^budgets$/i }, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /^housing$/i, level: 3 }, { timeout: 3000 }),
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

    renderAppAtPath('/budgets', authService.service);

    await user.selectOptions(
      await screen.findByLabelText(/^category$/i, {}, { timeout: 3000 }),
      'category-transport',
    );
    await user.selectOptions(screen.getByLabelText(/subcategory/i), 'subcategory-transit');
    await user.clear(screen.getByLabelText(/amount/i));
    await user.type(screen.getByLabelText(/amount/i), '90');
    await user.click(screen.getByRole('button', { name: /create default budget/i }));

    expect(
      await screen.findByRole('heading', { name: /transport \/ transit/i, level: 3 }, { timeout: 3000 }),
    ).toBeInTheDocument();
  });
});
