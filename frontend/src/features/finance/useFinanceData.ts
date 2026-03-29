import { useContext } from 'react';

import { FinanceDataContext } from './financeContextValue';

export function useFinanceData() {
  const context = useContext(FinanceDataContext);

  if (!context) {
    throw new Error('useFinanceData must be used inside a FinanceDataProvider.');
  }

  return context;
}
