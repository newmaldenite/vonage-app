import { createClient } from "@/utils/supabase/server";
import { callVonageAPI } from "./vonage";
import { AuthResponse, SignUpPayload } from "./types";

export async function createNewUser(
  payload: SignUpPayload,
): Promise<AuthResponse> {
  const supabase = await createClient();
  return supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        email_verified: false,
        phone_verified: false,
        phone_number: payload.phone,
      },
    },
  });
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
