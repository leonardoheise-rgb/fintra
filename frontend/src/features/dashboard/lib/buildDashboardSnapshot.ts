import { formatCurrency } from '../../../shared/lib/formatters/currency';
import {
  getMonthKey,
} from '../../../shared/lib/date/months';
import type {
  BudgetOverrideRecord,
  BudgetRecord,
  CategoryRecord,
  MonthReviewRecord,
  SetAsideRecord,
  TransactionRecord,
} from '../../finance/finance.types';
import { filterSetAsidesByMonth } from '../../finance/lib/setAsides';
import { findMonthReview } from '../../finance/lib/monthReviews';
import { resolveEffectiveBudgets } from '../../budgets/lib/effectiveBudgetResolver';
import type { BudgetCard, CategoryAvailability, DashboardSnapshot } from '../dashboard.types';
import { calculateCategoryTodayAvailableToSpend } from './categoryHighlights';

type DashboardSource = {
  categories: CategoryRecord[];
  budgets: BudgetRecord[];
  budgetOverrides: BudgetOverrideRecord[];
  transactions: TransactionRecord[];
  setAsides: SetAsideRecord[];
  monthReviews: MonthReviewRecord[];
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

function getReservedTotalForCategory(setAsides: SetAsideRecord[], categoryId: string) {
  return sumValues(
    setAsides
      .filter((item) => item.categoryId === categoryId)
      .map((item) => item.amount),
  );
}

function buildBudgetCards(
  categories: CategoryRecord[],
  budgets: BudgetRecord[],
  budgetOverrides: BudgetOverrideRecord[],
  transactions: TransactionRecord[],
  setAsides: SetAsideRecord[],
  month: string,
  monthStartDay: number,
  now: Date,
): BudgetCard[] {
  const effectiveBudgets = resolveEffectiveBudgets(budgets, budgetOverrides, month);

  return categories
    .map((category) => {
      const card = {
        id: category.id,
        name: category.name,
        shortLabel: buildShortLabel(category.name),
        defaultBudget: getBudgetTotalForCategory(budgets, category.id),
        effectiveBudget: sumValues(
          effectiveBudgets
            .filter((item) => item.categoryId === category.id)
            .map((item) => item.effectiveAmount),
        ),
        overrideAmount: sumValues(
          effectiveBudgets
            .filter((item) => item.categoryId === category.id && item.isOverridden)
            .map((item) => item.overrideAmount ?? 0),
        ) || null,
        isOverridden: effectiveBudgets.some(
          (item) => item.categoryId === category.id && item.isOverridden,
        ),
        spent: getExpenseTotalForCategory(transactions, category.id),
        reserved: getReservedTotalForCategory(setAsides, category.id),
      };

      return {
        ...card,
        todayAvailableToSpend: calculateCategoryTodayAvailableToSpend(
          card,
          transactions,
          month,
          monthStartDay,
          now,
        ),
      };
    })
    .filter((card) => card.effectiveBudget > 0)
    .sort(
      (left, right) =>
        right.effectiveBudget - left.effectiveBudget || left.name.localeCompare(right.name),
    );
}

function calculateAverageMonthlyExpenses(
  transactions: TransactionRecord[],
  monthStartDay: number,
) {
  const monthlyExpenseTotals = new Map<string, number>();

  transactions
    .filter((item) => item.type === 'expense')
    .forEach((item) => {
      const month = getMonthKey(item.date, monthStartDay);
      monthlyExpenseTotals.set(month, (monthlyExpenseTotals.get(month) ?? 0) + item.amount);
    });

  if (monthlyExpenseTotals.size === 0) {
    return 0;
  }

  return sumValues([...monthlyExpenseTotals.values()]) / monthlyExpenseTotals.size;
}

function buildCategoryAvailability(cards: BudgetCard[]): CategoryAvailability[] {
  return cards.map((card) => ({
    id: card.id,
    name: card.name,
    available: card.effectiveBudget - card.spent - card.reserved,
    budget: card.effectiveBudget,
    spent: card.spent,
    reserved: card.reserved,
  }));
}

function calculateTotalAvailable(
  cards: BudgetCard[],
  transactions: TransactionRecord[],
  setAsides: SetAsideRecord[],
  plannedIncome: number,
  carryOverAmount: number,
): number {
  const budgetedCategoryIds = new Set(cards.map((card) => card.id));
  const forecastedBudgetedSpending = sumValues(
    cards.map((card) => Math.max(card.spent, card.effectiveBudget)),
  );
  const nonBudgetedExpenses = sumValues(
    transactions
      .filter(
        (transaction) =>
          transaction.type === 'expense' && !budgetedCategoryIds.has(transaction.categoryId),
      )
      .map((transaction) => transaction.amount),
  );
  const nonBudgetedSetAsides = sumValues(
    setAsides
      .filter((setAside) => !budgetedCategoryIds.has(setAside.categoryId))
      .map((setAside) => setAside.amount),
  );
  const totalIncome = sumValues(
    transactions
      .filter((transaction) => transaction.type === 'income')
      .map((transaction) => transaction.amount),
  );

  return (
    totalIncome +
    plannedIncome +
    carryOverAmount -
    forecastedBudgetedSpending -
    nonBudgetedExpenses -
    nonBudgetedSetAsides
  );
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
      highestOverageCard.spent - highestOverageCard.effectiveBudget,
    )}. Tighten that lane first.`;
  }

  if (remainingBudget <= 0) {
    return 'Your budget envelope is fully consumed for the selected month. Review category pacing before adding more spend.';
  }

  return `You still have ${formatCurrency(
    remainingBudget,
  )} available across the default monthly plan. The dashboard is now reconciling budgets against live transactions.`;
}

export function filterTransactionsByMonth(
  transactions: TransactionRecord[],
  month: string,
  monthStartDay = 1,
) {
  return transactions.filter((item) => getMonthKey(item.date, monthStartDay) === month);
}

export function buildDashboardSnapshot(
  source: DashboardSource,
  month: string,
  monthStartDay = 1,
  now = new Date(),
): DashboardSnapshot {
  const monthlyTransactions = filterTransactionsByMonth(source.transactions, month, monthStartDay);
  const monthlySetAsides = filterSetAsidesByMonth(source.setAsides, month, monthStartDay);
  const cards = buildBudgetCards(
    source.categories,
    source.budgets,
    source.budgetOverrides,
    monthlyTransactions,
    monthlySetAsides,
    month,
    monthStartDay,
    now,
  );
  const totalBudget = sumValues(cards.map((card) => card.effectiveBudget));
  const monthReview = findMonthReview(source.monthReviews, month);
  const plannedIncome = monthReview?.plannedIncomeAmount ?? 0;
  const carryOverAmount = monthReview?.carryOverAmount ?? 0;
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
  const totalReserved = sumValues(monthlySetAsides.map((item) => item.amount));
  const remainingBudget = totalBudget - totalExpenses - totalReserved;
  const remainingBalance = totalIncome + plannedIncome + carryOverAmount - totalExpenses;
  const categoryAvailability = buildCategoryAvailability(cards);
  const totalAvailable = calculateTotalAvailable(
    cards,
    monthlyTransactions,
    monthlySetAsides,
    plannedIncome,
    carryOverAmount,
  );

  return {
    month,
    totalBudget,
    totalIncome,
    plannedIncome,
    carryOverAmount,
    totalExpenses,
    totalReserved,
    remainingBudget,
    remainingBalance,
    totalAvailable,
    averageMonthlyExpenses: calculateAverageMonthlyExpenses(source.transactions, monthStartDay),
    insight: buildInsight(cards, remainingBudget),
    cards,
    categoryAvailability,
  };
}
