export type FinanceNotificationType =
  | 'budget-overrun'
  | 'budget-reallocation'
  | 'installment-complete'
  | 'set-aside-due';

export type FinanceNotificationSeverity = 'critical' | 'warning' | 'info';

export type FinanceNotification = {
  id: string;
  type: FinanceNotificationType;
  severity: FinanceNotificationSeverity;
  title: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  occurredOn: string;
  occurredLabel: string;
  requiresAction: boolean;
};
