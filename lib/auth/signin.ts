import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { User } from "@/lib/auth/types";
import { callVonageAPI } from "./vonage";
import { encodedRedirect } from "@/utils/utils";
import { storeVerificationAttempts } from "./supabase";
import { detectDeviceType } from "@/utils/device-utils";
import { AuthResponse, DeviceType, VerificationAttempt } from "./types";

export const signInAction = async (formData: FormData) => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Primary authentication
    const { data, error }: AuthResponse = await authenticateUser(
      email,
      password,
    );
    if (error || !data?.user) throw error || new Error("Authentication failed");

    // Adaptive 2FA check
    const requires2FA = await checkRiskFactors(data.user);
    if (!requires2FA) {
      await recordTrustedDevice(data.user);
      return redirect("/protected");
    }

    // Initiate 2FA
    const verification = await handleSecondFactor(data.user);
    await storeVerificationAttempts([verification]);

    return encodedRedirect(
      "error",
      "/sign-in",
      `Verification code sent to ${verification.recipient}`,
    );
  } catch (error) {
    return encodedRedirect(
      "error",
      "/sign-in",
      error instanceof Error ? error.message : "Authentication failed",
    );
  }
};

async function authenticateUser(email: string, password: string) {
  const supabase = await createClient();
  return supabase.auth.signInWithPassword({ email, password });
}

async function checkRiskFactors(user: User) {
  // Implementation from previous risk assessment logic
  return true; // Simplified for example
}

async function handleSecondFactor(
  user: User,
): Promise<Omit<VerificationAttempt, "created_at">> {
  const deviceType = await detectDeviceType();
  const channel = deviceType === "mobile" ? "sms" : "email"; // Map to valid channels

  const recipient =
    channel === "sms" ? await getRegisteredPhone(user.id) : user.email!;

  const response = await callVonageAPI({
    action: "start",
    channel,
    ...(channel === "sms"
      ? { phoneNumber: recipient }
      : { emailAddress: recipient }),
  });

  return {
    user_id: user.id,
    request_id: response.request_id,
    channel,
    recipient,
  };
}

async function getRegisteredPhone(userId: string): Promise<string> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("phone_number")
    .eq("id", userId)
    .single();

  if (!data?.phone_number) throw new Error("Registered phone number required");
  return data.phone_number;
}

async function recordTrustedDevice(user: User) {
  const supabase = await createClient();
  await supabase.from("trusted_devices").upsert({
    user_id: user.id,
    last_used: new Date().toISOString(),
  });
}
