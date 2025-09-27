"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { useCart } from "../contexts/CartContext";
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
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null
  );

  const handleAddToCart = () => {
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
            <div className="w-16 h-16 bg-gray-600 rounded-lg flex items-center justify-center flex-shrink-0">
              {product.imageUrl ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover rounded-lg"
                  />
                </>
              ) : (
                <span className="text-gray-300 text-xs font-medium">IMG</span>
              )}
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
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            >
              <Minus className="w-4 h-4 text-white" />
            </button>
            <span className="text-white font-medium min-w-[2rem] text-center">
              {quantity}
            </span>
            <button
              onClick={() =>
                setQuantity(
                  Math.min(selectedVariant?.stockQuantity || 0, quantity + 1)
                )
              }
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
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
    </div>
  );
}
