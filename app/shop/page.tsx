"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import Navigation from "../components/Navigation";
import { useCart } from "../contexts/CartContext";
import { useProducts } from "../hooks/useProducts";
import AddToCartModal from "../components/AddToCartModal";
import ProductCard from "../components/ProductCard";
import FilterSidebar from "../components/FilterSidebar";
import TrendingPills from "../components/TrendingPills";

// Import types from ProductCard component
interface Product {
  id: string;
  name: string;
  description?: string;
  // sku?: string; // Temporarily disabled
  costPrice?: number;
  price: number;
  discountPrice?: number;
  discountPercent?: number;
  effectivePrice: number;
  profitMargin?: {
    costPrice: number;
    sellingPrice: number;
    profit: number;
    margin: number;
  };
  brand?: {
    id: string;
    name: string;
  };
  category?: {
    id: string;
    name: string;
  };
  legacyCategory?: string;
  imageUrl?: string;
  images?: string[]; // NEW: Array of all product and variant images
  requiresSpecialDelivery: boolean;
  deliveryEligible: boolean;
  pickupEligible: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductVariant {
  id: string;
  productId: string;
  productName: string;
  // sku: string; // Temporarily disabled
  size: string;
  color: string;
  stockQuantity: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function Shop() {
  const { addToCart: _addToCart } = useCart(); // eslint-disable-line @typescript-eslint/no-unused-vars
  const { products, loading, error, refetch } = useProducts();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
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

  const handleAddToCartClick = (
    product: Product & { variants?: ProductVariant[] }
  ) => {
    const productForModal: ProductForModal = {
      ...product,
      hasDiscount: Boolean(
        (product.discountPrice && product.discountPrice < product.price) ||
          (product.discountPercent && product.discountPercent > 0)
      ),
      discountAmount: product.discountPrice
        ? product.price - product.discountPrice
        : product.discountPercent
        ? product.price * (product.discountPercent / 100)
        : undefined,
    };
    setSelectedProduct(productForModal);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handleBrandChange = (brands: string[]) => {
    setSelectedBrands(brands);
  };

  const handleCategoryChange = (categories: string[]) => {
    setSelectedCategories(categories);
  };

  const handleClearFilters = () => {
    setSelectedBrands([]);
    setSelectedCategories([]);
    setSearchTerm("");
  };

  const handleBrandToggle = (brandId: string) => {
    if (selectedBrands.includes(brandId)) {
      setSelectedBrands(selectedBrands.filter((id) => id !== brandId));
    } else {
      setSelectedBrands([...selectedBrands, brandId]);
    }
  };

  const handleCategoryToggle = (categoryId: string) => {
    if (selectedCategories.includes(categoryId)) {
      setSelectedCategories(
        selectedCategories.filter((id) => id !== categoryId)
      );
    } else {
      setSelectedCategories([...selectedCategories, categoryId]);
    }
  };

  // Filter products based on brands, categories, and search term
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Brand filtering
      const matchesBrand =
        selectedBrands.length === 0 ||
        (product.brand?.id && selectedBrands.includes(product.brand.id));

      // Category filtering
      const matchesCategory =
        selectedCategories.length === 0 ||
        (product.category?.id &&
          selectedCategories.includes(product.category.id));

      // Search filtering
      const matchesSearch =
        searchTerm === "" ||
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.brand?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.category?.name &&
          product.category.name
            .toLowerCase()
            .includes(searchTerm.toLowerCase()));

      return matchesBrand && matchesCategory && matchesSearch;
    });
  }, [products, selectedBrands, selectedCategories, searchTerm]);

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

      {/* Search and Filters */}
      <section className="py-8 bg-gray-900 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Trending Pills */}
          <div className="mb-6">
            <TrendingPills
              selectedBrands={selectedBrands}
              selectedCategories={selectedCategories}
              onBrandToggle={handleBrandToggle}
              onCategoryToggle={handleCategoryToggle}
            />
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Search Bar */}
            <div className="flex-1">
              <div className="max-w-md mx-auto lg:mx-0">
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 rounded-full border-2 border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filter Toggle Button */}
            <div className="flex justify-center lg:justify-end">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-6 py-3 rounded-full border-2 border-gray-600 hover:border-yellow-400 hover:bg-yellow-400 hover:text-black text-white font-medium transition-all duration-200 flex items-center space-x-2"
              >
                <span>Filters</span>
                <span className="text-sm">
                  {selectedBrands.length + selectedCategories.length > 0 &&
                    `(${selectedBrands.length + selectedCategories.length})`}
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filter Sidebar */}
            {showFilters && (
              <div className="lg:w-80">
                <FilterSidebar
                  selectedBrands={selectedBrands}
                  selectedCategories={selectedCategories}
                  onBrandChange={handleBrandChange}
                  onCategoryChange={handleCategoryChange}
                  onClearFilters={handleClearFilters}
                />
              </div>
            )}

            {/* Products Grid */}
            <div className="flex-1">
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
                      {searchTerm ||
                      selectedBrands.length > 0 ||
                      selectedCategories.length > 0
                        ? "No products found matching your criteria"
                        : "No products available"}
                    </p>
                    {(searchTerm ||
                      selectedBrands.length > 0 ||
                      selectedCategories.length > 0) && (
                      <button
                        onClick={handleClearFilters}
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
                      <div key={product.id} className="flex">
                        <ProductCard
                          product={product}
                          onAddToCartClick={handleAddToCartClick}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="Joan Tees Logo"
                    width={32}
                    height={32}
                    className="w-full h-full object-contain"
                  />
                </div>
                <span className="text-2xl font-bold">JoanTee</span>
              </div>
              <p className="text-gray-400">
                Premium clothing with fast delivery service.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/shop"
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    Shop
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/contact"
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Connect</h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.instagram.com/p/DOEN1PBCEM0/?igsh=MW5lYjJ1YmZqaWxsOA=="
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Instagram
                </a>
                <a
                  href="https://vm.tiktok.com/ZMAhGntUb/0"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  TikTok
                </a>
                <a
                  href="https://snapchat.com/t/B1sJXJdX"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Snapchat
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-wrap justify-center md:justify-start space-x-6 text-sm">
                <Link
                  href="/privacy-policy"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/terms-of-service"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  Terms of Service
                </Link>
              </div>
              <p className="text-gray-400 text-sm">
                &copy; {new Date().getFullYear()} JoanTee. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Add to Cart Modal */}
      {selectedProduct && (
        <AddToCartModal
          product={{
            id: String(selectedProduct.id),
            name: selectedProduct.name,
            description: selectedProduct.description,
            price: selectedProduct.price,
            effectivePrice: selectedProduct.effectivePrice,
            discountPrice: selectedProduct.discountPrice,
            discountPercent: selectedProduct.discountPercent,
            hasDiscount: selectedProduct.hasDiscount,
            discountAmount: selectedProduct.discountAmount,
            category: selectedProduct.category,
            legacyCategory: selectedProduct.legacyCategory,
            imageUrl: selectedProduct.imageUrl,
            deliveryEligible: selectedProduct.deliveryEligible,
            pickupEligible: selectedProduct.pickupEligible,
            variants: selectedProduct.variants?.map((variant) => ({
              id: variant.id,
              productId: selectedProduct.id,
              productName: selectedProduct.name,
              sku: variant.id, // Use variant id as sku fallback
              size: variant.size,
              color: variant.color,
              stockQuantity: variant.stockQuantity,
              imageUrl: variant.imageUrl,
              isActive: true, // Default to active
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            })),
          }}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}
    </>
  );
}
