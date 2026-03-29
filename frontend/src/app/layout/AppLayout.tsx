import type { PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';

import { useAuth } from '../../features/auth/useAuth';
import { navigationItems } from '../navigation/navigationItems';

export function AppLayout({ children }: PropsWithChildren) {
  const auth = useAuth();

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Primary">
        <div>
          <p className="sidebar__eyebrow">Finance tracker</p>
          <h1 className="sidebar__brand">Fintra</h1>
          <p className="sidebar__copy">
            A clean operating panel for budgets, transactions, and long-term financial habits.
          </p>
        </div>

        <nav className="sidebar__nav">
          {navigationItems.map((item) =>
            item.href === '/' ? (
              <NavLink
                className={({ isActive }) => `sidebar__item${isActive ? ' sidebar__item--active' : ''}`}
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

        <div className="sidebar__footnote">
          Phase 1 authentication
          <span>Protected routing is active and the shell is now session-aware.</span>
        </div>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <div>
            <p className="topbar__eyebrow">Editorial ledger</p>
            <h2 className="topbar__title">Monthly command center</h2>
          </div>

          <div className="topbar__meta">
            <div className="topbar__account">
              <div className="status-pill">
                {auth.mode === 'preview' ? 'Preview auth' : 'Supabase auth'}
              </div>
              <p className="topbar__email">{auth.user?.email}</p>
            </div>
            <button className="secondary-button topbar__signout" onClick={() => void auth.signOut()} type="button">
              Sign out
            </button>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
