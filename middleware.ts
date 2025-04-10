// middleware.ts
// Purpose: Handles authentication, verification redirects, and admin route protection

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

  const { data: { session } } = await supabase.auth.getSession();
  const user = session?.user;
  const path = request.nextUrl.pathname;

  // Admin route protection (unchanged)
  let isAdminUser = false;
  if (user) {
    const isAdminByMetaData = user.user_metadata?.role === "admin";
    isAdminUser = isAdminByMetaData;
    if (!isAdminByMetaData) {
      const { data: adminData } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user.id)
        .single();
      isAdminUser = !!adminData;
    }
  }

  if (path.startsWith("/admin")) {
    if (path === "/admin/login") return NextResponse.next();
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    if (!isAdminUser) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }
    return NextResponse.next();
  }

  // Existing verification logic (preserved)
  const isVerified =
    request.cookies.get("verification_complete")?.value === "true";
  const hasEmailRequestId = request.cookies.has("vrfy_email");
  const hasSmsRequestId = request.cookies.has("vrfy_sms");

  if (session) {
    // Original verification checks (preserved)
    if (!isVerified && (hasEmailRequestId || hasSmsRequestId)) {
      if (path.startsWith("/dashboard") || path === "/protected") {
        return NextResponse.redirect(new URL("/verify", request.url));
      }
    }

    if (isVerified && (hasEmailRequestId || hasSmsRequestId)) {
      response.cookies.delete("vrfy_email");
      response.cookies.delete("vrfy_sms");
    }

    // New 2FA verification check
    const is2FAVerified = request.cookies.get("2fa_verified")?.value === "true";
    const is2FAPath = path === "/verifysignin";

    // Redirect to 2FA verification if needed
    if (!is2FAVerified && path.startsWith("/dashboard")) {
      return NextResponse.redirect(new URL("/verifysignin", request.url));
    }

    // Prevent accessing 2FA page when already verified
    if (is2FAVerified && is2FAPath) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    // Admin user redirects (preserved)
    if (isAdminUser && ["/sign-in", "/sign-up", "/"].includes(path)) {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Modified authentication redirects with 2FA check
  if (session && ["/sign-in", "/sign-up", "/"].includes(path)) {
    const is2FAVerified = request.cookies.get("2fa_verified")?.value === "true";
    return NextResponse.redirect(
      new URL(is2FAVerified ? "/dashboard" : "/verifysignin", request.url),
    );
  }

  if (!session && (path.startsWith("/dashboard") || path === "/protected")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  // 2FA route protection
  if (path === "/verifysignin") {
    if (!session) {
      return NextResponse.redirect(new URL("/sign-in", request.url));
    }
    const is2FAVerified = request.cookies.get("2fa_verified")?.value === "true";
    if (is2FAVerified) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/protected",
    "/sign-in",
    "/sign-up",
    "/verify",
    "/verifysignin",
    "/admin/:path*",
  ],
};
