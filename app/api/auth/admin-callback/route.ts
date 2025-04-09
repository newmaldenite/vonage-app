// Callback handler for precessing the magic link authentication
// Purpose: API route that handles magic link callback (checks user is authenticated) and redirects to admin dashboard

import { createClient } from "@/utils/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // the `/auth/callback` route is required for the magic link below
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  console.log("Admin callback - requestURL CODE: ", code);
  const origin = requestUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      // Redirect to admin login with error
      console.log("Admin authentication failed:", error);
      return NextResponse.redirect(
        `${origin}/admin/login?error=Authentication failed`,
      );
    }

    // After successful authentication, redirect to admin dashboard
    console.log("Admin authentication successful - redirecting to dashboard.");
    return NextResponse.redirect(`${origin}/admin/dashboard`);
  }
  // If no code is present, redirect to admin login
  return NextResponse.redirect(`${origin}/admin/login`);
}
