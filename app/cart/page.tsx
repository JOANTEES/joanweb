"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useDeliveryZones } from "../hooks/useDeliveryZones";
import {
  Plus,
  Minus,
  X,
  ShoppingBag,
  ArrowLeft,
  AlertCircle,
  MapPin,
} from "lucide-react";
import DeliveryMethodSelector from "../components/DeliveryMethodSelector";
import { useState } from "react";

export default function Cart() {
  const { isAuthenticated, loading, setRedirectUrl } = useAuth();
  const {
    cart,
    items,
    totals,
    updateQuantity,
    removeFromCart,
    updateCartDeliveryMethod,
    refreshCart,
    selectedDeliveryAddressId,
  } = useCart();
  const { zones } = useDeliveryZones();
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setRedirectUrl("/cart", "cart");
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, setRedirectUrl]);

  // Auto-open delivery editor when delivery is selected but no address is set
  useEffect(() => {
    if (
      cart?.deliveryMethod === "delivery" &&
      !cart?.deliveryAddress &&
      !selectedDeliveryAddressId &&
      editingItem !== "delivery"
    ) {
      setEditingItem("delivery");
    }
  }, [
    cart?.deliveryMethod,
    cart?.deliveryAddress,
    selectedDeliveryAddressId,
    editingItem,
  ]);

  const [validationError, setValidationError] = useState<string | null>(null);
  const [deliveryEligibilityIssues, setDeliveryEligibilityIssues] =
    useState<Array<{
      type: string;
      message: string;
      items: Array<{
        productId: string;
        productName: string;
        message: string;
      }>;
    }> | null>(null);

  // Check for delivery eligibility issues whenever cart data changes
  useEffect(() => {
    if (totals.deliveryEligibilityIssues) {
      setDeliveryEligibilityIssues(totals.deliveryEligibilityIssues);
    } else {
      setDeliveryEligibilityIssues(null);
    }
  }, [totals.deliveryEligibilityIssues]);

  const handleSwitchToPickup = async () => {
    try {
      const success = await updateCartDeliveryMethod("pickup");
      if (success) {
        setDeliveryEligibilityIssues(null);
        setValidationError(null);
      }
    } catch (error) {
      console.error("Error switching to pickup:", error);
      setValidationError("Failed to switch to pickup");
    }
  };

  const handleDeliveryMethodChange = async (
    method: "pickup" | "delivery",
    address?: {
      regionId: number;
      cityId: number;
      areaName: string;
      landmark?: string;
      additionalInstructions?: string;
      contactPhone?: string;
      regionName?: string;
      cityName?: string;
    },
    validationResult?: {
      isValid: boolean;
      message: string;
      deliveryZoneId?: string;
      deliveryZoneName?: string;
      deliveryZoneFee?: number;
    }
  ) => {
    try {
      setValidationError(null);

      // For pickup method, we don't need to validate delivery zones
      if (method === "pickup") {
        const success = await updateCartDeliveryMethod(method);
        if (success) {
          setEditingItem(null);
        }
        return;
      }

      // For delivery method, check if address is valid
      if (!address) {
        setValidationError("Please select a delivery address");
        return;
      }

      // Check validation result
      if (validationResult && !validationResult.isValid) {
        setValidationError(`⚠️ ${validationResult.message}`);
        // Still allow the user to proceed, but show warning
      }

      // If we have a valid delivery zone from validation, use it
      let zoneId: number | undefined = undefined;
      if (validationResult?.deliveryZoneId) {
        zoneId = parseInt(validationResult.deliveryZoneId);
      }

      // Set delivery method with address
      const success = await updateCartDeliveryMethod(method, zoneId, address);

      if (success) {
        // If we have a validation error but the user wants to proceed anyway
        if (validationError) {
          // Keep the validation error visible but close the editor
          setEditingItem(null);
        } else {
          // All good, close the editor
          setEditingItem(null);
          setValidationError(null);
        }
      }
    } catch (error) {
      console.error("Error updating delivery method:", error);
      setValidationError("Failed to update delivery method");
    }
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading cart...</p>
          </div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect to login
  }

  if (items.length === 0) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShoppingBag className="w-12 h-12 text-gray-400" />
              </div>
              <h1 className="text-3xl font-bold text-white mb-4">
                Your cart is empty
              </h1>
              <p className="text-gray-400 mb-8">
                Add some items to your cart to get started.
              </p>
              <button
                onClick={() => router.push("/shop")}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-full font-semibold transition-colors duration-200"
              >
                Continue Shopping
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
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-6 h-6" />
              </button>
              <h1 className="text-3xl font-bold text-white">Shopping Cart</h1>
            </div>
            <div className="text-gray-400">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Cart Delivery Method */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-white mb-2">
                  Delivery Method
                </h2>
                <div className="space-y-3">
                  {/* Delivery Method */}
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-300">
                      Delivery Method:
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        cart?.deliveryMethod === "pickup"
                          ? "text-green-400"
                          : "text-blue-400"
                      }`}
                    >
                      {cart?.deliveryMethod === "pickup"
                        ? "Pickup"
                        : cart?.deliveryAddress
                        ? "Home Delivery"
                        : "Delivery (address not set)"}
                    </span>
                  </div>

                  {/* Show delivery address details if available */}
                  {cart?.deliveryMethod === "delivery" &&
                    cart?.deliveryAddress && (
                      <div className="text-sm text-gray-400">
                        <div className="flex items-center space-x-2">
                          <MapPin className="w-4 h-4" />
                          <span>
                            {cart.deliveryAddress.regionName || "Region"} →{" "}
                            {cart.deliveryAddress.cityName || "City"} →{" "}
                            {cart.deliveryAddress.areaName}
                          </span>
                        </div>
                        {cart.deliveryAddress.landmark && (
                          <div className="text-xs text-gray-500 mt-1 ml-6">
                            Near: {cart.deliveryAddress.landmark}
                          </div>
                        )}

                        {/* Delivery zone info */}
                        {cart?.deliveryZoneName ? (
                          <div className="text-xs text-gray-500 mt-2 ml-6">
                            Delivery zone: {cart.deliveryZoneName} - ₵
                            {cart?.deliveryZoneFee?.toFixed(2)}
                          </div>
                        ) : (
                          <div className="text-xs text-orange-400 mt-2 ml-6">
                            ⚠️ Address is outside delivery zones - consider
                            pickup instead
                          </div>
                        )}
                      </div>
                    )}

                  {/* Pickup info */}
                  {cart?.deliveryMethod === "pickup" && (
                    <div className="text-sm text-gray-400">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>
                          {/** Show selected pickup location if present via context */}
                          {(() => {
                            try {
                              // Inline hook usage is not allowed; instead we rely on totals/cart area update elsewhere.
                              // Keep placeholder text until selection is displayed below in summary panel.
                              return "Pickup location selected below";
                            } catch (_) {
                              return "Pickup location";
                            }
                          })()}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1 ml-6">
                        Free pickup - no delivery charges
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setEditingItem("delivery")}
                className="text-yellow-400 hover:text-yellow-300 text-sm underline"
              >
                Change Address
              </button>
            </div>

            {/* Delivery Method Editor */}
            {editingItem === "delivery" && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <DeliveryMethodSelector
                  onDeliveryMethodChange={handleDeliveryMethodChange}
                  initialMethod={cart?.deliveryMethod || "delivery"}
                />

                {validationError && (
                  <div className="mt-3 p-3 bg-orange-900/30 border border-orange-500 rounded flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                    <div className="text-orange-400 text-sm">
                      {validationError}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Simple delivery eligibility notice */}
          {deliveryEligibilityIssues &&
            deliveryEligibilityIssues.length > 0 && (
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-blue-400" />
                    <span className="text-blue-300 text-sm">
                      Some items in your cart are only available for pickup
                    </span>
                  </div>
                  <button
                    onClick={handleSwitchToPickup}
                    className="text-blue-400 hover:text-blue-300 text-sm underline"
                  >
                    Switch to Pickup
                  </button>
                </div>
              </div>
            )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg p-6 ${
                      cart?.deliveryMethod === "delivery" &&
                      !item.deliveryEligible
                        ? "bg-blue-900/10 border border-blue-500/30"
                        : "bg-gray-800"
                    }`}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Product Image */}
                      <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.productName}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-gray-300 text-xs font-medium">
                            IMG
                          </span>
                        )}
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-lg font-semibold text-white">
                            {item.productName}
                          </h3>
                          {cart?.deliveryMethod === "delivery" &&
                            !item.deliveryEligible && (
                              <div className="flex items-center space-x-1 bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs">
                                <AlertCircle className="w-3 h-3" />
                                <span>Pickup Only</span>
                              </div>
                            )}
                        </div>
                        <p className="text-gray-400 text-sm mb-2">
                          ₵{item.price.toFixed(2)} each
                        </p>
                        {item.size && (
                          <p className="text-gray-500 text-sm">
                            Size: {item.size}
                          </p>
                        )}
                        {item.color && (
                          <p className="text-gray-500 text-sm">
                            Color: {item.color}
                          </p>
                        )}
                      </div>

                      {/* Quantity Controls */}
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity - 1)
                            }
                            className="p-1 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                          >
                            <Minus className="w-4 h-4 text-white" />
                          </button>
                          <span className="text-white font-medium min-w-[2rem] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.quantity + 1)
                            }
                            className="p-1 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
                          >
                            <Plus className="w-4 h-4 text-white" />
                          </button>
                        </div>

                        {/* Item Total */}
                        <div className="text-right min-w-[5rem]">
                          <div className="text-lg font-semibold text-white">
                            ₵{item.subtotal.toFixed(2)}
                          </div>
                        </div>

                        {/* Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 sticky top-8">
                <h2 className="text-xl font-semibold text-white mb-6">
                  Order Summary
                </h2>

                <div className="space-y-4">
                  <div className="flex justify-between items-center text-gray-300">
                    <span>
                      Subtotal ({items.length}{" "}
                      {items.length === 1 ? "item" : "items"})
                    </span>
                    <span>₵{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Tax</span>
                    <span>₵{totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    {cart?.deliveryMethod === "pickup" ? (
                      <>
                        <span className="flex items-center">
                          <span>Pickup</span>
                          <span className="ml-2 text-xs bg-green-900/30 text-green-400 px-2 py-0.5 rounded">
                            Free
                          </span>
                        </span>
                        <span>₵0.00</span>
                      </>
                    ) : (
                      <>
                        <span className="flex items-center">
                          <span>Delivery</span>
                          {cart?.deliveryZoneName && (
                            <span className="ml-2 text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">
                              {cart.deliveryZoneName}
                            </span>
                          )}
                        </span>
                        <span>₵{totals.shipping.toFixed(2)}</span>
                      </>
                    )}
                  </div>

                  {cart?.deliveryMethod === "pickup" && (
                    <PickupLocationSummary />
                  )}

                  {/* Show special delivery notice if applicable */}
                  {totals.shipping > 0 &&
                    cart?.deliveryMethod === "delivery" && (
                      <div className="flex items-start space-x-2 bg-gray-700/50 p-2 rounded text-xs">
                        <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-gray-300">
                          {totals.shipping > (cart?.deliveryZoneFee || 0)
                            ? "Special delivery fee applies due to order size or product requirements."
                            : "Standard delivery fee applies based on your location."}
                        </div>
                      </div>
                    )}

                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex justify-between items-center text-xl font-semibold text-white">
                      <span>Total</span>
                      <span>₵{totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  disabled={
                    !!(
                      deliveryEligibilityIssues &&
                      deliveryEligibilityIssues.length > 0
                    )
                  }
                  className={`w-full mt-6 py-4 rounded-lg font-semibold transition-colors duration-200 ${
                    deliveryEligibilityIssues &&
                    deliveryEligibilityIssues.length > 0
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-yellow-400 hover:bg-yellow-500 text-black"
                  }`}
                >
                  {deliveryEligibilityIssues &&
                  deliveryEligibilityIssues.length > 0
                    ? "Resolve Delivery Issues First"
                    : "Proceed to Checkout"}
                </button>

                <button
                  onClick={() => router.push("/shop")}
                  className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function PickupLocationSummary() {
  const { selectedPickupLocation } = useCart();
  if (!selectedPickupLocation) {
    return (
      <div className="mt-2 text-xs text-orange-400">
        Please choose a pickup location.
      </div>
    );
  }
  return (
    <div className="mt-3 p-3 bg-gray-700/50 rounded">
      <div className="text-sm text-gray-300 font-medium">
        {selectedPickupLocation.name}
      </div>
      <div className="text-xs text-gray-400">
        {[
          selectedPickupLocation.areaName,
          selectedPickupLocation.cityName,
          selectedPickupLocation.regionName,
        ]
          .filter(Boolean)
          .join(", ")}
      </div>
      {selectedPickupLocation.landmark && (
        <div className="text-xs text-gray-500 mt-1">
          Near {selectedPickupLocation.landmark}
        </div>
      )}
      {selectedPickupLocation.googleMapsLink && (
        <a
          href={selectedPickupLocation.googleMapsLink}
          target="_blank"
          rel="noopener noreferrer"
          className="text-yellow-400 hover:text-yellow-300 text-xs mt-2 inline-block"
        >
          View on Maps
        </a>
      )}
    </div>
  );
}
