import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import MaintenanceMode from "./components/MaintenanceMode";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "JoanTee - Premium Clothing",
  description:
    "Discover the latest in fashion with JoanTee. Premium clothing with fast delivery service.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://joantee.com",
    title: "JoanTee - Premium Clothing",
    description:
      "Discover the latest in fashion with JoanTee. Premium clothing with fast delivery service.",
    siteName: "JoanTee",
    images: [
      {
        url: "https://joantee.com/logo.png",
        width: 1200,
        height: 630,
        alt: "JoanTee Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "JoanTee - Premium Clothing",
    description:
      "Discover the latest in fashion with JoanTee. Premium clothing with fast delivery service.",
    images: ["https://joantee.com/logo.png"],
  },
  metadataBase: new URL("https://joantee.com"),
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: "JoanTee",
    description:
      "Premium clothing with fast delivery service. Discover the latest in fashion with JoanTee.",
    url: "https://joantee.com",
    logo: "https://joantee.com/logo.png",
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+233-XX-XXX-XXXX",
      contactType: "customer service",
      email: "joanteebusiness@gmail.com",
      availableLanguage: ["English"],
    },
    address: {
      "@type": "PostalAddress",
      addressCountry: "GH",
    },
    sameAs: [
      "https://www.instagram.com/p/DOEN1PBCEM0/",
      "https://vm.tiktok.com/ZMAhGntUb/0",
      "https://snapchat.com/t/B1sJXJdX",
    ],
  };

  return (
    <html lang="en">
      <head>
        <Script
          id="structured-data"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {isMaintenanceMode ? (
          <MaintenanceMode />
        ) : (
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">{children}</div>
            </CartProvider>
          </AuthProvider>
        )}
        <Analytics />
      </body>
    </html>
  );
}
