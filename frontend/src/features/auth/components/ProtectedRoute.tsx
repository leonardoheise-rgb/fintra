import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../useAuth';
import { AuthGateFallback } from './AuthGateFallback';

export function ProtectedRoute() {
  const auth = useAuth();
  const location = useLocation();

  if (auth.status === 'loading') {
    return <AuthGateFallback />;
  }

  if (auth.status === 'unauthenticated') {
    return <Navigate replace state={{ from: location }} to="/sign-in" />;
  }

  return <Outlet />;
}
