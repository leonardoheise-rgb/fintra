import type {
  CategoryRecord,
  SubcategoryRecord,
  TransactionRecord,
} from '../finance.types';
import { translateAppText } from '../../../shared/i18n/appText';

export function getSubcategoriesForCategory(
  subcategories: SubcategoryRecord[],
  categoryId: string,
) {
  return subcategories
    .filter((item) => item.categoryId === categoryId)
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function getCategoryName(categories: CategoryRecord[], categoryId: string) {
  return categories.find((item) => item.id === categoryId)?.name ?? translateAppText('finance.unknownCategory');
}

export function getSubcategoryName(
  subcategories: SubcategoryRecord[],
  subcategoryId: string | null,
) {
  if (!subcategoryId) {
    return translateAppText('finance.noSubcategory');
  }

  return (
    subcategories.find((item) => item.id === subcategoryId)?.name ??
    translateAppText('finance.unknownSubcategory')
  );
}

export function sortTransactionsByDateDesc(transactions: TransactionRecord[]) {
  return [...transactions].sort((left, right) => {
    const dateComparison = right.date.localeCompare(left.date);

    if (dateComparison !== 0) {
      return dateComparison;
    }

    const recordedAtComparison = (right.recordedAt ?? '').localeCompare(left.recordedAt ?? '');

    if (recordedAtComparison !== 0) {
      return recordedAtComparison;
    }

    return right.id.localeCompare(left.id);
  });
}
