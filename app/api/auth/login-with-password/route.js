import { createClient } from "@supabase/supabase-js";
import bcrypt from "bcrypt";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function normalizePhoneNumber(phone) {
  if (!phone) return null;
  if (!phone.startsWith("+")) {
    return `+${phone}`;
  }
  return phone;
}

export async function POST(request) {
  try {
    const { field, value, password } = await request.json();

    if (!value || !password) {
      return new Response(
        JSON.stringify({ error: "Identifier and password are required" }),
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
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401 }
      );
    }

    // Verify password
    const passwordMatch = await bcrypt.compare(password, user.password_hash);

    if (!passwordMatch) {
      return new Response(
        JSON.stringify({ error: "Invalid credentials" }),
        { status: 401 }
      );
    }

    // Log the login
    await supabase.from("user_login_logs").insert({
      user_id: user.id,
      login_method: "password",
      login_time: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Login successful",
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
