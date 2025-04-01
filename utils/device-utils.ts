import { headers } from "next/headers";
import { v5 as uuidv5 } from "uuid";

export async function detectDeviceType(): Promise<"mobile" | "desktop"> {
  const headersList = await headers();
  const userAgent = headersList.get("user-agent") || "";
  return /Mobile|Android|iP(hone|od)|Windows Phone/i.test(userAgent)
    ? "mobile"
    : "desktop";
}

export async function getClientFingerprint(): Promise<string> {
  const headersList = await headers();
  return uuidv5(
    [
      headersList.get("user-agent"),
      headersList.get("accept-language"),
      headersList.get("x-forwarded-for"),
    ].join("|"),
    process.env.FINGERPRINT_NAMESPACE!,
  );
}
