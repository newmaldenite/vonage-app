import SignUpForm from "./SignUpForm";
import { Message } from "@/lib/auth/types";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic"; // Add this line

export default async function SignupPage({
  searchParams: searchParamsPromise,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const searchParams = await searchParamsPromise;

  // Handle verification redirect
  if (searchParams.redirect === "/verify") {
    const cookieStore = await cookies();
    const emailRequestId = cookieStore.get("vrfy_email")?.value;
    const smsRequestId = cookieStore.get("vrfy_sms")?.value;

    if (emailRequestId && smsRequestId) {
      return redirect("/verify");
    }
  }

  // Construct message parameters
  const messageParams: Message = {
    type: searchParams.success ? "success" : "error",
    content: searchParams.success || searchParams.message || "",
  };

  return <SignUpForm searchParams={messageParams} />;
}
