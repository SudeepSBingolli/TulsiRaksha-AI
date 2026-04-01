"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showDbFix, setShowDbFix] = useState(false);

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setShowDbFix(false);

    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        setMessage("Welcome back. You are safe ❤️");
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;
        setMessage("Account created. Please check your email if verification is enabled.");
      }

      router.push("/");
    } catch (error) {
      const raw = error?.message || "Authentication failed. Please try again.";
      if (raw.toLowerCase().includes("database error saving new user")) {
        setShowDbFix(true);
        setMessage(
          "Sign-up failed due to Supabase Auth database trigger settings. Use Sign In for existing accounts or apply the quick Supabase fix below."
        );
      } else {
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
