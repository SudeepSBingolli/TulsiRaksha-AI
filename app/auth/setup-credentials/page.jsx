"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";

function SetupCredentialsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const email = searchParams.get("email");
  const phone = searchParams.get("phone");
  const verified = searchParams.get("verified");
  const identifier = email || phone;

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [setupFingerprint, setSetupFingerprint] = useState(false);
  const [fingerprintStatus, setFingerprintStatus] = useState("not-started");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");

  // Check password strength
  const checkPasswordStrength = (pwd) => {
    if (pwd.length < 8) {
      setPasswordStrength("weak");
      return;
    }
    if (/^[a-z]+$/.test(pwd)) {
      setPasswordStrength("weak");
      return;
    }
    if (/^[A-Z]+$/.test(pwd)) {
      setPasswordStrength("weak");
      return;
    }
    if (/^[0-9]+$/.test(pwd)) {
      setPasswordStrength("weak");
      return;
    }
    if (/[!@#$%^&*]/.test(pwd) && pwd.length >= 12) {
      setPasswordStrength("strong");
      return;
    }
    setPasswordStrength("medium");
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setPassword(pwd);
    checkPasswordStrength(pwd);
  };

  const handleSetupFingerprint = async () => {
    try {
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      if (!available) {
        setError("Fingerprint authentication is not available on this device");
        return;
      }

      // Create credential for fingerprint registration
      const challenge = new Uint8Array(32);
      crypto.getRandomValues(challenge);

      const credential = await navigator.credentials.create({
        publicKey: {
          challenge,
          rp: {
            name: "TulsiRaksha",
            id: window.location.hostname,
          },
          user: {
            id: new Uint8Array(Buffer.from(identifier)),
            name: identifier,
            displayName: identifier,
          },
          pubKeyCredParams: [
            {
              type: "public-key",
              alg: -7, // ES256
            },
          ],
          timeout: 60000,
          attestation: "direct",
          authenticatorSelection: {
            authenticatorAttachment: "platform",
            userVerification: "preferred",
          },
        },
      });

      if (credential) {
        setFingerprintStatus("completed");
        setSetupFingerprint(true);
        setMessage("Fingerprint registered successfully! ✓");
      }
    } catch (err) {
      if (err.name === "NotAllowedError") {
        setError("Fingerprint registration cancelled");
      } else {
        setError(`Failed to register fingerprint: ${err.message}`);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (setupFingerprint && fingerprintStatus !== "completed") {
      setError("Please complete fingerprint setup or skip it");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/create-user-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email || null,
          phone: phone || null,
          password,
          fingerprintEnabled: setupFingerprint && fingerprintStatus === "completed",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create account");
      }

      setMessage("Account created successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!verified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-lg shadow-lg p-8">
            <p className="text-center text-red-600 font-semibold">
              Access denied. Please verify your identity first.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Set Up Your Account</h1>
          <p className="text-gray-600 mb-8">
            Create a password and optionally set up fingerprint authentication
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Password Section */}
            <div className="bg-blue-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">🔐 Password Setup</h2>

              <div>
                <label className="block text-gray-700 font-semibold mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={handlePasswordChange}
                  required
                  placeholder="At least 8 characters"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {password && (
                  <div className="mt-2">
                    <div className="text-sm font-semibold mb-1">
                      Strength:{" "}
                      <span
                        className={
                          passwordStrength === "strong"
                            ? "text-green-600"
                            : passwordStrength === "medium"
                              ? "text-yellow-600"
                              : "text-red-600"
                        }
                      >
                        {passwordStrength ? passwordStrength.toUpperCase() : ""}
                      </span>
                    </div>
                    <div className="w-full bg-gray-300 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all ${
                          passwordStrength === "strong"
                            ? "w-full bg-green-500"
                            : passwordStrength === "medium"
                              ? "w-2/3 bg-yellow-500"
                              : "w-1/3 bg-red-500"
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-4">
                <label className="block text-gray-700 font-semibold mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="Re-enter password"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-red-600 text-sm mt-2">Passwords do not match</p>
                )}
                {confirmPassword && password === confirmPassword && (
                  <p className="text-green-600 text-sm mt-2">✓ Passwords match</p>
                )}
              </div>
            </div>

            {/* Fingerprint Section */}
            <div className="bg-green-50 p-6 rounded-lg">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">👆 Fingerprint Authentication</h2>
              <p className="text-gray-600 text-sm mb-4">
                Add an extra layer of security with fingerprint/biometric authentication
              </p>

              {fingerprintStatus === "not-started" && (
                <button
                  type="button"
                  onClick={handleSetupFingerprint}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-lg transition"
                >
                  Set Up Fingerprint
                </button>
              )}

              {fingerprintStatus === "completed" && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded text-center font-semibold">
                  ✓ Fingerprint registered
                </div>
              )}

              <button
                type="button"
                onClick={() => {
                  setSetupFingerprint(false);
                  setFingerprintStatus("skipped");
                }}
                className="w-full mt-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-3 px-4 rounded-lg transition"
              >
                Skip for Now
              </button>
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
              disabled={loading || !password || password !== confirmPassword}
              className={`w-full font-semibold py-3 px-4 rounded-lg transition ${
                loading || !password || password !== confirmPassword
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              }`}
            >
              {loading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <a href="/login" className="text-blue-500 hover:underline font-semibold">
                Sign In
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SetupCredentialsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center"><p className="text-gray-600">Loading...</p></div>}>
      <SetupCredentialsContent />
    </Suspense>
  );
}
