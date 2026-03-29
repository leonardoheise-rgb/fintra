import {
  startTransition,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import type { AuthResolvedState, AuthSession, AuthUser } from './auth.types';
import { AuthContext, type AuthContextValue } from './authContextValue';
import { createAuthService } from './services/createAuthService';
import type { AuthService } from './services/authService';

function normalizeAuthError(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong while trying to authenticate.';
}

function getUserFromSession(session: AuthSession | null) {
  return session?.user ?? null;
}

type AuthProviderProps = PropsWithChildren<{
  authService?: AuthService;
}>;

export function AuthProvider({ children, authService }: AuthProviderProps) {
  const service = useMemo(() => authService ?? createAuthService(), [authService]);
  const [status, setStatus] = useState<AuthResolvedState>('loading');
  const [user, setUser] = useState<AuthUser | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      try {
        const session = await service.getSession();

        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setUser(getUserFromSession(session));
          setStatus(session ? 'authenticated' : 'unauthenticated');
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        startTransition(() => {
          setErrorMessage(normalizeAuthError(error));
          setUser(null);
          setStatus('unauthenticated');
        });
      }
    }

    loadSession();

    const unsubscribe = service.onAuthStateChange((session) => {
      startTransition(() => {
        setUser(getUserFromSession(session));
        setStatus(session ? 'authenticated' : 'unauthenticated');
      });
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [service]);

  const value = useMemo<AuthContextValue>(
    () => ({
      mode: service.mode,
      status,
      user,
      errorMessage,
      clearError() {
        setErrorMessage(null);
      },
      async signIn(credentials) {
        setErrorMessage(null);
        await service.signIn(credentials);
      },
      async signUp(credentials) {
        setErrorMessage(null);
        return service.signUp(credentials);
      },
      async signOut() {
        try {
          setErrorMessage(null);
          await service.signOut();
        } catch (error) {
          setErrorMessage(normalizeAuthError(error));
          throw error;
        }
      },
    }),
    [errorMessage, service, status, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
