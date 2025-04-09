// @ts-ignore - Deno deployment handles this URL import
import { create } from "https://deno.land/x/djwt@v2.8/mod.ts";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST",
  "Access-Control-Allow-Headers": "Content-Type",
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "application/json",
      },
    });
  }

  try {
    const body = await req.json();
    const { action, channel, phoneNumber, emailAddress, request_id, code } =
      body;

    const applicationId = Deno.env.get("VONAGE_APPLICATION_ID");
    const privateKeyPem = Deno.env.get("VONAGE_PRIVATE_KEY");

    if (!applicationId || !privateKeyPem) {
      throw new Error("Missing Vonage credentials in environment variables");
    }

    // Process PEM key
    const pemContents = privateKeyPem
      .replace(/-----BEGIN PRIVATE KEY-----/g, "")
      .replace(/-----END PRIVATE KEY-----/g, "")
      .replace(/\s+/g, "");

    const privateKeyBuffer = new Uint8Array(
      atob(pemContents)
        .split("")
        .map((c) => c.charCodeAt(0)),
    );

    // Import private key
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      privateKeyBuffer,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"],
    );

    // Create JWT
    const token = await create(
      { alg: "RS256", typ: "JWT" }, // Vonage requires RS256 for private keys
      {
        application_id: applicationId,
        iat: Math.floor(Date.now() / 1000),
        jti: crypto.randomUUID(),
      },
      privateKey,
    );

    switch (action.toLowerCase()) {
      case "start": {
        if (!channel) {
          return new Response(
            JSON.stringify({ error: "Missing channel parameter" }),
            {
              status: 400,
              headers: {
                ...CORS_HEADERS,
                "Content-Type": "application/json",
              },
            },
          );
        }

        if (channel === "sms" && !phoneNumber) {
          return new Response(
            JSON.stringify({ error: "Missing phoneNumber for SMS channel" }),
            {
              status: 400,
              headers: {
                ...CORS_HEADERS,
                "Content-Type": "application/json",
              },
            },
          );
        }

        if (channel === "email" && !emailAddress) {
          return new Response(
            JSON.stringify({ error: "Missing emailAddress for Email channel" }),
            {
              status: 400,
              headers: {
                ...CORS_HEADERS,
                "Content-Type": "application/json",
              },
            },
          );
        }

        const workflow = [
          {
            channel: channel.toLowerCase(),
            to: channel === "sms" ? phoneNumber : emailAddress,
          },
        ];

        const response = await fetch("https://api.nexmo.com/v2/verify/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            brand: "Team SAN-e",
            workflow,
          }),
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        });
      }

      case "check": {
        const response = await fetch(
          `https://api.nexmo.com/v2/verify/${request_id}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ code }),
          },
        );

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: {
            ...CORS_HEADERS,
            "Content-Type": "application/json",
          },
        });
      }

      default: {
        return new Response(
          JSON.stringify({ error: "Invalid action. Use 'start' or 'check'" }),
          {
            status: 400,
            headers: {
              ...CORS_HEADERS,
              "Content-Type": "application/json",
            },
          },
        );
      }
    }
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : null,
      }),
      {
        status: 500,
        headers: {
          ...CORS_HEADERS,
          "Content-Type": "application/json",
        },
      },
    );
  }
});
