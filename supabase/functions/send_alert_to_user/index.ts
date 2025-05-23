import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  try {
    // Create Supabase client using secrets
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Parse request payload
    const { type, weatherType } = await req.json();

    // Query nearby users
    const { data: users, error: usersError } = await supabase
      .from("users_identifier")
      .select("*");

    if (usersError) {
      console.error("Error querying users:", usersError);
      return new Response("Failed to query nearby users", { status: 500 });
    }

    if (!users || users.length === 0) {
      return new Response("No nearby users found.");
    }

    // Send Expo push notifications to each
    for (const user of users) {
      try {
        const expoResponse = await fetch("https://exp.host/--/api/v2/push/send", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to: user.push_token,
            title: `Weather Alert!`,
            body: `There is an ${weatherType === "heat" ? "Extreme Heat" : "Extreme Rain"} detected at your location.`,
            data: {
              type: type,
              weatherType: weatherType,
            },
            priority: "high",
            sound: "default",
            channelId: "default",
            vibrate: [0, 250, 250, 250],
            badge: 1,
            ttl: 0,
          }),
        });

        if (!expoResponse.ok) {
          const errorBody = await expoResponse.json();
          console.error("Error sending alert to", user.push_token, ":", errorBody);
        }
      } catch (error) {
        console.error("Error sending alert:", error);
      }
    }

    return new Response("Alert sent to nearby users");
  } catch (error) {
    console.error("An unexpected error occurred:", error);
    return new Response("Internal server error", { status: 500 });
  }
});