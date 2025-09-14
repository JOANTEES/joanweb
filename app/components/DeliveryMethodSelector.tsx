"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import DeliveryAddressSelector from "./DeliveryAddressSelector";

interface DeliveryMethodSelectorProps {
  onDeliveryMethodChange: (
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
  ) => void;
  initialMethod?: "pickup" | "delivery";
  initialAddress?: {
    regionId: number;
    cityId: number;
    areaName: string;
    landmark?: string;
    additionalInstructions?: string;
    contactPhone?: string;
    regionName?: string;
    cityName?: string;
  };
  disabled?: boolean;
}

export default function DeliveryMethodSelector({
  onDeliveryMethodChange,
  initialMethod = "delivery",
  initialAddress,
  disabled = false,
}: DeliveryMethodSelectorProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">(
    initialMethod
  );
  const [selectedAddress, setSelectedAddress] = useState<
    | {
        regionId: number;
        cityId: number;
        areaName: string;
        landmark?: string;
        additionalInstructions?: string;
        contactPhone?: string;
        regionName?: string;
        cityName?: string;
      }
    | undefined
  >(initialAddress);

  const handleMethodChange = (method: "pickup" | "delivery") => {
    setDeliveryMethod(method);
    if (method === "pickup") {
      setSelectedAddress(undefined);
      onDeliveryMethodChange(method);
    } else {
      // If switching to delivery and we have an address, use it
      if (selectedAddress) {
        onDeliveryMethodChange(method, selectedAddress);
      }
    }
  };

  const handleAddressChange = (
    address: {
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
    setSelectedAddress(address);
    onDeliveryMethodChange(deliveryMethod, address, validationResult);
  };

  return (
    <div className="space-y-4">
      {/* Delivery Method Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Delivery Method
        </label>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="deliveryMethod"
              value="pickup"
              checked={deliveryMethod === "pickup"}
              onChange={() => handleMethodChange("pickup")}
              disabled={disabled}
              className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400 focus:ring-2"
            />
            <span className="ml-2 text-white">Pickup (Free)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="deliveryMethod"
              value="delivery"
              checked={deliveryMethod === "delivery"}
              onChange={() => handleMethodChange("delivery")}
              disabled={disabled}
              className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 focus:ring-yellow-400 focus:ring-2"
            />
            <span className="ml-2 text-white">Delivery</span>
          </label>
        </div>
      </div>

      {/* Delivery Address Selection */}
      {deliveryMethod === "delivery" && (
        <DeliveryAddressSelector
          onAddressChange={handleAddressChange}
          initialAddress={selectedAddress}
          disabled={disabled}
        />
      )}

      {/* Pickup Information */}
      {deliveryMethod === "pickup" && (
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-sm text-gray-300">
            <MapPin className="w-4 h-4" />
            <strong>Pickup Location:</strong> Store Address (to be configured)
          </div>
          <div className="text-xs text-gray-400 mt-1">
            You can pick up your order from our store location. Free of charge.
          </div>
        </div>
      )}
    </div>
  );
}
