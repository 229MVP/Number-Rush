/**
 * Public Supabase project URL and anon key (safe for client bundles).
 * Never log raw key material.
 */

function trimEnv(value: string | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function getSupabaseUrl(): string | null {
  const url = trimEnv(process.env.EXPO_PUBLIC_SUPABASE_URL);
  if (!url) return null;
  if (!url.startsWith('https://')) return null;
  return url;
}

export function getSupabaseAnonKey(): string | null {
  return trimEnv(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);
}

export function isSupabaseConfigured(): boolean {
  return getSupabaseUrl() != null && getSupabaseAnonKey() != null;
}
