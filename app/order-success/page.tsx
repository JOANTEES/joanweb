"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Navigation from "../components/Navigation";
import { CheckCircle, ShoppingBag, ArrowRight, Home } from "lucide-react";

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderDetails, setOrderDetails] = useState<{
    orderNumber?: string;
    total?: number;
    paymentMethod?: string;
  }>({});

  useEffect(() => {
    // Get order details from URL params if available
    const orderNumber = searchParams.get("order");
    const total = searchParams.get("total");
    const paymentMethod = searchParams.get("payment");

    if (orderNumber || total || paymentMethod) {
      setOrderDetails({
        orderNumber: orderNumber || undefined,
        total: total ? parseFloat(total) : undefined,
        paymentMethod: paymentMethod || undefined,
      });
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-900">
      <Navigation />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto text-center">
          {/* Success Icon */}
          <div className="mb-8">
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Order Successful!
            </h1>
            <p className="text-gray-300 text-lg">
              Thank you for your purchase. Your order has been confirmed.
            </p>
          </div>

          {/* Order Details */}
          {(orderDetails.orderNumber || orderDetails.total) && (
            <div className="bg-gray-800 rounded-lg p-6 mb-8">
              <h2 className="text-xl font-semibold text-white mb-4">
                Order Details
              </h2>
              <div className="space-y-2 text-gray-300">
                {orderDetails.orderNumber && (
                  <div className="flex justify-between">
                    <span>Order Number:</span>
                    <span className="text-white font-medium">
                      #{orderDetails.orderNumber}
                    </span>
                  </div>
                )}
                {orderDetails.total && (
                  <div className="flex justify-between">
                    <span>Total Amount:</span>
                    <span className="text-white font-medium">
                      ₵{orderDetails.total.toFixed(2)}
                    </span>
                  </div>
                )}
                {orderDetails.paymentMethod && (
                  <div className="flex justify-between">
                    <span>Payment Method:</span>
                    <span className="text-white font-medium capitalize">
                      {orderDetails.paymentMethod.replace("_", " ")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Next Steps */}
          <div className="bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-white mb-4">
              What&apos;s Next?
            </h3>
            <div className="text-gray-300 space-y-2">
              <p>• You will receive an order confirmation email shortly</p>
              <p>• We&apos;ll notify you when your order is being prepared</p>
              <p>• Track your order status in your account</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/shop")}
              className="flex items-center justify-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <ShoppingBag className="w-5 h-5" />
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </button>
            
            <button
              onClick={() => router.push("/")}
              className="flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              <Home className="w-5 h-5" />
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900">
        <Navigation />
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Loading...
            </h1>
            <p className="text-gray-300 text-lg">
              Preparing your order confirmation...
            </p>
          </div>
        </div>
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
