import { createLocalId } from '../lib/createLocalId';
import { createPreviewWorkspace } from '../lib/previewWorkspace';
import type {
  BudgetInput,
  BudgetOverrideInput,
  BudgetOverrideRecord,
  BudgetRecord,
  CategoryInput,
  CategoryRecord,
  FinanceWorkspace,
  SubcategoryInput,
  SubcategoryRecord,
  TransactionInput,
  TransactionRecord,
} from '../finance.types';
import {
  findBudgetForOverrideScope,
  isValidBudgetMonth,
} from '../../budgets/lib/effectiveBudgetResolver';
import type { FinanceService } from './financeService';

type PreviewFinanceStore = FinanceWorkspace;

function getStorageKey(userId: string) {
  return `fintra.preview.workspace.${userId}`;
}

function normalizeName(value: string) {
  return value.trim().toLowerCase();
}

function ensureValidCategoryName(name: string) {
  if (!name.trim()) {
    throw new Error('Category name is required.');
  }
}

function ensureValidSubcategoryName(name: string) {
  if (!name.trim()) {
    throw new Error('Subcategory name is required.');
  }
}

function ensureValidTransaction(input: TransactionInput) {
  if (Number.isNaN(input.amount) || input.amount <= 0) {
    throw new Error('Amount must be greater than zero.');
  }

  if (!input.date) {
    throw new Error('Transaction date is required.');
  }

  if (!input.categoryId) {
    throw new Error('A category is required.');
  }
}

function ensureValidBudget(input: BudgetInput) {
  if (!input.categoryId) {
    throw new Error('A category is required.');
  }

  if (Number.isNaN(input.amount) || input.amount <= 0) {
    throw new Error('Budget amount must be greater than zero.');
  }
}

function ensureValidBudgetOverride(input: BudgetOverrideInput) {
  if (!input.categoryId) {
    throw new Error('A category is required.');
  }

  if (!isValidBudgetMonth(input.month)) {
    throw new Error('Override month must use the YYYY-MM format.');
  }

  if (Number.isNaN(input.amount) || input.amount <= 0) {
    throw new Error('Override amount must be greater than zero.');
  }
}

function readWorkspace(userId: string): PreviewFinanceStore {
  const rawValue = window.localStorage.getItem(getStorageKey(userId));

  if (!rawValue) {
    const seededWorkspace = createPreviewWorkspace();
    writeWorkspace(userId, seededWorkspace);
    return seededWorkspace;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<PreviewFinanceStore>;

    return {
      categories: parsedValue.categories ?? [],
      subcategories: parsedValue.subcategories ?? [],
      transactions: parsedValue.transactions ?? [],
      budgets: parsedValue.budgets ?? [],
      budgetOverrides: parsedValue.budgetOverrides ?? [],
    };
  } catch {
    const seededWorkspace = createPreviewWorkspace();
    writeWorkspace(userId, seededWorkspace);
    return seededWorkspace;
  }
}

function writeWorkspace(userId: string, workspace: PreviewFinanceStore) {
  window.localStorage.setItem(getStorageKey(userId), JSON.stringify(workspace));
}

function getCategoryOrThrow(workspace: PreviewFinanceStore, categoryId: string) {
  const category = workspace.categories.find((item) => item.id === categoryId);

  if (!category) {
    throw new Error('The selected category does not exist.');
  }

  return category;
}

function getSubcategoryOrThrow(workspace: PreviewFinanceStore, subcategoryId: string) {
  const subcategory = workspace.subcategories.find((item) => item.id === subcategoryId);

  if (!subcategory) {
    throw new Error('The selected subcategory does not exist.');
  }

  return subcategory;
}

function validateBudgetScope(workspace: PreviewFinanceStore, input: BudgetInput) {
  getCategoryOrThrow(workspace, input.categoryId);

  if (!input.subcategoryId) {
    return;
  }

  const subcategory = getSubcategoryOrThrow(workspace, input.subcategoryId);

  if (subcategory.categoryId !== input.categoryId) {
    throw new Error('The selected subcategory does not belong to the selected category.');
  }
}

function hasMatchingBudgetScope(
  budgets: BudgetRecord[],
  input: BudgetInput,
  excludedBudgetId?: string,
) {
  return budgets.some(
    (item) =>
      item.id !== excludedBudgetId &&
      item.categoryId === input.categoryId &&
      item.subcategoryId === input.subcategoryId,
  );
}

function hasMatchingBudgetOverrideScope(
  budgetOverrides: BudgetOverrideRecord[],
  input: BudgetOverrideInput,
  excludedBudgetOverrideId?: string,
) {
  return budgetOverrides.some(
    (item) =>
      item.id !== excludedBudgetOverrideId &&
      item.categoryId === input.categoryId &&
      item.subcategoryId === input.subcategoryId &&
      item.month === input.month,
  );
}

export function createLocalPreviewFinanceService(userId: string): FinanceService {
  return {
    async getWorkspace() {
      return readWorkspace(userId);
    },
    async createCategory(input: CategoryInput): Promise<CategoryRecord> {
      ensureValidCategoryName(input.name);

      const workspace = readWorkspace(userId);
      const normalizedName = normalizeName(input.name);

      if (workspace.categories.some((item) => normalizeName(item.name) === normalizedName)) {
        throw new Error('Category names must be unique.');
      }

      const category = {
        id: createLocalId('category'),
        name: input.name.trim(),
      };

      writeWorkspace(userId, {
        ...workspace,
        categories: [...workspace.categories, category],
      });

      return category;
    },
    async updateCategory(categoryId: string, input: CategoryInput): Promise<CategoryRecord> {
      ensureValidCategoryName(input.name);

      const workspace = readWorkspace(userId);
      const category = getCategoryOrThrow(workspace, categoryId);
      const normalizedName = normalizeName(input.name);

      if (
        workspace.categories.some(
          (item) => item.id !== categoryId && normalizeName(item.name) === normalizedName,
        )
      ) {
        throw new Error('Category names must be unique.');
      }

      const updatedCategory = {
        ...category,
        name: input.name.trim(),
      };

      writeWorkspace(userId, {
        ...workspace,
        categories: workspace.categories.map((item) =>
          item.id === categoryId ? updatedCategory : item,
        ),
      });

      return updatedCategory;
    },
    async deleteCategory(categoryId: string) {
      const workspace = readWorkspace(userId);

      if (workspace.subcategories.some((item) => item.categoryId === categoryId)) {
        throw new Error('Delete subcategories before removing this category.');
      }

      if (workspace.transactions.some((item) => item.categoryId === categoryId)) {
        throw new Error('Delete related transactions before removing this category.');
      }

      if (workspace.budgets.some((item) => item.categoryId === categoryId)) {
        throw new Error('Delete related budgets before removing this category.');
      }

      if (workspace.budgetOverrides.some((item) => item.categoryId === categoryId)) {
        throw new Error('Delete related budget overrides before removing this category.');
      }

      writeWorkspace(userId, {
        ...workspace,
        categories: workspace.categories.filter((item) => item.id !== categoryId),
      });
    },
    async createSubcategory(input: SubcategoryInput): Promise<SubcategoryRecord> {
      ensureValidSubcategoryName(input.name);

      const workspace = readWorkspace(userId);
      getCategoryOrThrow(workspace, input.categoryId);
      const normalizedName = normalizeName(input.name);

      if (
        workspace.subcategories.some(
          (item) =>
            item.categoryId === input.categoryId && normalizeName(item.name) === normalizedName,
        )
      ) {
        throw new Error('Subcategory names must be unique within the same category.');
      }

      const subcategory = {
        id: createLocalId('subcategory'),
        categoryId: input.categoryId,
        name: input.name.trim(),
      };

      writeWorkspace(userId, {
        ...workspace,
        subcategories: [...workspace.subcategories, subcategory],
      });

      return subcategory;
    },
    async updateSubcategory(
      subcategoryId: string,
      input: SubcategoryInput,
    ): Promise<SubcategoryRecord> {
      ensureValidSubcategoryName(input.name);

      const workspace = readWorkspace(userId);
      getCategoryOrThrow(workspace, input.categoryId);
      const subcategory = getSubcategoryOrThrow(workspace, subcategoryId);
      const normalizedName = normalizeName(input.name);

      if (
        workspace.subcategories.some(
          (item) =>
            item.id !== subcategoryId &&
            item.categoryId === input.categoryId &&
            normalizeName(item.name) === normalizedName,
        )
      ) {
        throw new Error('Subcategory names must be unique within the same category.');
      }

      const updatedSubcategory = {
        ...subcategory,
        categoryId: input.categoryId,
        name: input.name.trim(),
      };

      writeWorkspace(userId, {
        ...workspace,
        subcategories: workspace.subcategories.map((item) =>
          item.id === subcategoryId ? updatedSubcategory : item,
        ),
        transactions: workspace.transactions.map((item) =>
          item.subcategoryId === subcategoryId
            ? { ...item, categoryId: input.categoryId }
            : item,
        ),
      });

      return updatedSubcategory;
    },
    async deleteSubcategory(subcategoryId: string) {
      const workspace = readWorkspace(userId);

      if (workspace.transactions.some((item) => item.subcategoryId === subcategoryId)) {
        throw new Error('Delete related transactions before removing this subcategory.');
      }

      if (workspace.budgets.some((item) => item.subcategoryId === subcategoryId)) {
        throw new Error('Delete related budgets before removing this subcategory.');
      }

      if (workspace.budgetOverrides.some((item) => item.subcategoryId === subcategoryId)) {
        throw new Error('Delete related budget overrides before removing this subcategory.');
      }

      writeWorkspace(userId, {
        ...workspace,
        subcategories: workspace.subcategories.filter((item) => item.id !== subcategoryId),
      });
    },
    async createTransaction(input: TransactionInput): Promise<TransactionRecord> {
      ensureValidTransaction(input);

      const workspace = readWorkspace(userId);
      getCategoryOrThrow(workspace, input.categoryId);

      if (input.subcategoryId) {
        const subcategory = getSubcategoryOrThrow(workspace, input.subcategoryId);

        if (subcategory.categoryId !== input.categoryId) {
          throw new Error('The selected subcategory does not belong to the selected category.');
        }
      }

      const transaction = {
        id: createLocalId('transaction'),
        amount: input.amount,
        type: input.type,
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        date: input.date,
        description: input.description.trim(),
      };

      writeWorkspace(userId, {
        ...workspace,
        transactions: [transaction, ...workspace.transactions],
      });

      return transaction;
    },
    async updateTransaction(
      transactionId: string,
      input: TransactionInput,
    ): Promise<TransactionRecord> {
      ensureValidTransaction(input);

      const workspace = readWorkspace(userId);
      const existingTransaction = workspace.transactions.find((item) => item.id === transactionId);

      if (!existingTransaction) {
        throw new Error('The selected transaction does not exist.');
      }

      getCategoryOrThrow(workspace, input.categoryId);

      if (input.subcategoryId) {
        const subcategory = getSubcategoryOrThrow(workspace, input.subcategoryId);

        if (subcategory.categoryId !== input.categoryId) {
          throw new Error('The selected subcategory does not belong to the selected category.');
        }
      }

      const updatedTransaction = {
        ...existingTransaction,
        ...input,
        description: input.description.trim(),
      };

      writeWorkspace(userId, {
        ...workspace,
        transactions: workspace.transactions.map((item) =>
          item.id === transactionId ? updatedTransaction : item,
        ),
      });

      return updatedTransaction;
    },
    async deleteTransaction(transactionId: string) {
      const workspace = readWorkspace(userId);

      writeWorkspace(userId, {
        ...workspace,
        transactions: workspace.transactions.filter((item) => item.id !== transactionId),
      });
    },
    async createBudget(input: BudgetInput): Promise<BudgetRecord> {
      ensureValidBudget(input);

      const workspace = readWorkspace(userId);
      validateBudgetScope(workspace, input);

      if (hasMatchingBudgetScope(workspace.budgets, input)) {
        throw new Error('A default budget already exists for this scope.');
      }

      const budget = {
        id: createLocalId('budget'),
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        amount: input.amount,
      };

      writeWorkspace(userId, {
        ...workspace,
        budgets: [...workspace.budgets, budget],
      });

      return budget;
    },
    async updateBudget(budgetId: string, input: BudgetInput): Promise<BudgetRecord> {
      ensureValidBudget(input);

      const workspace = readWorkspace(userId);
      validateBudgetScope(workspace, input);
      const existingBudget = workspace.budgets.find((item) => item.id === budgetId);

      if (!existingBudget) {
        throw new Error('The selected budget does not exist.');
      }

      if (hasMatchingBudgetScope(workspace.budgets, input, budgetId)) {
        throw new Error('A default budget already exists for this scope.');
      }

      const scopeChanged =
        existingBudget.categoryId !== input.categoryId ||
        existingBudget.subcategoryId !== input.subcategoryId;

      if (
        scopeChanged &&
        workspace.budgetOverrides.some(
          (item) =>
            item.categoryId === existingBudget.categoryId &&
            item.subcategoryId === existingBudget.subcategoryId,
        )
      ) {
        throw new Error('Reset related monthly overrides before changing this budget scope.');
      }

      const updatedBudget = {
        ...existingBudget,
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        amount: input.amount,
      };

      writeWorkspace(userId, {
        ...workspace,
        budgets: workspace.budgets.map((item) => (item.id === budgetId ? updatedBudget : item)),
      });

      return updatedBudget;
    },
    async deleteBudget(budgetId: string) {
      const workspace = readWorkspace(userId);

      const budgetToDelete = workspace.budgets.find((item) => item.id === budgetId);

      if (
        budgetToDelete &&
        workspace.budgetOverrides.some(
          (item) =>
            item.categoryId === budgetToDelete.categoryId &&
            item.subcategoryId === budgetToDelete.subcategoryId,
        )
      ) {
        throw new Error('Delete related budget overrides before removing this budget.');
      }

      writeWorkspace(userId, {
        ...workspace,
        budgets: workspace.budgets.filter((item) => item.id !== budgetId),
      });
    },
    async createBudgetOverride(input: BudgetOverrideInput): Promise<BudgetOverrideRecord> {
      ensureValidBudgetOverride(input);

      const workspace = readWorkspace(userId);
      validateBudgetScope(workspace, input);

      if (!findBudgetForOverrideScope(workspace.budgets, input.categoryId, input.subcategoryId)) {
        throw new Error('Create the default budget before adding a monthly override.');
      }

      if (hasMatchingBudgetOverrideScope(workspace.budgetOverrides, input)) {
        throw new Error('A monthly override already exists for this scope.');
      }

      const budgetOverride = {
        id: createLocalId('budget-override'),
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        month: input.month,
        amount: input.amount,
      };

      writeWorkspace(userId, {
        ...workspace,
        budgetOverrides: [...workspace.budgetOverrides, budgetOverride],
      });

      return budgetOverride;
    },
    async updateBudgetOverride(
      budgetOverrideId: string,
      input: BudgetOverrideInput,
    ): Promise<BudgetOverrideRecord> {
      ensureValidBudgetOverride(input);

      const workspace = readWorkspace(userId);
      validateBudgetScope(workspace, input);

      if (!findBudgetForOverrideScope(workspace.budgets, input.categoryId, input.subcategoryId)) {
        throw new Error('Create the default budget before adding a monthly override.');
      }

      const existingBudgetOverride = workspace.budgetOverrides.find(
        (item) => item.id === budgetOverrideId,
      );

      if (!existingBudgetOverride) {
        throw new Error('The selected budget override does not exist.');
      }

      if (
        hasMatchingBudgetOverrideScope(workspace.budgetOverrides, input, budgetOverrideId)
      ) {
        throw new Error('A monthly override already exists for this scope.');
      }

      const updatedBudgetOverride = {
        ...existingBudgetOverride,
        categoryId: input.categoryId,
        subcategoryId: input.subcategoryId,
        month: input.month,
        amount: input.amount,
      };

      writeWorkspace(userId, {
        ...workspace,
        budgetOverrides: workspace.budgetOverrides.map((item) =>
          item.id === budgetOverrideId ? updatedBudgetOverride : item,
        ),
      });

      return updatedBudgetOverride;
    },
    async deleteBudgetOverride(budgetOverrideId: string) {
      const workspace = readWorkspace(userId);

      writeWorkspace(userId, {
        ...workspace,
        budgetOverrides: workspace.budgetOverrides.filter((item) => item.id !== budgetOverrideId),
      });
    },
  };
}
