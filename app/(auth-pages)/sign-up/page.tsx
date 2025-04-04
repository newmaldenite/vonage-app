import { FormMessage, Message } from "@/components/form-message";
import { SubmitButton } from "@/components/submit-button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SmtpMessage } from "../smtp-message";
import { signUpAction } from "@/lib/auth/signup";


export default async function Signup(props: {
  searchParams: Promise<Message>;
}) {
  const searchParams = await props.searchParams;
  if ("message" in searchParams) {
    return (
      <div className="w-full flex-1 flex items-center h-screen sm:max-w-md justify-center gap-2 p-4">
        <FormMessage message={searchParams} />
      </div>
    );
  }

  return (
    <>
      <form className="flex flex-col min-w-64 max-w-64 mx-auto">
        <h1 className="text-2xl font-medium">Sign up</h1>
        <p className="text-sm text text-foreground">
          Already have an account?{" "}
          <Link className="text-primary font-medium underline" href="/sign-in">
            Sign in
          </Link>
        </p>
        <div className="flex flex-col gap-2 [&>input]:mb-3 mt-8">
          {/* <Label htmlFor="name">Name</Label>
          <Input name="name" placeholder="Your full name" required />
          <Label htmlFor="username">Username</Label> */}
          {/* <Input name="username" placeholder="Your username" required /> */}
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
            formAction={async (formData: FormData) => {
              "use server";
              try {
                const email = formData.get("email") as string;
                const password = formData.get("password") as string;
                const phone_number = formData.get("phone_number") as string;

                const { error } = await signUpAction({
                  email,
                  password,
                  phone_number,
                });

                if (error) {
                  throw new Error(error.message || "Signup failed");
                }
              } catch (error) {
                console.error(error);
                redirect(
                  `/sign-up?message=${encodeURIComponent(
                    (error as Error).message || "An unexpected error occurred",
                  )}`,
                );
              }

              redirect("/vdashboard");

            }}
            pendingText="Signing up..."
          >
            Sign up
          </SubmitButton>
          <FormMessage message={searchParams} />
        </div>
      </form>
      <SmtpMessage />
    </>
  );
}
