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
} from "lucide-react";
import PaymentMethodSelector from "../components/PaymentMethodSelector";


export default function Checkout() {
  const { isAuthenticated, loading, setRedirectUrl } = useAuth();
  const { cart, items, totals, clearCart, updateQuantity, removeFromCart } =
    useCart();
  const router = useRouter();
  const [formData, setFormData] = useState({
    customerNotes: "",
  });
  const [paymentMethod, setPaymentMethod] = useState<
    "online" | "on_delivery" | "on_pickup"
  >("online");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Store current URL for redirect after login with checkout context
      setRedirectUrl("/checkout", "checkout");
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, setRedirectUrl]);

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
    method: "online" | "on_delivery" | "on_pickup"
  ) => {
    setPaymentMethod(method);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Create order with backend API
      const orderData = {
        paymentMethod: paymentMethod,
        deliveryMethod: cart?.deliveryMethod || "delivery",
        // For now, we'll use a placeholder address ID since the cart doesn't store it
        // TODO: Update backend to accept address details directly or store address ID in cart
        deliveryAddressId: cart?.deliveryMethod === "delivery" ? 1 : undefined, // Placeholder - needs to be fixed
        pickupLocationId: cart?.deliveryMethod === "pickup" ? 1 : undefined, // Default pickup location
        customerNotes: formData.customerNotes || "No additional notes",
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/orders`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(orderData),
        }
      );

      const data = await response.json();

      if (data.success) {
        // Clear cart and redirect to success page
        clearCart();
        alert("Order placed successfully!");
        router.push("/orders");
      } else {
        alert(`Order failed: ${data.message}`);
      }
    } catch (error) {
      console.error("Error creating order:", error);
      alert("Failed to place order. Please try again.");
    } finally {
      setIsProcessing(false);
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
          <div className="mb-8">
            <button
              onClick={() => router.back()}
              className="flex items-center text-yellow-400 hover:text-yellow-300 mb-4 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Cart
            </button>
            <h1 className="text-3xl font-bold text-white">Checkout</h1>
            <p className="text-gray-400 mt-2">Complete your order</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Checkout Form */}
            <div className="space-y-8">
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
                          {cart?.deliveryZoneName
                            ? `Your order will be delivered to your address in ${cart.deliveryZoneName}.`
                            : "Your order will be delivered to your address."}
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
                  deliveryMethod={cart?.deliveryMethod}
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
                        <div className="text-white font-medium">
                          {paymentMethod === "on_delivery"
                            ? "Pay on Delivery"
                            : "Pay on Pickup"}
                        </div>
                        <p className="text-gray-400 text-sm">
                          {paymentMethod === "on_delivery"
                            ? "You\u2019ll pay when your order is delivered to your address"
                            : "You\u2019ll pay when you collect your order from our store"}
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

            {/* Order Summary */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">
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
                      className="flex items-center space-x-4 p-3 bg-gray-700/50 rounded-lg"
                    >
                      <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
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
                      <div className="flex-1 min-w-0">
                        <h3 className="text-white font-medium truncate">
                          {item.productName}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          ₵{item.price.toFixed(2)} each
                        </p>
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
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          className="p-1 bg-gray-600 hover:bg-gray-500 rounded-full transition-colors"
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
                          className="p-1 bg-gray-600 hover:bg-gray-500 rounded-full transition-colors"
                        >
                          <Plus className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <div className="text-white font-semibold text-lg min-w-[5rem] text-right">
                        ₵{item.subtotal.toFixed(2)}
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="p-1 text-gray-400 hover:text-red-400 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-700 mt-6 pt-4">
                  <div className="space-y-3">
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
                    <div className="border-t border-gray-600 pt-3">
                      <div className="flex justify-between items-center text-lg font-semibold text-white">
                        <span>Total</span>
                        <span>₵{totals.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 text-black py-4 rounded-lg font-semibold transition-colors duration-200"
                >
                  {isProcessing
                    ? "Processing..."
                    : paymentMethod === "online"
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
