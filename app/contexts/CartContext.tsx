"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";

interface CartItem {
  id: string;
  productId: string;
  productName: string;
  description?: string;
  price: number;
  category: string;
  imageUrl?: string;
  stockQuantity: number;
  quantity: number;
  size?: string;
  color?: string;
  subtotal: number;
  createdAt: string;
}

interface Cart {
  id: string;
  deliveryMethod: "pickup" | "delivery";
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryZoneFee?: number;
  createdAt: string;
  updatedAt: string;
}

interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
}

interface CartData {
  cart: Cart;
  items: CartItem[];
  totals: CartTotals;
  itemCount: number;
}

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  totals: CartTotals;
  itemCount: number;
  loading: boolean;
  error: string | null;
  addToCart: (
    productId: number,
    quantity?: number,
    size?: string,
    color?: string
  ) => Promise<boolean>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<boolean>;
  updateCartDeliveryMethod: (
    deliveryMethod: "pickup" | "delivery",
    deliveryZoneId?: number
  ) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [items, setItems] = useState<CartItem[]>([]);
  const [totals, setTotals] = useState<CartTotals>({
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
  });
  const [itemCount, setItemCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, setRedirectUrl } = useAuth();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  // Load cart from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      // Clear cart when user logs out
      setItems([]);
      setTotals({ subtotal: 0, tax: 0, shipping: 0, total: 0 });
      setItemCount(0);
    }
  }, [isAuthenticated]);

  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  const refreshCart = async () => {
    if (!isAuthenticated) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/cart`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setCart(data.data.cart || null);
          setItems(data.data.items || []);
          setTotals(
            data.data.totals || { subtotal: 0, tax: 0, shipping: 0, total: 0 }
          );
          setItemCount(data.data.itemCount || 0);
        }
      } else {
        throw new Error("Failed to fetch cart");
      }
    } catch (err) {
      console.error("Error fetching cart:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch cart");
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (
    productId: number,
    quantity: number = 1,
    size?: string,
    color?: string
  ): Promise<boolean> => {
    if (!isAuthenticated) {
      // Store current page for redirect after login with cart context
      if (typeof window !== "undefined") {
        setRedirectUrl(window.location.pathname, "cart");
      } else {
        setRedirectUrl("/shop", "cart");
      }
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/cart/add`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          productId,
          quantity,
          size,
          color,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh cart to get updated data
          await refreshCart();
          return true;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to add item to cart");
        return false;
      }
    } catch (err) {
      console.error("Error adding to cart:", err);
      setError(
        err instanceof Error ? err.message : "Failed to add item to cart"
      );
      return false;
    } finally {
      setLoading(false);
    }

    return false;
  };

  const removeFromCart = async (itemId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setItems(data.data.items || []);
          setTotals(
            data.data.totals || { subtotal: 0, tax: 0, shipping: 0, total: 0 }
          );
          setItemCount(data.data.itemCount || 0);
          return true;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to remove item from cart");
        return false;
      }
    } catch (err) {
      console.error("Error removing from cart:", err);
      setError(
        err instanceof Error ? err.message : "Failed to remove item from cart"
      );
      return false;
    } finally {
      setLoading(false);
    }

    return false;
  };

  const updateQuantity = async (
    itemId: string,
    quantity: number
  ): Promise<boolean> => {
    if (!isAuthenticated) return false;

    if (quantity <= 0) {
      return removeFromCart(itemId);
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/cart/${itemId}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({ quantity }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setItems(data.data.items || []);
          setTotals(
            data.data.totals || { subtotal: 0, tax: 0, shipping: 0, total: 0 }
          );
          setItemCount(data.data.itemCount || 0);
          return true;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update cart item");
        return false;
      }
    } catch (err) {
      console.error("Error updating cart:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update cart item"
      );
      return false;
    } finally {
      setLoading(false);
    }

    return false;
  };

  const updateCartDeliveryMethod = async (
    deliveryMethod: "pickup" | "delivery",
    deliveryZoneId?: number
  ): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/cart/delivery`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          deliveryMethod,
          deliveryZoneId,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Refresh cart to get updated data
          await refreshCart();
          return true;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update delivery method");
        return false;
      }
    } catch (err) {
      console.error("Error updating delivery method:", err);
      setError(
        err instanceof Error ? err.message : "Failed to update delivery method"
      );
      return false;
    } finally {
      setLoading(false);
    }

    return false;
  };

  const clearCart = async (): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/cart/clear`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setItems([]);
          setTotals({ subtotal: 0, tax: 0, shipping: 0, total: 0 });
          setItemCount(0);
          return true;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to clear cart");
        return false;
      }
    } catch (err) {
      console.error("Error clearing cart:", err);
      setError(err instanceof Error ? err.message : "Failed to clear cart");
      return false;
    } finally {
      setLoading(false);
    }

    return false;
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        items,
        totals,
        itemCount,
        loading,
        error,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateCartDeliveryMethod,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
