import { AuthError, Session } from "@supabase/supabase-js";

type SupabaseUser = import("@supabase/supabase-js").User;

export interface User extends SupabaseUser {
  phone_number?: string;
  email_verified?: boolean;
  phone_verified?: boolean;
}

export type AuthResponse =
  | {
    data: {
      user: User | null;
      session: Session | null;
      requestIds?: {
        // Move inside data object
        email: string;
        // sms: string;
      };
    };
    error: null;
  }
  | {
    data: {
      user: null;
      session: null;
    };
    error: AuthError;
  };

export type DeviceType = "mobile" | "desktop";

export interface VerificationAttempt {
  request_id: string;
  //  | "sms"
  channel: "email";
  recipient: string;
  user_id: string;
  created_at: string;
}

export interface SignUpPayload {
  email: string;
  password: string;
  // phone_number: string;
}

export interface VerificationPayload {
  emailCode: string;
  // smsCode: string;
  userId: string;
}

export type Message = {
  type: "error" | "success";
  content: string;
};
