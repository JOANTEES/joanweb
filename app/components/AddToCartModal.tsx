"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { useRouter } from "next/navigation";
import VariantSelector from "./VariantSelector";

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
  price: number;
  effectivePrice: number;
  discountPrice?: number;
  discountPercent?: number;
  hasDiscount: boolean;
  discountAmount?: number;
  category?: {
    id: string;
    name: string;
  };
  legacyCategory?: string;
  imageUrl?: string;
  images?: string[]; // NEW: Array of all product and variant images
  deliveryEligible: boolean;
  pickupEligible: boolean;
  variants?: ProductVariant[];
}

interface AddToCartModalProps {
  product: Product;
  isOpen: boolean;
  onClose: () => void;
}

export default function AddToCartModal({
  product,
  isOpen,
  onClose,
}: AddToCartModalProps) {
  const { addToCart } = useCart();
  const { isAuthenticated, setRedirectUrl } = useAuth();
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const isVariantSelected = !!selectedVariant;

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      // Persist pending add-to-cart intent if variant is selected
      try {
        if (selectedVariant) {
          sessionStorage.setItem(
            "cart:intent",
            JSON.stringify({
              variantId: selectedVariant.id,
              quantity: quantity,
            })
          );
        }
      } catch {}
      setShowLoginPrompt(true);
      return;
    }
    if (!selectedVariant) {
      return; // Don't add if no variant selected
    }

    // Close modal immediately - no delays
    onClose();

    // Reset form immediately
    setQuantity(1);
    setSelectedVariant(null);

    // Add to cart in background - don't wait for it
    addToCart(selectedVariant.id, quantity).catch((error) => {
      console.error("Error adding to cart:", error);
      // Could show a toast notification here if needed
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">Add to Cart</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Product Info */}
        <div className="mb-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0 relative overflow-hidden">
              {(() => {
                // Get display image - prioritize selected variant image, then product images
                const displayImage =
                  selectedVariant?.imageUrl ||
                  (product.images && product.images.length > 0
                    ? product.images[0]
                    : null) ||
                  product.imageUrl;

                return displayImage ? (
                  <>
                    <img
                      src={displayImage}
                      alt={product.name}
                      className="w-full h-full object-cover rounded-lg transition-all duration-300"
                      onError={(e) => {
                        // Fallback for broken images
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-image.svg";
                      }}
                    />
                    {/* Show image count if multiple images available */}
                    {product.images && product.images.length > 1 && (
                      <div className="absolute bottom-0 right-0 bg-black/50 text-white text-xs px-1 rounded-tl">
                        {product.images.length}
                      </div>
                    )}
                  </>
                ) : (
                  <span className="text-gray-300 text-xs font-medium">IMG</span>
                );
              })()}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">{product.name}</h3>
              <div className="flex items-center space-x-2">
                {product.hasDiscount ? (
                  <>
                    <p className="text-yellow-400 font-semibold">
                      ₵{product.effectivePrice}
                    </p>
                    <p className="text-gray-400 text-sm line-through">
                      ₵{product.price}
                    </p>
                    <span className="text-green-400 text-xs">
                      Save ₵{product.discountAmount}
                    </span>
                  </>
                ) : (
                  <p className="text-yellow-400 font-semibold">
                    ₵{product.effectivePrice}
                  </p>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                {product.category?.name ||
                  product.legacyCategory ||
                  "Uncategorized"}
              </p>
            </div>
          </div>
        </div>

        {/* Variant Selection */}
        <div className="mb-6">
          <VariantSelector
            productId={product.id}
            onVariantSelect={setSelectedVariant}
            selectedVariant={selectedVariant}
          />
        </div>

        {/* Quantity Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Quantity
          </label>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={!isVariantSelected}
              className={`p-2 rounded-full transition-colors ${
                !isVariantSelected
                  ? "bg-gray-700/60 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <span className="text-white font-medium min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() => {
                if (!selectedVariant) return;
                setQuantity((q) =>
                  Math.min(selectedVariant.stockQuantity, q + 1)
                );
              }}
              disabled={!isVariantSelected}
              className={`p-2 rounded-full transition-colors ${
                !isVariantSelected
                  ? "bg-gray-700/60 cursor-not-allowed"
                  : "bg-gray-700 hover:bg-gray-600"
              }`}
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
            <span className="text-gray-400 text-sm ml-2">
              {selectedVariant
                ? `${selectedVariant.stockQuantity} available`
                : "Select variant first"}
            </span>
          </div>
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!selectedVariant || selectedVariant.stockQuantity === 0}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-4 rounded-lg font-semibold transition-colors duration-200"
        >
          {!selectedVariant
            ? "Select Size & Color"
            : selectedVariant.stockQuantity === 0
            ? "Out of Stock"
            : "Add to Cart"}
        </button>
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
