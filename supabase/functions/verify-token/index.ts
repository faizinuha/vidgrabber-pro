import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { token, transaction_id } = await req.json();
    console.log("Verifying token:", token, "or transaction_id:", transaction_id);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // If transaction_id is provided, find the access token by donation order_id
    if (transaction_id) {
      // First check if donation exists
      const { data: donation, error: donationError } = await supabase
        .from("donations")
        .select("*")
        .eq("order_id", transaction_id)
        .single();

      if (donationError || !donation) {
        console.log("Donation not found for transaction_id:", transaction_id);
        return new Response(
          JSON.stringify({ valid: false, message: "Donasi tidak ditemukan. Pastikan transaction_id benar." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Find access token created around the same time as donation
      const { data: accessToken, error: tokenError } = await supabase
        .from("access_tokens")
        .select("*")
        .gte("expires_at", new Date().toISOString())
        .order("created_at", { ascending: false })
        .limit(1);

      if (tokenError || !accessToken || accessToken.length === 0) {
        console.log("No valid access token found");
        return new Response(
          JSON.stringify({ valid: false, message: "Token akses tidak ditemukan atau sudah expired." }),
          { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      console.log("Donation verified, returning access token");
      return new Response(
        JSON.stringify({ 
          valid: true, 
          message: "Donasi terverifikasi! Akses 4K aktif.",
          token: accessToken[0].token,
          supporter_name: donation.supporter_name
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Original token verification
    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, message: "Token atau Transaction ID diperlukan" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { data, error } = await supabase
      .from("access_tokens")
      .select("*")
      .eq("token", token)
      .gte("expires_at", new Date().toISOString())
      .single();

    if (error || !data) {
      console.log("Token not found or expired");
      return new Response(
        JSON.stringify({ valid: false, message: "Token invalid atau sudah expired" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Token valid:", data);
    return new Response(
      JSON.stringify({ valid: true, message: "Token valid" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error: any) {
    console.error("Error verifying token:", error);
    return new Response(
      JSON.stringify({ valid: false, error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
