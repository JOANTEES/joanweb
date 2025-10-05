"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import {
  CreditCard,
  MapPin,
  User,
  ArrowLeft,
  ShoppingCart,
  Plus,
  Minus,
  X,
  Truck,
  Store,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import PaymentMethodSelector from "../components/PaymentMethodSelector";

export default function Checkout() {
  const { isAuthenticated, loading, setRedirectUrl, user } = useAuth();
  const {
    cart,
    items,
    totals,
    clearCart,
    updateQuantity,
    removeFromCart,
    selectedPickupLocation,
    selectedDeliveryAddressId,
    selectedDeliveryAddress,
  } = useCart();
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerNotes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<"online">("online"); // "on_delivery" and "on_pickup" commented out
  const [isPaymentSuccess, setIsPaymentSuccess] = useState(false);
  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
  const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "";

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Store current URL for redirect after login with checkout context
      setRedirectUrl("/checkout", "checkout");
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, setRedirectUrl]);

  // Guard: ensure an applied location exists before proceeding on checkout
  useEffect(() => {
    if (loading || !isAuthenticated) return;
    if (!cart?.deliveryMethod) return;
    if (cart.deliveryMethod === "delivery" && !selectedDeliveryAddressId) {
      router.replace("/cart");
    }
    if (cart.deliveryMethod === "pickup" && !selectedPickupLocation) {
      router.replace("/cart");
    }
  }, [
    loading,
    isAuthenticated,
    cart?.deliveryMethod,
    selectedDeliveryAddressId,
    selectedPickupLocation,
    router,
  ]);

  // Preload Paystack script for instant payment opening
  useEffect(() => {
    if (paymentMethod === "online" && PAYSTACK_PUBLIC_KEY) {
      // Check if script is already loaded
      if (document.querySelector('script[src*="paystack"]')) {
        return;
      }

      // Preload Paystack script immediately
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      script.async = false;
      script.onload = () => {
        console.log("[Paystack] Script preloaded successfully");
      };
      script.onerror = () => {
        console.error("[Paystack] Failed to preload script");
      };
      document.head.appendChild(script);
    }
  }, [paymentMethod, PAYSTACK_PUBLIC_KEY]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePaymentMethodChange = (
    method: "online" // "on_delivery" and "on_pickup" commented out
  ) => {
    setPaymentMethod(method);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Process payment in background - no loading state, completely instant
    processPaymentInBackground();
  };

  const processPaymentInBackground = async () => {
    try {
      // Preconditions
      if (cart?.deliveryMethod === "delivery") {
        // Require a valid delivery address selection
        if (!selectedDeliveryAddressId) {
          alert("Please select a delivery address before continuing.");
          return;
        }
      }

      // Create order with backend API
      const orderData: Record<string, unknown> = {
        paymentMethod: paymentMethod,
        deliveryMethod: cart?.deliveryMethod || "delivery",
        customerNotes: formData.customerNotes || "No additional notes",
      };

      if (cart?.deliveryMethod === "pickup") {
        if (!selectedPickupLocation?.id) {
          alert("Please select a pickup location to continue.");
          return;
        }
        orderData.pickupLocationId = Number(selectedPickupLocation.id);
      } else if (cart?.deliveryMethod === "delivery") {
        if (!selectedDeliveryAddressId) {
          alert("Please select a delivery address to continue.");
          return;
        }
        orderData.deliveryAddressId = Number(selectedDeliveryAddressId);
        // Per-order maps link override if an explicit link exists on the selected address
        if (selectedDeliveryAddress?.googleMapsLink) {
          (orderData as { locationLink?: string }).locationLink =
            selectedDeliveryAddress.googleMapsLink;
        }
      }

      const authToken =
        typeof window !== "undefined"
          ? localStorage.getItem("authToken")
          : null;
      console.log("[Checkout] Creating order", {
        apiBase: API_BASE_URL,
        deliveryMethod: orderData.deliveryMethod,
        hasAddressId: !!orderData.deliveryAddressId,
        hasPickupId: !!orderData.pickupLocationId,
        paymentMethod,
        hasAuthToken: !!authToken,
      });

      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify(orderData),
      });

      const contentType = response.headers.get("content-type") || "";
      const data = contentType.includes("application/json")
        ? await response.json()
        : { success: false, message: await response.text() };
      console.log("[Checkout] Create order response", {
        status: response.status,
        ok: response.ok,
        data,
      });

      if (data.success) {
        if (paymentMethod === "online") {
          // Support both new checkout-session flow and legacy order-id flow
          const orderId: string | number | undefined =
            data.order?.id || data.data?.orderId;
          const sessionId: string | number | undefined =
            data.session?.id || data.data?.sessionId;

          let initEndpoint = "";
          let initBody: Record<string, unknown> | undefined = undefined;
          if (sessionId) {
            initEndpoint = `${API_BASE_URL}/payments/paystack/initialize-session`;
            initBody = { sessionId };
          } else if (orderId) {
            initEndpoint = `${API_BASE_URL}/orders/${orderId}/pay/initialize`;
          } else {
            // Backend created a session but didn't include identifiers
            alert(
              data.message ||
                "Checkout session created. Initialize Paystack to proceed with payment."
            );
            return;
          }

          // Initialize Paystack
          console.log("[Paystack] Initializing payment", {
            initEndpoint,
            hasSessionId: !!sessionId,
            hasOrderId: !!orderId,
            hasAuthToken: !!authToken,
            body: initBody,
          });
          console.log("[Paystack] User context check:", {
            user,
            userEmail: user?.email,
            isAuthenticated,
          });
          const initRes = await fetch(initEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${authToken}`,
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
            body: initBody ? JSON.stringify(initBody) : undefined,
          });
          const initContentType = initRes.headers.get("content-type") || "";
          const initData = initContentType.includes("application/json")
            ? await initRes.json()
            : { success: false, message: await initRes.text() };
          console.log("[Paystack] Init response", {
            status: initRes.status,
            ok: initRes.ok,
            initData,
          });
          console.log("[Paystack] Backend email data:", {
            backendEmail: initData?.data?.email,
            frontendUserEmail: user?.email,
          });
          if (!initRes.ok || !initData?.data) {
            alert(initData?.message || "Failed to initialize payment");
            return;
          }

          const reference: string | undefined = initData?.data?.reference;
          const authorizationUrl: string | undefined =
            initData?.data?.authorization_url;
          const amountFromSession: number | undefined = data.session?.amount;
          const orderTotalAmount: number = Number(
            amountFromSession ??
              data?.order?.totals?.totalAmount ??
              totals.total
          );
          const inlineAmountKobo: number = Number(
            initData?.data?.amount ?? Math.round(orderTotalAmount * 100)
          );

          // Persist debug breadcrumbs across redirects
          const persistPaystackDebug = (
            event: string,
            extra?: Record<string, unknown>
          ) => {
            try {
              const maskedKey = PAYSTACK_PUBLIC_KEY
                ? `${PAYSTACK_PUBLIC_KEY.slice(
                    0,
                    6
                  )}...${PAYSTACK_PUBLIC_KEY.slice(-4)}`
                : undefined;
              const payload = {
                event,
                timestamp: new Date().toISOString(),
                hasPublicKey: !!PAYSTACK_PUBLIC_KEY,
                maskedPublicKey: maskedKey,
                hasReference: !!reference,
                hasAuthorizationUrl: !!authorizationUrl,
                amountKobo: Math.round(orderTotalAmount * 100),
                ...extra,
              };
              sessionStorage.setItem("paystack_debug", JSON.stringify(payload));
            } catch {
              // ignore storage errors silently
            }
          };

          // Helper to open inline modal
          type PaystackGlobal = {
            PaystackPop?: {
              setup?: (
                config: Record<string, unknown>
              ) => { openIframe: () => void } | undefined;
            };
          };
          const openInline = () => {
            console.log("[Paystack] Attempting inline modal with:", {
              hasPublicKey: !!PAYSTACK_PUBLIC_KEY,
              hasReference: !!reference,
              amountKobo: inlineAmountKobo,
              currency: "GHS",
            });
            console.log("[Paystack] Using reference:", reference);
            console.log("[Paystack] User data:", {
              user,
              userEmail: user?.email,
            });
            const w = window as unknown as PaystackGlobal;
            const handler = w.PaystackPop?.setup?.({
              key: PAYSTACK_PUBLIC_KEY,
              email: user?.email || "customer@example.com",
              amount: inlineAmountKobo,
              currency: "GHS",
              ref: reference,
              onClose: () => {
                console.warn("[Paystack] Inline modal closed by user");
              },
              callback: (paystackResponse: unknown) => {
                console.log(
                  "[Paystack] Inline modal callback fired (success)",
                  paystackResponse
                );

                // Show loading state and redirect immediately
                setIsPaymentSuccess(true);
                setTimeout(() => {
                  router.push("/order-success?payment=online");
                }, 500); // Very short delay for smooth transition

                // Handle verification in background (don't wait for it)
                (async () => {
                  try {
                    console.log(
                      "[Paystack] Starting background verification..."
                    );
                    const verifyRes = await fetch(
                      `${API_BASE_URL}/payments/paystack/verify`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          "Cache-Control":
                            "no-cache, no-store, must-revalidate",
                          Pragma: "no-cache",
                          Expires: "0",
                          Authorization: `Bearer ${authToken}`,
                        },
                        body: JSON.stringify({ reference }),
                      }
                    );

                    if (verifyRes.ok) {
                      const verifyData = await verifyRes.json();
                      if (verifyData?.success) {
                        // Clear cart in background
                        await clearCart();
                        console.log(
                          "[Paystack] Background verification completed successfully"
                        );
                      }
                    }
                  } catch (err) {
                    console.error(
                      "[Paystack] Background verification error:",
                      err
                    );
                    // Still clear cart even if verification fails
                    try {
                      await clearCart();
                    } catch (clearErr) {
                      console.error("[Paystack] Cart clear error:", clearErr);
                    }
                  }
                })();
              },
            });
            if (handler) {
              console.log("[Paystack] Handler created. Opening iframe...");
              handler.openIframe();
            } else {
              console.error(
                "[Paystack] Handler not created. window.PaystackPop.setup missing?",
                {
                  hasPaystackPop: !!w.PaystackPop,
                  typeofSetup: typeof w.PaystackPop?.setup,
                }
              );
            }
          };

          // Ensure script or fallback to redirect
          const ensureScriptAndOpen = () => {
            const w = window as unknown as PaystackGlobal;
            if (w.PaystackPop && typeof w.PaystackPop.setup === "function") {
              console.log(
                "[Paystack] Script already loaded; opening modal instantly"
              );
              openInline();
              return;
            }

            // If script is preloaded but not ready yet, wait a tiny bit
            const existingScript = document.querySelector(
              'script[src*="paystack"]'
            );
            if (existingScript) {
              // Script is loading, wait just a moment then try again
              setTimeout(() => {
                const w2 = window as unknown as PaystackGlobal;
                if (
                  w2.PaystackPop &&
                  typeof w2.PaystackPop.setup === "function"
                ) {
                  openInline();
                } else {
                  // Fallback to redirect if script still not ready
                  if (authorizationUrl) window.location.href = authorizationUrl;
                }
              }, 50); // Very short wait
              return;
            }

            // Fallback: load script if somehow not preloaded
            const script = document.createElement("script");
            script.src = "https://js.paystack.co/v1/inline.js";
            script.async = false;
            script.onload = () => {
              console.log("[Paystack] Fallback script loaded");
              openInline();
            };
            script.onerror = () => {
              console.error("[Paystack] Failed to load script");
              if (authorizationUrl) window.location.href = authorizationUrl;
            };
            document.head.appendChild(script);
          };

          if (PAYSTACK_PUBLIC_KEY && reference) {
            console.log("[Paystack] Proceeding with inline flow", {
              hasPublicKey: !!PAYSTACK_PUBLIC_KEY,
              hasReference: !!reference,
            });
            ensureScriptAndOpen();
            return;
          }
          if (authorizationUrl) {
            console.warn(
              "[Paystack] Missing public key or reference. Redirecting to authorization_url."
            );
            persistPaystackDebug("missing_inline_requirements_redirect", {
              reason: !PAYSTACK_PUBLIC_KEY
                ? "missing_public_key"
                : !reference
                ? "missing_reference"
                : "unknown",
            });
            window.location.href = authorizationUrl;
            return;
          }
          alert(
            "Payment initialization succeeded but no reference or redirect URL provided."
          );
        } else {
          // This should not happen since only online payment is allowed
          alert("Only online payments are currently supported.");
          return;
        }
      } else {
        alert(`Order failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Payment success loading screen
  if (isPaymentSuccess) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Payment Successful!
            </h1>
            <p className="text-gray-400 mb-6">
              Redirecting you to your order confirmation...
            </p>
            <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </>
    );
  }

  if (items.length === 0) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">
              Your cart is empty
            </h1>
            <p className="text-gray-400 mb-6">
              Add some items to your cart before checking out.
            </p>
            <div className="space-y-3">
              <button
                onClick={() => router.push("/shop")}
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={() => router.push("/")}
                className="w-full bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-black py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-yellow-400 hover:text-yellow-300 mb-3 sm:mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1 sm:mr-2" />
              <span className="text-sm sm:text-base">Back to Cart</span>
            </button>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">
              Checkout
            </h1>
            <p className="text-gray-400 mt-1 sm:mt-2 text-sm sm:text-base">
              Complete your order
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
            {/* Checkout Form - Takes 7 columns on desktop */}
            <div className="lg:col-span-7 space-y-8">
              {/* Delivery Method */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  {cart?.deliveryMethod === "pickup" ? (
                    <Store className="w-5 h-5 text-green-400 mr-2" />
                  ) : (
                    <Truck className="w-5 h-5 text-blue-400 mr-2" />
                  )}
                  <h2 className="text-xl font-semibold text-white">
                    Delivery Method
                  </h2>
                </div>

                <div className="bg-gray-700/50 p-4 rounded-lg">
                  {cart?.deliveryMethod === "pickup" ? (
                    <div className="flex items-start space-x-3">
                      <Store className="w-5 h-5 text-green-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">
                          Pickup (Free)
                        </div>
                        <p className="text-gray-400 text-sm mt-1">
                          You&#39;ll pick up your order from our store location.
                        </p>
                        <div className="mt-3 flex items-center">
                          <a
                            href="https://www.google.com/maps/search/?api=1&query=Joantee+Store+Accra+Ghana"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-yellow-400 hover:text-yellow-300 text-sm flex items-center"
                          >
                            <MapPin className="w-4 h-4 mr-1" />
                            View store location
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-3">
                      <Truck className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                      <div>
                        <div className="text-white font-medium">
                          Delivery to your address
                          {cart?.deliveryZoneName && (
                            <span className="ml-2 text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">
                              {cart.deliveryZoneName}
                            </span>
                          )}
                        </div>
                        <p className="text-gray-400 text-sm mt-1">
                          {(() => {
                            const parts = [
                              selectedDeliveryAddress?.areaName,
                              selectedDeliveryAddress?.cityName,
                              selectedDeliveryAddress?.regionName,
                            ].filter(Boolean);
                            return parts.length > 0
                              ? `Your order will be delivered to: ${parts.join(
                                  ", "
                                )}.`
                              : "Your order will be delivered to your address.";
                          })()}
                        </p>
                        <div className="mt-2 flex items-center">
                          <span className="text-gray-300 text-sm">
                            Delivery fee:{" "}
                            <span className="text-white">
                              ₵{totals.shipping.toFixed(2)}
                            </span>
                          </span>
                        </div>
                        {totals.shipping > (cart?.deliveryZoneFee || 0) && (
                          <div className="mt-2 flex items-start space-x-2">
                            <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-yellow-400 text-xs">
                              Special delivery fee applies due to order size or
                              product requirements.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.push("/cart")}
                    className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                  >
                    Change delivery method
                  </button>
                </div>
              </div>

              {/* Payment Method Selection */}
              <div className="bg-gray-800 rounded-lg p-6">
                <PaymentMethodSelector
                  onPaymentMethodChange={handlePaymentMethodChange}
                  initialMethod={paymentMethod}
                />
              </div>

              {/* Payment Method Summary for non-online payments */}
              {paymentMethod !== "online" && (
                <div className="bg-gray-800 rounded-lg p-6">
                  <div className="flex items-center mb-4">
                    <CreditCard className="w-5 h-5 text-yellow-400 mr-2" />
                    <h2 className="text-xl font-semibold text-white">
                      Payment Summary
                    </h2>
                  </div>

                  <div className="bg-gray-700/50 p-4 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center">
                        <CreditCard className="w-5 h-5 text-green-400" />
                      </div>
                      <div>
                        <div className="text-white font-medium">Pay Online</div>
                        <p className="text-gray-400 text-sm">
                          Pay securely with card or mobile money
                        </p>
                        <p className="text-gray-500 text-xs mt-1">
                          We accept cash, mobile money, and card payments
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Notes */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <User className="w-5 h-5 text-yellow-400 mr-2" />
                  <h2 className="text-xl font-semibold text-white">
                    Additional Notes
                  </h2>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Special Instructions (Optional)
                  </label>
                  <textarea
                    name="customerNotes"
                    value={formData.customerNotes}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
                    placeholder="Any special instructions for your order..."
                  />
                </div>
              </div>
            </div>

            {/* Order Summary - Takes 5 columns on desktop */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-gray-800 rounded-lg p-4 sm:p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg sm:text-xl font-semibold text-white">
                    Order Summary
                  </h2>
                  <span className="text-gray-400 text-sm">
                    {items.length} item{items.length !== 1 ? "s" : ""}
                  </span>
                </div>

                <div className="space-y-4">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col sm:flex-row sm:items-center gap-3 sm:space-x-4 p-3 bg-gray-700/50 rounded-lg"
                    >
                      <div className="flex items-start w-full sm:w-auto">
                        <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 mr-4">
                          {item.imageUrl ? (
                            <>
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.imageUrl}
                                alt={item.productName}
                                className="w-full h-full object-cover rounded-lg"
                              />
                            </>
                          ) : (
                            <span className="text-gray-300 text-xs font-medium">
                              IMG
                            </span>
                          )}
                        </div>
                        <div className="flex-1 min-w-0 pl-2">
                          <h3 className="text-white font-medium truncate">
                            {item.productName}
                          </h3>
                          <p className="text-gray-400 text-sm">
                            ₵{item.price.toFixed(2)} each
                          </p>
                          <div className="flex flex-wrap gap-x-3">
                            {item.size && (
                              <p className="text-gray-500 text-xs">
                                Size: {item.size}
                              </p>
                            )}
                            {item.color && (
                              <p className="text-gray-500 text-xs">
                                Color: {item.color}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between w-full sm:w-auto sm:justify-start mt-2 sm:mt-0">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1 bg-gray-600 hover:bg-gray-500 rounded-full transition-colors"
                          >
                            <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </button>
                          <span className="text-white font-medium min-w-[1.5rem] sm:min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1 bg-gray-600 hover:bg-gray-500 rounded-full transition-colors"
                          >
                            <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </button>
                        </div>

                        <div className="flex items-center">
                          <div className="text-white font-semibold text-base sm:text-lg min-w-[4rem] sm:min-w-[5rem] text-right mr-2 sm:mr-0">
                            ₵{item.subtotal.toFixed(2)}
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-700 mt-4 sm:mt-6 pt-4">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-gray-300">
                      <span className="text-sm sm:text-base">
                        Subtotal ({items.length}{" "}
                        {items.length === 1 ? "item" : "items"})
                      </span>
                      <span className="text-sm sm:text-base">
                        ₵{totals.subtotal.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                      <span className="text-sm sm:text-base">Tax</span>
                      <span className="text-sm sm:text-base">
                        ₵{totals.tax.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-gray-300">
                      {cart?.deliveryMethod === "pickup" ? (
                        <>
                          <span className="flex items-center text-sm sm:text-base">
                            <span>Pickup</span>
                            <span className="ml-1 sm:ml-2 text-xs bg-green-900/30 text-green-400 px-1 sm:px-2 py-0.5 rounded">
                              Free
                            </span>
                          </span>
                          <span className="text-sm sm:text-base">₵0.00</span>
                        </>
                      ) : (
                        <>
                          <span className="flex flex-wrap items-center text-sm sm:text-base">
                            <span>Delivery</span>
                            {cart?.deliveryZoneName && (
                              <span className="ml-1 sm:ml-2 text-xs bg-blue-900/30 text-blue-400 px-1 sm:px-2 py-0.5 rounded">
                                {cart.deliveryZoneName}
                              </span>
                            )}
                          </span>
                          <span className="text-sm sm:text-base">
                            ₵{totals.shipping.toFixed(2)}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between items-center text-base sm:text-lg font-semibold text-white">
                        <span>Total</span>
                        <span>₵{totals.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  className="w-full mt-4 sm:mt-6 bg-yellow-400 hover:bg-yellow-500 active:bg-yellow-600 text-black py-3 sm:py-4 rounded-lg font-semibold transition-all duration-100 transform hover:scale-[1.01] active:scale-[0.99] shadow-lg hover:shadow-xl text-sm sm:text-base"
                >
                  {paymentMethod === "online"
                    ? "Pay Now & Place Order"
                    : "Place Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
