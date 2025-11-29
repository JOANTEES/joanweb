"use client";

import { useState } from "react";
import Navigation from "./components/Navigation";
import Link from "next/link";
import Image from "next/image";
import ReviewModal from "./components/ReviewModal";
import { api } from "./utils/api";
import { useAuth } from "./contexts/AuthContext";

export default function Home() {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const handleReviewSubmit = async (
    rating: number,
    comment: string
  ): Promise<void> => {
    try {
      console.log("Submitting review:", { rating, comment });

      // Prepare review data - backend expects review_text, not comment
      const reviewData: {
        rating: number;
        review_text: string;
        guest_name?: string;
      } = {
        rating,
        review_text: comment,
      };

      // If user is not authenticated, include guest_name
      // For now, use a default guest name if not authenticated
      // You may want to add a name field to the ReviewModal later
      if (!isAuthenticated) {
        reviewData.guest_name = "Guest User";
      }

      const result = await api.post("/reviews", reviewData);

      console.log("Review API response:", result);

      if (result.success) {
        console.log("Review submitted successfully:", result);
        return;
      } else {
        const errorMessage = result.message || "Failed to submit review";
        console.error("Review submission failed:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to submit review. Please try again.");
    }
  };

  const handleCloseReviewModal = () => setIsReviewModalOpen(false);
  const handleOpenReviewModal = () => setIsReviewModalOpen(true);

  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover blur-none sm:blur-sm"
          src="/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
        />
        <div className="absolute inset-0 bg-black/50" />
        <Navigation transparent />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  Premium{" "}
                  <span className="block text-yellow-400">
                    Clothing & Apparel
                  </span>
                  <span className="block text-4xl lg:text-5xl font-light">
                    for Everyone
                  </span>
                </h1>
                <p className="text-xl text-gray-300 max-w-lg">
                  Discover the latest trends in fashion with JoanTee. Quality
                  clothing with 24-48 hours delivery right at your doorstep.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/shop"
                  className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Shop Now
                </Link>
              </div>
            </div>

            <div className="relative h-96 flex items-center justify-center">
              <div
                className="relative w-80 h-80"
                style={{ perspective: "1000px" }}
              >
                <Image
                  src="/1.jpg"
                  alt="Clothing 1"
                  width={320}
                  height={320}
                  className="absolute inset-0 w-full h-full object-contain shadow-2xl animate-flip-carousel-1"
                />
                <Image
                  src="/2.jpg"
                  alt="Clothing 2"
                  width={320}
                  height={320}
                  className="absolute inset-0 w-full h-full object-contain shadow-2xl animate-flip-carousel-2"
                />
                <Image
                  src="/3.jpg"
                  alt="Clothing 3"
                  width={320}
                  height={320}
                  className="absolute inset-0 w-full h-full object-contain shadow-2xl animate-flip-carousel-3"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose JoanTee?
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              We deliver anyday, anytime, anywhere.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature cards */}
            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300 bg-gray-800 border border-gray-700">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🚚</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Fast Delivery
              </h3>
              <p className="text-gray-300">
                Get your orders delivered quickly with our reliable pick & drop
                service.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300 bg-gray-800 border border-gray-700">
              <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-6 overflow-hidden">
                <Image
                  src="/logo.png"
                  alt="JoanTee Logo"
                  width={40}
                  height={40}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Premium Quality
              </h3>
              <p className="text-gray-300">
                Every piece is carefully selected for quality, comfort, and
                style.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl hover:shadow-lg transition-shadow duration-300 bg-gray-800 border border-gray-700">
              <div className="w-16 h-16 bg-yellow-400 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">💳</span>
              </div>
              <h3 className="text-2xl font-semibold text-white mb-4">
                Easy Tracking
              </h3>
              <p className="text-gray-300">
                Track your orders and manage your purchases with our simple
                interface.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Upgrade Your Wardrobe?
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers who trust JoanTee for their
            fashion needs.
          </p>
          <Link
            href="/shop"
            className="bg-yellow-400 hover:bg-yellow-500 text-black px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 inline-block"
          >
            Start Shopping
          </Link>

          {/* Review Button */}
          <div className="mt-8 space-y-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                handleOpenReviewModal();
              }}
              className="bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105 cursor-pointer"
            >
              Share Your Experience
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Footer content simplified for brevity */}
        </div>
      </footer>

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}
