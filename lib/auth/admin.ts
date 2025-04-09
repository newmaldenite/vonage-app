// Purpose: contains admin-specific authentication functions

"use server";

import { createClient } from "@/utils/supabase/server";

const ADMIN_ROLE = "admin";
const ADMIN_EMAIL_DOMAIN = process.env.ADMIN_EMAIL_DOMAIN;

// simple utility function
export async function sendAdminMagicLink(email: string) {
  
  // Only validate the email domain if ADMIN_EMAIL_DOMAIN is the one specified
  if (ADMIN_EMAIL_DOMAIN && !email.endsWith(`@${ADMIN_EMAIL_DOMAIN}`)) {
    throw new Error(
      `Admin email must be a valid ${ADMIN_EMAIL_DOMAIN} address`,
    );
  }

  const supabase = await createClient();

  // Get the origin for the callback URL after checking the environment and set appropriate origin
  let origin;
  if (process.env.NODE_ENV === "production") {
    // In production, use the base URL from environment variable or fallback to a production URL
    origin =
      process.env.NEXT_PUBLIC_BASE_URL || "https://vonage-app-three.vercel.app";
  } else if (process.env.NODE_ENV === "development") {
    // In development, use localhost with the specified port
    origin = "http://localhost:3000";
  } else {
    // For testing or other environments
    origin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  }

  console.log(`Environment: ${process.env.NODE_ENV}, using origin: ${origin}`);

  const redirectTo = "/admin/dashboard";
  console.log("Setting redirect_to parameter:", redirectTo);

  const { error } = await supabase.auth.signInWithOtp({
    // pulling the error object out from the result of signInWithOtp()
    email,
    options: {
      // This callback URL will be used after the user clicks the magic link
      emailRedirectTo: `${origin}/auth/callback?redirect_to=${redirectTo}`, //correct file path
      data: {
        role: ADMIN_ROLE, // Store role information
      },
    },
  });

  if (error) {
    console.error("Error sending admin magic link: ", error);
    throw new Error("Failed to send login link. PLease try again.");
  }

  return { success: true };
}

export async function isAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return false;

  // check if user has admin role in user metadata
  const isAdminUser = user.user_metadata?.role === ADMIN_ROLE;

  // Alternatively, check if user is in the admins table
  if (!isAdminUser) {
    const { data: adminData } = await supabase
      .from("admins")
      .select("id")
      .eq("user_id", user.id)
      .single();

    return !!adminData; // !! forces any value into a clean boolean
  }

  return isAdminUser;
}

export async function requireAdmin() {
  const isAdminUser = await isAdmin();
  if (!isAdminUser) {
    throw new Error("Unauthorized: Admin");
  }

  return true;
}
