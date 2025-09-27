"use client";

import { useState, useMemo } from "react";
import Navigation from "../components/Navigation";
import { useCart } from "../contexts/CartContext";
import { useProducts } from "../hooks/useProducts";
import AddToCartModal from "../components/AddToCartModal";
import ProductCard from "../components/ProductCard";

export default function Shop() {
  const { addToCart: _addToCart } = useCart(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const { products, loading, error, refetch } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  type ProductForModal = {
    id: string;
    name: string;
    description?: string;
    price: number;
    effectivePrice: number;
    discountPrice?: number;
    discountPercent?: number;
    hasDiscount: boolean;
    discountAmount?: number;
    category?: {
      id: string;
      name: string;
    };
    legacyCategory?: string;
    imageUrl?: string;
    deliveryEligible: boolean;
    pickupEligible: boolean;
    variants?: Array<{
      id: string;
      size: string;
      color: string;
      stockQuantity: number;
      imageUrl?: string;
    }>;
  };

  const [selectedProduct, setSelectedProduct] =
    useState<ProductForModal | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Define specific categories
  const categories = [
    "All",
    "Students",
    "Women",
    "Men",
    "Jerseys",
    "Tees",
    "Shirts",
    "Sweat outfits",
    "Jeans/Cargo pants",
    "Two piece outfits",
    "Slippers/Footwear",
    "Sneakers",
    "Bags/Belts",
  ];

  const handleAddToCartClick = (product: ProductForModal) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Filter products based on category and search term
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      let matchesCategory = false;

      if (selectedCategory === "All") {
        matchesCategory = true;
      } else if (selectedCategory === "Students") {
        // Students category - you can define what products belong here
        const categoryName =
          product.category?.name || product.legacyCategory || "";
        matchesCategory =
          categoryName.toLowerCase().includes("student") ||
          product.name.toLowerCase().includes("student");
      } else if (selectedCategory === "Women") {
        // Women category - you can define what products belong here
        const categoryName =
          product.category?.name || product.legacyCategory || "";
        matchesCategory =
          categoryName.toLowerCase().includes("women") ||
          categoryName.toLowerCase().includes("female") ||
          product.name.toLowerCase().includes("women") ||
          product.name.toLowerCase().includes("female");
      } else if (selectedCategory === "Men") {
        // Men category - you can define what products belong here
        const categoryName =
          product.category?.name || product.legacyCategory || "";
        matchesCategory =
          categoryName.toLowerCase().includes("men") ||
          categoryName.toLowerCase().includes("male") ||
          product.name.toLowerCase().includes("men") ||
          product.name.toLowerCase().includes("male");
      } else {
        // Exact category match for specific categories
        const categoryName =
          product.category?.name || product.legacyCategory || "";
        matchesCategory = categoryName === selectedCategory;
      }

      const matchesSearch =
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchTerm]);

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

          {/* Category Filters */}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-3 rounded-full border-2 font-medium transition-all duration-200 ${
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
                  {searchTerm || selectedCategory !== "All"
                    ? "No products found matching your criteria"
                    : "No products available"}
                </p>
                {(searchTerm || selectedCategory !== "All") && (
                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setSelectedCategory("All");
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
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCartClick={handleAddToCartClick}
                  />
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
