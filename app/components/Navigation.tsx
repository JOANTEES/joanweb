"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { UserRound, LogOut, User, ShoppingCart } from "lucide-react";
import { Home, ShoppingBag, ClipboardList, Truck } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";

export default function Navigation({
  transparent = false,
}: {
  transparent?: boolean;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const [showLogoutNotice, setShowLogoutNotice] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, user, logout, setRedirectUrl } = useAuth();
  const { itemCount } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cross-route toast: read from sessionStorage when route changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = sessionStorage.getItem("app:toast");
      if (!raw) return;
      const payload = JSON.parse(raw) as { type?: string; message?: string };
      if (payload && payload.message) {
        setToastMessage(payload.message);
        setShowLogoutNotice(true);
        // remove and auto-hide
        sessionStorage.removeItem("app:toast");
        const t = setTimeout(() => {
          setShowLogoutNotice(false);
          setToastMessage("");
        }, 2500);
        return () => clearTimeout(t);
      }
    } catch {}
  }, [pathname]);

  const navItems = [
    { name: "Home", href: "/", Icon: Home, protected: false },
    { name: "Shop", href: "/shop", Icon: ShoppingBag, protected: false },
    { name: "Orders", href: "/orders", Icon: ClipboardList, protected: true },
    { name: "Pick & Drop", href: "/pick-drop", Icon: Truck, protected: true },
  ];

  const handleProtectedLinkClick = (href: string) => {
    if (!isAuthenticated) {
      // Determine context based on the href
      let context:
        | "generic"
        | "checkout"
        | "cart"
        | "account"
        | "protected-page" = "protected-page";

      if (href === "/orders" || href === "/profile") {
        context = "account";
      } else if (href.includes("checkout")) {
        context = "checkout";
      } else if (href.includes("cart")) {
        context = "cart";
      }

      setRedirectUrl(href, context);
    }
  };

  const navClassName = transparent
    ? "bg-transparent border-transparent absolute top-0 left-0 right-0 z-50"
    : "bg-black border-b border-gray-800 sticky top-0 z-50";

  return (
    <nav className={navClassName}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center space-x-2 ml-4 sm:ml-6 mt-2 sm:mt-3"
          >
            <Image
              src="/logo.png"
              alt="JoanTees logo"
              width={150}
              height={150}
              className="rounded-lg object-contain"
              priority
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.protected && !isAuthenticated ? "/login" : item.href}
                onClick={() => handleProtectedLinkClick(item.href)}
                className="text-white hover:text-yellow-400 transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Cart & Login Button (desktop) & Mobile Menu Toggle */}
          <div className="flex items-center space-x-3">
            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2 text-white hover:text-yellow-400 transition-colors duration-200 rounded-full hover:bg-gray-800/50"
              onClick={() => {
                if (!isAuthenticated) {
                  setRedirectUrl("/cart", "cart");
                }
              }}
            >
              <ShoppingCart className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-yellow-400 text-black text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center min-w-[20px]">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>
            {isAuthenticated ? (
              <div className="relative hidden md:block" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 bg-yellow-400 hover:bg-yellow-500 text-black px-4 py-2 rounded-full transition-colors duration-200"
                >
                  <UserRound className="w-5 h-5" />
                  <span className="font-medium">{user?.name}</span>
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 rounded-lg shadow-xl border border-gray-700 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-700">
                      <p className="text-sm text-gray-300">{user?.email}</p>
                    </div>
                    <Link
                      href="/profile"
                      className="flex items-center px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                      onClick={() => setIsDropdownOpen(false)}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profile
                    </Link>
                    <button
                      onClick={() => {
                        setIsLogoutConfirmOpen(true);
                      }}
                      className="flex items-center w-full px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                aria-label="Login"
                className="hidden md:inline-flex bg-yellow-400 hover:bg-yellow-500 text-black p-2 rounded-full transition-colors duration-200"
                onClick={() => {
                  // Store current page for generic login
                  if (typeof window !== "undefined") {
                    setRedirectUrl(window.location.pathname, "generic");
                  }
                }}
              >
                <UserRound className="w-6 h-6" />
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-md text-white hover:bg-gray-800"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-gray-800 bg-black/90 backdrop-blur-sm shadow-xl ring-1 ring-gray-800/60 rounded-b-2xl py-3 px-3">
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const ItemIcon = item.Icon;
                return (
                  <Link
                    key={item.name}
                    href={
                      item.protected && !isAuthenticated ? "/login" : item.href
                    }
                    onClick={() => {
                      handleProtectedLinkClick(item.href);
                      setIsMenuOpen(false);
                    }}
                    className={`${
                      isActive
                        ? "bg-gray-800/80 text-white ring-1 ring-gray-700"
                        : "text-white/90 hover:text-white hover:bg-gray-800/60"
                    } transition-colors duration-150 font-medium px-3 py-3 rounded-lg inline-flex items-center gap-3 border border-transparent hover:border-gray-700`}
                  >
                    <ItemIcon className="w-5 h-5" />
                    {item.name}
                  </Link>
                );
              })}
              <div className="mt-1 pt-2 border-t border-gray-800/70" />

              {/* Cart Link for Mobile */}
              <Link
                href="/cart"
                className="text-white hover:text-yellow-300 transition-colors duration-150 font-medium px-3 py-3 rounded-lg inline-flex items-center hover:bg-gray-800/60 border border-transparent hover:border-gray-700 relative"
                onClick={() => {
                  if (!isAuthenticated) {
                    setRedirectUrl("/cart", "cart");
                  }
                  setIsMenuOpen(false);
                }}
              >
                <div className="relative">
                  <ShoppingCart className="w-5 h-5 mr-2" />
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-yellow-400 text-black text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center min-w-[16px]">
                      {itemCount > 99 ? "99+" : itemCount}
                    </span>
                  )}
                </div>
                Cart
              </Link>

              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-300">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-xs">{user?.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="text-white hover:text-yellow-300 transition-colors duration-150 font-medium px-3 py-3 rounded-lg inline-flex items-center hover:bg-gray-800/60 border border-transparent hover:border-gray-700"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="w-5 h-5 mr-2" />
                    Profile
                  </Link>
                  <button
                    onClick={() => {
                      setIsLogoutConfirmOpen(true);
                    }}
                    className="w-full text-left text-white hover:text-yellow-300 transition-colors duration-150 font-medium px-3 py-3 rounded-lg inline-flex items-center hover:bg-gray-800/60 border border-transparent hover:border-gray-700"
                  >
                    <LogOut className="w-5 h-5 mr-2" />
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  href="/login"
                  className="text-white hover:text-yellow-300 transition-colors duration-150 font-medium px-3 py-3 rounded-lg inline-flex items-center hover:bg-gray-800/60 border border-transparent hover:border-gray-700"
                  onClick={() => {
                    // Store current page for generic login
                    if (typeof window !== "undefined") {
                      setRedirectUrl(window.location.pathname, "generic");
                    }
                    setIsMenuOpen(false);
                  }}
                >
                  <UserRound className="w-5 h-5 mr-2" />
                  Login
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
      {/* Logout Confirmation Modal */}
      {isLogoutConfirmOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60">
          <div className="bg-gray-900 border border-gray-700 rounded-lg w-full max-w-sm mx-4 shadow-xl">
            <div className="px-5 py-4 border-b border-gray-800">
              <h3 className="text-white text-lg font-semibold">Sign out</h3>
              <p className="text-gray-400 text-sm mt-1">
                Are you sure you want to sign out?
              </p>
            </div>
            <div className="px-5 py-4 flex justify-end gap-3">
              <button
                onClick={() => setIsLogoutConfirmOpen(false)}
                className="px-4 py-2 rounded-md bg-gray-700 hover:bg-gray-600 text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // close UI immediately
                  setIsDropdownOpen(false);
                  setIsMenuOpen(false);
                  setIsLogoutConfirmOpen(false);
                  // show toast locally
                  setToastMessage("You have been signed out.");
                  setShowLogoutNotice(true);
                  const hideTimer = setTimeout(() => {
                    setShowLogoutNotice(false);
                    setToastMessage("");
                  }, 2500);
                  // also queue for next route just in case
                  try {
                    sessionStorage.setItem(
                      "app:toast",
                      JSON.stringify({
                        type: "success",
                        message: "You have been signed out.",
                      })
                    );
                  } catch {}
                  // navigate to a public page first to avoid protected-page redirects
                  router.push("/");
                  // perform logout shortly after navigation starts
                  setTimeout(() => {
                    logout().catch(() => {});
                    clearTimeout(hideTimer);
                  }, 150);
                }}
                className="px-4 py-2 rounded-md bg-yellow-400 hover:bg-yellow-500 text-black font-semibold transition-colors"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Logout Toast/Notice */}
      {showLogoutNotice && (
        <div className="fixed top-4 right-4 z-[70]">
          <div className="bg-gray-900 border border-gray-700 text-white px-4 py-2 rounded-md shadow-lg flex items-center space-x-2">
            <span className="text-sm">
              {toastMessage || "You have been signed out."}
            </span>
            <button
              onClick={() => {
                setShowLogoutNotice(false);
                setToastMessage("");
              }}
              className="text-gray-400 hover:text-white"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
