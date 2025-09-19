"use client";

import { useState, useMemo, Suspense } from "react";
import Navigation from "../components/Navigation";
import { useCart } from "../contexts/CartContext";
import { useProducts } from "../hooks/useProducts";
import AddToCartModal from "../components/AddToCartModal";

export default function Shop() {
  const { addToCart: _addToCart } = useCart(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const { products, loading, error, refetch } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedGender, setSelectedGender] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  type ProductForModal = {
    id: string | number;
    name: string;
    description?: string;
    price: string | number;
    category: string;
    imageUrl?: string;
    stock_quantity: number;
  };

  const [selectedProduct, setSelectedProduct] =
    useState<ProductForModal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Predefined categories
  const categories = [
    "All",
    "Jerseys",
    "Tees",
    "Shirts", 
    "Sweat outfits",
    "Jeans/Cargo pants",
    "Two piece outfits",
    "Slippers/Footwear",
    "Sneakers",
    "Bags/Belts"
  ];

  // Gender filters
  const genderFilters = ["All", "Students", "Women", "Men"];

  const handleAddToCartClick = (product: ProductForModal) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Filter products based on category, gender, and search term
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;
      const matchesGender =
        selectedGender === "All" || 
        (selectedGender === "Students" && product.category.toLowerCase().includes("student")) ||
        (selectedGender === "Women" && product.category.toLowerCase().includes("women")) ||
        (selectedGender === "Men" && product.category.toLowerCase().includes("men"));
      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesGender && matchesSearch;
    });
  }, [products, selectedCategory, selectedGender, searchTerm]);

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
              Discover our curated collection of high-quality clothing for every
              occasion.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Categories */}
      <section className="py-8 bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="max-w-md mx-auto">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 rounded-full border-2 border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
              />
            </div>
          </div>

          {/* Gender Filters */}
          <div className="mb-6">
            <h3 className="text-white text-lg font-semibold mb-4 text-center">Filter by Gender</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {genderFilters.map((gender) => (
                <button
                  key={gender}
                  onClick={() => setSelectedGender(gender)}
                  className={`px-5 py-2 rounded-full border-2 font-medium transition-all duration-200 text-sm ${
                    selectedGender === gender
                      ? "border-yellow-400 bg-yellow-400 text-black"
                      : "border-gray-600 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black text-white"
                  }`}
                >
                  {gender}
                </button>
              ))}
            </div>
          </div>

          {/* Category Filters */}
          <div>
            <h3 className="text-white text-lg font-semibold mb-4 text-center">Categories</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-5 py-2 rounded-full border-2 font-medium transition-all duration-200 text-sm ${
                    selectedCategory === category
                      ? "border-yellow-400 bg-yellow-400 text-black"
                      : "border-gray-600 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black text-white"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-white text-lg">Loading products...</p>
              </div>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">⚠️</span>
                </div>
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <button
                  onClick={refetch}
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-full font-semibold transition-colors duration-200"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="flex items-center justify-center py-16">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🔍</span>
                </div>
                <p className="text-gray-400 text-lg mb-4">
                  {searchTerm || selectedCategory !== "All" || selectedGender !== "All"
                    ? "No products found matching your criteria"
                    : "No products available"}
                </p>
                {(searchTerm || selectedCategory !== "All" || selectedGender !== "All") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
                      setSelectedGender("All");
                    }}
                    className="bg-yellow-400 hover:bg-yellow-500 text-black px-6 py-3 rounded-full font-semibold transition-colors duration-200"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 text-center">
                <p className="text-gray-400">
                  Showing {filteredProducts.length} of {products.length}{" "}
                  products
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                  <div key={product.id} className="group cursor-pointer">
                    <div className="bg-gray-800 rounded-2xl p-8 mb-4 h-64 flex items-center justify-center group-hover:shadow-lg transition-shadow duration-300 border border-gray-700">
                      {product.image_url ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </>
                      ) : (
                        <div className="text-center">
                          <div className="w-20 h-20 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                            <span className="text-3xl">👕</span>
                          </div>
                          <p className="text-gray-300">Product Image</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-yellow-400 font-medium">
                        {product.category}
                      </p>
                      <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors">
                        {product.name}
                      </h3>
                      {product.description && (
                        <p className="text-gray-400 text-sm line-clamp-2">
                          {product.description}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <p className="text-2xl font-bold text-white">
                          ₵{product.price}
                        </p>
                        {product.stock_quantity > 0 ? (
                          <span className="text-green-400 text-sm">
                            In Stock
                          </span>
                        ) : (
                          <span className="text-red-400 text-sm">
                            Out of Stock
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleAddToCartClick(product)}
                        disabled={product.stock_quantity === 0}
                        className="w-full bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-black py-3 rounded-full font-semibold transition-colors duration-200"
                      >
                        {product.stock_quantity > 0
                          ? "Add to Cart"
                          : "Out of Stock"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-black text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Stay Updated with New Arrivals
          </h2>
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

      {/* Add to Cart Modal */}
      {selectedProduct && (
        <AddToCartModal
          product={{
            id: String(selectedProduct.id),
            name: selectedProduct.name,
            description: selectedProduct.description,
            price: String(selectedProduct.price),
            category: selectedProduct.category,
            imageUrl: selectedProduct.imageUrl,
            stock_quantity: selectedProduct.stock_quantity,
          }}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
