"use client";

import { useState, useEffect, useCallback } from "react";

interface Region {
  id: number;
  name: string;
  code: string;
}

interface City {
  id: number;
  name: string;
  region_id: number;
  region_name: string;
  region_code: string;
}

interface RegionsResponse {
  success: boolean;
  message: string;
  count: number;
  regions: Region[];
}

interface CitiesResponse {
  success: boolean;
  message: string;
  count: number;
  cities: City[];
}

export function useGhanaLocations() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchRegions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/ghana/regions`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch regions");
      }

      const data: RegionsResponse = await response.json();

      if (data.regions) {
        setRegions(data.regions);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching regions:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch regions");
      setRegions([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  const fetchCities = useCallback(
    async (regionId?: number) => {
      setLoading(true);
      setError(null);
      try {
        const url = regionId
          ? `${API_BASE_URL}/ghana/cities/${regionId}`
          : `${API_BASE_URL}/ghana/cities`;

        console.log(`Fetching cities from: ${url}`);

        const response = await fetch(url, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Failed to fetch cities");
        }

        const data: CitiesResponse = await response.json();

        if (data.cities) {
          console.log(`Received ${data.cities.length} cities:`, data.cities);

          // Check if Tema is in the list
          const temaCity = data.cities.find(
            (city) =>
              city.name.toLowerCase() === "tema" ||
              city.name.toLowerCase().includes("tema")
          );

          if (temaCity) {
            console.log("Found Tema in cities list:", temaCity);
          } else {
            console.log("Tema NOT found in cities list");
          }

          setCities(data.cities);
        } else {
          throw new Error("Invalid response format");
        }
      } catch (err) {
        console.error("Error fetching cities:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch cities");
        setCities([]);
      } finally {
        setLoading(false);
      }
    },
    [API_BASE_URL]
  );

  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  return {
    regions,
    cities,
    loading,
    error,
    fetchRegions,
    fetchCities,
  };
}
