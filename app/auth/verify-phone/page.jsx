"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, Suspense } from "react";

function VerifyPhoneContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const phone = searchParams.get("phone");
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes

  useEffect(() => {
    const interval = setInterval(() => {
      setTimer((t) => (t > 0 ? t - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/verify-phone-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code: verificationCode }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Verification failed");
      }

      setMessage("Phone verified! Redirecting to password setup...");
      setTimeout(() => {
        router.push(
          `/auth/setup-credentials?phone=${encodeURIComponent(phone)}&verified=true`
        );
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/auth/send-phone-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      if (!response.ok) {
        throw new Error("Failed to resend code");
      }

      setMessage("New verification code sent!");
      setTimer(300);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Verify Phone</h1>
          <p className="text-gray-600 mb-8">
            We sent a verification code to <strong>{phone}</strong>
          </p>

          <form onSubmit={handleVerify} className="space-y-4">
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                Verification Code
              </label>
              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                maxLength="6"
                placeholder="000000"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl tracking-widest font-bold"
              />
              <p className="text-sm text-gray-500 mt-2 text-center">
                Code expires in {formatTime(timer)}
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
              disabled={loading || verificationCode.length !== 6}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition ${
                loading || verificationCode.length !== 6
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600 text-white"
              }`}
            >
              {loading ? "Verifying..." : "Verify Phone"}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 mb-4">Didn&apos;t receive the code?</p>
            <button
              onClick={handleResendCode}
              disabled={loading || timer > 240}
              className="text-green-500 hover:underline font-semibold disabled:text-gray-400"
            >
              Resend Code {timer <= 240 && `(${formatTime(timer)})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


export default function VerifyPhonePage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 flex items-center justify-center"><p className="text-gray-600">Loading...</p></div>}>
      <VerifyPhoneContent />
    </Suspense>
  );
}
