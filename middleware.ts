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

  // Check verification status
  const isVerified =
    request.cookies.get("verification_complete")?.value === "true";
  const hasEmailRequestId = request.cookies.has("vrfy_email");
  // const hasSmsRequestId = request.cookies.has("vrfy_sms");

  // Redirect logic for verification
  if (session) {
    // Force verification before dashboard access
    //  || hasSmsRequestId
    if (!isVerified && hasEmailRequestId) {
      if (path !== "/verify") {
        return NextResponse.redirect(new URL("/verify", request.url));
      }
    }

    // Clear verification cookies after completion
    //  || hasSmsRequestId
    if (isVerified && hasEmailRequestId) {
      response.cookies.delete("vrfy_email");
      // response.cookies.delete("vrfy_sms");
    }
  }

  // Allow access to verify page even with session
  // if (path === "/verify" && hasEmailRequestId) {
  //   return response;
  // }

  // Existing auth redirects
  if (session && (path === "/sign-in" || path === "/sign-up" || path === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!session && (path.startsWith("/dashboard") || path === "/protected")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
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
  ],
};
