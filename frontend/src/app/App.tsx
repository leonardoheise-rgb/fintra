import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '../features/auth/AuthContext';
import { DisplayPreferencesProvider } from '../features/settings/DisplayPreferencesContext';
import type { AuthService } from '../features/auth/services/authService';
import type { FinanceService } from '../features/finance/services/financeService';
import type { DisplayPreferencesService } from '../features/settings/services/displayPreferencesService';
import { AppRouter } from './AppRouter';

type AppProps = {
  authService?: AuthService;
  financeService?: FinanceService;
  displayPreferencesService?: DisplayPreferencesService;
};

export function App({
  authService,
  financeService,
  displayPreferencesService,
}: AppProps) {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AuthProvider authService={authService}>
        <DisplayPreferencesProvider service={displayPreferencesService}>
          <AppRouter financeService={financeService} />
        </DisplayPreferencesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
