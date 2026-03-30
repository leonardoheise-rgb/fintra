import { NavLink } from 'react-router-dom';

import { navigationItems } from '../navigation/navigationItems';
import { translateAppText } from '../../shared/i18n/appText';

type SidebarNavigationProps = {
  onNavigate?: () => void;
};

export function SidebarNavigation({ onNavigate }: SidebarNavigationProps) {
  return (
    <nav className="sidebar__nav">
      {navigationItems.map((item) =>
        item.isEnabled ? (
          <NavLink
            className={({ isActive }) => `sidebar__item${isActive ? ' sidebar__item--active' : ''}`}
            key={item.id}
            onClick={onNavigate}
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
  );
}
