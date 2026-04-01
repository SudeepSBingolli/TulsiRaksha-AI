import { getAdminClient } from "@/lib/supabase/admin";
import bcrypt from "bcrypt";

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
    const { email, phone, password, fingerprintEnabled } = await request.json();

    if (!password || password.length < 8) {
      return new Response(
        JSON.stringify({ error: "Password must be at least 8 characters" }),
        { status: 400 }
      );
    }

    if (!email && !phone) {
      return new Response(
        JSON.stringify({ error: "Either email or phone number is required" }),
        { status: 400 }
      );
    }

    const normalizedPhone = normalizePhoneNumber(phone);

    // Check if user already exists
    if (email) {
      const { data: existingUser } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("email", email)
        .single();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "Email already registered" }),
          { status: 400 }
        );
      }
    }

    if (phone) {
      const { data: existingUser } = await supabase
        .from("user_profiles")
        .select("id")
        .eq("phone", normalizedPhone)
        .single();

      if (existingUser) {
        return new Response(
          JSON.stringify({ error: "Phone number already registered" }),
          { status: 400 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user profile
    const { data: userProfile, error: profileError } = await supabase
      .from("user_profiles")
      .insert({
        email: email || null,
        phone: normalizedPhone,
        password_hash: hashedPassword,
        fingerprint_enabled: fingerprintEnabled || false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (profileError) {
      console.error("Profile creation error:", profileError);
      return new Response(
        JSON.stringify({ error: "Failed to create user profile" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Account created successfully",
        userId: userProfile.id
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
