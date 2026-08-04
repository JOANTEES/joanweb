"use client";

import { useState, useEffect, useCallback } from "react";

interface Brand {
  id: string;
  name: string;
  description?: string;
  logoUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BrandsResponse {
  success: boolean;
  message: string;
  count: number;
  brands: Brand[];
}

interface UseBrandsReturn {
  brands: Brand[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_TTL_MS = 5 * 60_000;
let brandsCache: { data: Brand[]; fetchedAt: number } | null = null;
let brandsInflight: Promise<Brand[]> | null = null;

async function fetchBrandsFromApi(apiBaseUrl: string): Promise<Brand[]> {
  const response = await fetch(`${apiBaseUrl}/brands`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch brands: ${response.status}`);
  }

  const data: BrandsResponse = await response.json();

  if (data.success && data.brands) {
    return data.brands;
  }

  throw new Error(data.message || "Invalid response format");
}

export function useBrands(): UseBrandsReturn {
  const [brands, setBrands] = useState<Brand[]>(() => brandsCache?.data ?? []);
  const [loading, setLoading] = useState(() => !brandsCache);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchBrands = useCallback(
    async (force = false) => {
      try {
        const now = Date.now();
        if (!force && brandsCache && now - brandsCache.fetchedAt < CACHE_TTL_MS) {
          setBrands(brandsCache.data);
          setLoading(false);
          setError(null);
          return;
        }

        setLoading(true);
        setError(null);

        if (!brandsInflight || force) {
          brandsInflight = fetchBrandsFromApi(API_BASE_URL).finally(() => {
            brandsInflight = null;
          });
        }

        const data = await brandsInflight;
        brandsCache = { data, fetchedAt: Date.now() };
        setBrands(data);
      } catch (err) {
        console.error("Error fetching brands:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch brands");
        if (!brandsCache) setBrands([]);
      } finally {
        setLoading(false);
      }
    },
    [API_BASE_URL]
  );

  useEffect(() => {
    fetchBrands();
  }, [fetchBrands]);

  return {
    brands,
    loading,
    error,
    refetch: () => fetchBrands(true),
  };
}
