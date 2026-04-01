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
              Don't have an account?{" "}
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

        setMessage(raw);
      }
    } finally {
      setLoading(false);
    }
  };

  const simulateBiometricLogin = (method) => {
    setMessage(`${method} login will be available soon. Email login is active now.`);
  };

  return (
    <main className="min-h-screen bg-[#f6fbf7] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-emerald-100 p-7 sm:p-8">
        <p className="text-sm font-semibold text-emerald-600">TulsiRaksha AI</p>
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2">Simple Login</h1>
        <p className="text-gray-500 mt-2 text-base">Sign in to continue health monitoring.</p>

        <div className="flex gap-2 mt-6 bg-emerald-50 p-1 rounded-2xl">
          <button
            onClick={() => setMode("signin")}
            className={`flex-1 py-3 rounded-xl text-base font-semibold transition ${
              mode === "signin" ? "bg-white text-emerald-700 shadow" : "text-gray-500"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`flex-1 py-3 rounded-xl text-base font-semibold transition ${
              mode === "signup" ? "bg-white text-emerald-700 shadow" : "text-gray-500"
            }`}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleAuth} className="mt-5 space-y-4">
          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-lg focus:border-emerald-400"
              placeholder="appa@example.com"
            />
          </label>

          <label className="block">
            <span className="text-sm font-semibold text-gray-700">Password</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-2xl border border-gray-200 px-4 py-3 text-lg focus:border-emerald-400"
              placeholder="******"
            />
          </label>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white py-4 text-lg font-bold transition-transform active:scale-[0.98]"
          >
            {loading ? "Please wait..." : mode === "signin" ? "Login" : "Create account"}
          </button>
        </form>

        <p className="text-sm font-semibold text-gray-600 mt-6">Biometric Login (Demo)</p>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <button
            onClick={() => simulateBiometricLogin("Face")}
            className="rounded-xl border border-gray-200 py-3 text-sm font-semibold hover:bg-gray-50"
          >
            Face
          </button>
          <button
            onClick={() => simulateBiometricLogin("Fingerprint")}
            className="rounded-xl border border-gray-200 py-3 text-sm font-semibold hover:bg-gray-50"
          >
            Fingerprint
          </button>
          <button
            onClick={() => simulateBiometricLogin("Voice")}
            className="rounded-xl border border-gray-200 py-3 text-sm font-semibold hover:bg-gray-50"
          >
            Voice
          </button>
        </div>

        {message && (
          <p className={`mt-4 text-sm font-medium ${showDbFix ? "text-amber-700" : "text-emerald-700"}`}>
            {message}
          </p>
        )}

        {showDbFix && (
          <div className="mt-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
            <p className="font-bold mb-1">Quick fix in Supabase:</p>
            <p>1. Open Authentication → Settings and keep Email auth enabled.</p>
            <p>2. In SQL Editor, create any missing profile table/trigger dependencies.</p>
            <p>3. Retry Sign Up.</p>
          </div>
        )}

        <Link
          href="/"
          className="inline-flex mt-4 px-4 py-2 rounded-xl border border-emerald-200 bg-emerald-50 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
        >
          Continue in Offline Mode
        </Link>

        <Link href="/" className="inline-block mt-5 text-sm font-semibold text-emerald-700">
          Back to Dashboard
        </Link>
      </div>
    </main>
  );
}
