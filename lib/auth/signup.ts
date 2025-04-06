"use server";

import { createClient } from "@/utils/supabase/server";
import { callVonageAPI } from "./vonage";
import { AuthResponse, SignUpPayload } from "./types";
import { AuthError } from "@supabase/supabase-js";

export async function signUpAction(
  payload: SignUpPayload,
): Promise<AuthResponse> {
  const supabase = await createClient();

  // Create auth user
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        // Store in user_metadata (not auth.users.phone)
        phone_number: payload.phone_number,
      },
    },
  });

  if (error) {
    return {
      data: { user: null, session: null },
      error: error,
    };
  }

  const { error: profileError } = await supabase
    .from("profiles")
    .upsert({
      id: data.user?.id,
      phone_number: payload.phone_number,
    });

  if (profileError) {
    return {
      data: { user: null, session: null },
      error: new AuthError("Profile creation failed: " + profileError.message),
    };
  }

  try {
    const [emailRes, smsRes] = await initiateDualVerification(
      payload.email,
      payload.phone_number,
    );

    return {
      data: {
        user: data.user,
        session: data.session,
        requestIds: {
          email: emailRes.request_id,
          sms: smsRes.request_id,
        },
      },
      error: null,
    };
  } catch (err) {
    console.error("Verification initiation failed:", err);

    return {
      data: {
        user: null,
        session: null,
      },
      error: new AuthError(
        "Verification initiation failed: " +
          (err instanceof Error ? err.message : "Unknown error"),
      ),
    };
  }
}

export async function initiateDualVerification(
  email: string,
  phone_number: string,
) {
  return Promise.all([
    callVonageAPI({
      action: "start",
      channel: "email",
      emailAddress: email,
    }),
    callVonageAPI({
      action: "start",
      channel: "sms",
      phoneNumber: phone_number,
    }),
  ]);
}

// Add verification status update function
export async function updateVerificationStatus(
  userId: string,
  updates: { email_verified?: boolean; phone_verified?: boolean },
) {
  const supabase = await createClient();
  return supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);
}
