"use client";

import { useState } from "react";
import { X, ShoppingCart } from "lucide-react";
import ImageGallery from "./ImageGallery";
import VariantSelector from "./VariantSelector";
import { useCart } from "../contexts/CartContext";
import { useProductVariants } from "../hooks/useProductVariants";
import { useBrands } from "../hooks/useBrands";
import { useCategories } from "../hooks/useCategories";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";

interface ProductVariant {
  id: string;
  productId: string;
  productName: string;
  // sku: string; // Temporarily disabled
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
  images?: string[];
  requiresSpecialDelivery: boolean;
  deliveryEligible: boolean;
  pickupEligible: boolean;
  createdAt: string;
  updatedAt: string;
  variants?: ProductVariant[];
}

interface ProductDetailModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductDetailModal({
  product,
  isOpen,
  onClose,
}: ProductDetailModalProps) {
  const { addToCart } = useCart();
  const { isAuthenticated, setRedirectUrl } = useAuth();
  const router = useRouter();
  const { variants } = useProductVariants(product.id);
  const { brands } = useBrands();
  const { getCategoryPath } = useCategories();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [quantity, setQuantity] = useState(1);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const variantRequired = variants.length > 0;
  const isVariantSelected = !!selectedVariant;
  const quantityDisabled = variantRequired && !isVariantSelected;

  // Get brand information
  const brand = brands.find((b) => b.id === product.brand?.id);

  // Get category path
  const categoryPath = product.category?.id
    ? getCategoryPath(product.category.id)
    : product.legacyCategory || "Uncategorized";

  // Get display images
  const displayImages =
    product.images && product.images.length > 0
      ? product.images.filter((img) => img && img.trim() !== "")
      : product.imageUrl
      ? [product.imageUrl]
      : [];

  const mainImage = displayImages[0] || product.imageUrl;

  // Calculate total stock across all variants
  const totalStock = variants.reduce(
    (total, variant) => total + variant.stockQuantity,
    0
  );

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Persist pending add-to-cart intent if variant is selected
      try {
        if (selectedVariant) {
          sessionStorage.setItem(
            "cart:intent",
            JSON.stringify({ variantId: selectedVariant.id, quantity })
          );
        }
      } catch {}
      setShowLoginPrompt(true);
      return;
    }
    if (variants.length > 0 && !selectedVariant) {
      // Show error - variant selection required
      return;
    }

    if (variants.length > 0) {
      // Add variant to cart
      addToCart(selectedVariant!.id, quantity);
    } else {
      // Add product directly (no variants)
      // This would need to be implemented in the cart context
      console.log("Adding product without variants - needs implementation");
    }

    onClose();
  };

  const handleVariantSelect = (variant: ProductVariant | null) => {
    setSelectedVariant(variant);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-gray-800 rounded-2xl w-full max-w-6xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-b border-gray-700 flex-shrink-0">
          <h2 className="text-lg sm:text-2xl font-bold text-white truncate pr-4">
            {product.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-2 flex-shrink-0"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row flex-1 min-h-0">
          {/* Left Side - Image Gallery */}
          <div className="lg:w-1/2 p-4 lg:p-6 flex-shrink-0">
            <ImageGallery
              images={displayImages}
              mainImage={mainImage}
              showThumbnails={true}
              maxThumbnails={6}
              className="h-full max-h-96 lg:max-h-none"
            />
          </div>

          {/* Right Side - Product Details */}
          <div className="lg:w-1/2 p-4 lg:p-6 overflow-y-auto flex flex-col min-h-0">
            <div className="space-y-6 flex-1">
              {/* Brand and Category */}
              <div className="space-y-2">
                {brand && (
                  <div className="text-sm text-gray-400">
                    Brand:{" "}
                    <span className="text-white font-medium">{brand.name}</span>
                  </div>
                )}
                <div className="text-sm text-gray-400">
                  Category:{" "}
                  <span className="text-white font-medium">{categoryPath}</span>
                </div>
                {/** SKU temporarily hidden until SKU feature is enabled */}
                {/**
                {product.sku && (
                  <div className="text-sm text-gray-400">
                    SKU:{" "}
                    <span className="text-white font-medium">
                      {product.sku}
                    </span>
                  </div>
                )}
                */}
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    Description
                  </h3>
                  <p className="text-gray-300 leading-relaxed">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Pricing */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Pricing</h3>
                <div className="flex items-center space-x-4">
                  {product.discountPrice &&
                  product.discountPrice < product.price ? (
                    <>
                      <span className="text-3xl font-bold text-yellow-400">
                        ₵{product.effectivePrice}
                      </span>
                      <span className="text-xl text-gray-400 line-through">
                        ₵{product.price}
                      </span>
                      <span className="bg-green-500 text-white px-2 py-1 rounded text-sm font-medium">
                        Save ₵{product.price - product.effectivePrice}
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl font-bold text-yellow-400">
                      ₵{product.effectivePrice}
                    </span>
                  )}
                </div>
                {product.discountPercent && (
                  <div className="text-green-400 text-sm">
                    {product.discountPercent}% off
                  </div>
                )}
              </div>

              {/* Stock Information */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  Availability
                </h3>
                {variants.length > 0 ? (
                  <div className="text-gray-300">
                    {totalStock > 0 ? (
                      <span className="text-green-400">
                        {totalStock} items in stock across all variants
                      </span>
                    ) : (
                      <span className="text-red-400">Out of stock</span>
                    )}
                  </div>
                ) : (
                  <div className="text-gray-300">
                    {totalStock > 0 ? (
                      <span className="text-green-400">In stock</span>
                    ) : (
                      <span className="text-red-400">Out of stock</span>
                    )}
                  </div>
                )}
              </div>

              {/* Variant Selection */}
              {variants.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-white">
                    Select Variant
                  </h3>
                  <VariantSelector
                    productId={product.id}
                    onVariantSelect={handleVariantSelect}
                    selectedVariant={selectedVariant}
                  />
                </div>
              )}

              {/* Quantity Selection */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">Quantity</h3>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantityDisabled}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white transition-colors ${
                      quantityDisabled
                        ? "bg-gray-700/60 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    -
                  </button>
                  <span className="text-white font-medium text-lg w-12 text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    disabled={quantityDisabled}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white transition-colors ${
                      quantityDisabled
                        ? "bg-gray-700/60 cursor-not-allowed"
                        : "bg-gray-700 hover:bg-gray-600"
                    }`}
                  >
                    +
                  </button>
                </div>
                {quantityDisabled && (
                  <div className="text-xs text-gray-400">
                    Select a variant to set quantity.
                  </div>
                )}
              </div>

              {/* Delivery Options */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-white">
                  Delivery Options
                </h3>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        product.deliveryEligible ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="text-gray-300">
                      {product.deliveryEligible
                        ? "Available for delivery"
                        : "Not available for delivery"}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        product.pickupEligible ? "bg-green-500" : "bg-red-500"
                      }`}
                    />
                    <span className="text-gray-300">
                      {product.pickupEligible
                        ? "Available for pickup"
                        : "Not available for pickup"}
                    </span>
                  </div>
                  {product.requiresSpecialDelivery && (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <span className="text-yellow-400">
                        Requires special delivery
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons - Fixed at bottom */}
            <div className="pt-4 mt-6 border-t border-gray-700 flex-shrink-0">
              <button
                onClick={handleAddToCart}
                disabled={variantRequired && !isVariantSelected}
                className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>Add to Cart</span>
              </button>

              {/* Error Messages */}
              {variants.length > 0 && !selectedVariant && (
                <div className="text-red-400 text-sm mt-2 text-center">
                  Please select a variant before adding to cart
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-sm mx-4 shadow-xl">
            <div className="px-5 py-4 border-b border-gray-800">
              <h3 className="text-white text-lg font-semibold">
                Sign in required
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Please sign in to add items to your cart.
              </p>
            </div>
            <div className="px-5 py-4 flex justify-end gap-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    setRedirectUrl(window.location.pathname, "cart");
                  }
                  router.push("/login");
                }}
                className="px-4 py-2 rounded-md bg-yellow-400 hover:bg-yellow-500 text-black font-semibold transition-colors"
              >
                Sign in
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
