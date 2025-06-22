import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

interface RequestBody {
  query: string;
}

interface ErrorResponse {
  error: string;
  status: number;
}

serve(async (req) => {
  // Set up CORS headers
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };

  // Handle preflight OPTIONS request
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    // Check for required environment variables
    const picaSecretKey = Deno.env.get("PICA_SECRET_KEY");
    const picaFirecrawlConnectionKey = Deno.env.get("PICA_FIRECRAWL_CONNECTION_KEY");
    
    if (!picaSecretKey) {
      throw { error: "PICA_SECRET_KEY environment variable is not set", status: 500 };
    }
    
    if (!picaFirecrawlConnectionKey) {
      throw { error: "PICA_FIRECRAWL_CONNECTION_KEY environment variable is not set", status: 500 };
    }

    // Parse request body
    const requestData: RequestBody = await req.json();
    
    if (!requestData.query) {
      throw { error: "Query parameter is required", status: 400 };
    }

    // Make request to Pica API
    const response = await fetch(
      "https://api.picaos.com/v1/passthrough/v1/search",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": picaSecretKey,
          "x-pica-connection-key": picaFirecrawlConnectionKey,
          "x-pica-action-id": "conn_mod_def::GClH-wc_XMo::Lm5ew3DCSp2L1yETSndVHA",
        },
        body: JSON.stringify({
          query: requestData.query,
        }),
      }
    );

    // Check if the response is successful
    if (!response.ok) {
      throw { 
        error: `Pica API error: ${response.status}`, 
        status: response.status 
      };
    }

    // Parse and return the response
    const data = await response.json();
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error in pica-search function:", error);
    
    const errorResponse: ErrorResponse = {
      error: error.error || "An unexpected error occurred",
      status: error.status || 500,
    };
    
    return new Response(JSON.stringify(errorResponse), {
      status: errorResponse.status,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  }
});