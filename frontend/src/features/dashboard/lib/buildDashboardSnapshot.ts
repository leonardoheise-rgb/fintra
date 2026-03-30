import { formatCurrency } from '../../../shared/lib/formatters/currency';
import type {
  BudgetRecord,
  CategoryRecord,
  TransactionRecord,
} from '../../finance/finance.types';
import type { BudgetCard, DashboardSnapshot } from '../dashboard.types';

type DashboardSource = {
  categories: CategoryRecord[];
  budgets: BudgetRecord[];
  transactions: TransactionRecord[];
};

function buildShortLabel(name: string) {
  const ignoredWords = new Set(['and', 'of', 'the']);
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .filter((part) => !ignoredWords.has(part.toLowerCase()))
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return initials || name.slice(0, 2).toUpperCase();
}

function sumValues(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

function getMonthKey(date: string) {
  return date.slice(0, 7);
}

function getBudgetTotalForCategory(budgets: BudgetRecord[], categoryId: string) {
  return sumValues(
    budgets
      .filter((item) => item.categoryId === categoryId)
      .map((item) => item.amount),
  );
}

function getExpenseTotalForCategory(
  transactions: TransactionRecord[],
  categoryId: string,
) {
  return sumValues(
    transactions
      .filter((item) => item.categoryId === categoryId && item.type === 'expense')
      .map((item) => item.amount),
  );
}

function buildBudgetCards(
  categories: CategoryRecord[],
  budgets: BudgetRecord[],
  transactions: TransactionRecord[],
): BudgetCard[] {
  return categories
    .map((category) => ({
      id: category.id,
      name: category.name,
      shortLabel: buildShortLabel(category.name),
      defaultBudget: getBudgetTotalForCategory(budgets, category.id),
      spent: getExpenseTotalForCategory(transactions, category.id),
    }))
    .filter((card) => card.defaultBudget > 0)
    .sort((left, right) => right.defaultBudget - left.defaultBudget || left.name.localeCompare(right.name));
}

function calculateAverageMonthlyExpenses(transactions: TransactionRecord[]) {
  const monthlyExpenseTotals = new Map<string, number>();

  transactions
    .filter((item) => item.type === 'expense')
    .forEach((item) => {
      const month = getMonthKey(item.date);
      monthlyExpenseTotals.set(month, (monthlyExpenseTotals.get(month) ?? 0) + item.amount);
    });

  if (monthlyExpenseTotals.size === 0) {
    return 0;
  }

  return sumValues([...monthlyExpenseTotals.values()]) / monthlyExpenseTotals.size;
}

function buildInsight(cards: BudgetCard[], remainingBudget: number) {
  if (cards.length === 0) {
    return 'Set your first default budget to turn the dashboard into a live monthly planning surface.';
  }

  const highestOverageCard = cards
    .filter((card) => card.spent > card.defaultBudget)
    .sort(
      (left, right) =>
        right.spent - right.defaultBudget - (left.spent - left.defaultBudget),
    )[0];

  if (highestOverageCard) {
    return `${highestOverageCard.name} is over plan by ${formatCurrency(
      highestOverageCard.spent - highestOverageCard.defaultBudget,
    )}. Tighten that lane first.`;
  }

  if (remainingBudget <= 0) {
    return 'Your budget envelope is fully consumed for the selected month. Review category pacing before adding more spend.';
  }

  return `You still have ${formatCurrency(
    remainingBudget,
  )} available across the default monthly plan. The dashboard is now reconciling budgets against live transactions.`;
}

export function getCurrentMonthKey(now = new Date()) {
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function filterTransactionsByMonth(
  transactions: TransactionRecord[],
  month: string,
) {
  return transactions.filter((item) => getMonthKey(item.date) === month);
}

export function buildDashboardSnapshot(
  source: DashboardSource,
  month: string,
): DashboardSnapshot {
  const monthlyTransactions = filterTransactionsByMonth(source.transactions, month);
  const cards = buildBudgetCards(source.categories, source.budgets, monthlyTransactions);
  const totalBudget = sumValues(cards.map((card) => card.defaultBudget));
  const totalIncome = sumValues(
    monthlyTransactions
      .filter((item) => item.type === 'income')
      .map((item) => item.amount),
  );
  const totalExpenses = sumValues(
    monthlyTransactions
      .filter((item) => item.type === 'expense')
      .map((item) => item.amount),
  );
  const remainingBudget = totalBudget - totalExpenses;
  const remainingBalance = totalIncome - totalExpenses;

  return {
    month,
    totalBudget,
    totalIncome,
    totalExpenses,
    remainingBudget,
    remainingBalance,
    averageMonthlyExpenses: calculateAverageMonthlyExpenses(source.transactions),
    insight: buildInsight(cards, remainingBudget),
    cards,
  };
}
