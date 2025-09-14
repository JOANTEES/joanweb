'use client';

import { useState } from 'react';
import Navigation from '../components/Navigation';
import { useCart } from '../contexts/CartContext';

type MainCategory = "All" | "Students" | "Women" | "Men";

export default function Shop() {
  const { addToCart } = useCart();
  const [selectedMainCategory, setSelectedMainCategory] = useState<MainCategory>("All");
  const [selectedSubCategory, setSelectedSubCategory] = useState("All");
  
  // Sample product data - you'll replace this with real data
  const products = [
    {
      id: 1,
      name: "Classic White Tee",
      price: 89.99,
      image: "/placeholder-tshirt.jpg",
      category: "Tees"
    },
    {
      id: 2,
      name: "Premium Hoodie",
      price: 179.99,
      image: "/placeholder-hoodie.jpg",
      category: "Sweat outfits"
    },
    {
      id: 3,
      name: "Designer Jeans",
      price: 239.99,
      image: "/placeholder-jeans.jpg",
      category: "Jeans/Cargo pants"
    },
    {
      id: 4,
      name: "Casual Dress",
      price: 149.99,
      image: "/placeholder-dress.jpg",
      category: "Two piece outfits"
    },
    {
      id: 5,
      name: "Sporty Shorts",
      price: 104.99,
      image: "/placeholder-shorts.jpg",
      category: "Tees"
    },
    {
      id: 6,
      name: "Elegant Blouse",
      price: 134.99,
      image: "/placeholder-blouse.jpg",
      category: "Shirts"
    },
    {
      id: 7,
      name: "Football Jersey",
      price: 199.99,
      image: "/placeholder-jersey.jpg",
      category: "Jerseys"
    },
    {
      id: 8,
      name: "Comfortable Slippers",
      price: 79.99,
      image: "/placeholder-slippers.jpg",
      category: "Slippers/Footwear"
    },
    {
      id: 9,
      name: "Running Sneakers",
      price: 299.99,
      image: "/placeholder-sneakers.jpg",
      category: "Sneakers"
    },
    {
      id: 10,
      name: "Leather Belt",
      price: 59.99,
      image: "/placeholder-belt.jpg",
      category: "Bags/Belts"
    }
  ];

  const mainCategories: MainCategory[] = ["All", "Students", "Women", "Men"];
  
  const subCategories: Record<MainCategory, string[]> = {
    "All": ["Jerseys", "Tees", "Shirts", "Sweat outfits", "Jeans/Cargo pants", "Two piece outfits", "Slippers/Footwear", "Sneakers", "Bags/Belts"],
    "Students": ["Jerseys", "Tees", "Shirts", "Sweat outfits", "Jeans/Cargo pants", "Two piece outfits", "Slippers/Footwear", "Sneakers", "Bags/Belts"],
    "Women": ["Jerseys", "Tees", "Shirts", "Sweat outfits", "Jeans/Cargo pants", "Two piece outfits", "Slippers/Footwear", "Sneakers", "Bags/Belts"],
    "Men": ["Jerseys", "Tees", "Shirts", "Sweat outfits", "Jeans/Cargo pants", "Two piece outfits", "Slippers/Footwear", "Sneakers", "Bags/Belts"]
  };

  // Filter products based on selected categories
  const filteredProducts = products.filter(product => {
    // If "All" is selected for subcategory, show all products
    if (selectedSubCategory === "All") {
      return true;
    }
    
    // Filter by the selected subcategory
    return product.category === selectedSubCategory;
  });

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
          {/* Main Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-6">
            {mainCategories.map((category) => (
              <button
                key={category}
                onClick={() => {
                  setSelectedMainCategory(category as MainCategory);
                  setSelectedSubCategory("All");
                }}
                className={`px-6 py-3 rounded-full border-2 font-medium transition-all duration-200 ${
                  selectedMainCategory === category
                    ? 'border-yellow-400 bg-yellow-400 text-black'
                    : 'border-gray-600 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black text-white'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
          
          {/* Sub Categories */}
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setSelectedSubCategory("All")}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedSubCategory === "All"
                  ? 'bg-yellow-400 text-black'
                  : 'bg-gray-700 hover:bg-yellow-400 hover:text-black text-white'
              }`}
            >
              All {selectedMainCategory === "All" ? "Products" : selectedMainCategory}
            </button>
            {subCategories[selectedMainCategory]?.map((subCategory) => (
              <button
                key={subCategory}
                onClick={() => setSelectedSubCategory(subCategory)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  selectedSubCategory === subCategory
                    ? 'bg-yellow-400 text-black'
                    : 'bg-gray-700 hover:bg-yellow-400 hover:text-black text-white'
                }`}
              >
                {subCategory}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Count */}
          <div className="mb-8 text-center">
            <p className="text-gray-400">
              Showing {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''}
              {selectedSubCategory !== "All" && (
                <span> in <span className="text-yellow-400 font-medium">{selectedSubCategory}</span></span>
              )}
            </p>
          </div>
          
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">🔍</span>
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
              <p className="text-gray-400 mb-6">
                No products match your current filter selection.
              </p>
              <button
                onClick={() => {
                  setSelectedMainCategory("All");
                  setSelectedSubCategory("All");
                }}
                className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Show All Products
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredProducts.map((product) => (
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
          )}
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
