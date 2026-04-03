import { useEffect, useState, type PropsWithChildren } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '../../features/auth/useAuth';
import { SetAsideDecisionPrompt } from '../../features/finance/components/SetAsideDecisionPrompt';
import { getCategoryName, getSubcategoryName } from '../../features/finance/lib/financeSelectors';
import { getDueSetAsides } from '../../features/finance/lib/setAsides';
import { useFinanceData } from '../../features/finance/useFinanceData';
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
  const pageDescription =
    location.pathname === '/'
      ? translateAppText('page.desc.dashboard')
      : location.pathname === '/transactions'
        ? translateAppText('page.desc.transactions')
        : location.pathname === '/categories'
          ? translateAppText('page.desc.categories')
          : location.pathname === '/budgets'
            ? translateAppText('page.desc.budgets')
            : location.pathname === '/analytics'
              ? translateAppText('page.desc.analytics')
              : location.pathname === '/settings'
                ? translateAppText('page.desc.settings')
                : translateAppText('shell.defaultDescription');

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
      <aside className="sidebar" aria-label="Primary">
        <div className="sidebar__mobile-bar">
          <span className="sidebar__brand">{translateAppText('shell.brand')}</span>
          <button
            aria-controls="mobile-navigation-panel"
            aria-expanded={isMobileNavigationOpen}
            aria-label={
              isMobileNavigationOpen
                ? translateAppText('shell.closeNavigation')
                : translateAppText('shell.openNavigation')
            }
            className="sidebar__menu-button"
            onClick={() => setIsMobileNavigationOpen((currentValue) => !currentValue)}
            type="button"
          >
            <span className="sidebar__menu-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
            <span className="sidebar__menu-label">{translateAppText('shell.menu')}</span>
          </button>
        </div>

        {isMobileNavigationOpen ? (
          <div className="sidebar__mobile-panel" id="mobile-navigation-panel">
            <NavLink
              className="primary-button sidebar__cta"
              onClick={() => setIsMobileNavigationOpen(false)}
              to="/transactions"
            >
              {translateAppText('shell.addTransaction')}
            </NavLink>
            <SidebarNavigation onNavigate={() => setIsMobileNavigationOpen(false)} />
          </div>
        ) : null}

        <div className="sidebar__section sidebar__section--desktop">
          <div>
            <h1 className="sidebar__brand">{translateAppText('shell.brand')}</h1>
            <p className="sidebar__copy">{translateAppText('shell.copy')}</p>
          </div>

          <NavLink className="primary-button sidebar__cta" to="/transactions">
            {translateAppText('shell.addTransaction')}
          </NavLink>

          <SidebarNavigation />
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
          <div className="topbar__intro">
            <h2 className="topbar__title">{pageTitle}</h2>
            <p className="topbar__copy">{pageDescription}</p>
          </div>

          <div className="topbar__meta">
            <div className="topbar__controls">
              <div className="topbar__account">
                <p className="topbar__email">{auth.user?.email}</p>
              </div>
              <div aria-hidden="true" className="avatar-chip">
                {getUserInitials(auth.user?.email)}
              </div>
              <button
                className="secondary-button topbar__signout"
                onClick={() => void auth.signOut()}
                type="button"
              >
                {translateAppText('shell.signOut')}
              </button>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
