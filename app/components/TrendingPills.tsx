"use client";

import { useMemo } from "react";
import { useBrands } from "../hooks/useBrands";
import { useCategories } from "../hooks/useCategories";
import { useProducts } from "../hooks/useProducts";

// Define recursive category type
type CategoryWithChildren = {
  id: string;
  children?: CategoryWithChildren[];
};

interface TrendingPillsProps {
  selectedBrands: string[];
  selectedCategories: string[];
  onBrandToggle: (brandId: string) => void;
  onCategoryToggle: (categoryId: string) => void;
}

export default function TrendingPills({
  selectedBrands,
  selectedCategories,
  onBrandToggle,
  onCategoryToggle,
}: TrendingPillsProps) {
  const { brands } = useBrands();
  const { categories } = useCategories();
  const { products } = useProducts();

  // Calculate popular brands and categories based on product count
  const trendingItems = useMemo(() => {
    // Count products per brand
    const brandCounts = brands.map((brand) => ({
      ...brand,
      productCount: products.filter((p) => p.brand?.id === brand.id).length,
    }));

    // Count products per category (including subcategories)
    const categoryCounts = categories.map((category) => {
      const countProductsInCategory = (cat: CategoryWithChildren): number => {
        let count = products.filter((p) => p.category?.id === cat.id).length;
        if (cat.children) {
          count += cat.children.reduce(
            (sum: number, child: CategoryWithChildren) =>
              sum + countProductsInCategory(child),
            0
          );
        }
        return count;
      };

      return {
        ...category,
        productCount: countProductsInCategory(category),
      };
    });

    // Get top brands (at least 1 product)
    const popularBrands = brandCounts
      .filter((brand) => brand.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 4);

    // Get top categories (at least 1 product)
    const popularCategories = categoryCounts
      .filter((category) => category.productCount > 0)
      .sort((a, b) => b.productCount - a.productCount)
      .slice(0, 4);

    return {
      brands: popularBrands,
      categories: popularCategories,
    };
  }, [brands, categories, products]);

  const handleBrandClick = (brandId: string) => {
    onBrandToggle(brandId);
  };

  const handleCategoryClick = (categoryId: string) => {
    onCategoryToggle(categoryId);
  };

  if (
    trendingItems.brands.length === 0 &&
    trendingItems.categories.length === 0
  ) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Popular Brands */}
      {trendingItems.brands.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Popular Brands
          </h4>
          <div className="flex flex-wrap gap-2">
            {trendingItems.brands.map((brand) => (
              <button
                key={brand.id}
                onClick={() => handleBrandClick(brand.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center space-x-2 ${
                  selectedBrands.includes(brand.id)
                    ? "bg-blue-500 text-white"
                    : "bg-gray-700 text-gray-300 hover:bg-blue-500 hover:text-white"
                }`}
              >
                {brand.logoUrl && (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="w-4 h-4 object-contain"
                  />
                )}
                <span>{brand.name}</span>
                <span className="text-xs opacity-75">
                  ({brand.productCount})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Popular Categories */}
      {trendingItems.categories.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-300 mb-2">
            Popular Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            {trendingItems.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedCategories.includes(category.id)
                    ? "bg-yellow-400 text-black"
                    : "bg-gray-700 text-gray-300 hover:bg-yellow-400 hover:text-black"
                }`}
              >
                <span>{category.name}</span>
                <span className="text-xs opacity-75 ml-1">
                  ({category.productCount})
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
