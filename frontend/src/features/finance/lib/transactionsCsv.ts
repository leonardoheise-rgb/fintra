import { translateAppText } from '../../../shared/i18n/appText';
import type {
  CategoryRecord,
  SubcategoryRecord,
  TransactionRecord,
} from '../finance.types';
import { getCategoryName, getSubcategoryName } from './financeSelectors';

function escapeCsvCell(value: string | number) {
  const text = String(value);

  if (!/[",\n]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export function buildTransactionsCsv(
  transactions: TransactionRecord[],
  categories: CategoryRecord[],
  subcategories: SubcategoryRecord[],
) {
  const rows = [
    [
      translateAppText('transactions.date'),
      translateAppText('transactions.type'),
      translateAppText('transactions.category'),
      translateAppText('categories.subcategories'),
      translateAppText('transactions.descriptionLabel'),
      translateAppText('transactions.amount'),
    ],
    ...transactions.map((transaction) => [
      transaction.date,
      transaction.type === 'income'
        ? translateAppText('transactions.incomeOption')
        : translateAppText('transactions.expense'),
      getCategoryName(categories, transaction.categoryId),
      getSubcategoryName(subcategories, transaction.subcategoryId),
      transaction.description,
      transaction.amount.toFixed(2),
    ]),
  ];

  return rows.map((row) => row.map(escapeCsvCell).join(',')).join('\n');
}
