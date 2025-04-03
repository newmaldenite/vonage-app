"use server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { encodedRedirect } from "@/utils/utils";
import { createClient } from "@/utils/supabase/server";
import { signInAction as coreSignIn } from "@/lib/auth/signin";
import { initiatePasswordReset, updateUserPassword } from "@/lib/auth/password";

// Re-export core authentication actions

export { coreSignIn as signInAction };

// Password management actions
export const forgotPasswordAction = async (formData: FormData) => {
  const email = formData.get("email")?.toString();
  const origin = (await headers()).get("origin"); // Get the origin from headers

  if (!email) {
    return encodedRedirect("error", "/forgot-password", "Email is required");
  }

  try {
    const { error } = await initiatePasswordReset(email, origin || "");
    if (error) throw error;

    return encodedRedirect(
      "success",
      "/forgot-password",
      "Check your email for reset instructions",
    );
  } catch (error) {
    return encodedRedirect(
      "error",
      "/forgot-password",
      error instanceof Error ? error.message : "Password reset failed",
    );
  }
};

export const resetPasswordAction = async (formData: FormData) => {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return encodedRedirect(
      "error",
      "/reset-password",
      "Both fields are required",
    );
  }

  if (password !== confirmPassword) {
    return encodedRedirect(
      "error",
      "/reset-password",
      "Passwords do not match",
    );
  }

  try {
    const { error } = await updateUserPassword(password);
    if (error) throw error;

    return encodedRedirect(
      "success",
      "/sign-in",
      "Password updated successfully",
    );
  } catch (error) {
    return encodedRedirect(
      "error",
      "/reset-password",
      error instanceof Error ? error.message : "Password update failed",
    );
  }
};

// Session management
export const signOutAction = async () => {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return encodedRedirect(
      "error",
      "/sign-in",
      "Failed to sign out",
    );
  }

  return redirect("/sign-in");
};
