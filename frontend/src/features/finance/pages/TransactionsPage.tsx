import { useEffect, useMemo, useState } from 'react';

import { translateAppText } from '../../../shared/i18n/appText';
import { formatLocalIsoDate } from '../../../shared/lib/date/isoDates';
import { getMonthKey } from '../../../shared/lib/date/months';
import { useDisplayPreferences } from '../../settings/useDisplayPreferences';
import { buildDashboardSnapshot } from '../../dashboard/lib/buildDashboardSnapshot';
import { BudgetReallocationPrompt } from '../components/BudgetReallocationPrompt';
import { SetAsideForm } from '../components/SetAsideForm';
import { SetAsidesList } from '../components/SetAsidesList';
import { useFinanceData } from '../useFinanceData';
import { TransactionForm } from '../components/TransactionForm';
import { TransactionsList } from '../components/TransactionsList';
import {
  findPreferredDonorBudgetTarget,
  findPreferredSourceBudgetTarget,
} from '../lib/budgetReallocation';
import { splitAmountIntoInstallments } from '../lib/installments';
import { sortTransactionsByDateDesc } from '../lib/financeSelectors';
import { buildTransactionsCsv } from '../lib/transactionsCsv';
import type { TransactionInput, TransactionRecord } from '../finance.types';

type PendingBudgetReallocation = {
  amount: number;
  month: string;
  sourceCategoryId: string;
  sourceCategoryName: string;
  sourceSubcategoryId: string | null;
};

export function TransactionsPage() {
  const financeData = useFinanceData();
  const {
    preferences: { monthStartDay },
  } = useDisplayPreferences();
  const [transactionToEdit, setTransactionToEdit] = useState<TransactionRecord | null>(null);
  const [pendingBudgetReallocation, setPendingBudgetReallocation] =
    useState<PendingBudgetReallocation | null>(null);
  const [selectedDonorCategoryId, setSelectedDonorCategoryId] = useState('');
  const [isReallocatingBudget, setIsReallocatingBudget] = useState(false);
  const [reallocationErrorMessage, setReallocationErrorMessage] = useState<string | null>(null);
  const sortedTransactions = sortTransactionsByDateDesc(financeData.transactions);

  const donorCategoryOptions = useMemo(() => {
    if (!pendingBudgetReallocation) {
      return [];
    }

    const snapshot = buildDashboardSnapshot(
      {
        categories: financeData.categories,
        budgets: financeData.budgets,
        budgetOverrides: financeData.budgetOverrides,
        transactions: financeData.transactions,
        setAsides: financeData.setAsides,
      },
      pendingBudgetReallocation.month,
      monthStartDay,
    );

    return financeData.categories
      .filter((category) => category.id !== pendingBudgetReallocation.sourceCategoryId)
      .filter((category) => {
        const donorCategoryAvailability = snapshot.categoryAvailability.find(
          (availability) => availability.id === category.id,
        );

        return (donorCategoryAvailability?.available ?? 0) > pendingBudgetReallocation.amount;
      })
      .filter((category) =>
        Boolean(
          findPreferredDonorBudgetTarget(
            financeData.budgets,
            financeData.budgetOverrides,
            pendingBudgetReallocation.month,
            category.id,
            pendingBudgetReallocation.amount,
          ),
        ),
      )
      .map((category) => ({
        categoryId: category.id,
        categoryName: category.name,
      }));
  }, [
    financeData.budgetOverrides,
    financeData.budgets,
    financeData.categories,
    financeData.setAsides,
    financeData.transactions,
    monthStartDay,
    pendingBudgetReallocation,
  ]);

  useEffect(() => {
    setSelectedDonorCategoryId(donorCategoryOptions[0]?.categoryId ?? '');
  }, [donorCategoryOptions]);

  function buildBudgetReallocation(input: TransactionInput) {
    if (input.type !== 'expense') {
      return null;
    }

    const month = getMonthKey(input.date, monthStartDay);
    const snapshot = buildDashboardSnapshot(
      {
        categories: financeData.categories,
        budgets: financeData.budgets,
        budgetOverrides: financeData.budgetOverrides,
        transactions: financeData.transactions,
        setAsides: financeData.setAsides,
      },
      month,
      monthStartDay,
    );
    const sourceCard = snapshot.cards.find((card) => card.id === input.categoryId);
    const sourceBudgetTarget = findPreferredSourceBudgetTarget(
      financeData.budgets,
      financeData.budgetOverrides,
      month,
      input.categoryId,
      input.subcategoryId,
    );

    if (!sourceCard || !sourceBudgetTarget) {
      return null;
    }

    const [firstInstallmentAmount] = splitAmountIntoInstallments(input.amount, input.installmentCount);
    const projectedSpent = sourceCard.spent + sourceCard.reserved + (firstInstallmentAmount ?? input.amount);
    const overage = projectedSpent - sourceCard.effectiveBudget;

    if (overage <= 0) {
      return null;
    }

    return {
      amount: overage,
      month,
      sourceCategoryId: input.categoryId,
      sourceCategoryName: sourceCard.name,
      sourceSubcategoryId: input.subcategoryId,
    };
  }

  async function handleSubmit(input: TransactionInput) {
    if (transactionToEdit) {
      await financeData.updateTransaction(transactionToEdit.id, input);
      setTransactionToEdit(null);
      setPendingBudgetReallocation(null);
      return;
    }

    const nextBudgetReallocation = buildBudgetReallocation(input);
    await financeData.createTransaction(input);
    setPendingBudgetReallocation(nextBudgetReallocation);
    setReallocationErrorMessage(null);
  }

  async function upsertBudgetOverride(
    budgetOverrideId: string | null,
    categoryId: string,
    subcategoryId: string | null,
    month: string,
    amount: number,
  ) {
    const overrideInput = {
      categoryId,
      subcategoryId,
      month,
      amount,
    };

    if (budgetOverrideId) {
      await financeData.updateBudgetOverride(budgetOverrideId, overrideInput);
      return;
    }

    await financeData.createBudgetOverride(overrideInput);
  }

  async function handleBudgetReallocation() {
    if (!pendingBudgetReallocation || !selectedDonorCategoryId) {
      return;
    }

    const sourceTarget = findPreferredSourceBudgetTarget(
      financeData.budgets,
      financeData.budgetOverrides,
      pendingBudgetReallocation.month,
      pendingBudgetReallocation.sourceCategoryId,
      pendingBudgetReallocation.sourceSubcategoryId,
    );
    const donorTarget = findPreferredDonorBudgetTarget(
      financeData.budgets,
      financeData.budgetOverrides,
      pendingBudgetReallocation.month,
      selectedDonorCategoryId,
      pendingBudgetReallocation.amount,
    );

    if (!sourceTarget || !donorTarget) {
      setReallocationErrorMessage(translateAppText('transactions.reallocationNoOptions'));
      return;
    }

    setIsReallocatingBudget(true);
    setReallocationErrorMessage(null);

    try {
      await upsertBudgetOverride(
        donorTarget.overrideId,
        donorTarget.categoryId,
        donorTarget.subcategoryId,
        pendingBudgetReallocation.month,
        donorTarget.effectiveAmount - pendingBudgetReallocation.amount,
      );
      await upsertBudgetOverride(
        sourceTarget.overrideId,
        sourceTarget.categoryId,
        sourceTarget.subcategoryId,
        pendingBudgetReallocation.month,
        sourceTarget.effectiveAmount + pendingBudgetReallocation.amount,
      );
      setPendingBudgetReallocation(null);
    } catch (error) {
      setReallocationErrorMessage(
        error instanceof Error ? error.message : translateAppText('transactions.reallocationError'),
      );
    } finally {
      setIsReallocatingBudget(false);
    }
  }

  function handleExportCsv() {
    const csvContent = buildTransactionsCsv(
      sortedTransactions,
      financeData.categories,
      financeData.subcategories,
    );
    const blob = new Blob(['\uFEFF', csvContent], {
      type: 'text/csv;charset=utf-8;',
    });
    const downloadUrl = URL.createObjectURL(blob);
    const anchor = document.createElement('a');

    anchor.href = downloadUrl;
    anchor.download = `fintra-transactions-${formatLocalIsoDate()}.csv`;
    anchor.click();
    URL.revokeObjectURL(downloadUrl);
  }

  return (
    <div className="finance-page finance-page--transactions">
      {pendingBudgetReallocation ? (
        <BudgetReallocationPrompt
          amount={pendingBudgetReallocation.amount}
          errorMessage={reallocationErrorMessage}
          isSubmitting={isReallocatingBudget}
          month={pendingBudgetReallocation.month}
          onDismiss={() => {
            setPendingBudgetReallocation(null);
            setReallocationErrorMessage(null);
          }}
          onSubmit={() => void handleBudgetReallocation()}
          onUpdateSelectedCategory={setSelectedDonorCategoryId}
          options={donorCategoryOptions}
          selectedCategoryId={selectedDonorCategoryId}
          sourceCategoryName={pendingBudgetReallocation.sourceCategoryName}
        />
      ) : null}

      {financeData.errorMessage ? (
        <section aria-live="assertive" className="finance-panel">
          <p className="finance-message finance-message--error" role="alert">
            {financeData.errorMessage}
          </p>
        </section>
      ) : null}

      {financeData.status === 'loading' ? (
        <section aria-live="polite" className="finance-panel">
          <p className="finance-empty-state">{translateAppText('transactions.loading')}</p>
        </section>
      ) : (
        <div className="finance-grid finance-grid--ledger">
          <div className="finance-grid--stacked">
            <TransactionsList
              categories={financeData.categories}
              onDelete={financeData.deleteTransaction}
              onEdit={setTransactionToEdit}
              onExportCsv={handleExportCsv}
              subcategories={financeData.subcategories}
              transactions={sortedTransactions}
            />
            <SetAsidesList
              categories={financeData.categories}
              onDiscard={financeData.discardSetAside}
              setAsides={financeData.setAsides}
              subcategories={financeData.subcategories}
            />
          </div>
          <div className="finance-grid--stacked">
            <TransactionForm
              categories={financeData.categories}
              onCancelEdit={() => setTransactionToEdit(null)}
              onSubmit={handleSubmit}
              subcategories={financeData.subcategories}
              transactionToEdit={transactionToEdit}
            />
            <SetAsideForm
              categories={financeData.categories}
              onSubmit={financeData.createSetAside}
              subcategories={financeData.subcategories}
            />
          </div>
        </div>
      )}
    </div>
  );
}
