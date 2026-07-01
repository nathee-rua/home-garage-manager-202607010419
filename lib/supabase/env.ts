// Centralised env access. Values are read at request time (not module load)
// so that `next build` doesn't crash when envs are placeholders/empty.

export function getSupabaseUrl(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
}

export function getSupabaseAnonKey(): string {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
}

export function getSupabaseServiceKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

/** True only when real (non-placeholder) Supabase credentials are present. */
export function isSupabaseConfigured(): boolean {
  const url = getSupabaseUrl();
  const anon = getSupabaseAnonKey();
  return (
    url.startsWith("http") &&
    !url.includes("placeholder") &&
    anon.length > 10 &&
    anon !== "placeholder"
  );
}
