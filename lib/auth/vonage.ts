interface VonageRequest {
  action: "start" | "check";
  channel?: "email" | "sms";
  phoneNumber?: string;
  emailAddress?: string;
  request_id?: string;
  code?: string;
}

export async function callVonageAPI(payload: VonageRequest) {
  const VONAGE_EDGE_FUNCTION_URL = process.env.VONAGE_EDGE_FUNCTION_URL;

  return fetch(VONAGE_EDGE_FUNCTION_URL!, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).then((res) => res.json());
}
