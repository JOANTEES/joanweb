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

interface Product {
  id: string;
  name: string;
  description?: string;
  costPrice?: number;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  effectivePrice: number;
  profitMargin?: {
    costPrice: number;
    sellingPrice: number;
    profit: number;
    margin: number;
  };
  brand?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  legacyCategory?: string;
  imageUrl?: string;
  images?: string[];
  requiresSpecialDelivery: boolean;
  deliveryEligible: boolean;
  pickupEligible: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
}

interface ProductsResponse {
  success: boolean;
  message: string;
  count: number;
  products: Product[];
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

const CACHE_TTL_MS = 60_000;
let productsCache: { data: Product[]; fetchedAt: number } | null = null;
let productsInflight: Promise<Product[]> | null = null;

async function fetchProductsFromApi(apiBaseUrl: string): Promise<Product[]> {
  const response = await fetch(`${apiBaseUrl}/products`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch products: ${response.status}`);
  }

  const data: ProductsResponse = await response.json();

  if (data.success && data.products) {
    return data.products;
  }

  throw new Error(data.message || "Invalid response format");
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>(
    () => productsCache?.data ?? []
  );
  const [loading, setLoading] = useState(() => !productsCache);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchProducts = useCallback(
    async (force = false) => {
      try {
        const now = Date.now();
        if (
          !force &&
          productsCache &&
          now - productsCache.fetchedAt < CACHE_TTL_MS
        ) {
          setProducts(productsCache.data);
          setLoading(false);
          setError(null);
          return;
        }

        setLoading(true);
        setError(null);

        if (!productsInflight || force) {
          productsInflight = fetchProductsFromApi(API_BASE_URL).finally(() => {
            productsInflight = null;
          });
        }

        const data = await productsInflight;
        productsCache = { data, fetchedAt: Date.now() };
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
        if (!productsCache) setProducts([]);
      } finally {
        setLoading(false);
      }
    },
    [API_BASE_URL]
  );

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  return {
    products,
    loading,
    error,
    refetch: () => fetchProducts(true),
  };
}
