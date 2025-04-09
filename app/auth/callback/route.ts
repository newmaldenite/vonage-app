// app/auth/callback/route.ts
import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  // The `/auth/callback` route is required for the server-side auth flow implemented
  // by the SSR package. It exchanges an auth code for the user's session.
  // https://supabase.com/docs/guides/auth/server-side/nextjs
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const origin = requestUrl.origin;
  const redirectTo = requestUrl.searchParams.get("redirect_to")?.toString();

  console.log("Auth callback triggered with:", {
    code: code ? "PRESENT" : "MISSING",
    redirectTo,
  });

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("Error exchanging code for session:", error);
      return NextResponse.redirect(`${origin}/sign-in?error=auth_error`);
    }

    // Check if user is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    console.log("Authenticated user:", {
      id: user?.id,
      email: user?.email,
      metadata: user?.user_metadata,
    });

    // Check if user has admin role in user metadata
    const isAdmin = user?.user_metadata?.role === "admin";

    if (isAdmin) {
      console.log("Admin user detected - redirecting to admin dashboard");
      return NextResponse.redirect(`${origin}/admin/dashboard`);
    }
  }

  if (redirectTo) {
    console.log(`Redirecting to specified path: ${redirectTo}`);
    return NextResponse.redirect(`${origin}${redirectTo}`);
  }

  // URL to redirect to after sign up process completes
  console.log("No redirect_to parameter, using default redirect to /dashboard");
  return NextResponse.redirect(`${origin}/dashboard`);
}
