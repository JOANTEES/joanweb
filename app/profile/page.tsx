"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navigation from "../components/Navigation";
import { useAuth } from "../contexts/AuthContext";
import { useCustomerAddresses } from "../hooks/useCustomerAddresses";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Edit,
  Save,
  X,
  Package,
  Clock,
  CheckCircle,
  ExternalLink,
} from "lucide-react";

export default function Profile() {
  const { isAuthenticated, loading, setRedirectUrl, user } = useAuth();
  const { addresses, loading: addressesLoading } = useCustomerAddresses();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: "+233 24 123 4567",
    address: "123 Main Street, Accra, Ghana",
    city: "Accra",
    zipCode: "GA-123-4567",
    country: "Ghana",
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Store current URL for redirect after login with account context
      setRedirectUrl("/profile", "account");
      router.push("/login");
    }
  }, [isAuthenticated, loading, router, setRedirectUrl]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    // In a real app, this would save to the backend
    alert("Profile updated successfully!");
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset to original data
    setProfileData({
      name: user?.name || "",
      email: user?.email || "",
      phone: "+233 24 123 4567",
      address: "123 Main Street, Accra, Ghana",
      city: "Accra",
      zipCode: "GA-123-4567",
      country: "Ghana",
    });
    setIsEditing(false);
  };

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-black flex items-center justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Sample recent orders for the profile
  const recentOrders = [
    {
      id: "ORD-001",
      date: "2024-01-15",
      status: "delivered",
      total: 269.98,
      items: ["Classic White Tee", "Premium Hoodie"],
    },
    {
      id: "ORD-002",
      date: "2024-01-20",
      status: "shipped",
      total: 149.99,
      items: ["Casual Dress"],
    },
    {
      id: "ORD-003",
      date: "2024-01-25",
      status: "processing",
      total: 344.98,
      items: ["Designer Jeans", "Sporty Shorts"],
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "delivered":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "shipped":
        return <Package className="w-5 h-5 text-blue-400" />;
      case "processing":
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "delivered":
        return "Delivered";
      case "shipped":
        return "Shipped";
      case "processing":
        return "Processing";
      default:
        return "Unknown";
    }
  };

  return (
    <>
      <Navigation />

      <div className="min-h-screen bg-black py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white">My Account</h1>
            <p className="text-gray-400 mt-2">
              Manage your profile and view your orders
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Information */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <User className="w-6 h-6 text-yellow-400 mr-3" />
                    <h2 className="text-xl font-semibold text-white">
                      Profile Information
                    </h2>
                  </div>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex space-x-2">
                      <button
                        onClick={handleSave}
                        className="flex items-center text-green-400 hover:text-green-300 transition-colors"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="flex items-center text-red-400 hover:text-red-300 transition-colors"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={profileData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-white py-3">{profileData.name}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={profileData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-white py-3">{profileData.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      />
                    ) : (
                      <p className="text-white py-3">{profileData.phone}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Country
                    </label>
                    {isEditing ? (
                      <select
                        name="country"
                        value={profileData.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                      >
                        <option value="Ghana">Ghana</option>
                        <option value="Nigeria">Nigeria</option>
                        <option value="Kenya">Kenya</option>
                        <option value="South Africa">South Africa</option>
                      </select>
                    ) : (
                      <p className="text-white py-3">{profileData.country}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <MapPin className="w-6 h-6 text-yellow-400 mr-3" />
                    <h2 className="text-xl font-semibold text-white">
                      Default Address
                    </h2>
                  </div>
                  <button
                    onClick={() => router.push("/profile/addresses")}
                    className="flex items-center text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Manage Addresses
                  </button>
                </div>

                {addressesLoading ? (
                  <div className="p-4 bg-gray-700/50 rounded-lg flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin mr-2"></div>
                    <span className="text-gray-300">Loading addresses...</span>
                  </div>
                ) : addresses.length === 0 ? (
                  <div className="p-4 bg-gray-700/50 rounded-lg text-center">
                    <p className="text-gray-300 mb-2">
                      You don't have any saved addresses yet.
                    </p>
                    <button
                      onClick={() => router.push("/profile/addresses")}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors"
                    >
                      Add your first address
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-gray-700/50 rounded-lg">
                    {/* Get the default address or the first one */}
                    {(() => {
                      const defaultAddress =
                        addresses.find((addr) => addr.isDefault) ||
                        addresses[0];
                      return (
                        <>
                          <div className="flex items-start space-x-3">
                            <MapPin className="w-5 h-5 text-yellow-400 mt-1 flex-shrink-0" />
                            <div>
                              <p className="text-white font-medium">
                                {defaultAddress.areaName},{" "}
                                {defaultAddress.cityName}
                              </p>
                              <p className="text-gray-400 text-sm">
                                {defaultAddress.regionName}
                              </p>
                              {defaultAddress.landmark && (
                                <p className="text-gray-500 text-sm">
                                  Near {defaultAddress.landmark}
                                </p>
                              )}
                              {defaultAddress.contactPhone && (
                                <p className="text-gray-500 text-sm">
                                  {defaultAddress.contactPhone}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="mt-4 text-sm">
                            <a
                              href={defaultAddress.googleMapsLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center text-yellow-400 hover:text-yellow-300 transition-colors"
                            >
                              <ExternalLink className="w-4 h-4 mr-1" />
                              View on Google Maps
                            </a>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                <div className="mt-4 text-center">
                  <button
                    onClick={() => router.push("/profile/addresses")}
                    className="text-sm text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    View and manage all your addresses
                  </button>
                </div>
              </div>

              {/* Recent Orders */}
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Package className="w-6 h-6 text-yellow-400 mr-3" />
                    <h2 className="text-xl font-semibold text-white">
                      Recent Orders
                    </h2>
                  </div>
                  <button
                    onClick={() => router.push("/orders")}
                    className="text-yellow-400 hover:text-yellow-300 transition-colors"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-gray-700 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          {getStatusIcon(order.status)}
                          <span className="ml-2 text-white font-medium">
                            #{order.id}
                          </span>
                        </div>
                        <span className="text-gray-400 text-sm">
                          {order.date}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-300 text-sm">
                            {order.items.join(", ")}
                          </p>
                          <p className="text-yellow-400 text-sm font-medium">
                            {getStatusText(order.status)}
                          </p>
                        </div>
                        <span className="text-white font-semibold">
                          ${order.total.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push("/orders")}
                    className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-yellow-400 mr-3" />
                      <span className="text-white">View All Orders</span>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/profile/addresses")}
                    className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-yellow-400 mr-3" />
                      <span className="text-white">Manage Addresses</span>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/pick-drop")}
                    className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-yellow-400 mr-3" />
                      <span className="text-white">Pick & Drop</span>
                    </div>
                  </button>

                  <button
                    onClick={() => router.push("/shop")}
                    className="w-full text-left p-3 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                  >
                    <div className="flex items-center">
                      <Package className="w-5 h-5 text-yellow-400 mr-3" />
                      <span className="text-white">Continue Shopping</span>
                    </div>
                  </button>
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4">
                  Account Stats
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Orders</span>
                    <span className="text-white font-semibold">
                      {recentOrders.length}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Member Since</span>
                    <span className="text-white font-semibold">Jan 2024</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Loyalty Points</span>
                    <span className="text-white font-semibold">1,250</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
