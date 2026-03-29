import type { FinanceWorkspace } from '../finance.types';

export function createPreviewWorkspace(): FinanceWorkspace {
  return {
    categories: [
      { id: 'category-salary', name: 'Salary' },
      { id: 'category-housing', name: 'Housing' },
      { id: 'category-food', name: 'Food and dining' },
      { id: 'category-transport', name: 'Transport' },
    ],
    subcategories: [
      { id: 'subcategory-rent', categoryId: 'category-housing', name: 'Rent' },
      { id: 'subcategory-groceries', categoryId: 'category-food', name: 'Groceries' },
      { id: 'subcategory-restaurants', categoryId: 'category-food', name: 'Restaurants' },
      { id: 'subcategory-transit', categoryId: 'category-transport', name: 'Transit' },
    ],
    transactions: [
      {
        id: 'transaction-salary',
        amount: 6500,
        type: 'income',
        categoryId: 'category-salary',
        subcategoryId: null,
        date: '2026-03-01',
        description: 'Monthly salary',
      },
      {
        id: 'transaction-rent',
        amount: 2100,
        type: 'expense',
        categoryId: 'category-housing',
        subcategoryId: 'subcategory-rent',
        date: '2026-03-03',
        description: 'Apartment rent',
      },
      {
        id: 'transaction-grocery',
        amount: 180.75,
        type: 'expense',
        categoryId: 'category-food',
        subcategoryId: 'subcategory-groceries',
        date: '2026-03-05',
        description: 'Weekly grocery run',
      },
    ],
  };
}
