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
import AddressForm from "../components/AddressForm";
// PICKUP_DISABLED: Temporarily disable pickup feature UI (keep code for future)
// import { usePickupLocations } from "../hooks/usePickupLocations";

export default function Cart() {
  const { isAuthenticated, loading, setRedirectUrl } = useAuth();
  const {
    cart,
    items,
    totals,
    updateQuantity,
    removeFromCart,
    updateCartDeliveryMethod,
    selectedDeliveryAddressId,
    selectedPickupLocation,
    setSelectedPickupLocation,
  } = useCart();
  const { zones: deliveryZones, loading: zonesLoading } = useDeliveryZones();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"delivery" | "pickup">(
    // PICKUP_DISABLED: Force delivery tab only
    "delivery"
  );
  const [localSelectedAddressId, setLocalSelectedAddressId] = useState<
    number | null
  >(null);
  // PICKUP_DISABLED: Remove local pickup selection state
  // const [localSelectedPickupId, setLocalSelectedPickupId] = useState<
  //   string | null
  // >(null);
  const [appliedSelection, setAppliedSelection] = useState<
    { type: "delivery"; id: number } | { type: "pickup"; id: string } | null
  >(null);
  const [isApplying, setIsApplying] = useState(false);
  const [isAddressFormOpen, setIsAddressFormOpen] = useState(false);

  // Addresses hook utilities
  const {
    addresses,
    loading: addressesLoading,
    // error: _addrErr,
    createAddress,
    refetch: refetchAddresses,
  } = useCustomerAddresses();
  // Pickup locations
  // PICKUP_DISABLED: Temporarily disable pickup locations hook
  // const { locations: pickupLocations, loading: pickupsLoading } =
  //   usePickupLocations();

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

  // Load addresses default selection when list first arrives
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

  // PICKUP_DISABLED: Temporarily disable switch to pickup action
  // const handleSwitchToPickup = async () => {
  //   try {
  //     const success = await updateCartDeliveryMethod("pickup");
  //     if (success) {
  //       setDeliveryEligibilityIssues(null);
  //     }
  //   } catch (error) {
  //     console.error("Error switching to pickup:", error);
  //   }
  // };

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
          <div className="flex flex-wrap items-center justify-between mb-6 sm:mb-8 gap-4">
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button
                onClick={() => router.back()}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">
                Shopping Cart
              </h1>
            </div>
            <div className="text-gray-400">
              {items.length} item{items.length !== 1 ? "s" : ""}
            </div>
          </div>

          {/* Removed old delivery method section - replaced by Delivery Options card below */}

          {/* Delivery zones info / eligibility notice */}
          <div className="bg-gray-800 rounded-lg p-4 mb-6 border border-gray-700">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-white font-medium mb-1">
                  Available Delivery Zones
                </div>
                {zonesLoading ? (
                  <div className="text-gray-400 text-sm">
                    Loading delivery zones...
                  </div>
                ) : (deliveryZones ?? []).length === 0 ? (
                  <div className="text-gray-400 text-sm">
                    No delivery zones available right now.
                  </div>
                ) : (
                  <div className="text-gray-300 text-sm">
                    {(deliveryZones ?? []).map((z) => (
                      <span
                        key={z.id}
                        className="inline-flex items-center px-2 py-0.5 mr-2 mb-2 rounded border border-gray-600 bg-gray-700/50 text-xs sm:text-sm"
                        title={`${
                          z.description
                        } • Fee: ₵${z.deliveryFee.toFixed(2)} • ETA: ${
                          z.estimatedDays
                        }`}
                      >
                        {z.name}
                        <span className="ml-1 text-xs text-gray-400">
                          ₵{z.deliveryFee.toFixed(2)}
                        </span>
                      </span>
                    ))}
                  </div>
                )}
                <div className="text-gray-500 text-xs mt-2">
                  Pick an address that falls within one of these zones to enable
                  Delivery.
                </div>
              </div>
            </div>
          </div>

          {/* Simple delivery eligibility notice */}
          {/* PICKUP_DISABLED: Hide pickup eligibility notice and CTA */}
          {/* {deliveryEligibilityIssues &&
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
            )} */}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-3 sm:space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className={`rounded-lg p-4 sm:p-6 ${
                      cart?.deliveryMethod === "delivery" &&
                      !item.deliveryEligible
                        ? "bg-blue-900/10 border border-blue-500/30"
                        : "bg-gray-800"
                    }`}
                  >
                    {/* Mobile-optimized layout */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:space-x-4">
                      {/* Product Image */}
                      <div className="w-full sm:w-24 h-32 sm:h-24 bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0 mb-3 sm:mb-0">
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
                          <span className="text-gray-300 text-sm font-medium">
                            IMG
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Product Details */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
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

                        <div className="text-gray-400 text-sm mb-2">
                          {item.hasDiscount ? (
                            <div className="flex flex-wrap items-center gap-2">
                              <span>
                                ₵{item.effectivePrice.toFixed(2)} each
                              </span>
                              <span className="text-gray-500 line-through">
                                ₵{item.price.toFixed(2)}
                              </span>
                              <span className="text-green-400 text-xs">
                                Save ₵{item.discountAmount?.toFixed(2)}
                              </span>
                            </div>
                          ) : (
                            <span>₵{item.effectivePrice.toFixed(2)} each</span>
                          )}
                        </div>

                        <div className="text-gray-500 text-sm space-y-1">
                          <p>Size: {item.size}</p>
                          <p>Color: {item.color}</p>
                          <p>SKU: {item.sku}</p>
                        </div>

                        {/* Mobile Controls Section */}
                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity Controls */}
                          <div className="flex items-center">
                            <span className="text-yellow-400 text-sm font-medium mr-3">
                              Qty: {item.quantity}
                            </span>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity - 1)
                                }
                                className="p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-full transition-colors min-h-[32px] min-w-[32px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              </button>
                              <button
                                onClick={() =>
                                  updateQuantity(item.id, item.quantity + 1)
                                }
                                className="p-1.5 sm:p-2 bg-gray-700 hover:bg-gray-600 active:bg-gray-500 rounded-full transition-colors min-h-[32px] min-w-[32px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                              </button>
                            </div>
                          </div>

                          {/* Item Total and Remove */}
                          <div className="flex items-center space-x-3">
                            <div className="text-right">
                              <div className="text-lg font-bold text-white">
                                ₵{item.subtotal.toFixed(2)}
                              </div>
                            </div>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-1.5 sm:p-2 text-gray-400 hover:text-red-400 active:text-red-300 transition-colors min-h-[32px] min-w-[32px] sm:min-h-[40px] sm:min-w-[40px] flex items-center justify-center rounded-full hover:bg-red-400/10"
                              aria-label="Remove item"
                            >
                              <X className="w-4 h-4 sm:w-5 sm:h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Delivery Options Card (New - Tabs Scaffold) */}
              <div className="bg-gray-800 rounded-lg p-4 sm:p-6 mt-8">
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
                  {/* PICKUP_DISABLED: Hide pickup tab */}
                  {/* <button ...>Pickup</button> */}
                </div>

                {/* Panel Content */}
                <div className="grid grid-cols-1 gap-4">
                  {activeTab === "delivery" ? (
                    <div className="bg-gray-700/50 rounded p-3 sm:p-4">
                      <div className="flex flex-wrap items-center justify-between mb-3 gap-2">
                        <div className="text-sm text-gray-300 font-medium">
                          Select a delivery address
                        </div>
                        <button
                          className="text-yellow-400 hover:text-yellow-300 text-sm whitespace-nowrap"
                          onClick={() => setIsAddressFormOpen(true)}
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
                              className={`flex items-start p-2 sm:p-3 rounded border cursor-pointer transition-colors ${
                                localSelectedAddressId === Number(addr.id)
                                  ? "border-yellow-400 bg-yellow-400/5"
                                  : "border-gray-600 hover:border-gray-500"
                              }`}
                            >
                              <input
                                type="radio"
                                name="deliveryAddress"
                                className="mt-1 mr-2 sm:mr-3 accent-yellow-400"
                                checked={
                                  localSelectedAddressId === Number(addr.id)
                                }
                                onChange={() =>
                                  setLocalSelectedAddressId(Number(addr.id))
                                }
                              />
                              <div className="text-xs sm:text-sm">
                                <div className="text-white font-medium">
                                  {addr.areaName}
                                  {addr.isDefault && (
                                    <span className="ml-1 sm:ml-2 text-xxs uppercase tracking-wide bg-gray-600 text-white px-1 py-0.5 rounded">
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
                  ) : // PICKUP_DISABLED: Hide pickup panel
                  null}
                  <div className="flex justify-end">
                    <button
                      disabled={
                        activeTab === "delivery" && !localSelectedAddressId
                      }
                      onClick={() => {
                        if (activeTab === "delivery") {
                          if (!localSelectedAddressId) return;
                          const addr = (addresses ?? []).find(
                            (a) =>
                              Number(a.id) === Number(localSelectedAddressId)
                          );
                          if (!addr) return;

                          // Show immediate feedback
                          setAppliedSelection({
                            type: "delivery",
                            id: Number(localSelectedAddressId),
                          });

                          // Update in background
                          setIsApplying(true);
                          updateCartDeliveryMethod("delivery", undefined, {
                            addressId: addr.id,
                            regionId: addr.regionId,
                            cityId: addr.cityId,
                            areaName: addr.areaName,
                            landmark: addr.landmark,
                            additionalInstructions: addr.additionalInstructions,
                            contactPhone: addr.contactPhone,
                          })
                            .catch((error) => {
                              console.error(
                                "Error updating delivery method:",
                                error
                              );
                              // Reset selection if failed
                              setAppliedSelection(null);
                            })
                            .finally(() => setIsApplying(false));
                        } else {
                          // PICKUP_DISABLED: Hide pickup apply branch
                        }
                      }}
                      className={`px-5 py-2 rounded-lg font-semibold transition-all duration-150 transform hover:scale-105 active:scale-95 ${
                        activeTab === "delivery" && !localSelectedAddressId
                          ? "bg-gray-600 text-gray-300 cursor-not-allowed"
                          : "bg-yellow-400 hover:bg-yellow-500 text-black"
                      }`}
                    >
                      {activeTab === "delivery"
                        ? appliedSelection?.type === "delivery" &&
                          appliedSelection.id === Number(localSelectedAddressId)
                          ? "Applied"
                          : "Apply"
                        : "Apply"}
                    </button>
                  </div>
                </div>
              </div>
              {/* Address Form Modal */}
              <AddressForm
                isOpen={isAddressFormOpen}
                onClose={() => setIsAddressFormOpen(false)}
                title="Create Delivery Address"
                onSubmit={async (data) => {
                  // Build the address payload compatible with updateCartDeliveryMethod
                  const addressForCart = {
                    regionId: Number(data.regionId),
                    cityId: Number(data.cityId),
                    areaName: data.areaName,
                    landmark: data.landmark || undefined,
                    additionalInstructions:
                      data.additionalInstructions || undefined,
                    contactPhone: data.contactPhone || undefined,
                  };

                  // Save to backend if requested, then try to select it
                  if (data.saveAddress) {
                    const created = await createAddress({
                      regionId: Number(data.regionId),
                      cityId: Number(data.cityId),
                      areaName: data.areaName,
                      landmark: data.landmark || undefined,
                      additionalInstructions:
                        data.additionalInstructions || undefined,
                      contactPhone: data.contactPhone || undefined,
                      isDefault: data.isDefault,
                      googleMapsLink: data.googleMapsLink || undefined,
                    });
                    if (!created) return false;
                    // Refresh list and try to pick the newly created address
                    try {
                      await refetchAddresses();
                      const createdAddr = (addresses ?? []).find(
                        (a) =>
                          Number(a.regionId) === Number(data.regionId) &&
                          Number(a.cityId) === Number(data.cityId) &&
                          a.areaName.trim().toLowerCase() ===
                            data.areaName.trim().toLowerCase()
                      );
                      if (createdAddr) {
                        setLocalSelectedAddressId(Number(createdAddr.id));
                      }
                    } catch {}
                  }

                  // Apply immediately to cart
                  const ok = await updateCartDeliveryMethod(
                    "delivery",
                    undefined,
                    addressForCart
                  );
                  if (ok) {
                    setAppliedSelection({
                      type: "delivery",
                      id: Number(localSelectedAddressId || 0),
                    });
                    setIsAddressFormOpen(false);
                    return true;
                  }
                  alert(
                    "We couldn't set that address for delivery (no delivery zone found). Please adjust the address or choose Pickup."
                  );
                  return false;
                }}
              />
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-4 sm:p-6 sticky top-8">
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
                    <span className="flex items-center">
                      <span>Delivery</span>
                      {cart?.deliveryZoneName && (
                        <span className="ml-2 text-xs bg-blue-900/30 text-blue-400 px-2 py-0.5 rounded">
                          {cart.deliveryZoneName}
                        </span>
                      )}
                    </span>
                    <span>₵{totals.shipping.toFixed(2)}</span>
                  </div>

                  {/* PICKUP_DISABLED: Hide pickup summary */}
                  {/* {cart?.deliveryMethod === "pickup" && (
                    <PickupLocationSummary />
                  )} */}

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
                  onClick={() => {
                    // Navigate instantly
                    router.replace("/checkout");
                  }}
                  disabled={
                    isApplying ||
                    (deliveryEligibilityIssues &&
                      deliveryEligibilityIssues.length > 0) ||
                    (cart?.deliveryMethod === "delivery" &&
                      !selectedDeliveryAddressId) ||
                    (cart?.deliveryMethod === "pickup" &&
                      !selectedPickupLocation)
                  }
                  className={`w-full mt-6 py-4 rounded-lg font-semibold transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.98] ${
                    isApplying ||
                    (deliveryEligibilityIssues &&
                      deliveryEligibilityIssues.length > 0) ||
                    (cart?.deliveryMethod === "delivery" &&
                      !selectedDeliveryAddressId) ||
                    (cart?.deliveryMethod === "pickup" &&
                      !selectedPickupLocation)
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-yellow-400 hover:bg-yellow-500 text-black"
                  }`}
                >
                  {isApplying
                    ? activeTab === "delivery"
                      ? "Validating address..."
                      : "Applying pickup location..."
                    : deliveryEligibilityIssues &&
                      deliveryEligibilityIssues.length > 0
                    ? "Resolve Delivery Issues First"
                    : cart?.deliveryMethod === "delivery" &&
                      !selectedDeliveryAddressId
                    ? "Apply Delivery Address First"
                    : cart?.deliveryMethod === "pickup" &&
                      !selectedPickupLocation
                    ? "Select Pickup Location First"
                    : "Proceed to Checkout"}
                </button>

                <button
                  onClick={() => router.replace("/shop")}
                  className="w-full mt-3 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-all duration-150 transform hover:scale-[1.02] active:scale-[0.98]"
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

// PICKUP_DISABLED: Hide pickup summary component (kept for future use)
// function PickupLocationSummary() { ... }
