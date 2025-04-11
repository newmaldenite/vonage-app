// /lib/auth/verify2fa.ts
"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { callVonageAPI } from "./vonage";
import { createClient } from "@/utils/supabase/server";
import { headers } from "next/headers";

export const verify2FAAction = async (formData: FormData) => {
  const code = formData.get("code")?.toString().trim() || "";
  const cookieStore = await cookies();
  const headerStore = await headers();
  const requestId = cookieStore.get("2fa_request_id")?.value;
  const origin = headerStore.get("origin");

  if (!requestId) {
    return redirect(
      `${origin}/verifysignin?error=Verification session expired`,
    );
  }

  try {
    const verificationResult = await callVonageAPI({
      action: "check",
      request_id: requestId,
      code: code,
    });

    if (verificationResult.status !== "completed") {
      throw new Error("Verification failed. Please contact support.");
    }

    // Set verification cookies
    cookieStore.set("2fa_verified", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 86400,
      path: "/",
    });

    cookieStore.delete("2fa_request_id");

    // Redirect to dashboard
    return redirect(`${origin}/dashboard`);
  } catch (error) {
    console.error("2FA verification failed:", error);
    return redirect(
      `${origin}/verifysignin?error=${
        encodeURIComponent(
          error instanceof Error
            ? error.message
            : "Verification failed. Please contact support.",
        )
      }`,
    );
  }
};
