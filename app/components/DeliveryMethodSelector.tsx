"use client";

import { useState } from "react";
import { useDeliveryZones } from "../hooks/useDeliveryZones";

interface DeliveryMethodSelectorProps {
  onDeliveryMethodChange: (
    method: "pickup" | "delivery",
    zoneId?: number
  ) => void;
  initialMethod?: "pickup" | "delivery";
  initialZoneId?: number;
  disabled?: boolean;
}

export default function DeliveryMethodSelector({
  onDeliveryMethodChange,
  initialMethod = "delivery",
  initialZoneId,
  disabled = false,
}: DeliveryMethodSelectorProps) {
  const [deliveryMethod, setDeliveryMethod] = useState<"pickup" | "delivery">(
    initialMethod
  );
  const [selectedZoneId, setSelectedZoneId] = useState<number | undefined>(
    initialZoneId
  );
  const {
    zones,
    loading: zonesLoading,
    error: zonesError,
  } = useDeliveryZones();

  const handleMethodChange = (method: "pickup" | "delivery") => {
    setDeliveryMethod(method);
    if (method === "pickup") {
      setSelectedZoneId(undefined);
      onDeliveryMethodChange(method);
    } else {
      // If switching to delivery and no zone selected, select first available zone
      if (zones.length > 0 && !selectedZoneId) {
        const firstZone = zones[0];
        setSelectedZoneId(parseInt(firstZone.id));
        onDeliveryMethodChange(method, parseInt(firstZone.id));
      } else if (selectedZoneId) {
        onDeliveryMethodChange(method, selectedZoneId);
      }
    }
  };

  const handleZoneChange = (zoneId: number) => {
    setSelectedZoneId(zoneId);
    onDeliveryMethodChange(deliveryMethod, zoneId);
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

      {/* Delivery Zone Selection */}
      {deliveryMethod === "delivery" && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Delivery Zone
          </label>
          {zonesLoading ? (
            <div className="text-gray-400 text-sm">Loading zones...</div>
          ) : zonesError ? (
            <div className="text-red-400 text-sm">Error loading zones</div>
          ) : zones.length === 0 ? (
            <div className="text-gray-400 text-sm">
              No delivery zones available
            </div>
          ) : (
            <select
              value={selectedZoneId || ""}
              onChange={(e) => handleZoneChange(parseInt(e.target.value))}
              disabled={disabled}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="">Select a delivery zone</option>
              {zones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.name} - ₵{zone.deliveryFee} ({zone.estimatedDays})
                </option>
              ))}
            </select>
          )}

          {selectedZoneId && zones.length > 0 && (
            <div className="mt-2 text-sm text-gray-400">
              {
                zones.find((z) => parseInt(z.id) === selectedZoneId)
                  ?.description
              }
            </div>
          )}
        </div>
      )}

      {/* Pickup Information */}
      {deliveryMethod === "pickup" && (
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="text-sm text-gray-300">
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
