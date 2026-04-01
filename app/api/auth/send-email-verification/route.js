import nodemailer from "nodemailer";
import crypto from "crypto";
import { getAdminClient } from "@/lib/supabase/admin";

export async function POST(request) {
  const supabase = getAdminClient();
  // Configure your email service (Gmail, SendGrid, etc.)
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE || "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  try {
    const { email } = await request.json();

    if (!email || !email.includes("@")) {
      return new Response(
        JSON.stringify({ error: "Valid email is required" }),
        { status: 400 }
      );
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Store in database
    const { error: dbError } = await supabase.from("verification_codes").insert({
      email,
      code,
      type: "email",
      expires_at: expiresAt.toISOString(),
      verified: false,
    });

    if (dbError) {
      console.error("Database error:", dbError);
      return new Response(
        JSON.stringify({ error: "Failed to generate verification code" }),
        { status: 500 }
      );
    }

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "TulsiRaksha - Email Verification Code",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px;">
            <h1 style="color: #10b981;">Welcome to TulsiRaksha</h1>
            <p>Your email verification code is:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="text-align: center; letter-spacing: 5px; color: #1f2937;">
                ${code}
              </h2>
            </div>
            <p style="color: #6b7280;">This code expires in 10 minutes.</p>
            <p style="color: #9ca3af; font-size: 12px;">
              If you didn't request this code, please ignore this email.
            </p>
          </div>
        `,
      });
    } catch (emailError) {
      console.error("Email sending error:", emailError);
      // Don't fail the request, just indicate that email couldn't be sent
      return new Response(
        JSON.stringify({ 
          error: "Verification code generated but email could not be sent. Check your email configuration.",
          code: "EMAIL_SEND_FAILED"
        }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Verification code sent to your email" 
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
