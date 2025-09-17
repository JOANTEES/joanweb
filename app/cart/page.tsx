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
} from "lucide-react";

import { useState } from "react";
import { useCustomerAddresses } from "../hooks/useCustomerAddresses";
import { usePickupLocations } from "../hooks/usePickupLocations";

export default function Cart() {
  const { isAuthenticated, loading, setRedirectUrl } = useAuth();
  const {
    cart,
    items,
    totals,
    updateQuantity,
    removeFromCart,
    updateCartDeliveryMethod,
    // selectedDeliveryAddressId, // Unused but kept for future use
    setSelectedPickupLocation,
  } = useCart();
  useDeliveryZones();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"delivery" | "pickup">(
    (cart?.deliveryMethod as "delivery" | "pickup") || "delivery"
  );
  const [localSelectedAddressId, setLocalSelectedAddressId] = useState<
    number | null
  >(null);
  const [localSelectedPickupId, setLocalSelectedPickupId] = useState<
    string | null
  >(null);
  const [appliedSelection, setAppliedSelection] = useState<
    { type: "delivery"; id: number } | { type: "pickup"; id: string } | null
  >(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      setRedirectUrl("/cart", "cart");
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, setRedirectUrl]);

  // Removed: old auto-open delivery editor

  // const [validationError, setValidationError] = useState<string | null>(null); // Unused but kept for future use
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

  // Load addresses for the Delivery tab
  const { addresses, loading: addressesLoading } = useCustomerAddresses();
  const { locations: pickupLocations, loading: pickupsLoading } =
    usePickupLocations();
  useEffect(() => {
    if (!addressesLoading && addresses && addresses.length > 0) {
      const defaultAddress = addresses.find((a) => a.isDefault);
      const initialIdStr = (defaultAddress?.id ?? addresses[0]?.id) as
        | string
        | undefined;
      if (initialIdStr && !localSelectedAddressId) {
        setLocalSelectedAddressId(Number(initialIdStr));
      }
    }
  }, [addressesLoading, addresses, localSelectedAddressId]);

  const handleSwitchToPickup = async () => {
    try {
      const success = await updateCartDeliveryMethod("pickup");
      if (success) {
        setDeliveryEligibilityIssues(null);
        // setValidationError(null); // Commented out as variable is unused
      }
    } catch (error) {
      console.error("Error switching to pickup:", error);
      // setValidationError("Failed to switch to pickup"); // Commented out as variable is unused
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

          {/* Removed old delivery method section - replaced by Delivery Options card below */}

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

              {/* Delivery Options Card (New - Tabs Scaffold) */}
              <div className="bg-gray-800 rounded-lg p-6 mt-8">
                <h2 className="text-xl font-semibold text-white mb-4">
                  Delivery Options
                </h2>
                {/* Tabs */}
                <div className="flex border-b border-gray-700 mb-4">
                  <button
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === "delivery"
                        ? "border-yellow-400 text-yellow-400"
                        : "border-transparent text-gray-400 hover:text-gray-200"
                    }`}
                    onClick={() => setActiveTab("delivery")}
                  >
                    Delivery
                  </button>
                  <button
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ml-2 ${
                      activeTab === "pickup"
                        ? "border-yellow-400 text-yellow-400"
                        : "border-transparent text-gray-400 hover:text-gray-200"
                    }`}
                    onClick={() => setActiveTab("pickup")}
                  >
                    Pickup
                  </button>
                </div>

                {/* Panel Content */}
                <div className="grid grid-cols-1 gap-4">
                  {activeTab === "delivery" ? (
                    <div className="bg-gray-700/50 rounded p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-300 font-medium">
                          Select a delivery address
                        </div>
                        <button
                          className="text-yellow-400 hover:text-yellow-300 text-sm"
                          disabled
                        >
                          + Add New
                        </button>
                      </div>
                      <div className="max-h-60 overflow-auto pr-1 space-y-2">
                        {addressesLoading ? (
                          <div className="text-gray-400 text-sm">
                            Loading addresses...
                          </div>
                        ) : (addresses ?? []).length === 0 ? (
                          <div className="text-gray-400 text-sm">
                            You have no saved addresses yet.
                          </div>
                        ) : (
                          (addresses ?? []).map((addr) => (
                            <label
                              key={addr.id}
                              className={`flex items-start p-3 rounded border cursor-pointer transition-colors ${
                                localSelectedAddressId === Number(addr.id)
                                  ? "border-yellow-400 bg-yellow-400/5"
                                  : "border-gray-600 hover:border-gray-500"
                              }`}
                            >
                              <input
                                type="radio"
                                name="deliveryAddress"
                                className="mt-1 mr-3 accent-yellow-400"
                                checked={
                                  localSelectedAddressId === Number(addr.id)
                                }
                                onChange={() =>
                                  setLocalSelectedAddressId(Number(addr.id))
                                }
                              />
                              <div className="text-sm">
                                <div className="text-white font-medium">
                                  {addr.areaName}
                                  {addr.isDefault && (
                                    <span className="ml-2 text-xxs uppercase tracking-wide bg-gray-600 text-white px-1.5 py-0.5 rounded">
                                      Default
                                    </span>
                                  )}
                                </div>
                                <div className="text-gray-300">
                                  {[
                                    addr.areaName,
                                    addr.cityName,
                                    addr.regionName,
                                  ]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                                {addr.landmark && (
                                  <div className="text-gray-500 text-xs mt-0.5">
                                    Near {addr.landmark}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-700/50 rounded p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm text-gray-300 font-medium">
                          Select a pickup location
                        </div>
                      </div>
                      <div className="max-h-60 overflow-auto pr-1 space-y-2">
                        {pickupsLoading ? (
                          <div className="text-gray-400 text-sm">
                            Loading pickup locations...
                          </div>
                        ) : (pickupLocations ?? []).length === 0 ? (
                          <div className="text-gray-400 text-sm">
                            No pickup locations available.
                          </div>
                        ) : (
                          (pickupLocations ?? []).map((loc) => (
                            <label
                              key={loc.id}
                              className={`flex items-start p-3 rounded border cursor-pointer transition-colors ${
                                localSelectedPickupId === String(loc.id)
                                  ? "border-yellow-400 bg-yellow-400/5"
                                  : "border-gray-600 hover:border-gray-500"
                              }`}
                            >
                              <input
                                type="radio"
                                name="pickupLocation"
                                className="mt-1 mr-3 accent-yellow-400"
                                checked={
                                  localSelectedPickupId === String(loc.id)
                                }
                                onChange={() =>
                                  setLocalSelectedPickupId(String(loc.id))
                                }
                              />
                              <div className="text-sm">
                                <div className="text-white font-medium">
                                  {loc.name}
                                </div>
                                <div className="text-gray-300">
                                  {[loc.areaName, loc.cityName, loc.regionName]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                                {loc.landmark && (
                                  <div className="text-gray-500 text-xs mt-0.5">
                                    Near {loc.landmark}
                                  </div>
                                )}
                              </div>
                            </label>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                  <div className="flex justify-end">
                    <button
                      disabled={
                        (activeTab === "delivery" && !localSelectedAddressId) ||
                        (activeTab === "pickup" && !localSelectedPickupId)
                      }
                      onClick={async () => {
                        if (activeTab === "delivery") {
                          if (!localSelectedAddressId) return;
                          const addr = (addresses ?? []).find(
                            (a) =>
                              Number(a.id) === Number(localSelectedAddressId)
                          );
                          if (!addr) return;
                          await updateCartDeliveryMethod(
                            "delivery",
                            undefined,
                            {
                              addressId: addr.id,
                              regionId: addr.regionId,
                              cityId: addr.cityId,
                              areaName: addr.areaName,
                              landmark: addr.landmark,
                              additionalInstructions:
                                addr.additionalInstructions,
                              contactPhone: addr.contactPhone,
                            }
                          );
                          setAppliedSelection({
                            type: "delivery",
                            id: Number(localSelectedAddressId),
                          });
                        } else {
                          if (!localSelectedPickupId) return;
                          const loc = (pickupLocations ?? []).find(
                            (p) =>
                              String(p.id) === String(localSelectedPickupId)
                          );
                          if (loc) {
                            await updateCartDeliveryMethod("pickup");
                            try {
                              setSelectedPickupLocation?.(
                                loc as unknown as import("../hooks/usePickupLocations").PickupLocation
                              );
                            } catch {}
                            setAppliedSelection({
                              type: "pickup",
                              id: String(localSelectedPickupId),
                            });
                          }
                        }
                      }}
                      className={`px-5 py-2 rounded-lg font-semibold transition-colors ${
                        (activeTab === "delivery" && !localSelectedAddressId) ||
                        (activeTab === "pickup" && !localSelectedPickupId)
                          ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                          : "bg-yellow-400 hover:bg-yellow-500 text-black"
                      }`}
                    >
                      {activeTab === "delivery"
                        ? appliedSelection?.type === "delivery" &&
                          appliedSelection.id === Number(localSelectedAddressId)
                          ? "Applied"
                          : "Apply"
                        : appliedSelection?.type === "pickup" &&
                          appliedSelection.id === String(localSelectedPickupId)
                        ? "Applied"
                        : "Apply"}
                    </button>
                  </div>
                </div>
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
