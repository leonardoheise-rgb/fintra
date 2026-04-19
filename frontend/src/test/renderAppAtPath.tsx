import { act, render } from '@testing-library/react';

import { App } from '../app/App';
import type { AuthService } from '../features/auth/services/authService';
import { createPreviewWorkspace } from '../features/finance/lib/previewWorkspace';
import type { FinanceService } from '../features/finance/services/financeService';
import type { DisplayPreferencesService } from '../features/settings/services/displayPreferencesService';
import { getCurrentMonthKey } from '../shared/lib/date/months';
import { createTestFinanceService } from './createTestFinanceService';

export async function renderAppAtPath(
  pathname: string,
  authService: AuthService,
  financeService?: FinanceService,
  displayPreferencesService?: DisplayPreferencesService,
) {
  window.history.pushState({}, '', pathname);
  const previewStorageKey = 'fintra.preview.workspace.test-finance-user';

  if (!financeService && !window.localStorage.getItem(previewStorageKey)) {
    const workspace = createPreviewWorkspace();
    workspace.monthReviews = [
      {
        month: getCurrentMonthKey(new Date()),
        plannedIncomeAmount: 0,
        plannedIncomeDescription: '',
        carryOverAmount: 0,
        reviewedAt: new Date().toISOString(),
      },
    ];
    window.localStorage.setItem(previewStorageKey, JSON.stringify(workspace));
  }

  const resolvedFinanceService = financeService ?? createTestFinanceService('test-finance-user');

  let renderResult: ReturnType<typeof render> | undefined;

  await act(async () => {
    renderResult = render(
      <App
        authService={authService}
        displayPreferencesService={displayPreferencesService}
        financeService={resolvedFinanceService}
      />,
    );
    await Promise.resolve();
  });

  return renderResult!;
}
