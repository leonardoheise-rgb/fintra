import { NavLink } from 'react-router-dom';

import { useNotifications } from '../../features/notifications/useNotifications';
import { navigationItems } from '../navigation/navigationItems';
import { translateAppText } from '../../shared/i18n/appText';

type SidebarNavigationProps = {
  onNavigate?: () => void;
  variant?: 'drawer' | 'bottom';
};

function renderNavigationGlyph(id: string) {
  switch (id) {
    case 'dashboard':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <rect x="4" y="4" width="7" height="7" rx="1.5" />
          <rect x="13" y="4" width="7" height="7" rx="1.5" />
          <rect x="4" y="13" width="7" height="7" rx="1.5" />
          <rect x="13" y="13" width="7" height="7" rx="1.5" />
        </svg>
      );
    case 'transactions':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <rect x="5" y="4" width="14" height="16" rx="2" />
          <path d="M8 9h8M8 13h8M8 17h5" />
          <path d="M9 2v4M15 2v4" />
        </svg>
      );
    case 'categories':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="7" cy="7" r="2.5" />
          <circle cx="17" cy="7" r="2.5" />
          <circle cx="12" cy="17" r="2.5" />
          <path d="M9 8.5l3 6M15 8.5l-3 6" />
        </svg>
      );
    case 'budgets':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M8 10h8M8 14h5" />
          <circle cx="16.5" cy="12" r="1.5" />
        </svg>
      );
    case 'analytics':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M8 15v-4M12 15V8M16 15v-6" />
        </svg>
      );
    case 'notifications':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <path d="M12 4.5a4.5 4.5 0 0 1 4.5 4.5v2.4c0 .7.2 1.4.6 2l1.1 1.8H5.8l1.1-1.8c.4-.6.6-1.3.6-2V9A4.5 4.5 0 0 1 12 4.5Z" />
          <path d="M10 18a2 2 0 0 0 4 0" />
        </svg>
      );
    case 'settings':
      return (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3.2" />
          <path d="M12 4.5v2.2M12 17.3v2.2M4.5 12h2.2M17.3 12h2.2M6.8 6.8l1.5 1.5M15.7 15.7l1.5 1.5M17.2 6.8l-1.5 1.5M8.3 15.7l-1.5 1.5" />
        </svg>
      );
    default:
      return null;
  }
}

export function SidebarNavigation({
  onNavigate,
  variant = 'drawer',
}: SidebarNavigationProps) {
  const { unreadCount } = useNotifications();
  const visibleItems = navigationItems.filter((item) =>
    variant === 'bottom' ? item.showInBottomNav : true,
  );

  return (
    <nav
      aria-label={translateAppText(
        variant === 'bottom' ? 'shell.bottomNavigation' : 'shell.primaryNavigation',
      )}
      className={`sidebar__nav sidebar__nav--${variant}`}
    >
      {visibleItems.map((item) =>
        item.isEnabled ? (
          <NavLink
            className={({ isActive }) =>
              `sidebar__item sidebar__item--${variant}${
                isActive ? ' sidebar__item--active' : ''
              }`
            }
            key={item.id}
            onClick={onNavigate}
            to={item.href}
          >
            <span className="sidebar__item-badge" aria-hidden="true">
              {renderNavigationGlyph(item.id)}
            </span>
            <div>
              <p>{translateAppText(`nav.${item.id}`)}</p>
            </div>
            {item.id === 'notifications' && unreadCount > 0 ? (
              <span className="sidebar__item-count">{unreadCount}</span>
            ) : null}
          </NavLink>
        ) : (
          <div
            className={`sidebar__item sidebar__item--${variant} sidebar__item--disabled`}
            key={item.id}
          >
            <span className="sidebar__item-badge" aria-hidden="true">
              {renderNavigationGlyph(item.id)}
            </span>
            <div>
              <p>{translateAppText(`nav.${item.id}`)}</p>
            </div>
          </div>
        ),
      )}
    </nav>
  );
}
