const placeholderUrl = 'https://your-project.supabase.co';
const placeholderKey = 'your-public-anon-key';

export function getAuthEnvironment() {
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
