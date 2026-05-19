import type { AuthCredentials, AuthMode, AuthSession } from '../auth.types';

export type AuthStateListener = (session: AuthSession | null) => void;

export type SignUpResult = {
  requiresEmailConfirmation: boolean;
};

export interface AuthService {
  readonly mode: AuthMode;
  getSession(): Promise<AuthSession | null>;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  signIn(credentials: AuthCredentials): Promise<void>;
  signUp(credentials: AuthCredentials): Promise<SignUpResult>;
  signOut(): Promise<void>;
  onAuthStateChange(listener: AuthStateListener): () => void;
}
