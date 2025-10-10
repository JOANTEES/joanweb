"use client";

import Link from "next/link";
import Navigation from "../components/Navigation";
import Image from "next/image";
import { Mail, ExternalLink } from "lucide-react";

export default function Contact() {
  return (
    <>
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-black py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              Get in <span className="text-yellow-400">Touch</span>
            </h1>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Have questions or need support? Reach out to us directly via
              email.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="bg-gray-900 rounded-2xl p-12 border border-gray-800">
              <div className="w-20 h-20 bg-yellow-400/20 rounded-full flex items-center justify-center mx-auto mb-8">
                <Mail className="w-10 h-10 text-yellow-400" />
              </div>

              <h2 className="text-3xl font-bold text-white mb-4">Contact Us</h2>

              <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
                For any inquiries, support requests, or business partnerships,
                please reach out to us directly via email.
              </p>

              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <div className="flex items-center justify-center space-x-3 mb-4">
                  <Mail className="w-6 h-6 text-yellow-400" />
                  <span className="text-lg font-semibold text-white">
                    Email Address
                  </span>
                </div>

                <a
                  href="mailto:joanteebusiness@gmail.com"
                  className="inline-flex items-center space-x-2 text-xl text-yellow-400 hover:text-yellow-300 transition-colors font-medium"
                >
                  <span>joanteebusiness@gmail.com</span>
                  <ExternalLink className="w-5 h-5" />
                </a>

                <p className="text-gray-400 text-sm mt-4">
                  We typically respond within 24 hours
                </p>
              </div>

              <div className="mt-8">
                <p className="text-gray-400 text-sm">
                  For urgent matters, please mention &quot;URGENT&quot; in your
                  subject line.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Media Section */}
      <section className="py-16 bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-8">Follow Us</h2>
          <div className="flex justify-center space-x-6">
            <a
              href="https://www.instagram.com/p/DOEN1PBCEM0/?igsh=MW5lYjJ1YmZqaWxsOA=="
              className="text-gray-400 hover:text-yellow-400 transition-colors text-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Instagram
            </a>
            <a
              href="https://vm.tiktok.com/ZMAhGntUb/0"
              className="text-gray-400 hover:text-yellow-400 transition-colors text-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              TikTok
            </a>
            <a
              href="https://snapchat.com/t/B1sJXJdX"
              className="text-gray-400 hover:text-yellow-400 transition-colors text-lg"
              target="_blank"
              rel="noopener noreferrer"
            >
              Snapchat
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 border-t border-gray-800">
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
                    href="/"
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                  >
                    Home
                  </Link>
                </li>
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
              <ul className="space-y-2">
                <li>
                  <a
                    href="https://www.instagram.com/p/DOEN1PBCEM0/?igsh=MW5lYjJ1YmZqaWxsOA=="
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Instagram
                  </a>
                </li>
                <li>
                  <a
                    href="https://vm.tiktok.com/ZMAhGntUb/0"
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    TikTok
                  </a>
                </li>
                <li>
                  <a
                    href="https://snapchat.com/t/B1sJXJdX"
                    className="text-gray-400 hover:text-yellow-400 transition-colors"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Snapchat
                  </a>
                </li>
              </ul>
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
    </>
  );
}
