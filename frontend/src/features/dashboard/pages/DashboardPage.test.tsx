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
    const navigationPanel = document.getElementById('mobile-navigation-panel');

    expect(navigationButton).toHaveAttribute('aria-expanded', 'false');
    expect(navigationPanel).not.toBeNull();
    expect(navigationPanel).not.toHaveClass('sidebar--open');

    await user.click(navigationButton);

    expect(navigationButton).toHaveAttribute('aria-expanded', 'true');
    expect(navigationPanel).toHaveClass('sidebar--open');
    expect(await screen.findByRole('heading', { name: /^dashboard$/i, level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/available this month/i)).toBeInTheDocument();
    expect(screen.getByText(/planned budget/i)).toBeInTheDocument();
    expect(screen.getByText(/^expenses$/i)).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /^housing$/i, level: 4 }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/selected month/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /housing budget usage/i })).toBeInTheDocument();

    await user.click(navigationButton);

    expect(screen.getByRole('button', { name: /open navigation menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(navigationPanel).not.toHaveClass('sidebar--open');
  });
});
