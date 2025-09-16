"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import DeliveryAddressSelector from "./DeliveryAddressSelector";
import PickupLocationSelector from "./PickupLocationSelector";
import { useCart } from "../contexts/CartContext";

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
  const { selectedPickupLocation, setSelectedPickupLocation } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">(
    initialMethod
  );
  const [showPickupSelector, setShowPickupSelector] = useState<boolean>(true);
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
      // Collapse selector if a location is already chosen
      setShowPickupSelector(!selectedPickupLocation);
    } else {
      // If switching to delivery and we have an address, use it
      if (selectedAddress) {
        onDeliveryMethodChange(method, selectedAddress);
      }
      // Always collapse pickup selector when switching away
      setShowPickupSelector(false);
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

      {/* Pickup Selection */}
      {deliveryMethod === "pickup" && (
        <div className="space-y-3">
          {!showPickupSelector && selectedPickupLocation ? (
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-white font-medium">
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
                </div>
                <button
                  type="button"
                  className="text-yellow-400 hover:text-yellow-300 text-sm underline"
                  onClick={() => setShowPickupSelector(true)}
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <PickupLocationSelector
              onSelect={(loc) => {
                setSelectedPickupLocation({
                  id: loc.id,
                  name: loc.name,
                  description: loc.description,
                  regionName: loc.regionName,
                  cityName: loc.cityName,
                  areaName: loc.areaName,
                  landmark: loc.landmark,
                  contactPhone: loc.contactPhone,
                  googleMapsLink: loc.googleMapsLink,
                });
                setShowPickupSelector(false);
              }}
              disabled={disabled}
            />
          )}
        </div>
      )}
    </div>
  );
}
