import { serve } from "https://deno.land/std@0.224.0/http/server.ts";

const PICA_API_URL = "https://api.picaos.com/v1/context";
const PICA_API_KEY = Deno.env.get("PICA_API_KEY") || "";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // You can change this to your domain later
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  // Preflight request (OPTIONS) — must respond!
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method not allowed", {
      status: 405,
      headers: corsHeaders,
    });
  }

  if (!PICA_API_KEY) {
    return new Response("PICA API key missing", {
      status: 500,
      headers: corsHeaders,
    });
  }

  try {
    const body = await req.json();

    const picaResponse = await fetch(PICA_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PICA_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!picaResponse.ok) {
      const errorText = await picaResponse.text();
      console.error("Pica API error:", picaResponse.status, errorText);
      return new Response(errorText, {
        status: picaResponse.status,
        headers: corsHeaders,
      });
    }

    const data = await picaResponse.json();
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Error calling Pica API:", err);
    return new Response("Internal server error", {
      status: 500,
      headers: corsHeaders,
    });
  }
});
