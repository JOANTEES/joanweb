"use client";

import { useState, useEffect, useCallback } from "react";

interface DeliveryZone {
  id: string;
  name: string;
  description: string;
  deliveryFee: number;
  estimatedDays: string;
  coverageAreas: string[];
  isActive: boolean;
  createdAt: string;
}

interface DeliveryZonesResponse {
  success: boolean;
  message: string;
  zones: DeliveryZone[];
  count: number;
}

export function useDeliveryZones() {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchDeliveryZones = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/delivery-zones`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch delivery zones");
      }

      const data: DeliveryZonesResponse = await response.json();

      if (data.zones) {
        console.log("Received delivery zones:", data.zones);
        setZones(data.zones.filter((zone) => zone.isActive));
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching delivery zones:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch delivery zones"
      );
      setZones([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchDeliveryZones();
  }, [fetchDeliveryZones]);

  return { zones, loading, error, refetch: fetchDeliveryZones };
}
