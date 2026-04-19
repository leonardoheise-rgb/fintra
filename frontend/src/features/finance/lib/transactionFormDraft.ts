import type { TransactionInput } from '../finance.types';

export type TransactionFormDraft = {
  amount: string;
  type: TransactionInput['type'];
  categoryId: string;
  subcategoryId: string;
  date: string;
  description: string;
  installmentCount: string;
};

function getStorageKey(userId: string) {
  return `fintra.transaction-form-draft.${userId}`;
}

export function readTransactionFormDraft(userId: string): TransactionFormDraft | null {
  const rawValue = window.localStorage.getItem(getStorageKey(userId));

  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<TransactionFormDraft>;

    return {
      amount: typeof parsedValue.amount === 'string' ? parsedValue.amount : '',
      type: parsedValue.type === 'income' ? 'income' : 'expense',
      categoryId:
        typeof parsedValue.categoryId === 'string' ? parsedValue.categoryId : '',
      subcategoryId:
        typeof parsedValue.subcategoryId === 'string' ? parsedValue.subcategoryId : '',
      date: typeof parsedValue.date === 'string' ? parsedValue.date : '',
      description:
        typeof parsedValue.description === 'string' ? parsedValue.description : '',
      installmentCount:
        typeof parsedValue.installmentCount === 'string'
          ? parsedValue.installmentCount
          : '1',
    };
  } catch {
    return null;
  }
}

export function writeTransactionFormDraft(
  userId: string,
  draft: TransactionFormDraft,
) {
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(draft));
}

export function clearTransactionFormDraft(userId: string) {
  window.localStorage.removeItem(getStorageKey(userId));
}
