export interface VonageRequest {
  action: "start" | "check";
  channel?: "email" | "sms";
  phoneNumber?: string;
  emailAddress?: string;
  request_id?: string;
  code?: string;
}

export async function callVonageAPI(payload: VonageRequest) {
  const VONAGE_EDGE_FUNCTION_URL =
    process.env.NEXT_PUBLIC_VONAGE_EDGE_FUNCTION_URL;

  console.log("Making Vonage API request:", {
    url: VONAGE_EDGE_FUNCTION_URL,
    payload,
  });

  try {
    const response = await fetch(VONAGE_EDGE_FUNCTION_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    console.log("Received Vonage API response:", {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
    });

    const data = await response.json();
    console.log("Vonage API response data:", data);

    if (!response.ok) {
      console.error("Vonage API error response:", data);
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Vonage API call failed:", error);
    throw new Error("Verification service unavailable");
  }
}
