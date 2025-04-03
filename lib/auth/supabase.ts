import { createClient } from "@/utils/supabase/server";
import { VerificationAttempt } from "./types";

export async function storeVerificationAttempts(
  attempts: Omit<VerificationAttempt, "created_at">[],
) {
  const supabase = await createClient();
  return supabase.from("verification_attempts").insert(attempts);
}

export async function getRecentVerificationAttempts(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("verification_attempts")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
}

export async function updateUserVerificationStatus(userId: string) {
  const supabase = await createClient();
  return supabase
    .from("profiles")
    .update({ email_verified: true, phone_verified: true })
    .eq("id", userId);
}
