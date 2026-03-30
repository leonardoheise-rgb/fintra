import { screen, waitForElementToBeRemoved } from '@testing-library/react';

import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';

async function waitForDashboardToLoad() {
  const loadingState = screen.queryByText(/loading dashboard/i);

  if (loadingState) {
    await waitForElementToBeRemoved(loadingState, { timeout: 8000 });
  }
}

describe('DashboardPage', () => {
  it('renders live budget highlights from the finance workspace', async () => {
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/', authService.service);

    await waitForDashboardToLoad();

    expect(
      await screen.findByRole('heading', { name: /your money this month/i }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /^housing$/i, level: 4 }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/selected month/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /housing budget usage/i })).toBeInTheDocument();
  });
});
