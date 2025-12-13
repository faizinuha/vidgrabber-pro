import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface TrakteerWebhookPayload {
  supporter_name?: string;
  supporter_email?: string;
  supporter_avatar?: string;
  unit?: string;
  quantity?: number;
  price?: number;
  supporter_message?: string;
  transaction_id?: string;
  created_at?: string;
  net_amount?: number;
}

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Received Trakteer webhook request");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const payload: TrakteerWebhookPayload = await req.json();
    console.log("Webhook payload:", JSON.stringify(payload));

    // Calculate total amount
    const amount = payload.net_amount || (payload.price || 0) * (payload.quantity || 1);

    // Store donation in database
    const { data: donation, error: donationError } = await supabase
      .from("donations")
      .insert({
        supporter_name: payload.supporter_name || "Anonim",
        supporter_email: payload.supporter_email,
        amount: amount,
        message: payload.supporter_message,
        unit: payload.unit || "gulali",
        order_id: payload.transaction_id,
        verified: true,
      })
      .select()
      .single();

    if (donationError) {
      console.error("Error storing donation:", donationError);
      // If duplicate order_id, just return success
      if (donationError.code === "23505") {
        return new Response(
          JSON.stringify({ success: true, message: "Donation already processed" }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw donationError;
    }

    console.log("Donation stored:", donation);

    // Generate access token for 4K
    const token = crypto.randomUUID();
    const { error: tokenError } = await supabase
      .from("access_tokens")
      .insert({
        token: token,
        email: payload.supporter_email,
      });

    if (tokenError) {
      console.error("Error creating access token:", tokenError);
    } else {
      console.log("Access token created:", token);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Donation verified",
        token: token 
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );

  } catch (error: any) {
    console.error("Error processing webhook:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});