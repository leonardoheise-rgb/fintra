import type { PropsWithChildren } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { navigationItems } from '../navigation/navigationItems';
import { useAuth } from '../../features/auth/useAuth';
import { translateAppText } from '../../shared/i18n/appText';

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
  const location = useLocation();
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

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary">
        <div className="sidebar__section">
          <div>
            <h1 className="sidebar__brand">{translateAppText('shell.brand')}</h1>
            <p className="sidebar__copy">{translateAppText('shell.copy')}</p>
          </div>

          <NavLink className="primary-button sidebar__cta" to="/transactions">
            {translateAppText('shell.addTransaction')}
          </NavLink>

          <nav className="sidebar__nav">
            {navigationItems.map((item) =>
              item.isEnabled ? (
                <NavLink
                  className={({ isActive }) =>
                    `sidebar__item${isActive ? ' sidebar__item--active' : ''}`
                  }
                  key={item.id}
                  to={item.href}
                >
                  <span className="sidebar__item-badge" aria-hidden="true">
                    {item.shortLabel}
                  </span>
                  <div>
                    <p>{translateAppText(`nav.${item.id}`)}</p>
                  </div>
                </NavLink>
              ) : (
                <div className="sidebar__item sidebar__item--disabled" key={item.id}>
                  <span className="sidebar__item-badge" aria-hidden="true">
                    {item.shortLabel}
                  </span>
                  <div>
                    <p>{translateAppText(`nav.${item.id}`)}</p>
                  </div>
                </div>
              ),
            )}
          </nav>
        </div>
      </aside>

      <div className="main-panel">
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
