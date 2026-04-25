import type {
  CategoryRecord,
  SubcategoryRecord,
  TransactionRecord,
} from '../finance.types';
import { buildTransactionsCsv } from './transactionsCsv';

const categories: CategoryRecord[] = [{ id: 'category-food', name: 'Food', icon: null }];
const subcategories: SubcategoryRecord[] = [
  { id: 'subcategory-dining', categoryId: 'category-food', name: 'Dining out', icon: null },
];
const transactions: TransactionRecord[] = [
  {
    id: 'transaction-1',
    amount: 45.5,
    type: 'expense',
    categoryId: 'category-food',
    subcategoryId: 'subcategory-dining',
    date: '2026-04-03',
    description: 'Client lunch',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
];

describe('buildTransactionsCsv', () => {
  it('creates a csv with one transaction per dated row', () => {
    expect(buildTransactionsCsv(transactions, categories, subcategories)).toBe(
      [
        'Date,Type,Category,Subcategories,Description,Amount',
        '2026-04-03,Expense,Food,Dining out,Client lunch,45.50',
      ].join('\n'),
    );
  });
});
