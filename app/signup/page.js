"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [method, setMethod] = useState(null);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/send-email-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification email");
      }

      setMessage("Verification email sent! Check your inbox.");
      setTimeout(() => {
        router.push(`/auth/verify-email?email=${encodeURIComponent(email)}`);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/send-phone-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send verification code");
      }

      setMessage("Verification code sent to your phone!");
      setTimeout(() => {
        router.push(`/auth/verify-phone?phone=${encodeURIComponent(phone)}`);
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (method === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              Create Account
            </h1>
            <p className="text-gray-600 text-center mb-8">
              Choose how you&apos;d like to sign up
            </p>

            <div className="space-y-4">
              <button
                onClick={() => setMethod("email")}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                📧 Sign up with Email
              </button>
              <button
                onClick={() => setMethod("phone")}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition"
              >
                📱 Sign up with Phone
              </button>
            </div>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <Link href="/login" className="text-blue-500 hover:underline font-semibold">
                  Sign In
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (method === "email") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <button
              onClick={() => setMethod(null)}
              className="text-blue-500 hover:underline mb-4 flex items-center gap-2"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">Email Signup</h1>
            <p className="text-gray-600 mb-8">
              Enter your email to verify your identity
            </p>

            <form onSubmit={handleEmailSignup} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 hover:bg-blue-600 text-white"
                }`}
              >
                {loading ? "Sending..." : "Send Verification Email"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  if (method === "phone") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <button
              onClick={() => setMethod(null)}
              className="text-blue-500 hover:underline mb-4 flex items-center gap-2"
            >
              ← Back
            </button>

            <h1 className="text-3xl font-bold text-gray-800 mb-2">Phone Signup</h1>
            <p className="text-gray-600 mb-8">
              Enter your phone number to receive a verification code
            </p>

            <form onSubmit={handlePhoneSignup} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Phone Number (with country code)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+1234567890 or +919876543210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Include country code (e.g., +1 for USA, +91 for India)
                </p>
              </div>

              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}

              {message && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  {message}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`w-full font-semibold py-3 px-4 rounded-lg transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-green-500 hover:bg-green-600 text-white"
                }`}
              >
                {loading ? "Sending..." : "Send Verification Code"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
