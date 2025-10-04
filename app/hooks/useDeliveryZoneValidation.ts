"use client";

import { useState, useCallback } from "react";
import { useDeliveryZones } from "./useDeliveryZones";
import { useGhanaLocations } from "./useGhanaLocations";

interface Address {
  regionId: number;
  cityId: number;
  areaName: string;
  landmark?: string;
  additionalInstructions?: string;
  contactPhone?: string;
}

interface ValidationResult {
  isValid: boolean;
  message: string;
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryZoneFee?: number;
}

export function useDeliveryZoneValidation() {
  const { zones, loading: zonesLoading } = useDeliveryZones();
  const { cities } = useGhanaLocations();
  const [validating, setValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };
  };

  // Method 1: Validate using the backend API
  const validateAddressWithApi = useCallback(
    async (address: Address): Promise<ValidationResult> => {
      setValidating(true);
      setError(null);

      try {
        const response = await fetch(`${API_BASE_URL}/cart/validate-address`, {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify({
            regionId: address.regionId,
            cityId: address.cityId,
            areaName: address.areaName,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to validate address");
        }

        const data = await response.json();

        if (data.success) {
          return {
            isValid: data.isValid,
            message: data.message,
            deliveryZoneId: data.deliveryZoneId,
            deliveryZoneName: data.deliveryZoneName,
            deliveryZoneFee: data.deliveryZoneFee,
          };
        } else {
          throw new Error(data.message || "Address validation failed");
        }
      } catch (err) {
        console.error("Error validating address:", err);
        setError(
          err instanceof Error ? err.message : "Failed to validate address"
        );
        return {
          isValid: false,
          message:
            err instanceof Error ? err.message : "Failed to validate address",
        };
      } finally {
        setValidating(false);
      }
    },
    [API_BASE_URL]
  );

  // Method 2: Validate on the client side using zone data
  const validateAddressLocally = useCallback(
    (address: Address): ValidationResult => {
      console.log(
        "%cValidating Address Locally:",
        "color: yellow; font-weight: bold;",
        address
      );

      if (zonesLoading) {
        console.log("Validation check: Zones are still loading.");
        return {
          isValid: false,
          message: "Loading delivery zones...",
        };
      }

      if (!address.regionId || !address.cityId || !address.areaName) {
        console.log("Validation check: Address information is incomplete.");
        return {
          isValid: false,
          message: "Incomplete address information",
        };
      }

      // Check each zone to see if it covers the address
      for (const zone of zones) {
        console.log(`%cChecking Zone: ${zone.name}`, "color: cyan;", zone);

        // Check if the zone has structured areas (fallback to any for shape differences)
        const areas = (
          zone as {
            structuredAreas?: Array<{
              regionId: number;
              cityId: number;
            }>;
          }
        ).structuredAreas;
        if (Array.isArray(areas) && areas.length > 0) {
          console.log("Zone has structured areas to check:", areas);

          // Find if this zone covers the address's city, ignoring the specific areaName.
          // IMPORTANT: Convert address IDs to numbers for a strict type comparison.
          const cityIsCovered = areas.some(
            (area) =>
              area.regionId === Number(address.regionId) &&
              area.cityId === Number(address.cityId)
          );

          if (cityIsCovered) {
            console.log(
              `%cSUCCESS: Address city is covered by zone "${zone.name}".`,
              "color: green;"
            );
            return {
              isValid: true,
              message: `Delivery available in ${
                cities.find((c) => c.id === address.cityId)?.name || "your city"
              }`,
              deliveryZoneId: zone.id,
              deliveryZoneName: zone.name,
              deliveryZoneFee: zone.deliveryFee,
            };
          }
        } else {
          console.log("Zone has no structured areas to validate against.");
        }
      }

      // If we get here, no matching zone was found
      console.log(
        "%cWARNING: Address is outside our current delivery zones.",
        "color: orange;"
      );
      return {
        isValid: false,
        message:
          "We don't deliver to this area yet. Please choose a different address or select pickup instead.",
      };
    },
    [zones, zonesLoading, cities]
  );

  // Combined validation function that tries API first, then falls back to local
  const validateAddress = useCallback(
    async (address: Address): Promise<ValidationResult> => {
      try {
        // Try the API validation first
        return await validateAddressWithApi(address);
      } catch (error) {
        console.warn(
          "API validation failed, falling back to local validation:",
          error
        );
        // Fall back to local validation if API fails
        return validateAddressLocally(address);
      }
    },
    [validateAddressWithApi, validateAddressLocally]
  );

  return {
    validateAddress,
    validateAddressLocally,
    validating,
    error,
  };
}
