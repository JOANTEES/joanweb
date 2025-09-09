'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { Truck, MapPin, Clock, CheckCircle, Package } from 'lucide-react';

export default function PickDrop() {
  const { isAuthenticated, loading, setRedirectUrl } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    itemDescription: '',
    specialInstructions: '',
    preferredDate: '',
    preferredTime: ''
  });

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Store current URL for redirect after login with protected-page context
      setRedirectUrl('/pick-drop', 'protected-page');
      router.push('/login');
    }
  }, [isAuthenticated, loading, router, setRedirectUrl]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    alert('Pick & Drop request submitted successfully!');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
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

  // Sample pick & drop requests
  const requests = [
    {
      id: 'PD-001',
      date: '2024-01-15',
      status: 'completed',
      pickupAddress: '123 Main St, Accra',
      deliveryAddress: '456 Oak Ave, Kumasi',
      itemDescription: 'Clothing items for return',
      total: 25.00
    },
    {
      id: 'PD-002',
      date: '2024-01-20',
      status: 'in-transit',
      pickupAddress: '789 Pine St, Tema',
      deliveryAddress: '321 Elm St, Cape Coast',
      itemDescription: 'New clothing order',
      total: 30.00
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in-transit':
        return <Truck className="w-5 h-5 text-blue-400" />;
      case 'scheduled':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <Package className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-transit':
        return 'In Transit';
      case 'scheduled':
        return 'Scheduled';
      default:
        return 'Pending';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'in-transit':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'scheduled':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default:
        return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              Pick & <span className="text-yellow-400">Drop</span> Service
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Request pickup and delivery services for your clothing items.
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Request Form */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Request Pick & Drop</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="pickupAddress" className="block text-sm font-medium text-gray-300 mb-2">
                  Pickup Address
                </label>
                <input
                  type="text"
                  id="pickupAddress"
                  name="pickupAddress"
                  value={formData.pickupAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter pickup address"
                  required
                />
              </div>

              <div>
                <label htmlFor="deliveryAddress" className="block text-sm font-medium text-gray-300 mb-2">
                  Delivery Address
                </label>
                <input
                  type="text"
                  id="deliveryAddress"
                  name="deliveryAddress"
                  value={formData.deliveryAddress}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Enter delivery address"
                  required
                />
              </div>

              <div>
                <label htmlFor="itemDescription" className="block text-sm font-medium text-gray-300 mb-2">
                  Item Description
                </label>
                <textarea
                  id="itemDescription"
                  name="itemDescription"
                  value={formData.itemDescription}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Describe the items to be picked up/delivered"
                  required
                />
              </div>

              <div>
                <label htmlFor="specialInstructions" className="block text-sm font-medium text-gray-300 mb-2">
                  Special Instructions
                </label>
                <textarea
                  id="specialInstructions"
                  name="specialInstructions"
                  value={formData.specialInstructions}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                  placeholder="Any special instructions for pickup/delivery"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="preferredDate" className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Date
                  </label>
                  <input
                    type="date"
                    id="preferredDate"
                    name="preferredDate"
                    value={formData.preferredDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="preferredTime" className="block text-sm font-medium text-gray-300 mb-2">
                    Preferred Time
                  </label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                    required
                  >
                    <option value="">Select time</option>
                    <option value="morning">Morning (8AM - 12PM)</option>
                    <option value="afternoon">Afternoon (12PM - 5PM)</option>
                    <option value="evening">Evening (5PM - 8PM)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-lg font-semibold transition-colors duration-200"
              >
                Submit Request
              </button>
            </form>
          </div>

          {/* Recent Requests */}
          <div className="bg-gray-800 rounded-2xl p-8 border border-gray-700">
            <h2 className="text-2xl font-bold text-white mb-6">Recent Requests</h2>
            
            {requests.length === 0 ? (
              <div className="text-center py-8">
                <Truck className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No requests yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {requests.map((request) => (
                  <div key={request.id} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">#{request.id}</h3>
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(request.status)}`}>
                        {getStatusIcon(request.status)}
                        <span className="text-sm font-medium">{getStatusText(request.status)}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">From: {request.pickupAddress}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-300">To: {request.deliveryAddress}</span>
                      </div>
                      <p className="text-gray-300">{request.itemDescription}</p>
                      <div className="flex justify-between items-center pt-2">
                        <span className="text-gray-400">{new Date(request.date).toLocaleDateString()}</span>
                        <span className="text-yellow-400 font-semibold">₵{request.total}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}