import { vi } from 'vitest';

import type { AuthMode, AuthSession } from '../features/auth/auth.types';
import type { AuthService } from '../features/auth/services/authService';

type CreateAuthServiceStubOptions = {
  initialSession?: AuthSession | null;
  mode?: AuthMode;
  signInError?: Error;
  signUpError?: Error;
  signUpRequiresEmailConfirmation?: boolean;
  signOutError?: Error;
};

export function createAuthServiceStub(options: CreateAuthServiceStubOptions = {}) {
  let session = options.initialSession ?? null;
  const listeners = new Set<(value: AuthSession | null) => void>();

  const notify = (nextSession: AuthSession | null) => {
    session = nextSession;
    listeners.forEach((listener) => listener(nextSession));
  };

  const service: AuthService = {
    mode: options.mode ?? 'preview',
    getSession: vi.fn(async () => session),
    signIn: vi.fn(async ({ email }) => {
      if (options.signInError) {
        throw options.signInError;
      }

      notify({
        user: {
          id: `user-${email}`,
          email,
        },
      });
    }),
    signUp: vi.fn(async ({ email }) => {
      if (options.signUpError) {
        throw options.signUpError;
      }

      const requiresEmailConfirmation = options.signUpRequiresEmailConfirmation ?? false;

      if (!requiresEmailConfirmation) {
        notify({
          user: {
            id: `user-${email}`,
            email,
          },
        });
      }

      return {
        requiresEmailConfirmation,
      };
    }),
    signOut: vi.fn(async () => {
      if (options.signOutError) {
        throw options.signOutError;
      }

      notify(null);
    }),
    onAuthStateChange: vi.fn((listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    }),
  };

  return {
    service,
    emitSession(nextSession: AuthSession | null) {
      notify(nextSession);
    },
  };
}
