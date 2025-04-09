// middleware.ts
// Purpose: Handles authentication, verification redirects, and admin route protection

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request: NextRequest) {
  // Initialize response 
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
  
  // Get user data if authenticated 
  const user = session?.user;
  const path = request.nextUrl.pathname;

  // Define isAdminUser variable at the top level scope
  let isAdminUser = false;

  // If we have a user, determine if they're an admin
  if (user) {
    // Check if user is admin by user metadata
    const isAdminByMetaData = user.user_metadata?.role === "admin";
    isAdminUser = isAdminByMetaData;

    // If no admin role in metadata, check the database
    if (!isAdminByMetaData) {
      const { data: adminData } = await supabase
        .from("admins")
        .select("id")
        .eq("user_id", user.id)
        .single();
      
      isAdminUser = !!adminData;
    }
  }

  // ==== ADMIN ROUTE PROTECTION ====
  if (path.startsWith("/admin")) {
    // Skip middleware for the admin login page
    if (path === "/admin/login") {
      return NextResponse.next();
    }

    // If user is not authenticated, redirect to admin login
    if (!user) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }

    // If user is not admin, redirect to unauthorized page
    if (!isAdminUser) {
      return NextResponse.redirect(new URL("/unauthorized", request.url));
    }

    // Allow access to admin routes for authenticated admins
    return NextResponse.next();
  }

  // ==== EXISTING VERIFICATION & AUTH LOGIC ====
  if (session) {
    const needsVerification =
      request.cookies.has("vrfy_email") || request.cookies.has("vrfy_sms");

    // Redirect to verification if accessing protected routes
    if (
      needsVerification &&
      (path.startsWith("/dashboard") || path === "/protected")
    ) {
      return NextResponse.redirect(new URL("/verify", request.url));
    }
    
    // Special handling for root and login pages when user is admin
    if (isAdminUser && (path === "/sign-in" || path === "/sign-up" || path === "/")) {
      // Admin users should go to the admin dashboard
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
  }

  // Regular authentication redirect logic
  if (session && (path === "/sign-in" || path === "/sign-up" || path === "/")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (!session && (path.startsWith("/dashboard") || path === "/protected")) {
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  return response;
}

// Update matcher to include verify page
export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/protected",
    "/sign-in",
    "/sign-up",
    "/verify",
    "/admin/:path*"
  ],
};