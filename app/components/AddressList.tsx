"use client";

import { useState } from "react";
import {
  MapPin,
  Phone,
  MessageSquare,
  Star,
  Edit,
  Trash2,
  Plus,
  ExternalLink,
} from "lucide-react";
import { useCustomerAddresses } from "../hooks/useCustomerAddresses";
import AddressForm from "./AddressForm";

interface CustomerAddress {
  id: string;
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

export default function AddressList() {
  const {
    addresses,
    loading,
    error,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
  } = useCustomerAddresses();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<CustomerAddress | null>(
    null
  );

  const handleCreateAddress = async (data: any) => {
    const success = await createAddress({
      regionId: Number(data.regionId),
      cityId: Number(data.cityId),
      areaName: data.areaName,
      landmark: data.landmark || undefined,
      additionalInstructions: data.additionalInstructions || undefined,
      contactPhone: data.contactPhone || undefined,
      isDefault: data.isDefault,
    });
    return success;
  };

  const handleUpdateAddress = async (data: any) => {
    if (!editingAddress) return false;

    const success = await updateAddress(editingAddress.id, {
      regionId: data.regionId ? Number(data.regionId) : undefined,
      cityId: data.cityId ? Number(data.cityId) : undefined,
      areaName: data.areaName,
      landmark: data.landmark || undefined,
      additionalInstructions: data.additionalInstructions || undefined,
      contactPhone: data.contactPhone || undefined,
      isDefault: data.isDefault,
    });
    return success;
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      await deleteAddress(addressId);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    await setDefaultAddress(addressId);
  };

  const openEditForm = (address: CustomerAddress) => {
    setEditingAddress(address);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingAddress(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading addresses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⚠️</span>
          </div>
          <p className="text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-full font-semibold transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white">Delivery Addresses</h2>
          <p className="text-gray-400">
            Manage your delivery addresses for easy checkout
          </p>
        </div>
        <button
          onClick={() => setIsFormOpen(true)}
          className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-full font-semibold transition-colors duration-200 flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Add Address</span>
        </button>
      </div>

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
            <MapPin className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-4">
            No addresses yet
          </h3>
          <p className="text-gray-400 mb-6">
            Add your first delivery address to get started
          </p>
          <button
            onClick={() => setIsFormOpen(true)}
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-full font-semibold transition-colors duration-200"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`bg-gray-800 rounded-lg p-6 border-2 transition-all duration-200 ${
                address.isDefault
                  ? "border-yellow-400 bg-yellow-400/5"
                  : "border-gray-700 hover:border-gray-600"
              }`}
            >
              {/* Default Badge */}
              {address.isDefault && (
                <div className="flex items-center text-yellow-400 text-sm font-medium mb-4">
                  <Star className="w-4 h-4 mr-2 fill-current" />
                  Default Address
                </div>
              )}

              {/* Address Details */}
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div>
                    <p className="text-white font-medium">
                      {address.areaName}, {address.cityName}
                    </p>
                    <p className="text-gray-400 text-sm">
                      {address.regionName}
                    </p>
                    {address.landmark && (
                      <p className="text-gray-500 text-sm">
                        Near {address.landmark}
                      </p>
                    )}
                  </div>
                </div>

                {address.contactPhone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    <p className="text-gray-300 text-sm">
                      {address.contactPhone}
                    </p>
                  </div>
                )}

                {address.additionalInstructions && (
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                    <p className="text-gray-300 text-sm">
                      {address.additionalInstructions}
                    </p>
                  </div>
                )}

                {/* Google Maps Link */}
                <div className="pt-2">
                  <a
                    href={address.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-yellow-400 hover:text-yellow-300 text-sm transition-colors"
                  >
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View on Google Maps
                  </a>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-700">
                <div className="flex space-x-2">
                  <button
                    onClick={() => openEditForm(address)}
                    className="p-2 text-gray-400 hover:text-yellow-400 transition-colors"
                    title="Edit address"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                    title="Delete address"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {!address.isDefault && (
                  <button
                    onClick={() => handleSetDefault(address.id)}
                    className="text-yellow-400 hover:text-yellow-300 text-sm font-medium transition-colors"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Form Modal */}
      <AddressForm
        isOpen={isFormOpen}
        onClose={closeForm}
        onSubmit={editingAddress ? handleUpdateAddress : handleCreateAddress}
        initialData={
          editingAddress
            ? {
                regionId: editingAddress.regionName,
                cityId: editingAddress.cityName,
                areaName: editingAddress.areaName,
                landmark: editingAddress.landmark || "",
                additionalInstructions:
                  editingAddress.additionalInstructions || "",
                contactPhone: editingAddress.contactPhone || "",
                isDefault: editingAddress.isDefault,
              }
            : undefined
        }
        title={editingAddress ? "Edit Address" : "Add New Address"}
      />
    </div>
  );
}
