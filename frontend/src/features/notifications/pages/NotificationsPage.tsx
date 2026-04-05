import { Link } from 'react-router-dom';

import { translateAppText } from '../../../shared/i18n/appText';
import { CategoriesSummaryCard } from '../../finance/components/CategoriesSummaryCard';
import { FinancePageHeader } from '../../finance/components/FinancePageHeader';
import { useNotifications } from '../useNotifications';

function getSeverityLabel(severity: 'critical' | 'warning' | 'info') {
  if (severity === 'critical') {
    return translateAppText('notifications.severityCritical');
  }

  if (severity === 'warning') {
    return translateAppText('notifications.severityWarning');
  }

  return translateAppText('notifications.severityInfo');
}

export function NotificationsPage() {
  const { actionableNotifications, markAllAsRead, markAsRead, notifications, unreadCount } =
    useNotifications();

  return (
    <div className="finance-page">
      <FinancePageHeader
        description={translateAppText('notifications.description')}
        eyebrow={translateAppText('notifications.eyebrow')}
        title={translateAppText('notifications.title')}
      />

      <section
        aria-label={translateAppText('notifications.summary')}
        className="finance-summary-grid"
      >
        <CategoriesSummaryCard
          label={translateAppText('notifications.unreadCount')}
          value={String(unreadCount)}
        />
        <CategoriesSummaryCard
          label={translateAppText('notifications.totalCount')}
          value={String(notifications.length)}
        />
        <CategoriesSummaryCard
          label={translateAppText('notifications.requiresAction')}
          value={String(actionableNotifications.length)}
        />
      </section>

      <section className="finance-panel notifications-toolbar">
        <div className="finance-panel__heading">
          <div>
            <p className="finance-panel__eyebrow">{translateAppText('notifications.inboxEyebrow')}</p>
            <h2>{translateAppText('notifications.inboxHeading')}</h2>
          </div>

          <button
            className="secondary-button"
            disabled={notifications.length === 0 || unreadCount === 0}
            onClick={markAllAsRead}
            type="button"
          >
            {translateAppText('notifications.markAllRead')}
          </button>
        </div>

        {notifications.length === 0 ? (
          <p className="finance-empty-state">{translateAppText('notifications.empty')}</p>
        ) : (
          <div className="finance-list notifications-list">
            {notifications.map((notification) => (
              <article
                className={`notification-card notification-card--${notification.severity}${
                  notification.isRead ? ' notification-card--read' : ''
                }`}
                key={notification.id}
              >
                <div className="notification-card__header">
                  <div>
                    <p className="notification-card__eyebrow">
                      {getSeverityLabel(notification.severity)}
                    </p>
                    <h3>{notification.title}</h3>
                  </div>
                  <span className="notification-card__date">{notification.occurredLabel}</span>
                </div>

                <p className="notification-card__description">{notification.description}</p>

                <div className="notification-card__actions">
                  <Link className="primary-button" to={notification.actionHref}>
                    {notification.actionLabel}
                  </Link>
                  <button
                    className="secondary-button"
                    disabled={notification.isRead}
                    onClick={() => markAsRead(notification.id)}
                    type="button"
                  >
                    {notification.isRead
                      ? translateAppText('notifications.read')
                      : translateAppText('notifications.markRead')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
