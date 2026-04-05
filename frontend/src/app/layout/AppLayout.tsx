import { useEffect, useState, type PropsWithChildren } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '../../features/auth/useAuth';
import { SetAsideDecisionPrompt } from '../../features/finance/components/SetAsideDecisionPrompt';
import { getCategoryName, getSubcategoryName } from '../../features/finance/lib/financeSelectors';
import { getDueSetAsides } from '../../features/finance/lib/setAsides';
import { useFinanceData } from '../../features/finance/useFinanceData';
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

export function AppLayout({ children }: PropsWithChildren) {
  const auth = useAuth();
  const financeData = useFinanceData();
  const { preferences } = useDisplayPreferences();
  const location = useLocation();
  const [isMobileNavigationOpen, setIsMobileNavigationOpen] = useState(false);
  const [isResolvingSetAside, setIsResolvingSetAside] = useState(false);
  const [setAsidePromptError, setSetAsidePromptError] = useState<string | null>(null);
  const pageTitle =
    location.pathname === '/'
      ? translateAppText('page.title.dashboard')
      : location.pathname === '/transactions'
        ? translateAppText('page.title.transactions')
        : location.pathname === '/categories'
          ? translateAppText('page.title.categories')
          : location.pathname === '/budgets'
            ? translateAppText('page.title.budgets')
            : location.pathname === '/analytics'
              ? translateAppText('page.title.analytics')
              : location.pathname === '/settings'
                ? translateAppText('page.title.settings')
                : translateAppText('shell.defaultTitle');

  void preferences;
  useEffect(() => {
    setIsMobileNavigationOpen(false);
  }, [location.pathname]);

  const dueSetAside =
    financeData.status === 'ready'
      ? getDueSetAsides(financeData.setAsides, formatLocalIsoDate())[0] ?? null
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
        aria-label="Primary"
        className={`sidebar${isMobileNavigationOpen ? ' sidebar--open' : ''}`}
        id="mobile-navigation-panel"
      >
        <div className="sidebar__section">
          <div className="sidebar__brand-row">
            <div className="sidebar__brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24">
                <path d="M4 9.5L12 5l8 4.5" />
                <path d="M6.5 9.5V18M11 9.5V18M15.5 9.5V18M4 18h16" />
              </svg>
            </div>

            <div>
              <h2 className="sidebar__brand">{translateAppText('shell.brand')}</h2>
              <p className="sidebar__copy">{translateAppText('page.desc.dashboard')}</p>
            </div>
          </div>

          <NavLink
            className="primary-button sidebar__cta"
            onClick={() => setIsMobileNavigationOpen(false)}
            to="/transactions"
          >
            {translateAppText('shell.addTransaction')}
          </NavLink>

          <SidebarNavigation onNavigate={() => setIsMobileNavigationOpen(false)} variant="drawer" />
        </div>

        <button
          className="secondary-button sidebar__signout"
          onClick={() => void auth.signOut()}
          type="button"
        >
          {translateAppText('shell.signOut')}
        </button>
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
