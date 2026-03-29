import type { PropsWithChildren } from 'react';

import { navigationItems } from '../navigation/navigationItems';

export function AppLayout({ children }: PropsWithChildren) {
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
          {navigationItems.map((item) => (
            <div
              key={item.label}
              className={`sidebar__item${item.isActive ? ' sidebar__item--active' : ''}`}
            >
              <span className="sidebar__item-badge" aria-hidden="true">
                {item.shortLabel}
              </span>
              <div>
                <p>{item.label}</p>
                <small>{item.description}</small>
              </div>
            </div>
          ))}
        </nav>

        <div className="sidebar__footnote">
          Phase 0 foundation
          <span>Ready for auth, data, and analytics iterations.</span>
        </div>
      </aside>

      <div className="main-panel">
        <header className="topbar">
          <div>
            <p className="topbar__eyebrow">Editorial ledger</p>
            <h2 className="topbar__title">Monthly command center</h2>
          </div>

          <div className="topbar__meta">
            <div className="status-pill">Preview build</div>
            <div className="avatar-chip" aria-label="Workspace initials">
              FT
            </div>
          </div>
        </header>

        <main className="content">{children}</main>
      </div>
    </div>
  );
}
