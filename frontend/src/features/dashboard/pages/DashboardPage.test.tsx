import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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

    await waitForDashboardToLoad();

    const navigationButton = screen.getByRole('button', { name: /open navigation menu/i });

    expect(navigationButton).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('mobile-navigation-panel')).toBeNull();

    await user.click(navigationButton);

    expect(navigationButton).toHaveAttribute('aria-expanded', 'true');
    expect(document.getElementById('mobile-navigation-panel')).not.toBeNull();
    expect(
      await screen.findByRole('heading', { name: /available by category/i }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^this month$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/planned budget/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^income$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^expenses$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/net balance/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/budget status/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/default budget/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/recent activity/i)).not.toBeInTheDocument();
    expect(screen.getByText(/total available/i)).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /^housing$/i, level: 4 }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/selected month/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /housing budget usage/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close navigation menu/i }));

    expect(screen.getByRole('button', { name: /open navigation menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(document.getElementById('mobile-navigation-panel')).toBeNull();
  });
});
