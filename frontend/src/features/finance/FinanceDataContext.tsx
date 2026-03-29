import {
  startTransition,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { getErrorMessage } from '../../shared/lib/errors/getErrorMessage';
import { useAuth } from '../auth/useAuth';
import { FinanceDataContext, type FinanceDataContextValue, type FinanceDataStatus } from './financeContextValue';
import type { FinanceWorkspace } from './finance.types';
import { createFinanceService } from './services/createFinanceService';
import type { FinanceService } from './services/financeService';

const emptyWorkspace: FinanceWorkspace = {
  categories: [],
  subcategories: [],
  transactions: [],
};

function normalizeServiceError(error: unknown) {
  return getErrorMessage(error, 'Something went wrong while handling finance data.');
}

type FinanceDataProviderProps = PropsWithChildren<{
  service?: FinanceService;
}>;

export function FinanceDataProvider({ children, service }: FinanceDataProviderProps) {
  const auth = useAuth();
  const [workspace, setWorkspace] = useState<FinanceWorkspace>(emptyWorkspace);
  const [status, setStatus] = useState<FinanceDataStatus>('loading');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const financeService = useMemo(() => {
    if (service) {
      return service;
    }

    if (!auth.user) {
      return null;
    }

    return createFinanceService(auth.user.id, auth.mode);
  }, [auth.mode, auth.user, service]);

  async function loadWorkspace(activeService: FinanceService) {
    const nextWorkspace = await activeService.getWorkspace();

    startTransition(() => {
      setWorkspace(nextWorkspace);
      setStatus('ready');
    });
  }

  useEffect(() => {
    if (!financeService) {
      return;
    }

    let isMounted = true;

    setStatus('loading');

    financeService
      .getWorkspace()
      .then((nextWorkspace) => {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setWorkspace(nextWorkspace);
          setStatus('ready');
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setErrorMessage(normalizeServiceError(error));
          setWorkspace(emptyWorkspace);
          setStatus('ready');
        });
      });

    return () => {
      isMounted = false;
    };
  }, [financeService]);

  const value = useMemo<FinanceDataContextValue>(() => {
    async function runMutation(work: () => Promise<void>) {
      try {
        setErrorMessage(null);
        await work();
      } catch (error) {
        const normalizedError = normalizeServiceError(error);
        setErrorMessage(normalizedError);
        throw new Error(normalizedError);
      }
    }

    if (!financeService) {
      return {
        ...emptyWorkspace,
        status,
        errorMessage,
        async refresh() {},
        clearError() {
          setErrorMessage(null);
        },
        async createCategory() {},
        async updateCategory() {},
        async deleteCategory() {},
        async createSubcategory() {},
        async updateSubcategory() {},
        async deleteSubcategory() {},
        async createTransaction() {},
        async updateTransaction() {},
        async deleteTransaction() {},
      };
    }

    return {
      ...workspace,
      status,
      errorMessage,
      async refresh() {
        await runMutation(async () => {
          await loadWorkspace(financeService);
        });
      },
      clearError() {
        setErrorMessage(null);
      },
      async createCategory(input) {
        await runMutation(async () => {
          await financeService.createCategory(input);
          await loadWorkspace(financeService);
        });
      },
      async updateCategory(categoryId, input) {
        await runMutation(async () => {
          await financeService.updateCategory(categoryId, input);
          await loadWorkspace(financeService);
        });
      },
      async deleteCategory(categoryId) {
        await runMutation(async () => {
          await financeService.deleteCategory(categoryId);
          await loadWorkspace(financeService);
        });
      },
      async createSubcategory(input) {
        await runMutation(async () => {
          await financeService.createSubcategory(input);
          await loadWorkspace(financeService);
        });
      },
      async updateSubcategory(subcategoryId, input) {
        await runMutation(async () => {
          await financeService.updateSubcategory(subcategoryId, input);
          await loadWorkspace(financeService);
        });
      },
      async deleteSubcategory(subcategoryId) {
        await runMutation(async () => {
          await financeService.deleteSubcategory(subcategoryId);
          await loadWorkspace(financeService);
        });
      },
      async createTransaction(input) {
        await runMutation(async () => {
          await financeService.createTransaction(input);
          await loadWorkspace(financeService);
        });
      },
      async updateTransaction(transactionId, input) {
        await runMutation(async () => {
          await financeService.updateTransaction(transactionId, input);
          await loadWorkspace(financeService);
        });
      },
      async deleteTransaction(transactionId) {
        await runMutation(async () => {
          await financeService.deleteTransaction(transactionId);
          await loadWorkspace(financeService);
        });
      },
    };
  }, [errorMessage, financeService, status, workspace]);

  return <FinanceDataContext.Provider value={value}>{children}</FinanceDataContext.Provider>;
}
