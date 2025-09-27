"use client";

import { useState } from "react";
import { useProductVariants } from "../hooks/useProductVariants";
import { useBrands } from "../hooks/useBrands";
import { useCategories } from "../hooks/useCategories";

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

interface Product {
  id: string;
  name: string;
  description?: string;
  sku?: string;
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
  requiresSpecialDelivery: boolean;
  deliveryEligible: boolean;
  pickupEligible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductCardProps {
  product: Product;
  onAddToCartClick: (
    product: Product & { variants?: ProductVariant[] }
  ) => void;
}

export default function ProductCard({
  product,
  onAddToCartClick,
}: ProductCardProps) {
  const {
    variants,
    loading: variantsLoading,
    error: variantsError,
  } = useProductVariants(product.id);
  const { brands } = useBrands();
  const { getCategoryPath } = useCategories();
  const [isHovered, setIsHovered] = useState(false);

  // Get brand information
  const brand = brands.find((b) => b.id === product.brand?.id);

  // Get category path (e.g., "Men's Clothing / T-Shirts")
  const categoryPath = product.category?.id
    ? getCategoryPath(product.category.id)
    : product.legacyCategory || "Uncategorized";

  // Calculate total stock across all variants
  const totalStock = variants.reduce(
    (total, variant) => total + variant.stockQuantity,
    0
  );
  const hasVariants = variants.length > 0;

  const handleAddToCartClick = () => {
    onAddToCartClick({
      ...product,
      variants: variants,
    });
  };

  return (
    <div
      className="group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="bg-gray-800 rounded-2xl p-8 mb-4 h-64 flex items-center justify-center group-hover:shadow-lg transition-shadow duration-300 border border-gray-700">
        {product.imageUrl || (product as any).image_url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={product.imageUrl || (product as any).image_url}
              alt={product.name}
              className="w-full h-full object-cover rounded-lg"
            />
          </>
        ) : (
          <div className="text-center">
            <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
              <span className="text-3xl">👕</span>
            </div>
            <p className="text-gray-300">Product Image</p>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {/* Brand and Category */}
        <div className="space-y-1">
          {brand && (
            <div className="flex items-center space-x-2">
              {brand.logoUrl && (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-4 h-4 object-contain"
                />
              )}
              <span className="text-xs text-blue-400 font-medium">
                {brand.name}
              </span>
            </div>
          )}
          <p className="text-sm text-yellow-400 font-medium">{categoryPath}</p>
        </div>

        <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">
          {product.name}
        </h3>

        {product.description && (
          <p className="text-gray-400 text-sm line-clamp-2">
            {product.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            {(product.discountPrice && product.discountPrice < product.price) ||
            (product.discountPercent && product.discountPercent > 0) ? (
              <>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold text-white">
                    ₵{product.effectivePrice}
                  </p>
                  <p className="text-lg text-gray-400 line-through">
                    ₵{product.price}
                  </p>
                </div>
                <p className="text-sm text-green-400">
                  Save ₵{(product.price - product.effectivePrice).toFixed(2)}
                </p>
              </>
            ) : (
              <p className="text-2xl font-bold text-white">
                ₵{product.effectivePrice}
              </p>
            )}
          </div>

          {/* Stock Information */}
          <div className="text-right">
            {variantsLoading ? (
              <div className="flex items-center space-x-1">
                <div className="w-3 h-3 border border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <span className="text-gray-400 text-sm">Loading...</span>
              </div>
            ) : variantsError ? (
              <span className="text-red-400 text-sm">
                Error loading variants
              </span>
            ) : hasVariants ? (
              <span className="text-green-400 text-sm">
                {totalStock} in stock
              </span>
            ) : (
              <span className="text-red-400 text-sm">No variants</span>
            )}
          </div>
        </div>

        <button
          onClick={handleAddToCartClick}
          disabled={variantsLoading || !hasVariants || totalStock === 0}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-3 rounded-full font-semibold transition-colors duration-200"
        >
          {variantsLoading
            ? "Loading..."
            : !hasVariants
            ? "No Variants Available"
            : totalStock === 0
            ? "Out of Stock"
            : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
