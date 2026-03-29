import { createLocalId } from '../lib/createLocalId';
import { createPreviewWorkspace } from '../lib/previewWorkspace';
import type {
  CategoryInput,
  CategoryRecord,
  FinanceWorkspace,
  SubcategoryInput,
  SubcategoryRecord,
  TransactionInput,
  TransactionRecord,
} from '../finance.types';
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

function readWorkspace(userId: string): PreviewFinanceStore {
  const rawValue = window.localStorage.getItem(getStorageKey(userId));

  if (!rawValue) {
    const seededWorkspace = createPreviewWorkspace();
    writeWorkspace(userId, seededWorkspace);
    return seededWorkspace;
  }

  try {
    return JSON.parse(rawValue) as PreviewFinanceStore;
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
  };
}
