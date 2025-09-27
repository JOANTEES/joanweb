"use client";

import { useState, useEffect } from "react";
import { useProductVariants } from "../hooks/useProductVariants";

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

interface VariantSelectorProps {
  productId: string;
  onVariantSelect: (variant: ProductVariant | null) => void;
  selectedVariant: ProductVariant | null;
}

export default function VariantSelector({
  productId,
  onVariantSelect,
  selectedVariant,
}: VariantSelectorProps) {
  const { variants, loading, error } = useProductVariants(productId);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [selectedColor, setSelectedColor] = useState<string>("");

  // Get unique sizes and colors from variants
  const availableSizes = Array.from(
    new Set(variants.map((v) => v.size))
  ).sort();
  const availableColors = Array.from(
    new Set(variants.map((v) => v.color))
  ).sort();

  // Find the selected variant based on size and color
  useEffect(() => {
    if (selectedSize && selectedColor) {
      const variant = variants.find(
        (v) =>
          v.size === selectedSize && v.color === selectedColor && v.isActive
      );
      onVariantSelect(variant || null);
    } else {
      onVariantSelect(null);
    }
  }, [selectedSize, selectedColor, variants, onVariantSelect]);

  // Reset selections when product changes
  useEffect(() => {
    setSelectedSize("");
    setSelectedColor("");
  }, [productId]);

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
        <p className="text-gray-400 text-sm">Loading variants...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4">
        <p className="text-red-400 text-sm">{error}</p>
      </div>
    );
  }

  if (variants.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-gray-400 text-sm">
          No variants available for this product
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Size Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-3">
          Size <span className="text-red-400">*</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {availableSizes.map((size) => {
            const sizeVariants = variants.filter(
              (v) => v.size === size && v.isActive
            );
            const totalStock = sizeVariants.reduce(
              (sum, v) => sum + v.stockQuantity,
              0
            );
            const isDisabled = totalStock === 0;

            return (
              <button
                key={size}
                onClick={() => {
                  setSelectedSize(size);
                  setSelectedColor(""); // Reset color when size changes
                }}
                disabled={isDisabled}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedSize === size
                    ? "bg-yellow-400 text-black"
                    : isDisabled
                    ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                    : "bg-gray-700 text-white hover:bg-gray-600"
                }`}
              >
                {size}
                {isDisabled && <span className="ml-1 text-xs">(OOS)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Color Selection */}
      {selectedSize && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Color <span className="text-red-400">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {availableColors.map((color) => {
              const colorVariants = variants.filter(
                (v) =>
                  v.size === selectedSize && v.color === color && v.isActive
              );
              const totalStock = colorVariants.reduce(
                (sum, v) => sum + v.stockQuantity,
                0
              );
              const isDisabled = totalStock === 0;

              return (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  disabled={isDisabled}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedColor === color
                      ? "bg-yellow-400 text-black"
                      : isDisabled
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gray-700 text-white hover:bg-gray-600"
                  }`}
                >
                  {color}
                  {isDisabled && <span className="ml-1 text-xs">(OOS)</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Variant Info */}
      {selectedVariant && (
        <div className="bg-gray-700/50 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-300">Selected:</span>
            <span className="text-sm font-medium text-white">
              {selectedVariant.size} - {selectedVariant.color}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">SKU:</span>
            <span className="text-sm text-gray-400">{selectedVariant.sku}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-300">Stock:</span>
            <span
              className={`text-sm font-medium ${
                selectedVariant.stockQuantity > 0
                  ? "text-green-400"
                  : "text-red-400"
              }`}
            >
              {selectedVariant.stockQuantity} available
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
