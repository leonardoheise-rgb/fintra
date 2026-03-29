import { Navigate, Outlet } from 'react-router-dom';

import { useAuth } from '../useAuth';
import { AuthGateFallback } from './AuthGateFallback';

export function PublicOnlyRoute() {
  const auth = useAuth();

  if (auth.status === 'loading') {
    return <AuthGateFallback />;
  }

  if (auth.status === 'authenticated') {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
}
