import { getDisplayPreferences } from '../../../shared/preferences/displayPreferences';
import { formatCurrency } from '../../../shared/lib/formatters/currency';
import { translateAppText } from '../../../shared/i18n/appText';
import { getCategoryName, getSubcategoryName } from '../../finance/lib/financeSelectors';
import type { CategoryRecord, SubcategoryRecord } from '../../finance/finance.types';
import type { AnalyticsExpenseTransaction } from '../analytics.types';

type AnalyticsExpenseListProps = {
  transactions: AnalyticsExpenseTransaction[];
  categories: CategoryRecord[];
  subcategories: SubcategoryRecord[];
};

function formatDateLabel(date: string, locale = getDisplayPreferences().locale) {
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

export function AnalyticsExpenseList({
  transactions,
  categories,
  subcategories,
}: AnalyticsExpenseListProps) {
  return (
    <section className="finance-panel analytics-panel">
      <div className="finance-panel__heading">
        <div>
          <p className="finance-panel__eyebrow">{translateAppText('analytics.spendingByCategory')}</p>
          <h2>{translateAppText('analytics.spendingTransactions')}</h2>
        </div>
        <p className="analytics-panel__caption">{translateAppText('analytics.simpleTransactionList')}</p>
      </div>

      {transactions.length === 0 ? (
        <p className="finance-empty-state">{translateAppText('analytics.noExpenseTransactions')}</p>
      ) : (
        <div className="analytics-transaction-list">
          {transactions.map((transaction) => (
            <article className="analytics-transaction-card" key={transaction.id}>
              <div>
                <h3>{transaction.description || translateAppText('transactions.noDescription')}</h3>
                <p className="analytics-transaction-card__meta">
                  {getCategoryName(categories, transaction.categoryId)}
                  {' · '}
                  {getSubcategoryName(subcategories, transaction.subcategoryId)}
                </p>
              </div>
              <div className="analytics-transaction-card__amounts">
                <strong>{formatCurrency(transaction.amount)}</strong>
                <span>{formatDateLabel(transaction.date)}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
