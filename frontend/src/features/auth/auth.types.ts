export type AuthUser = {
  id: string;
  email: string;
};

export type AuthSession = {
  user: AuthUser;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type AuthRegistrationData = AuthCredentials & {
  confirmPassword: string;
};

export type AuthResolvedState = 'loading' | 'authenticated' | 'unauthenticated';

export type AuthMode = 'preview' | 'supabase';
