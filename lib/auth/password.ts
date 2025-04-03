import { createClient } from "@/utils/supabase/server";

export async function initiatePasswordReset(email: string, origin: string) {
  const supabase = await createClient();
  return supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?type=password-reset`,
  });
}

export async function updateUserPassword(newPassword: string) {
  const supabase = await createClient();
  return supabase.auth.updateUser({ password: newPassword });
}
