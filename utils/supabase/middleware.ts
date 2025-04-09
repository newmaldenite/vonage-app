// app/utils/supabase/middleware.ts

import { createClient } from "@/utils/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function updateSession(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { session: initialSession },
  } = await supabase.auth.getSession();

  // Skip refresh if no session exists
  if (!initialSession) return NextResponse.next();

  // Only refresh if token is about to expire
  // Check if token expires in less than 5 minutes (300 seconds)
  const expiresAt = initialSession.expires_at ?? 0; // Unix timestamp in seconds, defaults to 0
  const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
  const timeUntilExpiry = expiresAt - currentTime;

  // Create response
  const response = NextResponse.next();

  // Only refresh if token is about to expire (less than 5 minutes left)
  if (timeUntilExpiry < 300) {
    try {
      const { data, error } = await supabase.auth.refreshSession();

      if (error) {
        console.warn("Token refresh failed:", error.message);
        // Only redirect to sign-in if token is expired
        if (timeUntilExpiry <= 0) {
          return NextResponse.redirect(new URL("/sign-in", request.url));
        }
      } else if (data.session) {
        // Update the session in cookies only if refresh succeeded
        response.cookies.set("token", data.session.access_token, {
          secure: true,
          sameSite: "strict",
          path: "/",
        });
      }
    } catch (err) {
      console.error("Error refreshing session:", err);
      // Continue with the existing session if refresh fails but session isn't expired
    }
  }

  return response;
}
export { createClient };
