import { BrowserRouter } from 'react-router-dom';

import { AuthProvider } from '../features/auth/AuthContext';
import type { AuthService } from '../features/auth/services/authService';
import { AppRouter } from './AppRouter';

type AppProps = {
  authService?: AuthService;
};

export function App({ authService }: AppProps) {
  return (
    <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
      <AuthProvider authService={authService}>
        <AppRouter />
      </AuthProvider>
    </BrowserRouter>
  );
}
