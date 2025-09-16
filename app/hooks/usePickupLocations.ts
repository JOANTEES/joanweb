"use client";

import { useCallback, useEffect, useState } from "react";

export interface PickupLocation {
  id: string;
  name: string;
  description?: string;
  regionName?: string;
  cityName?: string;
  areaName?: string;
  landmark?: string;
  additionalInstructions?: string;
  contactPhone?: string;
  contactEmail?: string;
  operatingHours?: Record<string, string>;
  googleMapsLink?: string;
  createdAt?: string;
}

interface PickupLocationsResponse {
  success: boolean;
  message: string;
  count: number;
  locations: PickupLocation[];
}

export function usePickupLocations() {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchPickupLocations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/pickup-locations`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.message || "Failed to fetch pickup locations"
        );
      }

      const data: PickupLocationsResponse = await response.json();
      if (Array.isArray(data.locations)) {
        setLocations(data.locations);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching pickup locations:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch pickup locations"
      );
      setLocations([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  useEffect(() => {
    fetchPickupLocations();
  }, [fetchPickupLocations]);

  return { locations, loading, error, refetch: fetchPickupLocations };
}
