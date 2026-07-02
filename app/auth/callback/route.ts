import { NextResponse } from "next/server";
import { getServerClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const sb = getServerClient();
    if (sb) {
      const { error } = await sb.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(`${origin}${next}`);
      }
    }
  }

  // Return the user to an error page if some parameters are missing or exchange failed
  return NextResponse.redirect(`${origin}/login?error=auth_failed`);
}
