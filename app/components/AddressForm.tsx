"use client";

import { useState, useEffect } from "react";
import { X, MapPin, Phone, MessageSquare, Star } from "lucide-react";
import { useGhanaLocations } from "../hooks/useGhanaLocations";

interface AddressFormData {
  regionId: number | "";
  cityId: number | "";
  areaName: string;
  landmark: string;
  additionalInstructions: string;
  contactPhone: string;
  googleMapsLink?: string;
  isDefault: boolean;
  saveAddress: boolean;
}

interface AddressFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AddressFormData) => Promise<boolean>;
  initialData?: Partial<AddressFormData>;
  title?: string;
}

export default function AddressForm({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  title = "Add New Address",
}: AddressFormProps) {
  const {
    regions,
    cities,
    loading: locationsLoading,
    fetchCities,
  } = useGhanaLocations();
  const [formData, setFormData] = useState<AddressFormData>({
    regionId: "",
    cityId: "",
    areaName: "",
    landmark: "",
    additionalInstructions: "",
    contactPhone: "",
    googleMapsLink: "",
    isDefault: false,
    saveAddress: true,
    ...initialData,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const hasRegionSelection =
      formData.regionId !== "" && Number(formData.regionId) > 0;
    if (hasRegionSelection) {
      fetchCities(Number(formData.regionId));
    } else {
      fetchCities();
    }
  }, [formData.regionId, fetchCities]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.regionId || !formData.cityId || !formData.areaName.trim()) {
      setError("Please fill in all required fields");
      return;
    }

    if (
      formData.contactPhone &&
      !/^\+?[0-9\s-()]+$/.test(formData.contactPhone)
    ) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
        setFormData({
          regionId: "",
          cityId: "",
          areaName: "",
          landmark: "",
          additionalInstructions: "",
          contactPhone: "",
          googleMapsLink: "",
          isDefault: false,
          saveAddress: true,
        });
      }
    } catch {
      setError("An error occurred while saving the address");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-white">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Region Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Region <span className="text-red-400">*</span>
            </label>
            <select
              name="regionId"
              value={formData.regionId}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            >
              <option value="">Select a region</option>
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          </div>

          {/* City Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              City <span className="text-red-400">*</span>
            </label>
            <select
              name="cityId"
              value={formData.cityId}
              onChange={handleInputChange}
              required
              disabled={!formData.regionId || locationsLoading}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {locationsLoading ? "Loading cities..." : "Select a city"}
              </option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name}
                </option>
              ))}
            </select>
          </div>

          {/* Area Name */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Area/Neighborhood <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              name="areaName"
              value={formData.areaName}
              onChange={handleInputChange}
              placeholder="e.g., Osu, Labone, East Legon"
              required
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          {/* Landmark */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Landmark (Optional)
            </label>
            <input
              type="text"
              name="landmark"
              value={formData.landmark}
              onChange={handleInputChange}
              placeholder="e.g., Near Top Oil, Opposite the mall"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          {/* Contact Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Phone className="w-4 h-4 inline mr-2" />
              Contact Phone (Optional)
            </label>
            <input
              type="tel"
              name="contactPhone"
              value={formData.contactPhone}
              onChange={handleInputChange}
              placeholder="e.g., +233123456789"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
          </div>

          {/* Google Maps Link (Optional override) */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Google Maps Link (Optional)
            </label>
            <input
              type="url"
              name="googleMapsLink"
              value={formData.googleMapsLink || ""}
              onChange={handleInputChange}
              placeholder="https://maps.google.com/?q=5.6037,-0.1870"
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
            />
            <p className="text-gray-500 text-xs mt-1">
              If provided, this exact link will be saved and used. Otherwise the
              server auto-generates a link from the address.
            </p>
          </div>

          {/* Additional Instructions */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MessageSquare className="w-4 h-4 inline mr-2" />
              Additional Instructions (Optional)
            </label>
            <textarea
              name="additionalInstructions"
              value={formData.additionalInstructions}
              onChange={handleInputChange}
              placeholder="e.g., Call when you arrive, Leave at gate, etc."
              rows={3}
              className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent resize-none"
            />
          </div>

          {/* Save Address Checkbox */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              name="saveAddress"
              checked={formData.saveAddress}
              onChange={handleInputChange}
              className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2"
            />
            <label className="flex items-center text-sm text-gray-300">
              <MapPin className="w-4 h-4 mr-2" />
              Save this address for future use
            </label>
          </div>

          {/* Default Address Checkbox */}
          {formData.saveAddress && (
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleInputChange}
                className="w-4 h-4 text-yellow-400 bg-gray-700 border-gray-600 rounded focus:ring-yellow-400 focus:ring-2"
              />
              <label className="flex items-center text-sm text-gray-300">
                <Star className="w-4 h-4 mr-2" />
                Set as default address
              </label>
            </div>
          )}

          {/* Submit Buttons */}
          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || locationsLoading}
              className="flex-1 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-3 rounded-lg font-semibold transition-colors duration-200"
            >
              {isSubmitting ? "Saving..." : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
