"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
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
  deliveryEligible: boolean;
  pickupEligible: boolean;
  requiresSpecialDelivery: boolean;
  createdAt: string;
}

interface Cart {
  id: string;
  deliveryMethod: "pickup" | "delivery";
  deliveryZoneId?: string;
  deliveryZoneName?: string;
  deliveryZoneFee?: number;
  // Add address information for display
  deliveryAddress?: {
    regionId: number;
    cityId: number;
    areaName: string;
    landmark?: string;
    additionalInstructions?: string;
    contactPhone?: string;
    regionName?: string;
    cityName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface DeliveryEligibilityIssue {
  type: string;
  message: string;
  items: Array<{
    productId: string;
    productName: string;
    message: string;
  }>;
}

interface CartTotals {
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  deliveryEligibilityIssues?: DeliveryEligibilityIssue[] | null;
}

interface SelectedPickupLocation {
  id: string;
  name: string;
  description?: string;
  regionName?: string;
  cityName?: string;
  areaName?: string;
  landmark?: string;
  contactPhone?: string;
  googleMapsLink?: string;
}

interface SelectedDeliveryAddress {
  addressId?: string;
  regionId: number;
  cityId: number;
  areaName: string;
  landmark?: string;
  additionalInstructions?: string;
  contactPhone?: string;
  regionName?: string;
  cityName?: string;
  googleMapsLink?: string;
}

// This interface defines the structure of cart data returned from the API
// Used for typing the response from the server
type CartData = {
  cart: Cart;
  items: CartItem[];
  totals: CartTotals;
  itemCount: number;
};

interface CartContextType {
  cart: Cart | null;
  items: CartItem[];
  totals: CartTotals;
  itemCount: number;
  loading: boolean;
  error: string | null;
  selectedPickupLocation: SelectedPickupLocation | null;
  setSelectedPickupLocation: (location: SelectedPickupLocation | null) => void;
  selectedDeliveryAddressId: string | null;
  setSelectedDeliveryAddressId: (addressId: string | null) => void;
  selectedDeliveryAddress: SelectedDeliveryAddress | null;
  setSelectedDeliveryAddress: (address: SelectedDeliveryAddress | null) => void;
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
    deliveryZoneId?: number,
    address?: {
      googleMapsLink?: string;
      addressId?: string;
      regionId: number;
      cityId: number;
      areaName: string;
      landmark?: string;
      additionalInstructions?: string;
      contactPhone?: string;
    }
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
  const [selectedPickupLocation, setSelectedPickupLocation] =
    useState<SelectedPickupLocation | null>(null);
  const [selectedDeliveryAddressId, setSelectedDeliveryAddressId] = useState<
    string | null
  >(null);
  const [selectedDeliveryAddress, setSelectedDeliveryAddress] =
    useState<SelectedDeliveryAddress | null>(null);
  const { isAuthenticated, setRedirectUrl } = useAuth();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  };

  // Define refreshCart with useCallback to avoid recreation on each render
  const refreshCart = useCallback(async () => {
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
          // Use the CartData type to ensure we're handling the response correctly
          const cartData: CartData = data.data;
          setCart(cartData.cart || null);
          setItems(cartData.items || []);
          setTotals(
            cartData.totals || { subtotal: 0, tax: 0, shipping: 0, total: 0 }
          );
          setItemCount(cartData.itemCount || 0);
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
  }, [
    API_BASE_URL,
    isAuthenticated,
    setCart,
    setError,
    setItemCount,
    setItems,
    setLoading,
    setTotals,
  ]);

  // Load cart from backend when user is authenticated
  useEffect(() => {
    if (isAuthenticated) {
      refreshCart();
    } else {
      // Clear cart when user logs out
      setItems([]);
      setTotals({ subtotal: 0, tax: 0, shipping: 0, total: 0 });
      setItemCount(0);
      setSelectedPickupLocation(null);
      setSelectedDeliveryAddressId(null);
      setSelectedDeliveryAddress(null);
    }
  }, [isAuthenticated, refreshCart]);

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
          // Optimize: Update cart state directly instead of full refresh
          if (data.item) {
            setItems(prevItems => {
              const existingIndex = prevItems.findIndex(
                item => item.id === data.item.id
              );
              if (existingIndex >= 0) {
                // Update existing item quantity
                const updatedItems = [...prevItems];
                updatedItems[existingIndex] = data.item;
                return updatedItems;
              } else {
                // Add new item
                return [...prevItems, data.item];
              }
            });
            // Update item count
            setItemCount(prev => prev + quantity);
          } else {
            // Fallback to refresh if no item data returned
            await refreshCart();
          }
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
    deliveryZoneId?: number,
    address?: {
      googleMapsLink?: string;
      addressId?: string;
      regionId: number;
      cityId: number;
      areaName: string;
      landmark?: string;
      additionalInstructions?: string;
      contactPhone?: string;
    }
  ): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      setError(null);

      // If we have an address but no zoneId, try to set the delivery address first
      if (deliveryMethod === "delivery" && address && !deliveryZoneId) {
        try {
          // Validate that we have valid IDs before sending
          const regionId = Number(address.regionId);
          const cityId = Number(address.cityId);

          // Check if we have valid IDs (greater than 0)
          if (
            !regionId ||
            regionId <= 0 ||
            !cityId ||
            cityId <= 0 ||
            !address.areaName
          ) {
            console.error("Invalid address data - missing required fields:", {
              regionId,
              cityId,
              areaName: address.areaName,
            });
            setError("Invalid address data. Region and city are required.");
            return false;
          }

          // First try to set the delivery address (which will auto-determine the zone)
          const addressResponse = await fetch(
            `${API_BASE_URL}/cart/delivery-address`,
            {
              method: "PUT",
              headers: getAuthHeaders(),
              body: JSON.stringify({
                regionId: regionId,
                cityId: cityId,
                areaName: address.areaName,
                ...(address.googleMapsLink
                  ? { googleMapsLink: address.googleMapsLink }
                  : {}),
                // Optional fields - only include if they have values
                ...(address.landmark ? { landmark: address.landmark } : {}),
                ...(address.additionalInstructions
                  ? { additionalInstructions: address.additionalInstructions }
                  : {}),
                ...(address.contactPhone
                  ? { contactPhone: address.contactPhone }
                  : {}),
              }),
            }
          );

          if (addressResponse.ok) {
            const addressData = await addressResponse.json();
            if (addressData.success) {
              // Prefer explicit deliveryZoneId if provided
              if (addressData.data?.deliveryZoneId) {
                deliveryZoneId = parseInt(addressData.data.deliveryZoneId);
              }
              // Fallback to determinedZone.id if present per updated docs
              if (!deliveryZoneId && addressData.data?.determinedZone?.id) {
                deliveryZoneId = Number(addressData.data.determinedZone.id);
              }

              if (deliveryZoneId) {
                console.log(
                  "Delivery zone determined from address:",
                  deliveryZoneId
                );
              } else {
                console.log(
                  "Address set but no delivery zone was determined:",
                  addressData
                );
              }
            }
          } else {
            // Swallow the failure gracefully and let caller decide UX
            const errorData = await addressResponse.json().catch(() => ({}));
            console.warn("[Cart] Set delivery address failed", errorData);
            setError(
              errorData?.message ||
                "Could not set this address for delivery. Please pick another address or switch to Pickup."
            );
            return false;
          }
        } catch (addressErr) {
          console.warn("Error setting delivery address:", addressErr);
          // Continue with the delivery method update even if address setting fails
        }
      }

      // For delivery method, we need to ensure we have a zone ID
      if (deliveryMethod === "delivery" && !deliveryZoneId) {
        console.error("No delivery zone ID available for delivery method");
        setError(
          "A delivery zone is required for delivery. Please select a valid address."
        );
        return false;
      }

      // Now update the delivery method
      const response = await fetch(`${API_BASE_URL}/cart/delivery`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify({
          deliveryMethod,
          // Only include deliveryZoneId if it's defined and make sure it's a number
          ...(deliveryZoneId !== undefined
            ? { deliveryZoneId: Number(deliveryZoneId) }
            : {}),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Store address information in cart state if provided
          if (address && deliveryMethod === "delivery") {
            setCart((prevCart) =>
              prevCart
                ? {
                    ...prevCart,
                    deliveryAddress: address,
                  }
                : null
            );
            // Switching to delivery clears any previously selected pickup location
            setSelectedPickupLocation(null);
            // If we have an explicit address id, store it as selected
            if ((address as { addressId?: string }).addressId) {
              setSelectedDeliveryAddressId(
                (address as { addressId?: string }).addressId || null
              );
            }
            // Also store full selected address for UI
            setSelectedDeliveryAddress(address as SelectedDeliveryAddress);
          }
          // Refresh cart to get updated data
          await refreshCart();
          return true;
        } else {
          console.error("Delivery method update returned success: false", data);
          setError(data.message || "Failed to update delivery method");
          return false;
        }
      } else {
        // Log the error details for debugging
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to update delivery method:", errorData);
        console.error("Delivery data sent:", {
          deliveryMethod,
          deliveryZoneId:
            deliveryZoneId !== undefined ? Number(deliveryZoneId) : undefined,
        });
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
        selectedPickupLocation,
        setSelectedPickupLocation,
        selectedDeliveryAddressId,
        setSelectedDeliveryAddressId,
        selectedDeliveryAddress,
        setSelectedDeliveryAddress,
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
