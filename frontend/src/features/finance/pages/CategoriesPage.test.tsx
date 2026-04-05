import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';

async function waitForCategoriesToLoad() {
  const loadingState = screen.queryByText(/loading categories/i);

  if (loadingState) {
    await waitForElementToBeRemoved(loadingState, { timeout: 8000 });
  }
}

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

    await renderAppAtPath('/categories', authService.service);

    await waitForCategoriesToLoad();

    expect(
      await screen.findByRole('heading', { name: /^categories$/i, level: 1 }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^structure$/i)).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /^housing$/i, level: 3 }, { timeout: 8000 }),
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

    await renderAppAtPath('/categories', authService.service);

    await waitForCategoriesToLoad();

    await user.type(await screen.findByLabelText(/new category/i, {}, { timeout: 8000 }), 'Health');
    await user.click(screen.getByRole('button', { name: /add category/i }));

    expect(
      await screen.findByRole('heading', { name: /^health$/i, level: 3 }, { timeout: 8000 }),
    ).toBeInTheDocument();
  });
});
