Deno.serve(async (req: Request) => {
  try {
    const body = await req.json();
    const { action, channel, phoneNumber, emailAddress, request_id, code } =
      body;

    const auth = btoa(
      `${Deno.env.get("VONAGE_API_KEY")}:${Deno.env.get("VONAGE_API_SECRET")}`,
    );

    switch (action.toLowerCase()) {
      case "start": {
        // Validate required parameters
        if (!channel) {
          return new Response(
            JSON.stringify({ error: "Missing channel parameter" }),
            { status: 400, headers: { "Content-Type": "application/json" } },
          );
        }

        // Validate recipient based on channel
        if (channel === "sms" && !phoneNumber) {
          return new Response(
            JSON.stringify({ error: "Missing phoneNumber for SMS channel" }),
            { status: 400 },
          );
        }

        if (channel === "email" && !emailAddress) {
          return new Response(
            JSON.stringify({ error: "Missing emailAddress for Email channel" }),
            { status: 400 },
          );
        }

        // Build workflow
        const workflow = [{
          channel: channel.toLowerCase(),
          to: channel === "sms" ? phoneNumber : emailAddress,
        }];

        const response = await fetch("https://api.nexmo.com/v2/verify/", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Basic ${auth}`,
          },
          body: JSON.stringify({
            brand: "Team SAN-e",
            workflow,
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
          `https://api.nexmo.com/v2/verify/${request_id}`,
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
