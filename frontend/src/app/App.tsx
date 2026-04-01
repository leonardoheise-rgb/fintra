import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '../features/auth/AuthContext';
import { DisplayPreferencesProvider } from '../features/settings/DisplayPreferencesContext';
import type { AuthService } from '../features/auth/services/authService';
import type { FinanceService } from '../features/finance/services/financeService';
import { AppRouter } from './AppRouter';

type AppProps = {
  authService?: AuthService;
  financeService?: FinanceService;
};

export function App({ authService, financeService }: AppProps) {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AuthProvider authService={authService}>
        <DisplayPreferencesProvider>
          <AppRouter financeService={financeService} />
        </DisplayPreferencesProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
