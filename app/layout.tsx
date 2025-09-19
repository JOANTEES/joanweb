import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import PerformanceOptimizer from "./components/PerformanceOptimizer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: 'swap',
  preload: true,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  title: "JoanTees - Premium Clothing",
  description: "Discover the latest in fashion with JoanTees. Premium clothing with fast delivery service.",
  keywords: ["clothing", "fashion", "premium", "delivery", "Ghana", "apparel"],
  authors: [{ name: "JoanTees" }],
  creator: "JoanTees",
  publisher: "JoanTees",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://joantees.com'),
  openGraph: {
    title: "JoanTees - Premium Clothing",
    description: "Discover the latest in fashion with JoanTees. Premium clothing with fast delivery service.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "JoanTees - Premium Clothing",
    description: "Discover the latest in fashion with JoanTees. Premium clothing with fast delivery service.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        <AuthProvider>
          <CartProvider>
            <PerformanceOptimizer />
            <div className="min-h-screen flex flex-col">
              {children}
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
