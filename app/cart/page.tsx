"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useDeliveryZones } from "../hooks/useDeliveryZones";
import { Plus, Minus, X, ShoppingBag, ArrowLeft } from "lucide-react";
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

  const handleDeliveryMethodChange = async (
    method: "pickup" | "delivery",
    zoneId?: number
  ) => {
    try {
      const success = await updateCartDeliveryMethod(method, zoneId);
      if (success) {
        setEditingItem(null);
      }
    } catch (error) {
      console.error("Error updating delivery method:", error);
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
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-300">Current:</span>
                  <span
                    className={`text-sm font-medium ${
                      cart?.deliveryMethod === "pickup"
                        ? "text-green-400"
                        : "text-blue-400"
                    }`}
                  >
                    {cart?.deliveryMethod === "pickup"
                      ? "Pickup (Free)"
                      : `${cart?.deliveryZoneName || "Delivery"} - ₵${
                          cart?.deliveryZoneFee?.toFixed(2) || "0.00"
                        }`}
                  </span>
                </div>
              </div>
              <button
                onClick={() =>
                  setEditingItem(editingItem === "delivery" ? null : "delivery")
                }
                className="text-yellow-400 hover:text-yellow-300 text-sm underline"
              >
                {editingItem === "delivery" ? "Cancel" : "Change"}
              </button>
            </div>

            {/* Delivery Method Editor */}
            {editingItem === "delivery" && (
              <div className="mt-4 p-4 bg-gray-700 rounded-lg">
                <DeliveryMethodSelector
                  onDeliveryMethodChange={handleDeliveryMethodChange}
                  initialMethod={cart?.deliveryMethod || "delivery"}
                  initialZoneId={
                    cart?.deliveryZoneId
                      ? parseInt(cart.deliveryZoneId)
                      : undefined
                  }
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="bg-gray-800 rounded-lg p-6">
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
                        <h3 className="text-lg font-semibold text-white mb-2">
                          {item.productName}
                        </h3>
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
                    <span>Subtotal</span>
                    <span>₵{totals.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Tax (10%)</span>
                    <span>₵{totals.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-gray-300">
                    <span>Shipping</span>
                    <span>₵{totals.shipping.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-600 pt-4">
                    <div className="flex justify-between items-center text-xl font-semibold text-white">
                      <span>Total</span>
                      <span>₵{totals.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => router.push("/checkout")}
                  className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 text-black py-4 rounded-lg font-semibold transition-colors duration-200"
                >
                  Proceed to Checkout
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
