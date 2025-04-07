"use client";
import { useState } from "react";
import { VonageRequest, callVonageAPI } from "@/lib/auth/vonage";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";

// Wrap the main component with Suspense
function VerifyPageWrapper() {
  return (
    <Suspense fallback={<div>Loading verification session...</div>}>
      <VerifyPage />
    </Suspense>
  );
}

function VerifyPage() {
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get request IDs from URL parameters
  const emailRequestId = searchParams.get("email");
  const smsRequestId = searchParams.get("sms");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("Initial verification state:", {
      emailRequestId,
      smsRequestId,
      emailCode,
      phoneCode,
    });

    if (!emailRequestId || !smsRequestId) {
      console.error("Missing request IDs:", { emailRequestId, smsRequestId });
      setError("Missing verification session");
      return;
    }

    try {
      console.log("Starting verification checks...");
      const emailPayload: VonageRequest = {
        action: "check",
        channel: "email",
        request_id: emailRequestId,
        code: emailCode,
      };
      const smsPayload: VonageRequest = {
        action: "check",
        channel: "sms",
        request_id: smsRequestId,
        code: phoneCode,
      };

      console.log("Sending verification payloads:", {
        emailPayload,
        smsPayload,
      });

      const [emailRes, smsRes] = await Promise.all([
        callVonageAPI(emailPayload).catch((e) => {
          console.error("Email verification error:", e);
          throw e;
        }),
        callVonageAPI(smsPayload).catch((e) => {
          console.error("SMS verification error:", e);
          throw e;
        }),
      ]);

      console.log("Verification responses:", {
        emailResponse: emailRes,
        smsResponse: smsRes,
      });

      if (emailRes.status === "completed" && smsRes.status === "completed") {
        console.log("Dual verification successful");
        setSuccess(true);
        router.push("/dashboard");
      } else {
        console.warn("Verification failed:", {
          emailStatus: emailRes.status,
          smsStatus: smsRes.status,
        });
        setError("Invalid codes - please try again");
      }
    } catch (err) {
      console.error("Verification process failed:", err);
      setError(err instanceof Error ? err.message : "Verification failed");

      // Log additional error details if available
      if (err instanceof Error && "cause" in err) {
        console.error("Underlying error details:", err.cause);
      }
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Verify Your Codes</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      {success ? (
        <p className="text-green-500">Success! Redirecting...</p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Email code"
            value={emailCode}
            onChange={(e) => setEmailCode(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="text"
            placeholder="SMS code"
            value={phoneCode}
            onChange={(e) => setPhoneCode(e.target.value)}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 transition-colors"
          >
            Verify
          </button>
        </form>
      )}
    </div>
  );
}

export default VerifyPageWrapper;