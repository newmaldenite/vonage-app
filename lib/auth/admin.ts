// Purpose: contains admin-specific authentication functions

"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache"; // tells Next.js to refres/revalidate a specific route/path next time someone visits it

const ADMIN_ROLE = "admin";
const ADMIN_EMAIL_DOMAIN =
  process.env.ADMIN_EMAIL_DOMAIN ||
  "https://vonage-app-three.vercel.app/sign-in";

// simple utility function
export async function sendAdminMagicLink(email: string) {
  // Validate the email belongs to the organisation
  if (!email.endsWith(`@${ADMIN_EMAIL_DOMAIN}`)) {
    throw new Error(
      `Admin email must be a valid ${ADMIN_EMAIL_DOMAIN} address`,
    );
  }

  const supabase = await createClient();

  // Get the origin for the callback URL
  const origin = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  const { error } = await supabase.auth.signInWithOtp({
    // pulling the error object out from the result of signInWithOtp()
    email,
    options: {
      // This callback URL will be used after the user clicks the magic link
      emailRedirectTo: `${origin}/api/auth/admin-callback`,
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
