"use client";

import { useState, useEffect, useCallback } from "react";

interface ProductVariant {
  id: string;
  productId: string;
  productName: string;
  sku: string;
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

export function useProductVariants(
  productId: string | null
): UseProductVariantsReturn {
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchVariants = useCallback(async () => {
    if (!productId) {
      setVariants([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/product-variants/product/${productId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch variants: ${response.status}`);
      }

      const data: ProductVariantsResponse = await response.json();

      if (data.success && data.variants) {
        setVariants(data.variants);
      } else {
        throw new Error(data.message || "Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching variants:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch variants");
      setVariants([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL, productId]);

  useEffect(() => {
    fetchVariants();
  }, [fetchVariants]);

  return {
    variants,
    loading,
    error,
    refetch: fetchVariants,
  };
}
