import { createSupabaseBrowserClient } from '../../../shared/supabase/client';
import type { AuthCredentials, AuthSession, AuthUser } from '../auth.types';
import type { AuthService, AuthStateListener, SignUpResult } from './authService';

function mapUser(user: { id: string; email?: string | null }): AuthUser | null {
  if (!user.email) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
  };
}

function mapSession(session: { user: { id: string; email?: string | null } } | null): AuthSession | null {
  if (!session) {
    return null;
  }

  const user = mapUser(session.user);

  if (!user) {
    return null;
  }

  return {
    user,
  };
}

export function createSupabaseAuthService(): AuthService {
  const client = createSupabaseBrowserClient();

  return {
    mode: 'supabase',
    async getSession() {
      const { data, error } = await client.auth.getSession();

      if (error) {
        throw error;
      }

      return mapSession(data.session);
    },
    async signIn(credentials: AuthCredentials) {
      const { error } = await client.auth.signInWithPassword(credentials);

      if (error) {
        throw error;
      }
    },
    async signUp(credentials: AuthCredentials): Promise<SignUpResult> {
      const { data, error } = await client.auth.signUp(credentials);

      if (error) {
        throw error;
      }

      return {
        requiresEmailConfirmation: !data.session,
      };
    },
    async signOut() {
      const { error } = await client.auth.signOut();

      if (error) {
        throw error;
      }
    },
    onAuthStateChange(listener: AuthStateListener) {
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange((_event, session) => {
        listener(mapSession(session));
      });

      return () => {
        subscription.unsubscribe();
      };
    },
  };
}
