"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";

interface CustomerAddress {
  id: string;
  regionId: number;
  cityId: number;
  regionName: string;
  cityName: string;
  areaName: string;
  landmark?: string;
  additionalInstructions?: string;
  contactPhone?: string;
  isDefault: boolean;
  googleMapsLink: string;
  createdAt: string;
}

interface AddressesResponse {
  success: boolean;
  message: string;
  count: number;
  addresses: CustomerAddress[];
}

interface CreateAddressRequest {
  regionId: number;
  cityId: number;
  areaName: string;
  landmark?: string;
  additionalInstructions?: string;
  contactPhone?: string;
  googleMapsLink?: string;
  isDefault?: boolean;
}

interface UpdateAddressRequest {
  regionId?: number;
  cityId?: number;
  areaName?: string;
  landmark?: string;
  additionalInstructions?: string;
  contactPhone?: string;
  googleMapsLink?: string;
  isDefault?: boolean;
}

export function useCustomerAddresses() {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();

  const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "Cache-Control": "no-cache, no-store, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };
  };

  const fetchAddresses = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE_URL}/customer-addresses`, {
        method: "GET",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch addresses");
      }

      const data: AddressesResponse = await response.json();

      if (data.addresses) {
        setAddresses(data.addresses);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch addresses"
      );
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, API_BASE_URL]);

  const createAddress = async (
    addressData: CreateAddressRequest
  ): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/customer-addresses`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(addressData),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchAddresses(); // Refresh addresses
          return true;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to create address");
        return false;
      }
    } catch (err) {
      console.error("Error creating address:", err);
      setError(err instanceof Error ? err.message : "Failed to create address");
      return false;
    } finally {
      setLoading(false);
    }

    return false;
  };

  const updateAddress = async (
    addressId: string,
    addressData: UpdateAddressRequest
  ): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/customer-addresses/${addressId}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(addressData),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchAddresses(); // Refresh addresses
          return true;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to update address");
        return false;
      }
    } catch (err) {
      console.error("Error updating address:", err);
      setError(err instanceof Error ? err.message : "Failed to update address");
      return false;
    } finally {
      setLoading(false);
    }

    return false;
  };

  const deleteAddress = async (addressId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/customer-addresses/${addressId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchAddresses(); // Refresh addresses
          return true;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to delete address");
        return false;
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      setError(err instanceof Error ? err.message : "Failed to delete address");
      return false;
    } finally {
      setLoading(false);
    }

    return false;
  };

  const setDefaultAddress = async (addressId: string): Promise<boolean> => {
    if (!isAuthenticated) return false;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `${API_BASE_URL}/customer-addresses/${addressId}/set-default`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          await fetchAddresses(); // Refresh addresses
          return true;
        }
      } else {
        const errorData = await response.json();
        setError(errorData.message || "Failed to set default address");
        return false;
      }
    } catch (err) {
      console.error("Error setting default address:", err);
      setError(
        err instanceof Error ? err.message : "Failed to set default address"
      );
      return false;
    } finally {
      setLoading(false);
    }

    return false;
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses();
    } else {
      setAddresses([]);
    }
  }, [isAuthenticated, fetchAddresses]);

  return {
    addresses,
    loading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    refetch: fetchAddresses,
  };
}
