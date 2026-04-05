import { getMonthKey } from '../../../shared/lib/date/months';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { formatMonthLabel } from '../../../shared/lib/formatters/date';
import { translateAppText } from '../../../shared/i18n/appText';
import { buildDashboardSnapshot, filterTransactionsByMonth } from '../../dashboard/lib/buildDashboardSnapshot';
import { findPreferredDonorBudgetTarget, findPreferredSourceBudgetTarget } from '../../finance/lib/budgetReallocation';
import { getCategoryName, getSubcategoryName } from '../../finance/lib/financeSelectors';
import { getDueSetAsides } from '../../finance/lib/setAsides';
import type { FinanceWorkspace, TransactionRecord } from '../../finance/finance.types';
import type { FinanceNotification, FinanceNotificationSeverity } from '../notifications.types';

type BuildNotificationsOptions = {
  currency: string;
  locale: string;
  monthStartDay: number;
  todayIsoDate: string;
};

function formatIsoDateLabel(date: string, locale: string) {
  const [yearText, monthText, dayText] = date.split('-');
  const year = Number(yearText);
  const monthIndex = Number(monthText) - 1;
  const day = Number(dayText);

  if (
    Number.isNaN(year) ||
    Number.isNaN(monthIndex) ||
    Number.isNaN(day) ||
    monthIndex < 0 ||
    monthIndex > 11
  ) {
    return date;
  }

  return new Intl.DateTimeFormat(locale, {
    dateStyle: 'medium',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, monthIndex, day)));
}

function compareSeverity(
  left: FinanceNotificationSeverity,
  right: FinanceNotificationSeverity,
) {
  const severityRank: Record<FinanceNotificationSeverity, number> = {
    critical: 0,
    warning: 1,
    info: 2,
  };

  return severityRank[left] - severityRank[right];
}

function groupTransactionsByInstallmentGroup(transactions: TransactionRecord[]) {
  const groups = new Map<string, TransactionRecord[]>();

  transactions.forEach((transaction) => {
    if (!transaction.installmentGroupId) {
      return;
    }

    const groupTransactions = groups.get(transaction.installmentGroupId) ?? [];

    groupTransactions.push(transaction);
    groups.set(transaction.installmentGroupId, groupTransactions);
  });

  return groups;
}

function buildInstallmentCompletionNotifications(
  workspace: FinanceWorkspace,
  options: BuildNotificationsOptions,
) {
  const currentMonth = getMonthKey(options.todayIsoDate, options.monthStartDay);

  return [...groupTransactionsByInstallmentGroup(workspace.transactions).entries()].reduce<
    FinanceNotification[]
  >((notifications, [installmentGroupId, transactions]) => {
      const sortedTransactions = [...transactions].sort(
        (left, right) =>
          (left.installmentIndex ?? 0) - (right.installmentIndex ?? 0) ||
          left.date.localeCompare(right.date),
      );
      const lastInstallment = sortedTransactions[sortedTransactions.length - 1] ?? null;

      if (
        !lastInstallment ||
        !lastInstallment.installmentCount ||
        lastInstallment.installmentCount <= 1 ||
        lastInstallment.installmentIndex !== lastInstallment.installmentCount ||
        lastInstallment.date > options.todayIsoDate ||
        getMonthKey(lastInstallment.date, options.monthStartDay) !== currentMonth
      ) {
        return notifications;
      }

      const titleTarget =
        lastInstallment.description ||
        `${getCategoryName(workspace.categories, lastInstallment.categoryId)} / ${getSubcategoryName(
          workspace.subcategories,
          lastInstallment.subcategoryId,
        )}`;

      notifications.push({
        id: `installment-complete:${installmentGroupId}`,
        type: 'installment-complete',
        severity: 'info',
        title: translateAppText(
          'notifications.installmentCompleteTitle',
          {
            title: titleTarget,
          },
          options.locale,
        ),
        description: translateAppText(
          'notifications.installmentCompleteBody',
          {
            date: formatIsoDateLabel(lastInstallment.date, options.locale),
            installmentCount: lastInstallment.installmentCount,
          },
          options.locale,
        ),
        actionHref: '/transactions',
        actionLabel: translateAppText('notifications.openTransactions', undefined, options.locale),
        occurredOn: lastInstallment.date,
        occurredLabel: formatIsoDateLabel(lastInstallment.date, options.locale),
        requiresAction: false,
      });

      return notifications;
    }, []);
}

export function buildFinanceNotifications(
  workspace: FinanceWorkspace,
  options: BuildNotificationsOptions,
) {
  const currentMonth = getMonthKey(options.todayIsoDate, options.monthStartDay);
  const currentMonthLabel = formatMonthLabel(currentMonth, options.locale);
  const currentMonthTransactions = filterTransactionsByMonth(
    workspace.transactions,
    currentMonth,
    options.monthStartDay,
  );
  const snapshot = buildDashboardSnapshot(workspace, currentMonth, options.monthStartDay);
  const notifications: FinanceNotification[] = [];

  snapshot.categoryAvailability
    .filter((categoryAvailability) => categoryAvailability.available < 0)
    .forEach((categoryAvailability) => {
      const overage = Math.abs(categoryAvailability.available);
      const lastCategoryTransactionDate =
        currentMonthTransactions
          .filter(
            (transaction) =>
              transaction.categoryId === categoryAvailability.id && transaction.type === 'expense',
          )
          .sort((left, right) => right.date.localeCompare(left.date))[0]?.date ??
        `${currentMonth}-01`;

      notifications.push({
        id: `budget-overrun:${currentMonth}:${categoryAvailability.id}`,
        type: 'budget-overrun',
        severity: 'critical',
        title: translateAppText(
          'notifications.overBudgetTitle',
          {
            category: categoryAvailability.name,
          },
          options.locale,
        ),
        description: translateAppText(
          'notifications.overBudgetBody',
          {
            amount: formatCurrency(overage, {
              locale: options.locale,
              currency: options.currency,
            }),
            month: currentMonthLabel,
          },
          options.locale,
        ),
        actionHref: '/budgets',
        actionLabel: translateAppText('notifications.openBudgets', undefined, options.locale),
        occurredOn: lastCategoryTransactionDate,
        occurredLabel: currentMonthLabel,
        requiresAction: true,
      });

      const sourceTarget = findPreferredSourceBudgetTarget(
        workspace.budgets,
        workspace.budgetOverrides,
        currentMonth,
        categoryAvailability.id,
        null,
      );
      const donorOptions = workspace.categories.filter((category) => {
        if (category.id === categoryAvailability.id) {
          return false;
        }

        const donorAvailability = snapshot.categoryAvailability.find(
          (availability) => availability.id === category.id,
        );

        if ((donorAvailability?.available ?? 0) <= overage) {
          return false;
        }

        return Boolean(
          findPreferredDonorBudgetTarget(
            workspace.budgets,
            workspace.budgetOverrides,
            currentMonth,
            category.id,
            overage,
          ),
        );
      });

      if (!sourceTarget || donorOptions.length === 0) {
        return;
      }

      notifications.push({
        id: `budget-reallocation:${currentMonth}:${categoryAvailability.id}`,
        type: 'budget-reallocation',
        severity: 'warning',
        title: translateAppText(
          'notifications.reallocationTitle',
          {
            category: categoryAvailability.name,
          },
          options.locale,
        ),
        description: translateAppText(
          'notifications.reallocationBody',
          {
            amount: formatCurrency(overage, {
              locale: options.locale,
              currency: options.currency,
            }),
            month: currentMonthLabel,
          },
          options.locale,
        ),
        actionHref: '/budgets',
        actionLabel: translateAppText('notifications.openBudgets', undefined, options.locale),
        occurredOn: lastCategoryTransactionDate,
        occurredLabel: currentMonthLabel,
        requiresAction: true,
      });
    });

  getDueSetAsides(workspace.setAsides, options.todayIsoDate).forEach((setAside) => {
    const titleTarget =
      setAside.description ||
      `${getCategoryName(workspace.categories, setAside.categoryId)} / ${getSubcategoryName(
        workspace.subcategories,
        setAside.subcategoryId,
      )}`;

    notifications.push({
      id: `set-aside-due:${setAside.id}`,
      type: 'set-aside-due',
      severity: 'critical',
      title: translateAppText(
        'notifications.setAsideTitle',
        {
          title: titleTarget,
        },
        options.locale,
      ),
      description: translateAppText(
        'notifications.setAsideBody',
        {
          amount: formatCurrency(setAside.amount, {
            locale: options.locale,
            currency: options.currency,
          }),
          date: formatIsoDateLabel(setAside.date, options.locale),
        },
        options.locale,
      ),
      actionHref: '/transactions',
      actionLabel: translateAppText('notifications.openTransactions', undefined, options.locale),
      occurredOn: setAside.date,
      occurredLabel: formatIsoDateLabel(setAside.date, options.locale),
      requiresAction: true,
    });
  });

  notifications.push(...buildInstallmentCompletionNotifications(workspace, options));

  return notifications.sort(
    (left, right) =>
      compareSeverity(left.severity, right.severity) ||
      right.occurredOn.localeCompare(left.occurredOn) ||
      left.title.localeCompare(right.title),
  );
}
