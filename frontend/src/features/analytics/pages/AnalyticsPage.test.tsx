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
      await screen.findByRole('heading', { name: /^analytics$/i, level: 1 }, { timeout: 5000 }),
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
    expect(screen.getAllByText(/food and dining/i).length).toBeGreaterThan(0);
    expect(screen.getByLabelText(/category filter/i)).toBeInTheDocument();
  });

  it('filters the spending time series to a specific category', async () => {
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
    await user.selectOptions(screen.getByLabelText(/category filter/i), 'category-food');

    expect(
      await screen.findByRole('heading', { name: /food and dining over time/i }, { timeout: 8000 }),
    ).toBeInTheDocument();
  });

  it('shows an empty state when the selected range has no activity', async () => {
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

    await user.selectOptions(screen.getByLabelText(/range preset/i), 'custom');
    await user.clear(screen.getByLabelText(/start month/i));
    await user.type(screen.getByLabelText(/start month/i), '2030-01');
    await user.clear(screen.getByLabelText(/end month/i));
    await user.type(screen.getByLabelText(/end month/i), '2030-01');

    expect(
      await screen.findByText(/no income or expense activity is available for the selected range/i),
    ).toBeInTheDocument();
  });
});
