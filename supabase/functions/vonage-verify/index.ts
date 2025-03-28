// import { createClient } from "@supabase/supabase-js";

// const supabase = createClient(
//   Deno.env.get("SUPABASE_URL") ?? "",
//   Deno.env.get("SUPABASE_ANON_KEY") ?? "",
// );

Deno.serve(async (req: Request) => {
  try {
    // First parse the request body
    const body = await req.json();
    const { action, phoneNumber, requestId, code } = body;

    const auth = btoa(
      `${Deno.env.get("VONAGE_API_KEY")}:${Deno.env.get("VONAGE_API_SECRET")}`,
    );

    switch (
      action.toLowerCase() // Normalize action casing
    ) {
      case "start": {
        const response = await fetch("https://api.nexmo.com/v2/verify/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${auth}`,
          },
          body: JSON.stringify({
            brand: "Team SAN-e",
            workflow: [
              {
                channel: "sms",
                to: phoneNumber,
              },
            ],
          }),
        });

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      case "check": {
        const response = await fetch(
          `https://api.nexmo.com/v2/verify/${requestId}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${auth}`,
            },
            body: JSON.stringify({ code }),
          },
        );

        const data = await response.json();
        return new Response(JSON.stringify(data), {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        });
      }

      default: {
        return new Response(
          JSON.stringify({ error: "Invalid action. Use 'start' or 'check'" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
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
        headers: { "Content-Type": "application/json" },
      },
    );
  }
});
