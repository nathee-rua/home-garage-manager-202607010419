import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkAndSendDueNotifications } from "@/lib/notifications";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // 1. Authenticate the Cron request
  const authHeader = request.headers.get("authorization");
  const queryKey = searchParams.get("key");
  const cronSecret = process.env.CRON_SECRET;

  const isAuthorized =
    (authHeader && authHeader === `Bearer ${cronSecret}`) ||
    (queryKey && queryKey === cronSecret) ||
    // Fallback for development if CRON_SECRET is not set
    (!cronSecret && process.env.NODE_ENV === "development");

  if (!isAuthorized) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey || serviceRoleKey === "placeholder") {
    return NextResponse.json(
      { ok: false, error: "Database service keys are not configured" },
      { status: 500 }
    );
  }

  // Create admin client to bypass RLS and retrieve all users
  const sbAdmin = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  try {
    // 2. Fetch all registered users
    const { data: { users }, error: listError } = await sbAdmin.auth.admin.listUsers();
    if (listError) {
      return NextResponse.json({ ok: false, error: listError.message }, { status: 500 });
    }

    const results: {
      userId: string;
      email: string;
      emailSent: boolean;
      telegramSent: boolean;
      messageCount: number;
    }[] = [];

    // 3. Process notifications for each user
    for (const user of users) {
      if (!user.email) continue;
      
      try {
        const status = await checkAndSendDueNotifications(user.id, sbAdmin, user.email);
        results.push({
          userId: user.id,
          email: user.email,
          ...status,
        });
      } catch (err: any) {
        console.error(`Failed to process notifications for user ${user.email}:`, err);
        results.push({
          userId: user.id,
          email: user.email,
          emailSent: false,
          telegramSent: false,
          messageCount: 0,
        });
      }
    }

    return NextResponse.json({
      ok: true,
      processedUsersCount: users.length,
      results: results,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message ?? "Unknown cron error" },
      { status: 500 }
    );
  }
}
