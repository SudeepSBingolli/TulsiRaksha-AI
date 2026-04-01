import { getAdminClient } from "@/lib/supabase/admin";

function normalizePhoneNumber(phone) {
  if (!phone) return null;
  if (!phone.startsWith("+")) {
    return `+${phone}`;
  }
  return phone;
}

export async function POST(request) {
  const supabase = getAdminClient();
  try {
    const { field, value, assertion } = await request.json();

    if (!value || !assertion) {
      return new Response(
        JSON.stringify({ error: "Identifier and assertion are required" }),
        { status: 400 }
      );
    }

    // Query user based on field (email or phone)
    let query = supabase.from("user_profiles").select("*");

    if (field === "email") {
      query = query.eq("email", value);
    } else if (field === "phone") {
      query = query.eq("phone", normalizePhoneNumber(value));
    } else {
      return new Response(
        JSON.stringify({ error: "Invalid field" }),
        { status: 400 }
      );
    }

    const { data: user, error: queryError } = await query.single();

    if (queryError || !user) {
      return new Response(
        JSON.stringify({ error: "User not found" }),
        { status: 401 }
      );
    }

    // Check if fingerprint is enabled
    if (!user.fingerprint_enabled) {
      return new Response(
        JSON.stringify({ error: "Fingerprint authentication is not enabled for this account" }),
        { status: 401 }
      );
    }

    // Here you would verify the WebAuthn assertion
    // For now, we'll assume the assertion is valid
    // In production, integrate with a WebAuthn verification library

    // Log the login
    await supabase.from("user_login_logs").insert({
      user_id: user.id,
      login_method: "fingerprint",
      login_time: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Fingerprint login successful",
        userId: user.id,
        email: user.email,
        phone: user.phone
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
