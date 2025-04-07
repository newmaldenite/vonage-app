"use client"; // This is a Client Component
import { useState } from "react";
import { useRouter } from "next/navigation";
import { VonageRequest, callVonageAPI } from "@/lib/auth/vonage";

interface VerifyFormProps {
  emailRequestId: string;
  smsRequestId: string;
}

export default function VerifyForm({
  emailRequestId,
  smsRequestId,
}: VerifyFormProps) {
  const [emailCode, setEmailCode] = useState("");
  const [phoneCode, setPhoneCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const [emailRes, smsRes] = await Promise.all([
        callVonageAPI({
          action: "check",
          channel: "email",
          request_id: emailRequestId,
          code: emailCode,
        }),
        callVonageAPI({
          action: "check",
          channel: "sms",
          request_id: smsRequestId,
          code: phoneCode,
        }),
      ]);

      if (emailRes.status === "completed" && smsRes.status === "completed") {
        document.cookie = "vrfy_email=; path=/; max-age=0";
        document.cookie = "vrfy_sms=; path=/; max-age=0";

        setSuccess(true);
        router.push("/dashboard");
      } else {
        setError("Invalid codes - please try again");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed");
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
