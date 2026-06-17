import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "*",
};

serve((req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }

  const now = new Date();
  const timestamp = now.toISOString();
  const readable = now.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "full",
    timeStyle: "medium",
  });

  const responseBody = JSON.stringify({
    status: "healthy",
    operational: true,
    runtime: "Deno / Edge Runtime",
    server_time_ist: readable,
    timestamp: timestamp,
  }, null, 2);

  return new Response(responseBody, { status: 200, headers });
});
