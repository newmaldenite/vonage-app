// middleware.ts
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

  // Check auth state
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const path = request.nextUrl.pathname;

  // Redirect logic based on auth state
  if (session && (path === "/sign-in" || path === "/sign-up" || path === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!session && (path.startsWith("/dashboard") || path === "/protected")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return response;
}

// Add the paths you want the middleware to run on
export const config = {
  matcher: ["/", "/dashboard/:path*", "/protected", "/sign-in", "/sign-up"],
};
