import { screen, waitForElementToBeRemoved, within } from '@testing-library/react';
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

    const { container } = await renderAppAtPath('/', authService.service);

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
    expect(screen.getAllByText(/you can spend today up to/i).length).toBeGreaterThan(0);
    expect(
      await screen.findByRole('heading', { name: /^housing$/i, level: 4 }, { timeout: 8000 }),
    ).toBeInTheDocument();
    const budgetCardBadges = [...container.querySelectorAll<HTMLElement>('.budget-card__badge')];
    expect(budgetCardBadges.some((badge) => badge.textContent === '🏠')).toBe(true);
    const recentActivityIcons = [...container.querySelectorAll<HTMLElement>('.recent-activity-item__icon')];
    expect(recentActivityIcons.some((icon) => icon.textContent === '🍷')).toBe(true);
    expect(screen.getByLabelText(/selected month/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar', { name: /housing budget usage/i })).toBeInTheDocument();

    await user.click(navigationButton);

    expect(screen.getByRole('button', { name: /open navigation menu/i })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(navigationPanel).not.toHaveClass('sidebar--open');
  });

  it('opens month-scoped transactions when a category highlight is clicked', async () => {
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

    const dismissMonthReviewButton = screen.queryByRole('button', { name: /do this later/i });

    if (dismissMonthReviewButton) {
      await user.click(dismissMonthReviewButton);
    }

    await user.clear(screen.getByLabelText(/selected month/i));
    await user.type(screen.getByLabelText(/selected month/i), '2026-03');
    await user.click(await screen.findByRole('button', { name: /housing/i }));

    const categoryDialogHeading = await screen.findByRole('heading', {
      name: /housing transactions in march 2026/i,
    });
    const categoryDialog = categoryDialogHeading.closest('[role="dialog"]');

    expect(categoryDialogHeading).toBeInTheDocument();
    expect(
      within((categoryDialog as HTMLElement | null) ?? document.body).getByText(/apartment rent/i),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /close details/i }));

    expect(
      screen.queryByRole('heading', { name: /housing transactions in march 2026/i }),
    ).not.toBeInTheDocument();
  });
});
