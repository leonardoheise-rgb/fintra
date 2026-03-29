import type { AuthCredentials, AuthSession } from '../auth.types';
import type { AuthService, AuthStateListener, SignUpResult } from './authService';

const previewStorageKey = 'fintra.preview.session';

type StoredPreviewSession = {
  id: string;
  email: string;
};

function readStoredSession(): AuthSession | null {
  const rawValue = window.localStorage.getItem(previewStorageKey);

  if (!rawValue) {
    return null;
  }

  try {
    const parsed = JSON.parse(rawValue) as StoredPreviewSession;

    if (!parsed.id || !parsed.email) {
      return null;
    }

    return {
      user: {
        id: parsed.id,
        email: parsed.email,
      },
    };
  } catch {
    return null;
  }
}

function persistSession(session: AuthSession | null) {
  if (!session) {
    window.localStorage.removeItem(previewStorageKey);
    return;
  }

  window.localStorage.setItem(
    previewStorageKey,
    JSON.stringify({
      id: session.user.id,
      email: session.user.email,
    }),
  );
}

function createPreviewSession(email: string): AuthSession {
  return {
    user: {
      id: `preview-${email.toLowerCase()}`,
      email: email.trim().toLowerCase(),
    },
  };
}

export function createLocalPreviewAuthService(): AuthService {
  const listeners = new Set<AuthStateListener>();

  function notify(session: AuthSession | null) {
    listeners.forEach((listener) => {
      listener(session);
    });
  }

  async function storeSession(email: string) {
    const session = createPreviewSession(email);
    persistSession(session);
    notify(session);
  }

  return {
    mode: 'preview',
    async getSession() {
      return readStoredSession();
    },
    async signIn(credentials: AuthCredentials) {
      await storeSession(credentials.email);
    },
    async signUp(credentials: AuthCredentials): Promise<SignUpResult> {
      await storeSession(credentials.email);

      return {
        requiresEmailConfirmation: false,
      };
    },
    async signOut() {
      persistSession(null);
      notify(null);
    },
    onAuthStateChange(listener: AuthStateListener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
  };
}
