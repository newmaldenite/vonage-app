"use server";
import { createClient } from "@/utils/supabase/server";
import { callVonageAPI } from "./vonage";
import { AuthResponse, SignUpPayload } from "./types";
import { AuthError } from "@supabase/supabase-js";

export async function signUpAction(
  payload: SignUpPayload,
): Promise<AuthResponse> {
  const supabase = await createClient();

  try {
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: payload.email,
      password: payload.password,
      options: {
        data: {
          // phone_number: payload.phone_number,
        },
      },
    });

    if (error) throw error;

    // Create user profile
    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user?.id,
      // phone_number: payload.phone_number,
    });

    if (profileError) throw profileError;

    // Initiate Vonage verification , smsRequestId commented out
    const [emailRequestId] = await initiateDualVerification(
      payload.email,
      // payload.phone_number,
    );

    console.log("Verification initiated:", {
      emailRequestId,
      // smsRequestId,
      ttl: 900,
    });

    return {
      data: {
        user: data.user,
        session: data.session,
        requestIds: {
          email: emailRequestId,
          // sms: smsRequestId,
        },
      },
      error: null,
    };
  } catch (error) {
    console.error("Signup error:", error);
    return {
      data: {
        user: null,
        session: null,
      },
      error: new AuthError(
        error instanceof Error ? error.message : "Signup failed",
      ),
    };
  }
}

async function initiateDualVerification(
  email: string,
  // phone_number: string,
): Promise<[string]> {
  try {
    const emailRes = await callVonageAPI({
      action: "start",
      channel: "email",
      emailAddress: email,
    });

    // const smsRes = await callVonageAPI({
    //   action: "start",
    //   channel: "sms",
    //   phoneNumber: phone_number,
    // });

    // , smsRes.request_id // commented out from the return statement
    return [emailRes.request_id];
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Verification initiation failed";
    throw new Error(errorMessage);
  }
}
