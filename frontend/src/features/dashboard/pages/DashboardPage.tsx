import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { translateAppText } from '../../../shared/i18n/appText';
import { getCurrentMonthKey } from '../../../shared/lib/date/months';
import { useDisplayPreferences } from '../../settings/useDisplayPreferences';
import { sortTransactionsByDateDesc } from '../../finance/lib/financeSelectors';
import { useFinanceData } from '../../finance/useFinanceData';
import { useNotifications } from '../../notifications/useNotifications';
import { AvailableBalancePanel } from '../components/AvailableBalancePanel';
import { BudgetHighlights } from '../components/BudgetHighlights';
import { InsightsPanel } from '../components/InsightsPanel';
import { RecentTransactionsPanel } from '../components/RecentTransactionsPanel';
import { buildDashboardSnapshot } from '../lib/buildDashboardSnapshot';

export function DashboardPage() {
  const financeData = useFinanceData();
  const {
    preferences: { monthStartDay },
  } = useDisplayPreferences();
  const { unreadCount, unreadNotifications } = useNotifications();
  const currentMonth = useMemo(() => getCurrentMonthKey(new Date(), monthStartDay), [monthStartDay]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  useEffect(() => {
    setSelectedMonth(currentMonth);
  }, [currentMonth]);

  if (financeData.status === 'loading') {
    return (
      <section aria-live="polite" className="finance-panel">
        <p className="finance-empty-state">{translateAppText('dashboard.loading')}</p>
      </section>
    );
  }

  const snapshot = buildDashboardSnapshot(
    {
      categories: financeData.categories,
      budgets: financeData.budgets,
      budgetOverrides: financeData.budgetOverrides,
      transactions: financeData.transactions,
      setAsides: financeData.setAsides,
      monthReviews: financeData.monthReviews,
    },
    selectedMonth,
    monthStartDay,
  );
  const recentTransactions = sortTransactionsByDateDesc(financeData.transactions);
  return (
    <div className="dashboard-page">
      <section className="finance-panel dashboard-toolbar dashboard-toolbar--compact">
        <label className="finance-field dashboard-toolbar__field">
          <span>{translateAppText('dashboard.selectedMonth')}</span>
          <input
            name="dashboardMonth"
            onChange={(event) => setSelectedMonth(event.target.value)}
            type="month"
            value={selectedMonth}
          />
        </label>
      </section>

      {financeData.errorMessage ? (
        <section aria-live="assertive" className="finance-panel">
          <p className="finance-message finance-message--error" role="alert">
            {financeData.errorMessage}
          </p>
        </section>
      ) : null}

      {unreadNotifications.length > 0 ? (
        <section className="finance-panel finance-panel--alert">
          <div className="finance-panel__heading">
            <div>
              <h2>{translateAppText('notifications.attentionHeading')}</h2>
            </div>
            <Link className="secondary-button" to="/notifications">
              {translateAppText('notifications.openPage')}
            </Link>
          </div>
          <p className="finance-header__copy">
            {translateAppText('notifications.attentionSummary', {
              count: unreadCount,
            })}
          </p>
          <div className="finance-list notifications-preview-list">
            {unreadNotifications.slice(0, 2).map((notification) => (
              <article className="notification-preview-card" key={notification.id}>
                <strong>{notification.title}</strong>
                <p>{notification.description}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <AvailableBalancePanel snapshot={snapshot} />
      <InsightsPanel insight={snapshot.insight} />
      <BudgetHighlights cards={snapshot.cards} month={selectedMonth} />
      <RecentTransactionsPanel
        categories={financeData.categories}
        subcategories={financeData.subcategories}
        transactions={recentTransactions}
      />
    </div>
  );
}
