"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;
    async function checkSession() {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (active && session?.user) router.replace("/");
    }
    checkSession();
    return () => {
      active = false;
    };
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!email) throw new Error("Email is required");
      if (!password || password.length < 6)
        throw new Error("Password must be at least 6 characters");

      if (mode === "signup") {
        if (password !== confirmPassword)
          throw new Error("Passwords do not match");

        const { error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
          },
        });
        if (signUpError) throw signUpError;

        setMessage(
          "Account created! Check your email for the confirmation link, then log in."
        );
      } else {
        const { error: signInError } =
          await supabase.auth.signInWithPassword({ email, password });
        if (signInError) throw signInError;
        router.push("/");
      }
    } catch (err) {
      setError(err.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-green-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-5xl flex flex-col lg:flex-row items-stretch gap-0 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-200/30 border border-gray-100">

        {/* ══════════════════════════════════════
            LEFT BOX — Login / Sign Up Form
        ══════════════════════════════════════ */}
        <div className="w-full lg:w-1/2 bg-white p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-200/50 overflow-hidden">
              <Image
                src="/logo.jpeg"
                alt="TulsiRaksha Logo"
                width={32}
                height={32}
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tight">
              Tulsi<span className="text-emerald-600">Raksha</span>
            </span>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            {mode === "signin" ? "Welcome back" : "Create account"}
          </h1>
          <p className="text-base sm:text-lg text-gray-500 mb-8">
            {mode === "signin"
              ? "Sign in to access your health dashboard."
              : "Sign up to get started with TulsiRaksha AI."}
          </p>

          {/* Tab toggle */}
          <div className="grid grid-cols-2 gap-1.5 p-1.5 bg-gray-50 border border-gray-100 rounded-2xl mb-8">
            {["signin", "signup"].map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError("");
                  setMessage("");
                }}
                className={`py-3 rounded-xl text-base font-bold transition-all duration-200 ${
                  mode === m
                    ? "bg-white text-emerald-700 shadow-sm border border-gray-100"
                    : "text-gray-400 hover:text-gray-700"
                }`}
              >
                {m === "signin" ? "Sign In" : "Sign Up"}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl text-base font-medium text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all placeholder:text-gray-300"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-5 py-4 border border-gray-200 rounded-2xl text-base font-medium text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all placeholder:text-gray-300"
                placeholder="Min. 6 characters"
              />
            </div>

            {mode === "signup" && (
              <div>
                <label className="block text-sm font-bold uppercase tracking-wider text-gray-400 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 border border-gray-200 rounded-2xl text-base font-medium text-gray-800 bg-gray-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-300 focus:border-emerald-400 transition-all placeholder:text-gray-300"
                  placeholder="Re-enter your password"
                />
              </div>
            )}

            {error && (
              <div className="rounded-2xl bg-red-50 border border-red-200 text-red-700 px-5 py-4 text-base font-medium flex items-center gap-2">
                <span>⚠️</span> {error}
              </div>
            )}

            {message && (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 px-5 py-4 text-base font-medium flex items-center gap-2">
                <span>✅</span> {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold py-4 px-6 rounded-2xl text-lg transition-all duration-200 hover:shadow-lg hover:shadow-emerald-200/50 active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg
                    className="w-5 h-5 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8z"
                    />
                  </svg>
                  Please wait…
                </>
              ) : mode === "signin" ? (
                "Sign In"
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-base text-gray-400 hover:text-emerald-600 font-medium transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

        {/* ══════════════════════════════════════
            RIGHT BOX — Logo
        ══════════════════════════════════════ */}
        <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-emerald-50 via-emerald-100/30 to-white items-center justify-center p-12 relative overflow-hidden">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-emerald-200/25 blur-3xl" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 rounded-full bg-emerald-100/30 blur-3xl" />

          <div className="relative z-10 flex flex-col items-center text-center">
            {/* Large Logo */}
            <div className="w-52 h-52 xl:w-60 xl:h-60 rounded-3xl bg-white border-2 border-emerald-100 shadow-xl shadow-emerald-200/30 flex items-center justify-center overflow-hidden mb-8 hover:scale-105 transition-transform duration-500">
              <Image
                src="/logo.jpeg"
                alt="TulsiRaksha AI"
                width={220}
                height={220}
                className="w-44 h-44 xl:w-52 xl:h-52 object-contain"
                priority
              />
            </div>

            <h2 className="text-3xl xl:text-4xl font-extrabold text-gray-900 tracking-tight mb-3">
              Tulsi<span className="text-emerald-600">Raksha</span> AI
            </h2>
            <p className="text-lg font-bold text-emerald-700 mb-3">
              Never Alone. Always Cared For.
            </p>
            <p className="text-base text-gray-400 leading-relaxed max-w-xs">
              Health monitoring, voice guidance, and family support — all in one
              place.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}