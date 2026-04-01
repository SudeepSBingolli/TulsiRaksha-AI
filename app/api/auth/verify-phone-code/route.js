import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function normalizePhoneNumber(phone) {
  if (!phone.startsWith("+")) {
    return `+${phone}`;
  }
  return phone;
}

export async function POST(request) {
  try {
    const { phone, code } = await request.json();

    if (!phone || !code) {
      return new Response(
        JSON.stringify({ error: "Phone and code are required" }),
        { status: 400 }
      );
    }

    // Query the verification code
    const { data, error: queryError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("phone", normalizePhoneNumber(phone))
      .eq("type", "phone")
      .eq("code", code)
      .single();

    if (queryError || !data) {
      return new Response(
        JSON.stringify({ error: "Invalid verification code" }),
        { status: 400 }
      );
    }

    // Check if expired
    const now = new Date();
    if (new Date(data.expires_at) < now) {
      return new Response(
        JSON.stringify({ error: "Verification code has expired" }),
        { status: 400 }
      );
    }

    // Mark as verified
    const { error: updateError } = await supabase
      .from("verification_codes")
      .update({ verified: true })
      .eq("id", data.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ error: "Failed to verify code" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Phone verified successfully" 
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500 }
    );
  }
}
