"use client";

import { useMemo, useState } from "react";
import { MapPin, Phone, Info } from "lucide-react";
import { usePickupLocations } from "../hooks/usePickupLocations";

export interface PickupLocationMinimal {
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

export default function PickupLocationSelector({
  onSelect,
  initialId,
  disabled = false,
}: {
  onSelect: (location: PickupLocationMinimal) => void;
  initialId?: string;
  disabled?: boolean;
}) {
  const { locations, loading, error, refetch } = usePickupLocations();
  const [selectedId, setSelectedId] = useState<string | undefined>(initialId);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const text = search.toLowerCase();
    return locations.filter((loc) => {
      return (
        loc.name?.toLowerCase().includes(text) ||
        loc.cityName?.toLowerCase().includes(text) ||
        loc.areaName?.toLowerCase().includes(text) ||
        loc.regionName?.toLowerCase().includes(text)
      );
    });
  }, [locations, search]);

  const handleChoose = (id: string) => {
    if (disabled) return;
    setSelectedId(id);
    const found = locations.find((l) => l.id === id);
    if (found) {
      onSelect({
        id: found.id,
        name: found.name,
        description: found.description,
        regionName: found.regionName,
        cityName: found.cityName,
        areaName: found.areaName,
        landmark: found.landmark,
        contactPhone: found.contactPhone,
        googleMapsLink: found.googleMapsLink,
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-2">
        <div className="text-sm text-gray-400">Loading pickup locations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-3">
        <div className="text-sm text-red-400">{error}</div>
        <button
          onClick={() => refetch()}
          className="text-yellow-400 hover:text-yellow-300 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-300">
        Choose Pickup Location
      </label>

      <div className="max-w-md">
        <input
          placeholder="Search by name, city, area"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          disabled={disabled}
          className="w-full px-4 py-2 rounded-md border border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
        />
      </div>

      <div className="space-y-3">
        {filtered.map((loc) => {
          const active = selectedId === loc.id;
          return (
            <button
              key={loc.id}
              type="button"
              disabled={disabled}
              onClick={() => handleChoose(loc.id)}
              className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                active
                  ? "border-yellow-400 bg-yellow-400/5"
                  : "border-gray-600 hover:border-gray-500 bg-gray-700/50"
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div>
                    <div className="text-white font-medium">{loc.name}</div>
                    <div className="text-gray-400 text-sm">
                      {[loc.areaName, loc.cityName, loc.regionName]
                        .filter(Boolean)
                        .join(", ")}
                    </div>
                    {loc.landmark && (
                      <div className="text-gray-500 text-xs mt-1">
                        <Info className="inline w-3 h-3 mr-1" />
                        Near {loc.landmark}
                      </div>
                    )}
                    {loc.description && (
                      <div className="text-gray-500 text-xs mt-1">
                        {loc.description}
                      </div>
                    )}
                    {loc.contactPhone && (
                      <div className="text-gray-500 text-xs mt-1">
                        <Phone className="inline w-3 h-3 mr-1" />
                        {loc.contactPhone}
                      </div>
                    )}
                  </div>
                </div>
                {loc.googleMapsLink && (
                  <a
                    href={loc.googleMapsLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-yellow-400 hover:text-yellow-300 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  >
                    View on Maps
                  </a>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
