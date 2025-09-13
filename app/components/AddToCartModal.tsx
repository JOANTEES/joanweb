"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { useCart } from "../contexts/CartContext";

interface Product {
  id: string;
  name: string;
  description?: string;
  price: string;
  category: string;
  imageUrl?: string;
  stock_quantity: number;
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
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      const success = await addToCart(
        parseInt(product.id),
        quantity,
        size || undefined,
        color || undefined
      );

      if (success) {
        onClose();
        // Reset form
        setQuantity(1);
        setSize("");
        setColor("");
      }
    } catch (error) {
      console.error("Error adding to cart:", error);
    } finally {
      setIsAdding(false);
    }
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
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <span className="text-gray-300 text-xs font-medium">IMG</span>
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">{product.name}</h3>
              <p className="text-yellow-400 font-semibold">₵{product.price}</p>
              <p className="text-gray-400 text-sm">{product.category}</p>
            </div>
          </div>
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
                setQuantity(Math.min(product.stock_quantity, quantity + 1))
              }
              className="p-2 bg-gray-700 hover:bg-gray-600 rounded-full transition-colors"
            >
              <Plus className="w-4 h-4 text-white" />
            </button>
            <span className="text-gray-400 text-sm ml-2">
              {product.stock_quantity} available
            </span>
          </div>
        </div>

        {/* Size Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Size (Optional)
          </label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            placeholder="e.g., M, L, XL"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>

        {/* Color Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Color (Optional)
          </label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="e.g., Red, Blue, Black"
            className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
          />
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={isAdding}
          className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-4 rounded-lg font-semibold transition-colors duration-200"
        >
          {isAdding ? "Adding..." : "Add to Cart"}
        </button>
      </div>
    </div>
  );
}
