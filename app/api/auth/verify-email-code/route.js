import { getAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  const supabase = getAdminClient();
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return new Response(
        JSON.stringify({ error: "Email and code are required" }),
        { status: 400 }
      );
    }

    // Query the verification code
    const { data, error: queryError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", email)
      .eq("type", "email")
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
        message: "Email verified successfully" 
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
