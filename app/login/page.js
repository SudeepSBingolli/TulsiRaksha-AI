"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [loginMethod, setLoginMethod] = useState("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [useFingerprint, setUseFingerprint] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      let identifier = "";
      if (loginMethod === "email") {
        if (!email) throw new Error("Email is required");
        identifier = email;
      } else {
        if (!phone) throw new Error("Phone number is required");
        identifier = phone;
      }

      if (useFingerprint) {
        // Try fingerprint authentication first
        await handleFingerprintLogin(identifier);
      } else {
        // Standard password authentication
        const response = await fetch("/api/auth/login-with-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            field: loginMethod === "email" ? "email" : "phone",
            value: identifier,
            password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Login failed");
        }

        setMessage("Login successful! Redirecting...");
        // Store user session
        localStorage.setItem("userId", data.userId);
        setTimeout(() => {
          router.push("/");
        }, 1500);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFingerprintLogin = async (identifier) => {
    try {
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge,
          timeout: 60000,
          userVerification: "preferred",
        },
      });

      if (!assertion) {
        throw new Error("Fingerprint authentication cancelled");
      }

      // Verify with backend
      const response = await fetch("/api/auth/login-with-fingerprint", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field: loginMethod === "email" ? "email" : "phone",
          value: identifier,
          assertion: assertion,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Fingerprint authentication failed");
      }

      setMessage("Login with fingerprint successful! Redirecting...");
      localStorage.setItem("userId", data.userId);
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
          <p className="text-gray-600 mb-8">Sign in to your TulsiRaksha account</p>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Login Method Tabs */}
            <div className="flex gap-4 mb-6">
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("email");
                  setPhone("");
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                  loginMethod === "email"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                📧 Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginMethod("phone");
                  setEmail("");
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-semibold transition ${
                  loginMethod === "phone"
                    ? "bg-green-500 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                📱 Phone
              </button>
            </div>

            {/* Email Input */}
            {loginMethod === "email" && (
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
            )}

            {/* Phone Input */}
            {loginMethod === "phone" && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="+1234567890"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
            )}

            {/* Password Input */}
            {!useFingerprint && (
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {/* Fingerprint Toggle */}
            <div className="flex items-center gap-2 p-3 bg-gray-100 rounded-lg">
              <input
                type="checkbox"
                id="fingerprint"
                checked={useFingerprint}
                onChange={(e) => setUseFingerprint(e.target.checked)}
                className="w-4 h-4"
              />
              <label htmlFor="fingerprint" className="text-gray-700 font-semibold cursor-pointer">
                👆 Use Fingerprint to Login
              </label>
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
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>

          <div className="mt-8 space-y-4 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-blue-500 hover:underline font-semibold">
                Sign Up
              </Link>
            </p>
            <Link href="/" className="text-gray-500 hover:underline text-sm">
              Continue as Guest
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


