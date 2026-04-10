import { getSupabaseBrowserClient } from '../../../shared/supabase/client';
import { buildInstallmentDates, splitAmountIntoInstallments } from '../lib/installments';
import type {
  BudgetInput,
  BudgetOverrideInput,
  BudgetOverrideRecord,
  BudgetRecord,
  CategoryInput,
  CategoryRecord,
  FinanceWorkspace,
  SetAsideInput,
  SetAsideRecord,
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
  created_at: string;
  description: string | null;
  installment_group_id: string | null;
  installment_index: number | null;
  installment_count: number | null;
}): TransactionRecord {
  return {
    id: record.id,
    amount: Number(record.amount),
    type: record.type,
    categoryId: record.category_id,
    subcategoryId: record.subcategory_id,
    date: record.date,
    recordedAt: record.created_at,
    description: record.description ?? '',
    installmentGroupId: record.installment_group_id,
    installmentIndex: record.installment_index,
    installmentCount: record.installment_count,
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

function mapBudgetOverride(record: {
  id: string;
  category_id: string;
  subcategory_id: string | null;
  month: string;
  amount: number;
}): BudgetOverrideRecord {
  return {
    id: record.id,
    categoryId: record.category_id,
    subcategoryId: record.subcategory_id,
    month: record.month,
    amount: Number(record.amount),
  };
}

function mapSetAside(record: {
  id: string;
  amount: number;
  category_id: string;
  subcategory_id: string | null;
  date: string;
  description: string | null;
}): SetAsideRecord {
  return {
    id: record.id,
    amount: Number(record.amount),
    categoryId: record.category_id,
    subcategoryId: record.subcategory_id,
    date: record.date,
    description: record.description ?? '',
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
        { data: setAsides, error: setAsidesError },
        { data: budgets, error: budgetsError },
        { data: budgetOverrides, error: budgetOverridesError },
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
            .select(
              'id, amount, type, category_id, subcategory_id, date, created_at, description, installment_group_id, installment_index, installment_count',
            )
            .eq('user_id', userId)
            .order('date', { ascending: false })
            .order('created_at', { ascending: false }),
          client
            .from('set_asides')
            .select('id, amount, category_id, subcategory_id, date, description')
            .eq('user_id', userId)
            .order('date', { ascending: false }),
          client
            .from('budgets')
            .select('id, category_id, subcategory_id, amount')
            .eq('user_id', userId)
            .order('amount', { ascending: false }),
          client
            .from('budget_overrides')
            .select('id, category_id, subcategory_id, month, amount')
            .eq('user_id', userId)
            .order('month', { ascending: false }),
        ]),
      );

      if (
        categoriesError ||
        subcategoriesError ||
        transactionsError ||
        setAsidesError ||
        budgetsError ||
        budgetOverridesError
      ) {
        throw (
          categoriesError ??
          subcategoriesError ??
          transactionsError ??
          setAsidesError ??
          budgetsError ??
          budgetOverridesError
        );
      }

      return {
        categories: (categories ?? []).map(mapCategory),
        subcategories: (subcategories ?? []).map(mapSubcategory),
        transactions: (transactions ?? []).map(mapTransaction),
        setAsides: (setAsides ?? []).map(mapSetAside),
        budgets: (budgets ?? []).map(mapBudget),
        budgetOverrides: (budgetOverrides ?? []).map(mapBudgetOverride),
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
      const normalizedDescription = input.description.trim();
      const installmentAmounts = splitAmountIntoInstallments(input.amount, input.installmentCount);
      const installmentDates = buildInstallmentDates(input.date, input.installmentCount);
      const installmentGroupId =
        input.installmentCount > 1 ? crypto.randomUUID() : null;
      const { data, error } = await client
        .from('transactions')
        .insert(
          installmentAmounts.map((amount, index) => ({
            user_id: userId,
            amount,
            type: input.type,
            category_id: input.categoryId,
            subcategory_id: input.subcategoryId,
            date: installmentDates[index],
            description: normalizedDescription,
            installment_group_id: installmentGroupId,
            installment_index: input.installmentCount > 1 ? index + 1 : null,
            installment_count: input.installmentCount > 1 ? input.installmentCount : null,
          })),
        )
        .select(
          'id, amount, type, category_id, subcategory_id, date, created_at, description, installment_group_id, installment_index, installment_count',
        );

      if (error) {
        throw error;
      }

      return (data ?? []).map(mapTransaction);
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
        .select(
          'id, amount, type, category_id, subcategory_id, date, created_at, description, installment_group_id, installment_index, installment_count',
        )
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
    async createSetAside(input: SetAsideInput) {
      const { data, error } = await client
        .from('set_asides')
        .insert({
          user_id: userId,
          amount: input.amount,
          category_id: input.categoryId,
          subcategory_id: input.subcategoryId,
          date: input.date,
          description: input.description.trim(),
        })
        .select('id, amount, category_id, subcategory_id, date, description')
        .single();

      if (error) {
        throw error;
      }

      return mapSetAside(data);
    },
    async discardSetAside(setAsideId: string) {
      const { error } = await client
        .from('set_asides')
        .delete()
        .eq('id', setAsideId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    },
    async convertSetAsideToTransaction(setAsideId: string) {
      const { data: setAside, error: setAsideError } = await client
        .from('set_asides')
        .select('id, amount, category_id, subcategory_id, date, description')
        .eq('id', setAsideId)
        .eq('user_id', userId)
        .single();

      if (setAsideError) {
        throw setAsideError;
      }

      const { data: transaction, error: transactionError } = await client
        .from('transactions')
        .insert({
          user_id: userId,
          amount: setAside.amount,
          type: 'expense',
          category_id: setAside.category_id,
          subcategory_id: setAside.subcategory_id,
          date: setAside.date,
          description: setAside.description ?? '',
          installment_group_id: null,
          installment_index: null,
          installment_count: null,
        })
        .select(
          'id, amount, type, category_id, subcategory_id, date, created_at, description, installment_group_id, installment_index, installment_count',
        )
        .single();

      if (transactionError) {
        throw transactionError;
      }

      const { error: deleteError } = await client
        .from('set_asides')
        .delete()
        .eq('id', setAsideId)
        .eq('user_id', userId);

      if (deleteError) {
        throw deleteError;
      }

      return mapTransaction(transaction);
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
      const { data: existingBudget, error: existingBudgetError } = await client
        .from('budgets')
        .select('category_id, subcategory_id')
        .eq('id', budgetId)
        .eq('user_id', userId)
        .single();

      if (existingBudgetError) {
        throw existingBudgetError;
      }

      const scopeChanged =
        existingBudget.category_id !== input.categoryId ||
        existingBudget.subcategory_id !== input.subcategoryId;

      if (scopeChanged) {
        let overrideCount = 0;

        if (existingBudget.subcategory_id === null) {
          const { count, error: overridesCountError } = await client
            .from('budget_overrides')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('category_id', existingBudget.category_id)
            .is('subcategory_id', null);

          if (overridesCountError) {
            throw overridesCountError;
          }

          overrideCount = count ?? 0;
        } else {
          const { count, error: overridesCountError } = await client
            .from('budget_overrides')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('category_id', existingBudget.category_id)
            .eq('subcategory_id', existingBudget.subcategory_id);

          if (overridesCountError) {
            throw overridesCountError;
          }

          overrideCount = count ?? 0;
        }

        if (overrideCount > 0) {
          throw new Error('Reset related monthly overrides before changing this budget scope.');
        }
      }

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
      const { data: existingBudget, error: existingBudgetError } = await client
        .from('budgets')
        .select('category_id, subcategory_id')
        .eq('id', budgetId)
        .eq('user_id', userId)
        .single();

      if (existingBudgetError) {
        throw existingBudgetError;
      }

      let overrideCount = 0;

      if (existingBudget.subcategory_id === null) {
        const { count, error: overridesCountError } = await client
          .from('budget_overrides')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('category_id', existingBudget.category_id)
          .is('subcategory_id', null);

        if (overridesCountError) {
          throw overridesCountError;
        }

        overrideCount = count ?? 0;
      } else {
        const { count, error: overridesCountError } = await client
          .from('budget_overrides')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('category_id', existingBudget.category_id)
          .eq('subcategory_id', existingBudget.subcategory_id);

        if (overridesCountError) {
          throw overridesCountError;
        }

        overrideCount = count ?? 0;
      }

      if (overrideCount > 0) {
        throw new Error('Delete related budget overrides before removing this budget.');
      }

      const { error } = await client.from('budgets').delete().eq('id', budgetId).eq('user_id', userId);

      if (error) {
        throw error;
      }
    },
    async createBudgetOverride(input: BudgetOverrideInput) {
      if (input.subcategoryId === null) {
        const { count, error } = await client
          .from('budgets')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('category_id', input.categoryId)
          .is('subcategory_id', null);

        if (error) {
          throw error;
        }

        if ((count ?? 0) === 0) {
          throw new Error('Create the default budget before adding a monthly override.');
        }
      } else {
        const { count, error } = await client
          .from('budgets')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('category_id', input.categoryId)
          .eq('subcategory_id', input.subcategoryId);

        if (error) {
          throw error;
        }

        if ((count ?? 0) === 0) {
          throw new Error('Create the default budget before adding a monthly override.');
        }
      }

      const { data, error } = await client
        .from('budget_overrides')
        .insert({
          user_id: userId,
          category_id: input.categoryId,
          subcategory_id: input.subcategoryId,
          month: input.month,
          amount: input.amount,
        })
        .select('id, category_id, subcategory_id, month, amount')
        .single();

      if (error) {
        throw error;
      }

      return mapBudgetOverride(data);
    },
    async updateBudgetOverride(
      budgetOverrideId: string,
      input: BudgetOverrideInput,
    ) {
      if (input.subcategoryId === null) {
        const { count, error } = await client
          .from('budgets')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('category_id', input.categoryId)
          .is('subcategory_id', null);

        if (error) {
          throw error;
        }

        if ((count ?? 0) === 0) {
          throw new Error('Create the default budget before adding a monthly override.');
        }
      } else {
        const { count, error } = await client
          .from('budgets')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('category_id', input.categoryId)
          .eq('subcategory_id', input.subcategoryId);

        if (error) {
          throw error;
        }

        if ((count ?? 0) === 0) {
          throw new Error('Create the default budget before adding a monthly override.');
        }
      }

      const { data, error } = await client
        .from('budget_overrides')
        .update({
          category_id: input.categoryId,
          subcategory_id: input.subcategoryId,
          month: input.month,
          amount: input.amount,
        })
        .eq('id', budgetOverrideId)
        .eq('user_id', userId)
        .select('id, category_id, subcategory_id, month, amount')
        .single();

      if (error) {
        throw error;
      }

      return mapBudgetOverride(data);
    },
    async deleteBudgetOverride(budgetOverrideId: string) {
      const { error } = await client
        .from('budget_overrides')
        .delete()
        .eq('id', budgetOverrideId)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
    },
  };
}
