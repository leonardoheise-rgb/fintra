import type { PropsWithChildren } from 'react';
import { NavLink, useLocation } from 'react-router-dom';

import { navigationItems } from '../navigation/navigationItems';
import { useAuth } from '../../features/auth/useAuth';

const pageTitles: Record<string, string> = {
  '/': 'Monthly command center',
  '/transactions': 'Transaction ledger',
  '/categories': 'Category manager',
  '/budgets': 'Budget operations',
  '/analytics': 'Historical insights',
  '/settings': 'Workspace settings',
};

const pageDescriptions: Record<string, string> = {
  '/': 'Track monthly pacing, see the latest budget signals, and keep the highest-value insight in view first.',
  '/transactions':
    'Create entries quickly, scan the latest ledger movements, and keep the primary action visible on smaller screens.',
  '/categories':
    'Shape the category model first so every transaction, budget, and report keeps a clear information hierarchy.',
  '/budgets':
    'Review default plans and monthly overrides with stronger separation between setup, scope, and active totals.',
  '/analytics':
    'Read trends, comparisons, and category drift through a calmer long-view layout with clearer mobile filters.',
  '/settings':
    'Choose how amounts, dates, and your monthly rhythm feel throughout the app.',
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
  const pageTitle = pageTitles[location.pathname] ?? 'Protected workspace';
  const pageDescription =
    pageDescriptions[location.pathname] ??
    'Your core money tools now share a calmer, clearer layout.';

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
            Stay consistent
            <span>
              Keep your transactions, budgets, and monthly habits aligned in one focused place.
            </span>
          </div>
        </div>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <div className="topbar__intro">
            <p className="topbar__eyebrow">Editorial ledger</p>
            <h2 className="topbar__title">{pageTitle}</h2>
            <p className="topbar__copy">{pageDescription}</p>
          </div>

          <div className="topbar__meta">
            <div className="topbar__workspace">
              <div className="status-pill status-pill--accent">Personal workspace</div>
              <p className="topbar__workspace-copy">
                Your plan, activity, and progress stay organized around the month ahead.
              </p>
            </div>
            <div className="topbar__controls">
              <div className="topbar__account">
                <div className="status-pill">Signed in</div>
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
