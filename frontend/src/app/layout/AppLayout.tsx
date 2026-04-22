import { useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

import { useAuth } from '../../features/auth/useAuth';
import { buildDashboardSnapshot } from '../../features/dashboard/lib/buildDashboardSnapshot';
import { calculateLiveAvailableAmount } from '../../features/dashboard/lib/calculateLiveAvailableAmount';
import { filterTransactionsByMonth } from '../../features/dashboard/lib/buildDashboardSnapshot';
import { MonthReviewPrompt } from '../../features/finance/components/MonthReviewPrompt';
import { SetAsideDecisionPrompt } from '../../features/finance/components/SetAsideDecisionPrompt';
import { getCategoryName, getSubcategoryName } from '../../features/finance/lib/financeSelectors';
import {
  buildPlannedExpenseItems,
  findMonthReview,
  sumPlannedExpenseItems,
} from '../../features/finance/lib/monthReviews';
import { filterSetAsidesByMonth, getDueSetAsides } from '../../features/finance/lib/setAsides';
import { useFinanceData } from '../../features/finance/useFinanceData';
import { useNotifications } from '../../features/notifications/useNotifications';
import { useDisplayPreferences } from '../../features/settings/useDisplayPreferences';
import { translateAppText } from '../../shared/i18n/appText';
import { formatLocalIsoDate } from '../../shared/lib/date/isoDates';
import {
  getClosestMonthToFirstDay,
  getCurrentMonthKey,
  shiftMonthKey,
} from '../../shared/lib/date/months';
import { formatCurrency } from '../../shared/lib/formatters/currency';
import { SidebarNavigation } from './SidebarNavigation';

function getUserInitials(email: string | undefined) {
  if (!email) {
    return 'FT';
  }

  return email
    .split('@')[0]
    .split(/[.\-_]/)
    .filter(Boolean)
    .slice(0, 2)
    .map((token) => token[0]?.toUpperCase() ?? '')
    .join('');
}

const pageTitleByPath: Record<string, string> = {
  '/': 'page.title.dashboard',
  '/transactions': 'page.title.transactions',
  '/categories': 'page.title.categories',
  '/budgets': 'page.title.budgets',
  '/analytics': 'page.title.analytics',
  '/notifications': 'page.title.notifications',
  '/settings': 'page.title.settings',
};

export function AppLayout({ children }: PropsWithChildren) {
  const auth = useAuth();
  const financeData = useFinanceData();
  const { unreadCount } = useNotifications();
  const {
    preferences: { monthStartDay },
  } = useDisplayPreferences();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const [isResolvingSetAside, setIsResolvingSetAside] = useState(false);
  const [setAsidePromptError, setSetAsidePromptError] = useState<string | null>(null);
  const [dismissedSetAsideId, setDismissedSetAsideId] = useState<string | null>(null);
  const [dismissedMonthReview, setDismissedMonthReview] = useState<string | null>(null);
  const [monthReviewError, setMonthReviewError] = useState<string | null>(null);
  const [isSavingMonthReview, setIsSavingMonthReview] = useState(false);
  const pageTitle = translateAppText(
    pageTitleByPath[location.pathname] ?? 'shell.defaultTitle',
  );
  const currentMonth = useMemo(() => getCurrentMonthKey(new Date(), monthStartDay), [monthStartDay]);
  const reviewMonth = useMemo(() => getClosestMonthToFirstDay(new Date()), []);
  const shouldOpenMonthReviewFromSettings = useMemo(() => {
    const searchParams = new URLSearchParams(location.search);
    return searchParams.get('month-review') === 'open';
  }, [location.search]);

  useEffect(() => {
    setIsMobileNavigationOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (
      dismissedSetAsideId &&
      !financeData.setAsides.some((setAside) => setAside.id === dismissedSetAsideId)
    ) {
      setDismissedSetAsideId(null);
    }
  }, [dismissedSetAsideId, financeData.setAsides]);

  useEffect(() => {
    setDismissedMonthReview(null);
  }, [reviewMonth]);

  const dueSetAside =
    financeData.status === 'ready'
      ? getDueSetAsides(financeData.setAsides, formatLocalIsoDate()).find(
          (setAside) => setAside.id !== dismissedSetAsideId,
        ) ?? null
      : null;
  const dueSetAsideTitle = dueSetAside
    ? `${getCategoryName(financeData.categories, dueSetAside.categoryId)} / ${getSubcategoryName(
        financeData.subcategories,
        dueSetAside.subcategoryId,
      )}`
    : '';
  const currentMonthBalance = useMemo(() => {
    if (financeData.status !== 'ready') {
      return null;
    }

    const currentMonthTransactions = filterTransactionsByMonth(
      financeData.transactions,
      currentMonth,
      monthStartDay,
    );
    const currentMonthSetAsides = filterSetAsidesByMonth(
      financeData.setAsides,
      currentMonth,
      monthStartDay,
    );
    const monthReview = findMonthReview(financeData.monthReviews, currentMonth);

    return calculateLiveAvailableAmount({
      transactions: currentMonthTransactions,
      setAsides: currentMonthSetAsides,
      monthReview,
    });
  }, [currentMonth, financeData, monthStartDay]);
  const currentMonthReview =
    financeData.status === 'ready' ? findMonthReview(financeData.monthReviews, reviewMonth) : null;
  const plannedExpenseItems = useMemo(() => {
    if (financeData.status !== 'ready') {
      return [];
    }

    return buildPlannedExpenseItems(
      filterTransactionsByMonth(financeData.transactions, reviewMonth, monthStartDay),
      filterSetAsidesByMonth(financeData.setAsides, reviewMonth, monthStartDay),
    );
  }, [financeData, monthStartDay, reviewMonth]);
  const plannedExpenseTotal = useMemo(
    () => sumPlannedExpenseItems(plannedExpenseItems),
    [plannedExpenseItems],
  );
  const suggestedCarryOverAmount = useMemo(() => {
    if (financeData.status !== 'ready') {
      return 0;
    }

    if (currentMonthReview) {
      return currentMonthReview.carryOverAmount;
    }

    const previousMonth = shiftMonthKey(reviewMonth, -1);
    const previousSnapshot = buildDashboardSnapshot(
      {
        categories: financeData.categories,
        budgets: financeData.budgets,
        budgetOverrides: financeData.budgetOverrides,
        transactions: financeData.transactions,
        setAsides: financeData.setAsides,
        monthReviews: financeData.monthReviews,
      },
      previousMonth,
      monthStartDay,
    );

    return previousSnapshot.totalAvailable;
  }, [currentMonthReview, financeData, monthStartDay, reviewMonth]);
  const shouldAutoOpenMonthReview = location.pathname === '/';
  const shouldShowMonthReviewPrompt =
    financeData.status === 'ready' &&
    (shouldOpenMonthReviewFromSettings ||
      (shouldAutoOpenMonthReview &&
        !currentMonthReview &&
        dismissedMonthReview !== reviewMonth));

  async function handleMarkSetAsideSpent() {
    if (!dueSetAside) {
      return;
    }

    setIsResolvingSetAside(true);
    setSetAsidePromptError(null);

    try {
      await financeData.convertSetAsideToTransaction(dueSetAside.id);
      setDismissedSetAsideId(dueSetAside.id);
    } catch (error) {
      setSetAsidePromptError(
        error instanceof Error ? error.message : translateAppText('setAsides.promptError'),
      );
    } finally {
      setIsResolvingSetAside(false);
    }
  }

  async function handleDiscardSetAside() {
    if (!dueSetAside) {
      return;
    }

    setIsResolvingSetAside(true);
    setSetAsidePromptError(null);

    try {
      await financeData.discardSetAside(dueSetAside.id);
      setDismissedSetAsideId(dueSetAside.id);
    } catch (error) {
      setSetAsidePromptError(
        error instanceof Error ? error.message : translateAppText('setAsides.promptError'),
      );
    } finally {
      setIsResolvingSetAside(false);
    }
  }

  async function handleSaveMonthReview(input: {
    month: string;
    plannedIncomeAmount: number;
    plannedIncomeDescription: string;
    carryOverAmount: number;
  }) {
    setIsSavingMonthReview(true);
    setMonthReviewError(null);

    try {
      await financeData.saveMonthReview(input);

      if (shouldOpenMonthReviewFromSettings) {
        const searchParams = new URLSearchParams(location.search);
        searchParams.delete('month-review');
        const nextSearch = searchParams.toString();
        navigate(
          {
            pathname: location.pathname,
            search: nextSearch ? `?${nextSearch}` : '',
          },
          { replace: true },
        );
      }
    } catch (error) {
      setMonthReviewError(
        error instanceof Error ? error.message : translateAppText('monthReview.errorSave'),
      );
    } finally {
      setIsSavingMonthReview(false);
    }
  }

  function handleCloseMonthReview() {
    setMonthReviewError(null);
    setDismissedMonthReview(reviewMonth);

    if (shouldOpenMonthReviewFromSettings) {
      const searchParams = new URLSearchParams(location.search);
      searchParams.delete('month-review');
      const nextSearch = searchParams.toString();
      navigate(
        {
          pathname: location.pathname,
          search: nextSearch ? `?${nextSearch}` : '',
        },
        { replace: true },
      );
    }
  }

  return (
    <div className="app-shell">
      {shouldShowMonthReviewPrompt ? (
        <MonthReviewPrompt
          currentMonth={reviewMonth}
          errorMessage={monthReviewError}
          existingReview={currentMonthReview}
          isSubmitting={isSavingMonthReview}
          onClose={handleCloseMonthReview}
          onSubmit={(input) => void handleSaveMonthReview(input)}
          plannedExpenseItems={plannedExpenseItems}
          plannedExpenseTotal={plannedExpenseTotal}
          suggestedCarryOverAmount={suggestedCarryOverAmount}
        />
      ) : null}
      {isMobileNavigationOpen ? (
        <button
          aria-label={translateAppText('shell.closeNavigation')}
          className="sidebar__scrim"
          onClick={() => setIsMobileNavigationOpen(false)}
          type="button"
        />
      ) : null}

      <aside
        aria-label={translateAppText('shell.primaryNavigation')}
        className={`sidebar${isMobileNavigationOpen ? ' sidebar--open' : ''}`}
        id="mobile-navigation-panel"
      >
        <div className="sidebar__section">
          <div className="sidebar__header">
            <div className="sidebar__brand-row">
              <div className="sidebar__brand-mark" aria-hidden="true">
                <svg viewBox="0 0 24 24">
                  <path d="M4 9.5L12 5l8 4.5" />
                  <path d="M6.5 9.5V18M11 9.5V18M15.5 9.5V18M4 18h16" />
                </svg>
              </div>

              <div>
                <h2 className="sidebar__brand">{translateAppText('shell.brand')}</h2>
                <p className="sidebar__copy">{auth.user?.email}</p>
              </div>
            </div>

            <button
              aria-label={translateAppText('shell.closeNavigation')}
              className="sidebar__close-button"
              onClick={() => setIsMobileNavigationOpen(false)}
              type="button"
            >
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>
          </div>

          <SidebarNavigation onNavigate={() => setIsMobileNavigationOpen(false)} variant="drawer" />
        </div>

        <div className="sidebar__actions">
          <NavLink
            className="primary-button sidebar__cta"
            onClick={() => setIsMobileNavigationOpen(false)}
            to="/transactions"
          >
            {translateAppText('shell.addTransaction')}
          </NavLink>

          <button
            className="secondary-button sidebar__signout"
            onClick={() => void auth.signOut()}
            type="button"
          >
            {translateAppText('shell.signOut')}
          </button>
        </div>
      </aside>

      <div className="main-panel">
        {dueSetAside ? (
          <SetAsideDecisionPrompt
            errorMessage={setAsidePromptError}
            isSubmitting={isResolvingSetAside}
            onDiscard={() => void handleDiscardSetAside()}
            onMarkSpent={() => void handleMarkSetAsideSpent()}
            setAside={dueSetAside}
            title={dueSetAsideTitle}
          />
        ) : null}

        <header className="topbar">
          <button
            aria-controls="mobile-navigation-panel"
            aria-expanded={isMobileNavigationOpen}
            aria-label={
              isMobileNavigationOpen
                ? translateAppText('shell.closeNavigation')
                : translateAppText('shell.openNavigation')
            }
            className="topbar__menu-button"
            onClick={() => setIsMobileNavigationOpen((currentValue) => !currentValue)}
            type="button"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24">
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          </button>

          <div className="topbar__intro">
            <h1 className="topbar__title">{pageTitle}</h1>
            <p className="topbar__email">{auth.user?.email}</p>
          </div>

          <div className="topbar__meta">
            {currentMonthBalance !== null ? (
              <div
                aria-label={translateAppText('shell.currentMonthBalance')}
                className="topbar__balance-chip"
              >
                <svg aria-hidden="true" viewBox="0 0 24 24">
                  <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z" />
                  <path d="M4 9h16" />
                  <path d="M15.5 13h2.5" />
                </svg>
                <div>
                  <span>{translateAppText('shell.currentMonthBalance')}</span>
                  <strong>{formatCurrency(currentMonthBalance)}</strong>
                </div>
              </div>
            ) : null}
            {unreadCount > 0 ? (
              <NavLink className="topbar__notifications" to="/notifications">
                {translateAppText('notifications.unreadBadge', { count: unreadCount })}
              </NavLink>
            ) : null}
            <div aria-hidden="true" className="avatar-chip">
              {getUserInitials(auth.user?.email)}
            </div>
          </div>
        </header>

        <main className="content">{children}</main>

        <div className="bottom-nav-shell">
          <SidebarNavigation onNavigate={() => setIsMobileNavigationOpen(false)} variant="bottom" />
        </div>
      </div>
    </div>
  );
}
