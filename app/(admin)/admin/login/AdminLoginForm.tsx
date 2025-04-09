// Purpose: Client component that handles the admin login form submission
"use client";

import { useState } from "react";

import { sendAdminMagicLink } from "@/lib/auth/admin";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      await sendAdminMagicLink(email);
      setMessage({
        type: "success",
        text: "Magic link sent! Check your email for the login link.",
      });
      setEmail("");
    } catch (error) {
      setMessage({
        type: "error",
        text:
          error instanceof Error ? error.message : "Failed to send magic link",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Admin Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
          placeholder="admin@example.com"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isLoading ? "opacity-75 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Sending..." : "Send Magic Link"}
      </button>

      {message && (
        <div
          className={`p-3 rounded ${
            message.type === "success"
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </form>
  );
}
