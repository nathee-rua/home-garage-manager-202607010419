// Server-side Supabase client using the service-role key. Used inside Server
// Components (reads) and Server Actions (writes). Lazily created at request
// time so `next build` never crashes on empty/placeholder envs.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import {
  getSupabaseAnonKey,
  getSupabaseServiceKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./env";

/**
 * Returns a server Supabase client, or null when credentials are not yet
 * configured. Prefer the service-role key; fall back to anon (RLS is
 * permissive in v1 anyway).
 */
export function getServerClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  const key = getSupabaseServiceKey() || getSupabaseAnonKey();
  if (!key || key === "placeholder") return null;
  return createClient(getSupabaseUrl(), key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
