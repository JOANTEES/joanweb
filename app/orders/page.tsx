'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navigation from '../components/Navigation';
import { useAuth } from '../contexts/AuthContext';
import { Package, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function Orders() {
  const { isAuthenticated, loading, setRedirectUrl } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      // Store current URL for redirect after login with account context
      setRedirectUrl('/orders', 'account');
      router.push('/login');
    }
  }, [isAuthenticated, loading, router, setRedirectUrl]);

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

  // Sample orders data
  const orders = [
    {
      id: 'ORD-001',
      date: '2024-01-15',
      status: 'delivered',
      total: 269.98,
      items: [
        { name: 'Classic White Tee', price: 89.99, quantity: 2 },
        { name: 'Premium Hoodie', price: 179.99, quantity: 1 }
      ]
    },
    {
      id: 'ORD-002',
      date: '2024-01-20',
      status: 'shipped',
      total: 149.99,
      items: [
        { name: 'Casual Dress', price: 149.99, quantity: 1 }
      ]
    },
    {
      id: 'ORD-003',
      date: '2024-01-25',
      status: 'processing',
      total: 344.98,
      items: [
        { name: 'Designer Jeans', price: 239.99, quantity: 1 },
        { name: 'Sporty Shorts', price: 104.99, quantity: 1 }
      ]
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'shipped':
        return <Package className="w-5 h-5 text-blue-400" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-400" />;
      default:
        return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'shipped':
        return 'Shipped';
      case 'processing':
        return 'Processing';
      default:
        return 'Cancelled';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-400 bg-green-400/10 border-green-400/20';
      case 'shipped':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'processing':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      default:
        return 'text-red-400 bg-red-400/10 border-red-400/20';
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
              Your <span className="text-yellow-400">Orders</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Track and manage all your orders in one place.
            </p>
          </div>
        </div>
      </section>

      {/* Orders Section */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {orders.length === 0 ? (
            <div className="text-center py-16">
              <Package className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-white mb-2">No Orders Yet</h3>
              <p className="text-gray-400 mb-8">Start shopping to see your orders here.</p>
              <a
                href="/shop"
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-3 rounded-full font-semibold transition-colors duration-200"
              >
                Start Shopping
              </a>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div key={order.id} className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-white">Order #{order.id}</h3>
                      <p className="text-gray-400">Placed on {new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center space-x-4 mt-4 md:mt-0">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span className="font-medium">{getStatusText(order.status)}</span>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">₵{order.total}</p>
                        <p className="text-sm text-gray-400">Total</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-lg font-semibold text-white mb-3">Items</h4>
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <div>
                            <p className="text-white font-medium">{item.name}</p>
                            <p className="text-gray-400 text-sm">Quantity: {item.quantity}</p>
                          </div>
                          <p className="text-white font-semibold">₵{item.price}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-lg font-medium transition-colors duration-200">
                      View Details
                    </button>
                    {order.status === 'delivered' && (
                      <button className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-lg font-medium transition-colors duration-200">
                        Reorder
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}