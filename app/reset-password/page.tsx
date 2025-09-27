"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContext";

function ResetPasswordContent() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<{ first_name: string } | null>(null);
  const [token, setToken] = useState("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const { resetPassword, verifyResetToken } = useAuth();

  useEffect(() => {
    const tokenParam = searchParams.get("token");

    if (!tokenParam) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    setToken(tokenParam);

    // Verify the reset token
    const verifyToken = async () => {
      try {
        const result = await verifyResetToken(tokenParam);
        if (result.success && result.user) {
          setUser(result.user as { first_name: string });
        } else {
          setError(result.message);
        }
      } catch (error) {
        console.error("Token verification error:", error);
        setError(
          "Failed to verify reset token. Please request a new password reset."
        );
      }
    };

    verifyToken();
  }, [searchParams, verifyResetToken]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!password.trim()) {
      setError("Password is required");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    try {
      const result = await resetPassword(token, password);
      if (result.success) {
        setSuccess(true);
        setTimeout(() => {
          router.replace("/login");
        }, 3000);
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <>
        {/* Hero Section with Background Video and Overlaid Navigation */}
        <section className="relative min-h-screen flex items-center overflow-hidden">
          {/* Background video */}
          <video
            className="absolute inset-0 w-full h-full object-cover blur-none sm:blur-sm"
            src="/hero.mp4"
            autoPlay
            loop
            muted
            playsInline
          />

          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-black/60" />

          {/* Navigation overlaid */}
          <Navigation transparent />

          {/* Success Message */}
          <div className="relative z-10 max-w-md w-full mx-auto px-4 py-20">
            <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 mb-4">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                    <Image
                      src="/logo.png"
                      alt="Joan Tees Logo"
                      width={40}
                      height={40}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-3xl font-bold text-white">JoanTee</span>
                </div>

                <div className="rounded-full h-16 w-16 bg-green-500 flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>

                <h1 className="text-2xl font-bold text-white mb-2">
                  Password Reset Successful!
                </h1>
                <p className="text-gray-300 mb-6">
                  Your password has been reset successfully. You can now log in
                  with your new password.
                </p>
                <p className="text-gray-400 text-sm">
                  Redirecting to login page...
                </p>
              </div>
            </div>
          </div>
        </section>
      </>
    );
  }

  return (
    <>
      {/* Hero Section with Background Video and Overlaid Navigation */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover blur-none sm:blur-sm"
          src="/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/60" />

        {/* Navigation overlaid */}
        <Navigation transparent />

        {/* Reset Password Form */}
        <div className="relative z-10 max-w-md w-full mx-auto px-4 py-20">
          <div className="bg-gray-800/90 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-gray-700">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="Joan Tees Logo"
                    width={40}
                    height={40}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-3xl font-bold text-white">JoanTee</span>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Reset Your Password
              </h1>
              {user && (
                <p className="text-gray-300">
                  Hello {user.first_name}, please enter your new password below.
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  New Password
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter your new password"
                  required
                  minLength={6}
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-300 mb-2"
                >
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Confirm your new password"
                  required
                  minLength={6}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !user}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 text-black py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                {isLoading ? "Resetting Password..." : "Reset Password"}
              </button>
            </form>

            <div className="text-center mt-6">
              <button
                type="button"
                onClick={() => router.replace("/login")}
                className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
              >
                Back to Login
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function ResetPassword() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
