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

export function useCategories(): UseCategoriesReturn {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/categories`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
      }

      const data: CategoriesResponse = await response.json();

      if (data.success && data.categories) {
        setCategories(data.categories);
      } else {
        throw new Error(data.message || "Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories"
      );
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, [API_BASE_URL]);

  // Helper function to get category by ID (searches through all levels)
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

  // Helper function to build category path (e.g., "Men's Clothing / T-Shirts")
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
    refetch: fetchCategories,
    getCategoryPath,
    getCategoryById,
  };
}
