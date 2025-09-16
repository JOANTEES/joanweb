"use client";

import { useState } from "react";
import { CreditCard, HandCoins, AlertCircle } from "lucide-react";

interface PaymentMethodSelectorProps {
  onPaymentMethodChange: (
    method: "online" | "on_delivery" | "on_pickup"
  ) => void;
  initialMethod?: "online" | "on_delivery" | "on_pickup";
  deliveryMethod?: "delivery" | "pickup";
}

export default function PaymentMethodSelector({
  onPaymentMethodChange,
  initialMethod = "online",
  deliveryMethod = "delivery",
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<
    "online" | "on_delivery" | "on_pickup"
  >(initialMethod);

  const handleMethodChange = (
    method: "online" | "on_delivery" | "on_pickup"
  ) => {
    setSelectedMethod(method);
    onPaymentMethodChange(method);
  };

  // Determine available payment methods based on delivery method
  const getAvailableMethods = () => {
    if (deliveryMethod === "pickup") {
      return [
        {
          id: "online" as const,
          name: "Pay Online",
          description: "Pay securely with card or mobile money",
          icon: CreditCard,
          available: true,
        },
        {
          id: "on_pickup" as const,
          name: "Pay on Pickup",
          description: "Pay when you collect your order",
          icon: HandCoins,
          available: true,
        },
      ];
    } else {
      return [
        {
          id: "online" as const,
          name: "Pay Online",
          description: "Pay securely with card or mobile money",
          icon: CreditCard,
          available: true,
        },
        {
          id: "on_delivery" as const,
          name: "Pay on Delivery",
          description: "Pay when your order arrives",
          icon: HandCoins,
          available: true,
        },
      ];
    }
  };

  const availableMethods = getAvailableMethods();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white mb-4">Payment Method</h3>

      <div className="space-y-3">
        {availableMethods.map((method) => {
          const Icon = method.icon;
          const isSelected = selectedMethod === method.id;

          return (
            <div
              key={method.id}
              className={`relative rounded-lg border-2 p-4 cursor-pointer transition-all duration-200 ${
                isSelected
                  ? "border-yellow-400 bg-yellow-400/10"
                  : "border-gray-600 bg-gray-700/50 hover:border-gray-500"
              }`}
              onClick={() => handleMethodChange(method.id)}
            >
              <div className="flex items-start space-x-3">
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                    isSelected
                      ? "border-yellow-400 bg-yellow-400"
                      : "border-gray-400"
                  }`}
                >
                  {isSelected && (
                    <div className="w-2 h-2 bg-black rounded-full"></div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5 text-yellow-400" />
                    <span className="text-white font-medium">
                      {method.name}
                    </span>
                    {isSelected && (
                      <span className="text-xs bg-yellow-400 text-black px-2 py-0.5 rounded">
                        Selected
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm mt-1">
                    {method.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Payment method info */}
      <div className="mt-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
        <div className="flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="text-blue-300 text-sm">
            {selectedMethod === "online" ? (
              <div>
                <p className="font-medium">Online Payment</p>
                <p className="text-xs mt-1">
                  Your payment will be processed immediately. You can pay with
                  credit/debit cards or mobile money.
                </p>
              </div>
            ) : selectedMethod === "on_delivery" ? (
              <div>
                <p className="font-medium">Pay on Delivery</p>
                <p className="text-xs mt-1">
                  Pay when your order arrives. We accept cash, mobile money, and
                  card payments.
                </p>
              </div>
            ) : (
              <div>
                <p className="font-medium">Pay on Pickup</p>
                <p className="text-xs mt-1">
                  Pay when you collect your order from our store. We accept
                  cash, mobile money, and card payments.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
