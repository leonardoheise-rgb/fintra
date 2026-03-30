import type { PropsWithChildren } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { useAuth } from '../../features/auth/useAuth';
import { navigationItems } from '../navigation/navigationItems';

const pageTitles: Record<string, string> = {
  '/': 'Monthly command center',
  '/transactions': 'Transaction ledger',
  '/categories': 'Category manager',
  '/budgets': 'Budget operations',
  '/analytics': 'Historical insights',
  '/settings': 'Workspace settings',
};

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

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary">
        <div className="sidebar__section">
          <div>
            <p className="sidebar__eyebrow">Wealth curation</p>
            <h1 className="sidebar__brand">Fintra Ledger</h1>
            <p className="sidebar__copy">
              An editorial operating panel for budgets, transactions, and long-term financial
              habits.
            </p>
          </div>

          <nav className="sidebar__nav">
            {navigationItems.map((item) =>
              item.isEnabled ? (
                <NavLink
                  className={({ isActive }) =>
                    `sidebar__item${isActive ? ' sidebar__item--active' : ''}`
                  }
                  key={item.label}
                  to={item.href}
                >
                  <span className="sidebar__item-badge" aria-hidden="true">
                    {item.shortLabel}
                  </span>
                  <div>
                    <p>{item.label}</p>
                    <small>{item.description}</small>
                  </div>
                </NavLink>
              ) : (
                <div className="sidebar__item sidebar__item--disabled" key={item.label}>
                  <span className="sidebar__item-badge" aria-hidden="true">
                    {item.shortLabel}
                  </span>
                  <div>
                    <p>{item.label}</p>
                    <small>{item.description}</small>
                  </div>
                </div>
              ),
            )}
          </nav>
        </div>

        <div className="sidebar__section">
          <NavLink className="primary-button sidebar__cta" to="/transactions">
            Add transaction
          </NavLink>

          <div className="sidebar__footnote">
            Sprint 6 release
            <span>
              Auth, transactions, budgets, analytics, and settings are now ready for a real hosted
              demo.
            </span>
          </div>
        </div>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <div className="topbar__intro">
            <p className="topbar__eyebrow">Editorial ledger</p>
            <h2 className="topbar__title">
              {pageTitles[location.pathname] ?? 'Protected workspace'}
            </h2>
          </div>

          <div className="topbar__meta">
            <label className="topbar__search" htmlFor="app-search">
              <span className="topbar__search-icon" aria-hidden="true">
                S
              </span>
              <input
                aria-label="Search records"
                disabled
                id="app-search"
                placeholder="Search records..."
                type="search"
              />
            </label>
            <div className="topbar__controls">
              <div className="topbar__account">
                <div className="status-pill">
                  {auth.mode === 'preview' ? 'Preview auth' : 'Supabase auth'}
                </div>
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
                Sign out
              </button>
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
