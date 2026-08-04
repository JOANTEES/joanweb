"use client";

import { useState, useEffect, useCallback } from "react";

interface Category {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  imageUrl?: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  children?: Category[];
}

interface CategoriesResponse {
  success: boolean;
  message: string;
  count: number;
  categories: Category[];
}

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  getCategoryPath: (categoryId: string) => string;
  getCategoryById: (categoryId: string) => Category | null;
}

const CACHE_TTL_MS = 5 * 60_000;
let categoriesCache: { data: Category[]; fetchedAt: number } | null = null;
let categoriesInflight: Promise<Category[]> | null = null;

async function fetchCategoriesFromApi(
  apiBaseUrl: string
): Promise<Category[]> {
  const response = await fetch(`${apiBaseUrl}/categories`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch categories: ${response.status}`);
  }

  const data: CategoriesResponse = await response.json();

  if (data.success && data.categories) {
    return data.categories;
  }

  throw new Error(data.message || "Invalid response format");
}

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>(
    () => categoriesCache?.data ?? []
  );
  const [loading, setLoading] = useState(() => !categoriesCache);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchCategories = useCallback(
    async (force = false) => {
      try {
        const now = Date.now();
        if (
          !force &&
          categoriesCache &&
          now - categoriesCache.fetchedAt < CACHE_TTL_MS
        ) {
          setCategories(categoriesCache.data);
          setLoading(false);
          setError(null);
          return;
        }

        setLoading(true);
        setError(null);

        if (!categoriesInflight || force) {
          categoriesInflight = fetchCategoriesFromApi(API_BASE_URL).finally(
            () => {
              categoriesInflight = null;
            }
          );
        }

        const data = await categoriesInflight;
        categoriesCache = { data, fetchedAt: Date.now() };
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(
          err instanceof Error ? err.message : "Failed to fetch categories"
        );
        if (!categoriesCache) setCategories([]);
      } finally {
        setLoading(false);
      }
    },
    [API_BASE_URL]
  );

  const getCategoryById = useCallback(
    (categoryId: string): Category | null => {
      const findCategory = (cats: Category[]): Category | null => {
        for (const cat of cats) {
          if (cat.id === categoryId) return cat;
          if (cat.children) {
            const found = findCategory(cat.children);
            if (found) return found;
          }
        }
        return null;
      };
      return findCategory(categories);
    },
    [categories]
  );

  const getCategoryPath = useCallback(
    (categoryId: string): string => {
      const category = getCategoryById(categoryId);
      if (!category) return "Uncategorized";

      const buildPath = (cat: Category): string[] => {
        const path = [cat.name];
        if (cat.parentId) {
          const parent = getCategoryById(cat.parentId);
          if (parent) {
            return [...buildPath(parent), ...path];
          }
        }
        return path;
      };

      return buildPath(category).join(" / ");
    },
    [getCategoryById]
  );

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  return {
    categories,
    loading,
    error,
    refetch: () => fetchCategories(true),
    getCategoryPath,
    getCategoryById,
  };
}
