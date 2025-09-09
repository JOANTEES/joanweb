'use client';

import Navigation from '../components/Navigation';
import Link from 'next/link';
import { useCart } from '../contexts/CartContext';

export default function Shop() {
  const { addToCart } = useCart();
  
  // Sample product data - you'll replace this with real data
  const products = [
    {
      id: 1,
      name: "Classic White Tee",
      price: 89.99,
      image: "/placeholder-tshirt.jpg",
      category: "T-Shirts"
    },
    {
      id: 2,
      name: "Premium Hoodie",
      price: 179.99,
      image: "/placeholder-hoodie.jpg",
      category: "Hoodies"
    },
    {
      id: 3,
      name: "Designer Jeans",
      price: 239.99,
      image: "/placeholder-jeans.jpg",
      category: "Jeans"
    },
    {
      id: 4,
      name: "Casual Dress",
      price: 149.99,
      image: "/placeholder-dress.jpg",
      category: "Dresses"
    },
    {
      id: 5,
      name: "Sporty Shorts",
      price: 104.99,
      image: "/placeholder-shorts.jpg",
      category: "Shorts"
    },
    {
      id: 6,
      name: "Elegant Blouse",
      price: 134.99,
      image: "/placeholder-blouse.jpg",
      category: "Tops"
    }
  ];

  const categories = ["All", "T-Shirts", "Hoodies", "Jeans", "Dresses", "Shorts", "Tops"];

  return (
    <>
      <Navigation />
      
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              Shop <span className="text-yellow-400">Premium</span> Clothing
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Discover our curated collection of high-quality clothing for every occasion.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Categories */}
      <section className="py-8 bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                className="px-6 py-3 rounded-full border-2 border-gray-600 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black text-white font-medium transition-all duration-200"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="group cursor-pointer">
                <div className="bg-gray-800 rounded-2xl p-8 mb-4 h-64 flex items-center justify-center group-hover:shadow-lg transition-shadow duration-300 border border-gray-700">
                  <div className="text-center">
                    <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-3xl">👕</span>
                    </div>
                    <p className="text-gray-300">Product Image</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-yellow-400 font-medium">{product.category}</p>
                  <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-2xl font-bold text-white">₵{product.price}</p>
                  <button 
                    onClick={() => addToCart(product)}
                    className="w-full bg-yellow-400 hover:bg-yellow-500 text-black py-3 rounded-full font-semibold transition-colors duration-200"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Stay Updated with New Arrivals</h2>
          <p className="text-xl text-gray-300 mb-8">
            Be the first to know about new products and exclusive offers.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-6 py-4 rounded-full text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            />
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-full font-semibold transition-colors duration-200">
              Subscribe
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
