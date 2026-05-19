import { createContext } from 'react';

import type { AuthCredentials, AuthResolvedState, AuthUser } from './auth.types';
import type { AuthService } from './services/authService';

export type AuthContextValue = {
  mode: AuthService['mode'];
  status: AuthResolvedState;
  user: AuthUser | null;
  errorMessage: string | null;
  clearError(): void;
  requestPasswordReset(email: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
  signIn(credentials: AuthCredentials): Promise<void>;
  signUp(credentials: AuthCredentials): Promise<{ requiresEmailConfirmation: boolean }>;
  signOut(): Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);
