import type { TransactionRecord } from '../../finance/finance.types';
import { sortTransactionsByDateDesc } from '../../finance/lib/financeSelectors';

function roundCurrency(amount: number) {
  return Math.round(amount * 100) / 100;
}

function compareInstallments(left: TransactionRecord, right: TransactionRecord) {
  const indexComparison =
    (left.installmentIndex ?? Number.MAX_SAFE_INTEGER) -
    (right.installmentIndex ?? Number.MAX_SAFE_INTEGER);

  return indexComparison || left.date.localeCompare(right.date);
}

function buildInstallmentGroupItem(
  installmentGroupId: string,
  installments: TransactionRecord[],
): TransactionRecord {
  const orderedInstallments = [...installments].sort(compareInstallments);
  const firstInstallment = orderedInstallments[0];
  const installmentCount =
    firstInstallment.installmentCount ??
    Math.max(
      orderedInstallments.length,
      ...orderedInstallments.map((transaction) => transaction.installmentIndex ?? 0),
    );

  return {
    ...firstInstallment,
    id: `installment-group:${installmentGroupId}`,
    amount: roundCurrency(
      orderedInstallments.reduce((total, transaction) => total + transaction.amount, 0),
    ),
    installmentIndex: null,
    installmentCount,
  };
}

export function buildRecentTransactionItems(transactions: TransactionRecord[]) {
  const individualTransactions: TransactionRecord[] = [];
  const installmentGroups = new Map<string, TransactionRecord[]>();

  transactions.forEach((transaction) => {
    if (!transaction.installmentGroupId) {
      individualTransactions.push(transaction);
      return;
    }

    const group = installmentGroups.get(transaction.installmentGroupId) ?? [];
    group.push(transaction);
    installmentGroups.set(transaction.installmentGroupId, group);
  });

  const groupedInstallments = [...installmentGroups.entries()].map(
    ([installmentGroupId, installments]) =>
      buildInstallmentGroupItem(installmentGroupId, installments),
  );

  return sortTransactionsByDateDesc([...individualTransactions, ...groupedInstallments]);
}
