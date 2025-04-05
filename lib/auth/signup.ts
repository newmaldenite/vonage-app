"use server";

import { createClient } from "@/utils/supabase/server";
import { callVonageAPI } from "./vonage";
import { AuthResponse, SignUpPayload } from "./types";

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

  await supabase.from("profiles").upsert({
    id: data.user?.id,
    phone_number: payload.phone_number,
  });

  return {
    data: {
      user: data.user,
      session: data.session,
    },
    error: null,
  };
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
