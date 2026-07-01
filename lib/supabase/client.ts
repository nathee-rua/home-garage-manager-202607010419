"use client";

// Browser Supabase client (anon key). Lazily initialised so that a missing
// env at build/render time never throws — callers should check the return.
import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAnonKey, getSupabaseUrl, isSupabaseConfigured } from "./env";

let cached: SupabaseClient | null = null;

export function getBrowserClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cached) return cached;
  cached = createBrowserClient(getSupabaseUrl(), getSupabaseAnonKey());
  return cached;
}
