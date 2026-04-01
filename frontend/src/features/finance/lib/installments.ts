import { addMonthsToIsoDate } from '../../../shared/lib/date/months';

function roundCurrency(value: number) {
  return Math.round(value * 100) / 100;
}

export function splitAmountIntoInstallments(amount: number, installmentCount: number) {
  if (installmentCount <= 1) {
    return [roundCurrency(amount)];
  }

  const roundedAmount = roundCurrency(amount);
  const baseInstallmentAmount = roundCurrency(roundedAmount / installmentCount);
  const amounts = Array.from({ length: installmentCount }, () => baseInstallmentAmount);
  const allocatedAmount = roundCurrency(
    amounts.reduce((total, currentAmount) => total + currentAmount, 0),
  );
  const remainder = roundCurrency(roundedAmount - allocatedAmount);

  amounts[amounts.length - 1] = roundCurrency(amounts[amounts.length - 1] + remainder);

  return amounts;
}

export function buildInstallmentDates(date: string, installmentCount: number) {
  return Array.from({ length: installmentCount }, (_unused, index) => addMonthsToIsoDate(date, index));
}

export function getInstallmentLabel(installmentIndex: number | null, installmentCount: number | null) {
  if (!installmentIndex || !installmentCount || installmentCount <= 1) {
    return null;
  }

  return `${installmentIndex}/${installmentCount}`;
}
