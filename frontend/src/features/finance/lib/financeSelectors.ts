import type {
  CategoryRecord,
  SubcategoryRecord,
  TransactionRecord,
} from '../finance.types';

export function getSubcategoriesForCategory(
  subcategories: SubcategoryRecord[],
  categoryId: string,
) {
  return subcategories
    .filter((item) => item.categoryId === categoryId)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getCategoryName(categories: CategoryRecord[], categoryId: string) {
  return categories.find((item) => item.id === categoryId)?.name ?? 'Unknown category';
}

export function getSubcategoryName(
  subcategories: SubcategoryRecord[],
  subcategoryId: string | null,
) {
  if (!subcategoryId) {
    return 'No subcategory';
  }

  return subcategories.find((item) => item.id === subcategoryId)?.name ?? 'Unknown subcategory';
}

export function sortTransactionsByDateDesc(transactions: TransactionRecord[]) {
  return [...transactions].sort((left, right) => right.date.localeCompare(left.date));
}
