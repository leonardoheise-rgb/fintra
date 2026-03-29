import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';

describe('CategoriesPage', () => {
  it('renders existing preview categories on the protected route', async () => {
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    renderAppAtPath('/categories', authService.service);

    expect(
      await screen.findByRole('heading', { name: /^categories$/i }, { timeout: 3000 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /^housing$/i, level: 3 }, { timeout: 3000 }),
    ).toBeInTheDocument();
  });

  it('creates a new category and displays it in the list', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    renderAppAtPath('/categories', authService.service);

    await user.type(await screen.findByLabelText(/new category/i, {}, { timeout: 3000 }), 'Health');
    await user.click(screen.getByRole('button', { name: /add category/i }));

    expect(
      await screen.findByRole('heading', { name: /^health$/i, level: 3 }, { timeout: 3000 }),
    ).toBeInTheDocument();
  });
});
