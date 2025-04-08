"use client";
import { FormMessage } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { handleSignUp } from "@/app/actions";
import { Message } from "@/lib/auth/types";

export default function SignUpForm({ 
  searchParams 
}: { 
  searchParams: Message 
}) {
  const [state, formAction] = useActionState(handleSignUp, undefined);

  // Handle redirect from server action
  useEffect(() => {
    if (state?.redirect) {
      window.location.href = state.redirect;
    }
  }, [state]);

  return (
    <>
      {searchParams?.content && (
        <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
          <FormMessage message={searchParams} />
        </div>
      )}

      <form action={formAction} className="flex flex-col min-w-64 max-w-64 mx-auto">
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text-sm text text-foreground">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          <Label htmlFor="email">Email</Label>
          <Input name="email" placeholder="you@example.com" required />
          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            name="password"
            placeholder="Your password"
            minLength={6}
            required
          />
          <Label htmlFor="phone_number">Phone Number</Label>
          <Input
            name="phone_number"
            placeholder="+1234567890"
            required
            type="tel"
          />
          <SubmitButton
            pendingText="Signing up..."
          >
            Sign up
          </SubmitButton>
          {state?.error && (
            <p className="text-red-500 text-sm mt-2">{state.error}</p>
          )}
        </div>
      </form>
    </>
  );
}