import { filterTransactions } from './transactionFilters';
import type { CategoryRecord, SubcategoryRecord, TransactionRecord } from '../finance.types';

const categories: CategoryRecord[] = [
  { id: 'food', name: 'Food and dining', icon: null },
  { id: 'transport', name: 'Transport', icon: null },
];

const subcategories: SubcategoryRecord[] = [
  { id: 'restaurants', categoryId: 'food', name: 'Restaurants', icon: null },
];

const transactions: TransactionRecord[] = [
  {
    id: 'dinner',
    amount: 20,
    type: 'expense',
    categoryId: 'food',
    subcategoryId: 'restaurants',
    date: '2026-03-12',
    description: 'Client dinner',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
  {
    id: 'transit',
    amount: 10,
    type: 'expense',
    categoryId: 'transport',
    subcategoryId: null,
    date: '2026-04-02',
    description: 'Transit pass',
    installmentGroupId: null,
    installmentIndex: null,
    installmentCount: null,
  },
];

describe('filterTransactions', () => {
  it('searches transaction descriptions and category details', () => {
    expect(
      filterTransactions(transactions, categories, subcategories, {
        searchTerm: 'restaurants',
        startDate: '',
        endDate: '',
      }).map((transaction) => transaction.id),
    ).toEqual(['dinner']);
  });

  it('keeps only transactions within the selected inclusive date range', () => {
    expect(
      filterTransactions(transactions, categories, subcategories, {
        searchTerm: '',
        startDate: '2026-03-15',
        endDate: '2026-04-02',
      }).map((transaction) => transaction.id),
    ).toEqual(['transit']);
  });
});
