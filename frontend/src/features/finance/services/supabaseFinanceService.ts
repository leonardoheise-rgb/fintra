import { getSupabaseBrowserClient } from '../../../shared/supabase/client';
import type {
  BudgetInput,
  BudgetRecord,
  CategoryInput,
  CategoryRecord,
  FinanceWorkspace,
  SubcategoryInput,
  SubcategoryRecord,
  TransactionInput,
  TransactionRecord,
} from '../finance.types';
import type { FinanceService } from './financeService';

function mapCategory(record: { id: string; name: string }): CategoryRecord {
  return {
    id: record.id,
    name: record.name,
  };
}

function mapSubcategory(record: {
  id: string;
  category_id: string;
  name: string;
}): SubcategoryRecord {
  return {
    id: record.id,
    categoryId: record.category_id,
    name: record.name,
  };
}

function mapTransaction(record: {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category_id: string;
  subcategory_id: string | null;
  date: string;
  description: string | null;
}): TransactionRecord {
  return {
    id: record.id,
    amount: Number(record.amount),
    type: record.type,
    categoryId: record.category_id,
    subcategoryId: record.subcategory_id,
    date: record.date,
    description: record.description ?? '',
  };
}

function mapBudget(record: {
  id: string;
  category_id: string;
  subcategory_id: string | null;
  amount: number;
}): BudgetRecord {
  return {
    id: record.id,
    categoryId: record.category_id,
    subcategoryId: record.subcategory_id,
    amount: Number(record.amount),
  };
}

async function withTimeout<T>(operation: Promise<T>, timeoutInMilliseconds = 12000): Promise<T> {
  let timer: number | undefined;

  const timeoutPromise = new Promise<never>((_resolve, reject) => {
    timer = window.setTimeout(() => {
      reject(
        new Error(
          'Supabase is taking too long to answer. Check your migrations, RLS policies, and browser network tab.',
        ),
      );
    }, timeoutInMilliseconds);
  });

  try {
    return await Promise.race([operation, timeoutPromise]);
  } finally {
    if (timer) {
      window.clearTimeout(timer);
    }
  }
}

export function createSupabaseFinanceService(userId: string): FinanceService {
  const client = getSupabaseBrowserClient();

  return {
    async getWorkspace(): Promise<FinanceWorkspace> {
      const {
        data: { session },
        error: sessionError,
      } = await client.auth.getSession();

      if (sessionError) {
        throw sessionError;
      }

      if (!session) {
        throw new Error('No active Supabase session was found. Sign out and sign in again.');
      }

      const [
        { data: categories, error: categoriesError },
        { data: subcategories, error: subcategoriesError },
        { data: transactions, error: transactionsError },
        { data: budgets, error: budgetsError },
      ] = await withTimeout(
        Promise.all([
          client.from('categories').select('id, name').eq('user_id', userId).order('name'),
          client
            .from('subcategories')
            .select('id, category_id, name')
            .eq('user_id', userId)
            .order('name'),
          client
            .from('transactions')
            .select('id, amount, type, category_id, subcategory_id, date, description')
            .eq('user_id', userId)
            .order('date', { ascending: false }),
          client
            .from('budgets')
            .select('id, category_id, subcategory_id, amount')
            .eq('user_id', userId)
            .order('amount', { ascending: false }),
        ]),
      );

      if (categoriesError || subcategoriesError || transactionsError || budgetsError) {
        throw categoriesError ?? subcategoriesError ?? transactionsError ?? budgetsError;
      }

      return {
        categories: (categories ?? []).map(mapCategory),
        subcategories: (subcategories ?? []).map(mapSubcategory),
        transactions: (transactions ?? []).map(mapTransaction),
        budgets: (budgets ?? []).map(mapBudget),
      };
    },
    async createCategory(input: CategoryInput) {
      const { data, error } = await client
        .from('categories')
        .insert({
          user_id: userId,
          name: input.name.trim(),
        })
        .select('id, name')
        .single();

      if (error) {
        throw error;
      }

      return mapCategory(data);
    },
    async updateCategory(categoryId: string, input: CategoryInput) {
      const { data, error } = await client
        .from('categories')
        .update({
          name: input.name.trim(),
        })
        .eq('id', categoryId)
        .eq('user_id', userId)
        .select('id, name')
        .single();

      if (error) {
        throw error;
      }

      return mapCategory(data);
    },
    async deleteCategory(categoryId: string) {
      const { error } = await client.from('categories').delete().eq('id', categoryId).eq('user_id', userId);

      if (error) {
        throw error;
      }
    },
    async createSubcategory(input: SubcategoryInput) {
      const { data, error } = await client
        .from('subcategories')
        .insert({
          user_id: userId,
          category_id: input.categoryId,
          name: input.name.trim(),
        })
        .select('id, category_id, name')
        .single();

      if (error) {
        throw error;
      }

      return mapSubcategory(data);
    },
    async updateSubcategory(subcategoryId: string, input: SubcategoryInput) {
      const { data, error } = await client
        .from('subcategories')
        .update({
          category_id: input.categoryId,
          name: input.name.trim(),
        })
        .eq('id', subcategoryId)
        .eq('user_id', userId)
        .select('id, category_id, name')
        .single();

      if (error) {
        throw error;
      }

      return mapSubcategory(data);
    },
    async deleteSubcategory(subcategoryId: string) {
      const { error } = await client
        .from('subcategories')
        .delete()
        .eq('id', subcategoryId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    },
    async createTransaction(input: TransactionInput) {
      const { data, error } = await client
        .from('transactions')
        .insert({
          user_id: userId,
          amount: input.amount,
          type: input.type,
          category_id: input.categoryId,
          subcategory_id: input.subcategoryId,
          date: input.date,
          description: input.description.trim(),
        })
        .select('id, amount, type, category_id, subcategory_id, date, description')
        .single();

      if (error) {
        throw error;
      }

      return mapTransaction(data);
    },
    async updateTransaction(transactionId: string, input: TransactionInput) {
      const { data, error } = await client
        .from('transactions')
        .update({
          amount: input.amount,
          type: input.type,
          category_id: input.categoryId,
          subcategory_id: input.subcategoryId,
          date: input.date,
          description: input.description.trim(),
        })
        .eq('id', transactionId)
        .eq('user_id', userId)
        .select('id, amount, type, category_id, subcategory_id, date, description')
        .single();

      if (error) {
        throw error;
      }

      return mapTransaction(data);
    },
    async deleteTransaction(transactionId: string) {
      const { error } = await client
        .from('transactions')
        .delete()
        .eq('id', transactionId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    },
    async createBudget(input: BudgetInput) {
      const { data, error } = await client
        .from('budgets')
        .insert({
          user_id: userId,
          category_id: input.categoryId,
          subcategory_id: input.subcategoryId,
          amount: input.amount,
        })
        .select('id, category_id, subcategory_id, amount')
        .single();

      if (error) {
        throw error;
      }

      return mapBudget(data);
    },
    async updateBudget(budgetId: string, input: BudgetInput) {
      const { data, error } = await client
        .from('budgets')
        .update({
          category_id: input.categoryId,
          subcategory_id: input.subcategoryId,
          amount: input.amount,
        })
        .eq('id', budgetId)
        .eq('user_id', userId)
        .select('id, category_id, subcategory_id, amount')
        .single();

      if (error) {
        throw error;
      }

      return mapBudget(data);
    },
    async deleteBudget(budgetId: string) {
      const { error } = await client.from('budgets').delete().eq('id', budgetId).eq('user_id', userId);

      if (error) {
        throw error;
      }
    },
  };
}
