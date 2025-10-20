"use client";

import { useState } from "react";
import Navigation from "./components/Navigation";
import Link from "next/link";
import Image from "next/image";
import ReviewModal from "./components/ReviewModal";
import { api } from "./utils/api";

export default function Home() {
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const handleReviewSubmit = async (rating: number, comment: string) => {
    try {
      const result = await api.post('/reviews', {
        rating,
        comment,
        // User ID will be automatically included via authentication token
      });

      if (result.success) {
        console.log("Review submitted successfully:", result);
        // You could add a toast notification here
        // toast.success("Thank you for your review!");
      } else {
        throw new Error(result.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      throw error;
    }
  };

  const handleCloseReviewModal = () => {
    setIsReviewModalOpen(false);
  };

  const handleOpenReviewModal = () => {
    setIsReviewModalOpen(true);
  };

  return (
    <>
      {/* Hero Section with Background Video and Overlaid Navigation */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Background video */}
        <video
          className="absolute inset-0 w-full h-full object-cover blur-none sm:blur-sm"
          src="/hero.mp4"
          autoPlay
          loop
          muted
          playsInline
        />

        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-black/50" />

        {/* Navigation overlaid */}
        <Navigation transparent />

        {/* Foreground content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              <div className="space-y-4">
                <h1 className="text-5xl lg:text-7xl font-bold text-white leading-tight">
                  Premium
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

            {/* Right Content - Flipping Clothing Images */}
            <div className="relative h-96 flex items-center justify-center">
              <div
                className="relative w-80 h-80"
                style={{ perspective: "1000px" }}
              >
                {/* Image 1 */}
                <Image
                  src="/1.jpg"
                  alt="Premium Clothing Collection 1"
                  width={320}
                  height={320}
                  className="absolute inset-0 w-full h-full object-contain shadow-2xl animate-flip-carousel-1"
                />
                {/* Image 2 */}
                <Image
                  src="/2.jpg"
                  alt="Premium Clothing Collection 2"
                  width={320}
                  height={320}
                  className="absolute inset-0 w-full h-full object-contain shadow-2xl animate-flip-carousel-2"
                />
                {/* Image 3 */}
                <Image
                  src="/3.jpg"
                  alt="Premium Clothing Collection 3"
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
          <div className="mt-8">
            <button
              onClick={handleOpenReviewModal}
              className="bg-transparent border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 rounded-full font-semibold text-lg transition-all duration-300 transform hover:scale-105"
            >
              Share Your Experience
            </button>
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
                Premium clothing with 24-48 hours delivery service.
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
                <a
                  href="https://chat.whatsapp.com/FC3C47wb7wk6Op4XeNkECc?mode=wwc
"
                  className="text-gray-400 hover:text-yellow-400 transition-colors"
                >
                  WhatsApp
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

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={handleCloseReviewModal}
        onSubmit={handleReviewSubmit}
      />
    </>
  );
}
