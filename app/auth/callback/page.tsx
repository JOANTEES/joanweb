"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Navigation from "../../components/Navigation";

export default function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get("token");
        const refreshToken = searchParams.get("refreshToken");
        const success = searchParams.get("success");
        const error = searchParams.get("error");

        if (error) {
          setStatus("error");
          setMessage("Authentication failed. Please try again.");
          setTimeout(() => {
            router.replace("/login");
          }, 3000);
          return;
        }

        if (success === "true" && token && refreshToken) {
          // Store tokens in localStorage
          localStorage.setItem("authToken", token);
          localStorage.setItem("refreshToken", refreshToken);

          // Store token expiration time (24 hours from now)
          const expiresAt = Date.now() + 24 * 60 * 60 * 1000;
          localStorage.setItem("tokenExpiresAt", expiresAt.toString());

          setStatus("success");
          setMessage("Authentication successful! Redirecting...");

          // Redirect to the appropriate page
          setTimeout(() => {
            // Check if there's a redirect URL stored
            const redirectUrl = localStorage.getItem("redirectUrl");
            const redirectContext = localStorage.getItem("redirectContext");

            if (redirectUrl && redirectContext) {
              try {
                const context = JSON.parse(redirectContext);
                localStorage.removeItem("redirectUrl");
                localStorage.removeItem("redirectContext");

                // Smart redirect based on context
                switch (context.context) {
                  case "checkout":
                    router.replace("/checkout");
                    break;
                  case "cart":
                    router.replace(redirectUrl);
                    break;
                  case "account":
                    router.replace("/profile");
                    break;
                  case "protected-page":
                    router.replace(redirectUrl);
                    break;
                  default:
                    router.replace("/shop");
                    break;
                }
              } catch (error) {
                console.error("Error parsing redirect context:", error);
                router.replace("/shop");
              }
            } else {
              // Default redirect to shop page
              router.replace("/shop");
            }
          }, 2000);
        } else {
          setStatus("error");
          setMessage("Invalid authentication response. Please try again.");
          setTimeout(() => {
            router.replace("/login");
          }, 3000);
        }
      } catch (error) {
        console.error("Auth callback error:", error);
        setStatus("error");
        setMessage("An unexpected error occurred. Please try again.");
        setTimeout(() => {
          router.replace("/login");
        }, 3000);
      }
    };

    handleCallback();
  }, [searchParams, router]);

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

        {/* Callback Status */}
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

              {status === "loading" && (
                <>
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Authenticating...
                  </h1>
                  <p className="text-gray-300">
                    Please wait while we complete your authentication.
                  </p>
                </>
              )}

              {status === "success" && (
                <>
                  <div className="rounded-full h-12 w-12 bg-green-500 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-white"
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
                    Success!
                  </h1>
                  <p className="text-gray-300">{message}</p>
                </>
              )}

              {status === "error" && (
                <>
                  <div className="rounded-full h-12 w-12 bg-red-500 flex items-center justify-center mx-auto mb-4">
                    <svg
                      className="w-6 h-6 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Authentication Failed
                  </h1>
                  <p className="text-gray-300 mb-4">{message}</p>
                  <button
                    onClick={() => router.replace("/login")}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black py-2 px-6 rounded-lg font-semibold transition-colors duration-200"
                  >
                    Back to Login
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
