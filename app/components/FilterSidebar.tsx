"use client";

import { useState } from "react";
import { useBrands } from "../hooks/useBrands";
import { useCategories } from "../hooks/useCategories";
import { X, ChevronDown, ChevronRight } from "lucide-react";

// Define recursive category type
type CategoryWithChildren = {
  id: string;
  name: string;
  children?: CategoryWithChildren[];
};

interface FilterSidebarProps {
  selectedBrands: string[];
  selectedCategories: string[];
  onBrandChange: (brands: string[]) => void;
  onCategoryChange: (categories: string[]) => void;
  onClearFilters: () => void;
}

export default function FilterSidebar({
  selectedBrands,
  selectedCategories,
  onBrandChange,
  onCategoryChange,
  onClearFilters,
}: FilterSidebarProps) {
  const { brands, loading: brandsLoading } = useBrands();
  const { categories, loading: categoriesLoading } = useCategories();
  const [expandedSections, setExpandedSections] = useState({
    brands: true,
    categories: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleBrandToggle = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      onBrandChange(selectedBrands.filter((id) => id !== brandId));
    } else {
      onBrandChange([...selectedBrands, brandId]);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      onCategoryChange(selectedCategories.filter((id) => id !== categoryId));
    } else {
      onCategoryChange([...selectedCategories, categoryId]);
    }
  };

  const renderCategoryTree = (
    categories: CategoryWithChildren[],
    level = 0
  ) => {
    return categories.map((category) => (
      <div key={category.id} className="ml-2">
        <label className="flex items-center space-x-2 py-1 cursor-pointer hover:bg-gray-700/50 rounded px-2">
          <input
            type="checkbox"
            checked={selectedCategories.includes(category.id)}
            onChange={() => handleCategoryToggle(category.id)}
            className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2"
          />
          <span
            className="text-sm text-gray-300"
            style={{ marginLeft: `${level * 12}px` }}
          >
            {category.name}
          </span>
        </label>
        {category.children && category.children.length > 0 && (
          <div className="ml-4">
            {renderCategoryTree(category.children, level + 1)}
          </div>
        )}
      </div>
    ));
  };

  const hasActiveFilters =
    selectedBrands.length > 0 || selectedCategories.length > 0;

  return (
    <div className="w-80 bg-gray-800 rounded-lg p-6 h-fit sticky top-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-white">Filters</h3>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-sm text-yellow-400 hover:text-yellow-300 flex items-center space-x-1"
          >
            <X className="w-4 h-4" />
            <span>Clear All</span>
          </button>
        )}
      </div>

      {/* Brands Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("brands")}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <h4 className="text-md font-medium text-white">Brands</h4>
          {expandedSections.brands ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.brands && (
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brandsLoading ? (
              <div className="text-center py-4">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Loading brands...</p>
              </div>
            ) : brands.length === 0 ? (
              <p className="text-gray-400 text-sm">No brands available</p>
            ) : (
              brands.map((brand) => (
                <label
                  key={brand.id}
                  className="flex items-center space-x-3 py-2 cursor-pointer hover:bg-gray-700/50 rounded px-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand.id)}
                    onChange={() => handleBrandToggle(brand.id)}
                    className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2"
                  />
                  <div className="flex items-center space-x-2">
                    {brand.logoUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={brand.logoUrl}
                        alt={`${brand.name} logo`}
                        className="w-8 h-8 object-contain"
                      />
                    )}
                    <span className="text-sm text-gray-300">{brand.name}</span>
                  </div>
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Categories Section */}
      <div className="mb-6">
        <button
          onClick={() => toggleSection("categories")}
          className="flex items-center justify-between w-full text-left mb-3"
        >
          <h4 className="text-md font-medium text-white">Categories</h4>
          {expandedSections.categories ? (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-400" />
          )}
        </button>

        {expandedSections.categories && (
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {categoriesLoading ? (
              <div className="text-center py-4">
                <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                <p className="text-gray-400 text-sm">Loading categories...</p>
              </div>
            ) : categories.length === 0 ? (
              <p className="text-gray-400 text-sm">No categories available</p>
            ) : (
              renderCategoryTree(categories)
            )}
          </div>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-400 mb-2">Active Filters:</p>
          <div className="space-y-1">
            {selectedBrands.length > 0 && (
              <p className="text-xs text-blue-400">
                {selectedBrands.length} brand
                {selectedBrands.length !== 1 ? "s" : ""} selected
              </p>
            )}
            {selectedCategories.length > 0 && (
              <p className="text-xs text-yellow-400">
                {selectedCategories.length} categor
                {selectedCategories.length !== 1 ? "ies" : "y"} selected
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
