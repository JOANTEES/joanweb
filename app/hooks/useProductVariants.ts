"use client";

import { useState, useEffect, useCallback } from "react";

interface ProductVariant {
  id: string;
  productId: string;
  productName: string;
  size: string;
  color: string;
  stockQuantity: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductVariantsResponse {
  success: boolean;
  message: string;
  product: {
    id: string;
    name: string;
  };
  count: number;
  variants: ProductVariant[];
}

interface UseProductVariantsReturn {
  variants: ProductVariant[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_TTL_MS = 60_000;
const variantsCache = new Map<
  string,
  { data: ProductVariant[]; fetchedAt: number }
>();
const variantsInflight = new Map<string, Promise<ProductVariant[]>>();

async function fetchVariantsFromApi(
  apiBaseUrl: string,
  productId: string
): Promise<ProductVariant[]> {
  const response = await fetch(
    `${apiBaseUrl}/product-variants/product/${productId}`,
    {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch variants: ${response.status}`);
  }

  const data: ProductVariantsResponse = await response.json();

  if (data.success && data.variants) {
    return data.variants;
  }

  throw new Error(data.message || "Invalid response format");
}

export function useProductVariants(
  productId: string | null,
  options: { enabled?: boolean } = {}
): UseProductVariantsReturn {
  const enabled = options.enabled ?? true;
  const cached = productId ? variantsCache.get(productId) : undefined;

  const [variants, setVariants] = useState<ProductVariant[]>(
    () => cached?.data ?? []
  );
  const [loading, setLoading] = useState(
    () => Boolean(productId && enabled && !cached)
  );
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchVariants = useCallback(
    async (force = false) => {
      if (!productId || !enabled) {
        if (!productId) setVariants([]);
        setLoading(false);
        return;
      }

      try {
        const now = Date.now();
        const hit = variantsCache.get(productId);
        if (!force && hit && now - hit.fetchedAt < CACHE_TTL_MS) {
          setVariants(hit.data);
          setLoading(false);
          setError(null);
          return;
        }

        setLoading(true);
        setError(null);

        let inflight = variantsInflight.get(productId);
        if (!inflight || force) {
          inflight = fetchVariantsFromApi(API_BASE_URL, productId).finally(
            () => {
              variantsInflight.delete(productId);
            }
          );
          variantsInflight.set(productId, inflight);
        }

        const data = await inflight;
        variantsCache.set(productId, { data, fetchedAt: Date.now() });
        setVariants(data);
      } catch (err) {
        console.error("Error fetching variants:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch variants"
        );
        if (!variantsCache.has(productId)) setVariants([]);
      } finally {
        setLoading(false);
      }
    },
    [API_BASE_URL, productId, enabled]
  );

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  return {
    variants,
    loading,
    error,
    refetch: () => fetchVariants(true),
  };
}
