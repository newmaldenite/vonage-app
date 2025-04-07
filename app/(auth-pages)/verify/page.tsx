import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import VerifyForm from "./VerifyForm"; // New Client Component

export default async function VerifyPage() {
  const cookieStore = await cookies();
  const emailRequestId = cookieStore.get("vrfy_email")?.value;
  const smsRequestId = cookieStore.get("vrfy_sms")?.value;

  if (!emailRequestId || !smsRequestId) {
    redirect("/sign-up?message=Verification session expired or invalid");
  }

  return (
    <VerifyForm emailRequestId={emailRequestId} smsRequestId={smsRequestId} />
  );
}
