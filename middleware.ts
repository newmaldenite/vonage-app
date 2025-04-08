import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          response.cookies.set({
            name,
            value: "",
            ...options,
            maxAge: 0,
          });
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const path = request.nextUrl.pathname;

  // New: Check for verification completion
  const isVerified =
    request.cookies.get("verification_complete")?.value === "true";

  if (session) {
    // Modified verification check
    const needsVerification =
      !isVerified &&
      (request.cookies.has("vrfy_email") || request.cookies.has("vrfy_sms"));

    if (needsVerification && path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/verify", request.url));
    }
  }

  // Existing auth logic
  if (session && (path === "/sign-in" || path === "/sign-up" || path === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!session && path.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return response;
}
