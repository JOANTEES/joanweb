import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Geist,
  Geist_Mono,
  Great_Vibes,
} from "next/font/google";
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

const display = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const script = Great_Vibes({
  variable: "--font-script",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "Sashup with JoanTee — Premium Custom Sash",
  description:
    "Sashup with JoanTee — design your perfect custom sash in minutes. Choose your background, personalize your design, and get premium delivery.",
  icons: {
    icon: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://joantee.com",
    title: "Sashup with JoanTee — Premium Custom Sash",
    description:
      "Sashup with JoanTee — design your perfect custom sash in minutes. Choose your background, personalize your design, and get premium delivery.",
    siteName: "Sashup with JoanTee",
    images: [
      {
        url: "https://joantee.com/logo.png",
        width: 1200,
        height: 630,
        alt: "Sashup with JoanTee Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sashup with JoanTee — Premium Custom Sash",
    description:
      "Sashup with JoanTee — design your perfect custom sash in minutes. Choose your background, personalize your design, and get premium delivery.",
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
    name: "Sashup with JoanTee",
    description:
      "Premium custom sash with fast delivery. Design yours with Sashup with JoanTee.",
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
      "https://www.instagram.com/sashup_with_joantee/",
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
        className={`${geistSans.variable} ${geistMono.variable} ${display.variable} ${script.variable} antialiased bg-black text-white`}
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
