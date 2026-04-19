import { act, render } from '@testing-library/react';

import { App } from '../app/App';
import type { AuthService } from '../features/auth/services/authService';
import type { FinanceService } from '../features/finance/services/financeService';
import type { DisplayPreferencesService } from '../features/settings/services/displayPreferencesService';
import { createTestFinanceService } from './createTestFinanceService';

export async function renderAppAtPath(
  pathname: string,
  authService: AuthService,
  financeService?: FinanceService,
  displayPreferencesService?: DisplayPreferencesService,
) {
  window.history.pushState({}, '', pathname);
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
