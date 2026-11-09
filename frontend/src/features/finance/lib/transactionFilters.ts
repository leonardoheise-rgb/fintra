import type { CategoryRecord, SubcategoryRecord, TransactionRecord } from '../finance.types';
import { getCategoryName, getSubcategoryName } from './financeSelectors';

type TransactionFilters = {
  endDate: string;
  searchTerm: string;
  startDate: string;
};

function normalizeSearchText(value: string) {
  return value.trim().toLocaleLowerCase();
}

export function filterTransactions(
  transactions: TransactionRecord[],
  categories: CategoryRecord[],
  subcategories: SubcategoryRecord[],
  filters: TransactionFilters,
) {
  const searchTerm = normalizeSearchText(filters.searchTerm);

  return transactions.filter((transaction) => {
    if (filters.startDate && transaction.date < filters.startDate) {
      return false;
    }

    if (filters.endDate && transaction.date > filters.endDate) {
      return false;
    }

    if (!searchTerm) {
      return true;
    }

    const searchableText = [
      transaction.description,
      getCategoryName(categories, transaction.categoryId),
      getSubcategoryName(subcategories, transaction.subcategoryId),
      transaction.type,
    ]
      .join(' ')
      .toLocaleLowerCase();

    return searchableText.includes(searchTerm);
  });
}
