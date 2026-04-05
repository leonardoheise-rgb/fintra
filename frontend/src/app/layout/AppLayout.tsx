import { useEffect, useState, type PropsWithChildren } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '../../features/auth/useAuth';
import { SetAsideDecisionPrompt } from '../../features/finance/components/SetAsideDecisionPrompt';
import { getCategoryName, getSubcategoryName } from '../../features/finance/lib/financeSelectors';
import { getDueSetAsides } from '../../features/finance/lib/setAsides';
import { useFinanceData } from '../../features/finance/useFinanceData';
import { useNotifications } from '../../features/notifications/useNotifications';
import { useDisplayPreferences } from '../../features/settings/useDisplayPreferences';
import { translateAppText } from '../../shared/i18n/appText';
import { formatLocalIsoDate } from '../../shared/lib/date/isoDates';
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
  const { preferences } = useDisplayPreferences();
  const location = useLocation();
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const [isResolvingSetAside, setIsResolvingSetAside] = useState(false);
  const [setAsidePromptError, setSetAsidePromptError] = useState<string | null>(null);
  const [dismissedSetAsideId, setDismissedSetAsideId] = useState<string | null>(null);
  const pageTitle = translateAppText(
    pageTitleByPath[location.pathname] ?? 'shell.defaultTitle',
  );

  void preferences;
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

  return (
    <div className="app-shell">
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
