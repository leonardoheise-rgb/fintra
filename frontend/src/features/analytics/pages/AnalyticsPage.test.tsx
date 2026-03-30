import { screen, waitForElementToBeRemoved } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { createAuthServiceStub } from '../../../test/createAuthServiceStub';
import { renderAppAtPath } from '../../../test/renderAppAtPath';

async function waitForAnalyticsToLoad() {
  const loadingState = screen.queryByText(/loading analytics/i);

  if (loadingState) {
    await waitForElementToBeRemoved(loadingState, { timeout: 8000 });
  }
}

describe('AnalyticsPage', () => {
  it('renders the analytics route with historical overview content', async () => {
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/analytics', authService.service);

    await waitForAnalyticsToLoad();

    expect(
      await screen.findByRole('heading', { name: /^analytics$/i }, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(
      await screen.findByRole('heading', { name: /income versus expenses/i }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/range preset/i)).toBeInTheDocument();
  });

  it('switches to the category analytics tab', async () => {
    const user = userEvent.setup();
    const authService = createAuthServiceStub({
      initialSession: {
        user: {
          id: 'user-1',
          email: 'owner@fintra.dev',
        },
      },
    });

    await renderAppAtPath('/analytics', authService.service);

    await waitForAnalyticsToLoad();

    await user.click(await screen.findByRole('tab', { name: /categories/i }));

    expect(
      await screen.findByRole('heading', { name: /spending by category/i }, { timeout: 8000 }),
    ).toBeInTheDocument();
    expect(screen.getByText(/food and dining/i)).toBeInTheDocument();
  });
});
