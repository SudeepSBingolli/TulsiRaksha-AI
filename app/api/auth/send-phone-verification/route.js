import twilio from "twilio";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function normalizePhoneNumber(phone) {
  // Ensure phone number starts with +
  if (!phone.startsWith("+")) {
    return `+${phone}`;
  }
  return phone;
}

export async function POST(request) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone number is required" }),
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    console.log("Attempting to store verification code for phone:", normalizePhoneNumber(phone));

    // Store in database
    const { data, error: dbError } = await supabase.from("verification_codes").insert({
      phone: normalizePhoneNumber(phone),
      code: otp,
      type: "phone",
      expires_at: expiresAt.toISOString(),
      verified: false,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ 
          error: "Failed to generate verification code. Database error: " + dbError.message,
          details: dbError
        }),
        { status: 500 }
      );
    }

    // Send OTP via Twilio SMS
    try {
      const accountSid = requireEnv("TWILIO_ACCOUNT_SID");
      const authToken = requireEnv("TWILIO_AUTH_TOKEN");
      const twilioPhone = requireEnv("TWILIO_PHONE_FROM");

      const client = twilio(accountSid, authToken);

      await client.messages.create({
        body: `Your TulsiRaksha verification code is: ${otp}\n\nThis code expires in 10 minutes. Do not share it with anyone.`,
        from: twilioPhone,
        to: normalizePhoneNumber(phone),
      });
    } catch (smsError) {
      console.error("SMS sending error:", smsError);
      return new Response(
        JSON.stringify({ 
          error: "Verification code generated but OTP could not be sent. Check your Twilio configuration.",
          code: "SMS_SEND_FAILED"
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent to your phone" 
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
