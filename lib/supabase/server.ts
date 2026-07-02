import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getSupabaseAnonKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "./env";

/**
 * Returns a server Supabase client, or null when credentials are not yet
 * configured. Uses cookies to forward user sessions for RLS.
 */
export function getServerClient() {
  if (!isSupabaseConfigured()) return null;
  const cookieStore = cookies();

  return createServerClient(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: { name: string; value: string; options: any }[]
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // The `setAll` method can be called from a Server Component
            // which cannot write cookies. This is fine.
          }
        },
      },
    }
  );
}
