import { callVonageAPI } from "./vonage";
import { VerificationAttempt, VerificationPayload } from "./types";
import { getRecentVerificationAttempts } from "./supabase";
import { createClient } from "@/utils/supabase/server";

export async function verifySignUpCodes(payload: VerificationPayload) {
  const { emailCode, smsCode, userId } = payload;

  const [emailResponse, smsResponse] = await Promise.all([
    callVonageAPI({
      action: "check",
      request_id: await getVerificationRequestId(userId, "email"),
      code: emailCode,
    }),
    callVonageAPI({
      action: "check",
      request_id: await getVerificationRequestId(userId, "sms"),
      code: smsCode,
    }),
  ]);

  return { emailResponse, smsResponse };
}

async function getVerificationRequestId(
  userId: string,
  channel: "email" | "sms",
) {
  const { data } = await getRecentVerificationAttempts(userId);
  return data?.find((a: VerificationAttempt) => a.channel === channel)
    ?.request_id;
}

// lib/auth/verification.ts
export async function checkVerificationStatus(userId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("email_verified, phone_verified")
    .eq("id", userId)
    .single();
  return data;
}
