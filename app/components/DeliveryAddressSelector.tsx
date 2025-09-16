"use client";

import { useState, useEffect } from "react";
import { MapPin, Plus, Star, ExternalLink, AlertCircle } from "lucide-react";
import { useCustomerAddresses } from "../hooks/useCustomerAddresses";
import { useGhanaLocations } from "../hooks/useGhanaLocations";
import { useDeliveryZoneValidation } from "../hooks/useDeliveryZoneValidation";
import AddressForm from "./AddressForm";

interface DeliveryAddressSelectorProps {
  onAddressChange: (
    address: {
      regionId: number;
      cityId: number;
      areaName: string;
      landmark?: string;
      additionalInstructions?: string;
      contactPhone?: string;
      regionName?: string;
      cityName?: string;
    },
    validationResult?: {
      isValid: boolean;
      message: string;
      deliveryZoneId?: string;
      deliveryZoneName?: string;
      deliveryZoneFee?: number;
    }
  ) => void;
  initialAddress?: {
    regionId: number;
    cityId: number;
    areaName: string;
    landmark?: string;
    additionalInstructions?: string;
    contactPhone?: string;
    regionName?: string;
    cityName?: string;
  };
  disabled?: boolean;
}

export default function DeliveryAddressSelector({
  onAddressChange,
  initialAddress,
  disabled = false,
}: DeliveryAddressSelectorProps) {
  const {
    addresses,
    loading: addressesLoading,
    createAddress,
  } = useCustomerAddresses();
  const {
    regions,
    cities,
    loading: locationsLoading,
    fetchCities,
  } = useGhanaLocations();
  const { validateAddressLocally, validating } = useDeliveryZoneValidation();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [tempAddress, setTempAddress] = useState<{
    regionId: number;
    cityId: number;
    areaName: string;
    landmark?: string;
    additionalInstructions?: string;
    contactPhone?: string;
    regionName?: string;
    cityName?: string;
  } | null>(null);
  const [validationResults, setValidationResults] = useState<{
    [key: string]: {
      isValid: boolean;
      message: string;
      deliveryZoneId?: string;
      deliveryZoneName?: string;
      deliveryZoneFee?: number;
    };
  }>({});

  // Find the selected address
  const selectedAddress = selectedAddressId
    ? addresses.find((addr) => addr.id === selectedAddressId)
    : null;

  // Auto-select default address on load if none selected yet
  useEffect(() => {
    if (!disabled && !selectedAddressId && addresses.length > 0) {
      const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0];
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress.id);
        const addressData = {
          addressId: defaultAddress.id,
          regionId: defaultAddress.regionId,
          cityId: defaultAddress.cityId,
          areaName: defaultAddress.areaName,
          landmark: defaultAddress.landmark,
          additionalInstructions: defaultAddress.additionalInstructions,
          contactPhone: defaultAddress.contactPhone,
          regionName: defaultAddress.regionName,
          cityName: defaultAddress.cityName,
        };

        // Prefer existing validation result; fall back to local validation immediately
        const validation =
          validationResults[defaultAddress.id] ||
          validateAddressLocally({
            regionId: addressData.regionId,
            cityId: addressData.cityId,
            areaName: addressData.areaName,
          });
        onAddressChange(addressData as any, validation);
      }
    }
  }, [
    addresses,
    disabled,
    onAddressChange,
    selectedAddressId,
    validationResults,
    validateAddressLocally,
  ]);

  // Validate all addresses
  useEffect(() => {
    if (addresses.length > 0 && regions.length > 0) {
      const newValidationResults: {
        [key: string]: {
          isValid: boolean;
          message: string;
          deliveryZoneId?: string;
          deliveryZoneName?: string;
          deliveryZoneFee?: number;
        };
      } = {};

      addresses.forEach((address) => {
        // Use the IDs directly from the address object for validation
        // Ensure we have valid IDs before attempting to validate
        if (address.regionId > 0 && address.cityId > 0) {
          const addressData = {
            regionId: address.regionId,
            cityId: address.cityId,
            areaName: address.areaName,
          };

          const result = validateAddressLocally(addressData);
          newValidationResults[address.id] = result;
        } else {
          // If IDs are missing, mark as invalid by default
          newValidationResults[address.id] = {
            isValid: false,
            message: "Address has missing Region/City IDs.",
          };
        }
      });

      setValidationResults(newValidationResults);
    }
  }, [addresses, regions, cities, validateAddressLocally]);

  // Handle address selection
  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId);
    const address = addresses.find((addr) => addr.id === addressId);
    if (address) {
      // We now have regionId and cityId directly from the address object.
      // No more string matching needed.
      const addressData = {
        addressId: address.id,
        regionId: address.regionId,
        cityId: address.cityId,
        areaName: address.areaName,
        landmark: address.landmark,
        additionalInstructions: address.additionalInstructions,
        contactPhone: address.contactPhone,
        regionName: address.regionName,
        cityName: address.cityName,
      };

      // Get validation result for the selected address
      const validation = validationResults[addressId];

      // Pass both the reliable address data and validation result to the parent
      onAddressChange(addressData, validation);
    }
  };

  // Handle creating new address
  const handleCreateNew = () => {
    setIsCreatingNew(true);
    setIsFormOpen(true);
  };

  // Handle form submission
  const handleFormSubmit = async (formData: {
    regionId: number | string;
    cityId: number | string;
    areaName: string;
    landmark?: string;
    additionalInstructions?: string;
    contactPhone?: string;
    isDefault: boolean;
    saveAddress?: boolean;
  }): Promise<boolean> => {
    // Client-side validation before processing
    if (!formData.regionId || !formData.cityId) {
      alert("Please select a Region and City before saving.");
      return false; // Stop the submission
    }

    // Create the address data
    const addressData = {
      regionId: Number(formData.regionId),
      cityId: Number(formData.cityId),
      areaName: formData.areaName,
      landmark: formData.landmark || undefined,
      additionalInstructions: formData.additionalInstructions || undefined,
      contactPhone: formData.contactPhone || undefined,
      regionName: regions.find((r) => r.id === Number(formData.regionId))?.name,
      cityName: cities.find((c) => c.id === Number(formData.cityId))?.name,
      isDefault: formData.isDefault,
    };

    // Validate the address
    const validation = validateAddressLocally(addressData);

    // Check if the address is valid for delivery
    if (!validation.isValid) {
      if (
        !window.confirm(
          `${validation.message}\n\nWould you like to continue with this address anyway? You can also choose pickup instead.`
        )
      ) {
        return false;
      }
    }

    // Save the address if user wants to
    if (formData.saveAddress) {
      const success = await createAddress({
        ...addressData,
        isDefault: formData.isDefault,
      });

      if (success) {
        // Find the newly created address and select it
        // Note: In a real app, you'd get the created address ID from the response
        // For now, we'll just use the temp address
        setTempAddress(addressData);
        setSelectedAddressId("temp");

        // Store validation result for the temp address
        setValidationResults((prev) => ({
          ...prev,
          temp: validation,
        }));
      }
    } else {
      // Just use the address without saving
      setTempAddress(addressData);
      setSelectedAddressId("temp");

      // Store validation result for the temp address
      setValidationResults((prev) => ({
        ...prev,
        temp: validation,
      }));
    }

    // Notify parent component with address and validation result
    onAddressChange(addressData as any, validation);
    setIsFormOpen(false);
    setIsCreatingNew(false);
    return true;
  };

  // Load cities when region changes
  useEffect(() => {
    if (tempAddress?.regionId) {
      fetchCities(tempAddress.regionId);
    }
  }, [tempAddress?.regionId, fetchCities]);

  if (addressesLoading) {
    return (
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-300">
          Delivery Address
        </label>
        <div className="text-gray-400 text-sm">Loading addresses...</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        Delivery Address
      </label>

      {/* Saved Addresses */}
      {addresses.length > 0 && (
        <div className="space-y-3">
          <div className="text-sm text-gray-400">
            Select from saved addresses:
          </div>
          {addresses.map((address) => (
            <div
              key={address.id}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedAddressId === address.id
                  ? "border-yellow-400 bg-yellow-400/5"
                  : validationResults[address.id]?.isValid === false
                  ? "border-orange-400/50 hover:border-orange-400 bg-orange-400/5"
                  : "border-gray-600 hover:border-gray-500 bg-gray-700/50"
              }`}
              onClick={() => !disabled && handleAddressSelect(address.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-white font-medium">
                        {address.areaName}, {address.cityName}
                      </span>
                      {address.isDefault && (
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      )}
                      {validationResults[address.id]?.isValid === false && (
                        <span
                          className="inline-flex"
                          aria-label="Outside delivery zone"
                        >
                          <AlertCircle className="w-4 h-4 text-orange-400" />
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm">
                      {address.regionName}
                    </p>
                    {address.landmark && (
                      <p className="text-gray-500 text-sm">
                        Near {address.landmark}
                      </p>
                    )}
                    {address.contactPhone && (
                      <p className="text-gray-500 text-sm">
                        {address.contactPhone}
                      </p>
                    )}
                    {validationResults[address.id]?.isValid === false && (
                      <p className="text-orange-400 text-xs mt-1">
                        {validationResults[address.id]?.message}
                      </p>
                    )}
                    {validationResults[address.id]?.isValid === true &&
                      validationResults[address.id]?.deliveryZoneName && (
                        <p className="text-green-400 text-xs mt-1">
                          {validationResults[address.id]?.deliveryZoneName} - ₵
                          {validationResults[
                            address.id
                          ]?.deliveryZoneFee?.toFixed(2)}
                        </p>
                      )}
                  </div>
                </div>
                <a
                  href={address.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create New Address Button */}
      <div className="pt-2">
        <button
          onClick={handleCreateNew}
          disabled={disabled}
          className="w-full p-4 border-2 border-dashed border-gray-600 hover:border-yellow-400 rounded-lg text-gray-400 hover:text-yellow-400 transition-all duration-200 flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create New Address</span>
        </button>
      </div>

      {/* Temporary Address Display */}
      {tempAddress && selectedAddressId === "temp" && (
        <div
          className={`p-4 rounded-lg border-2 ${
            validationResults.temp?.isValid === false
              ? "border-orange-400 bg-orange-400/5"
              : "border-yellow-400 bg-yellow-400/5"
          }`}
        >
          <div className="flex items-start space-x-3">
            <MapPin
              className={`w-5 h-5 mt-1 flex-shrink-0 ${
                validationResults.temp?.isValid === false
                  ? "text-orange-400"
                  : "text-yellow-400"
              }`}
            />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-1">
                <span className="text-white font-medium">
                  {tempAddress.areaName},{" "}
                  {cities.find((c) => c.id === tempAddress.cityId)?.name}
                </span>
                {validationResults.temp?.isValid === false && (
                  <span
                    className="inline-flex"
                    aria-label="Outside delivery zone"
                  >
                    <AlertCircle className="w-4 h-4 text-orange-400" />
                  </span>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                {regions.find((r) => r.id === tempAddress.regionId)?.name}
              </p>
              {tempAddress.landmark && (
                <p className="text-gray-500 text-sm">
                  Near {tempAddress.landmark}
                </p>
              )}
              {tempAddress.contactPhone && (
                <p className="text-gray-500 text-sm">
                  {tempAddress.contactPhone}
                </p>
              )}
              {validationResults.temp?.isValid === false && (
                <p className="text-orange-400 text-xs mt-1">
                  {validationResults.temp?.message}
                </p>
              )}
              {validationResults.temp?.isValid === true &&
                validationResults.temp?.deliveryZoneName && (
                  <p className="text-green-400 text-xs mt-1">
                    {validationResults.temp?.deliveryZoneName} - ₵
                    {validationResults.temp?.deliveryZoneFee?.toFixed(2)}
                  </p>
                )}
              <p
                className={`${
                  validationResults.temp?.isValid === false
                    ? "text-orange-400"
                    : "text-yellow-400"
                } text-xs mt-2`}
              >
                {tempAddress.landmark
                  ? "Temporary address"
                  : "New address (not saved)"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Address Form Modal */}
      <AddressForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setIsCreatingNew(false);
        }}
        onSubmit={handleFormSubmit}
        title="Create Delivery Address"
      />
    </div>
  );
}
