"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { User } from "@/lib/auth/types";
import { callVonageAPI } from "./vonage";
import { encodedRedirect } from "@/utils/utils";
import { storeVerificationAttempts } from "./supabase";
import { detectDeviceType } from "@/utils/device-utils";
import { AuthResponse, DeviceType, VerificationAttempt } from "./types";

// /lib/auth/signin.ts
export const signInAction = async (formData: FormData) => {
  console.log("SignInAction started with email:", formData.get("email"));
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    // Primary authentication
    console.log("Attempting authentication...");
    const { data, error }: AuthResponse = await authenticateUser(
      email,
      password,
    );

    if (error || !data?.user) {
      console.log("Authentication failed:", error);
      throw error || new Error("Authentication failed");
    }

    console.log("Authentication successful for user:", data.user.id);

    // Adaptive 2FA check
    console.log("Checking risk factors...");
    const requires2FA = await checkRiskFactors(data.user);
    console.log("2FA required?", requires2FA);

    if (!requires2FA) {
      console.log("2FA not required, recording trusted device...");
      await recordTrustedDevice(data.user);
      console.log("Redirecting to /protected...");
      redirect("/protected");
    }

    // initiate 2FA
    console.log("Initiating 2FA...");
    const verification = await handleSecondFactor(data.user);
    await storeVerificationAttempts([verification]);

    return encodedRedirect(
      "error",
      "/sign-in",
      `Verification code sent to ${verification.recipient}`,
    );

    // Rest of the function...
  } catch (error) {
    // Check if this is a redirect error, and if so, don't handle it
    // The error object will have a 'digest' property if it's a redirect error
    if (
      error instanceof Error &&
      (error as any).digest?.startsWith("NEXT_REDIRECT")
    ) {
      // Re-throw the redirect error so Next.js can handle it
      console.log(
        "Detected redirect error, re-throwing for Next.js to handle...",
      );
      throw error;
    }

    console.error("Error in signInAction:", error);
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
  console.log("Explicitly bypassing 2FA for testing...");
  return false; // MUST return false to bypass 2FA
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
