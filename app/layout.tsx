import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import MaintenanceMode from "./components/MaintenanceMode";

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
  description: "Discover the latest in fashion with JoanTee. Premium clothing with fast delivery service.",
  icons: {
    icon: '/favicon.ico',
    apple: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Check if maintenance mode is enabled
  const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true';

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-black text-white`}
      >
        {isMaintenanceMode ? (
          <MaintenanceMode />
        ) : (
          <AuthProvider>
            <CartProvider>
              <div className="min-h-screen flex flex-col">
                {children}
              </div>
            </CartProvider>
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
