import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const placeholderUrl = 'https://your-project.supabase.co';
const placeholderKey = 'your-public-anon-key';

export function getSupabaseEnvironment() {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  const isConfigured =
    Boolean(url) &&
    Boolean(anonKey) &&
    url !== placeholderUrl &&
    anonKey !== placeholderKey;

  return {
    url,
    anonKey,
    isConfigured,
  };
}

let sharedSupabaseBrowserClient: SupabaseClient | null = null;

export function getSupabaseBrowserClient(): SupabaseClient {
  if (sharedSupabaseBrowserClient) {
    return sharedSupabaseBrowserClient;
  }

  const environment = getSupabaseEnvironment();

  if (!environment.isConfigured || !environment.url || !environment.anonKey) {
    throw new Error('Supabase environment variables are not configured.');
  }

  sharedSupabaseBrowserClient = createClient(environment.url, environment.anonKey, {
    auth: {
      autoRefreshToken: true,
      detectSessionInUrl: true,
      persistSession: true,
    },
  });

  return sharedSupabaseBrowserClient;
}
