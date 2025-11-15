import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Luga - Premium Nepalese Fashion Marketplace",
  description: "Shop authentic sarees, jewelry, and traditional Nepalese clothing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Navbar />
        <main className="min-h-screen">{children}</main>
                    <footer className="bg-gray-100 border-t border-gray-200 py-6 px-4">
              <div className="container mx-auto text-center text-gray-600">
                © 2025 Luga Marketplace. All rights reserved.
              </div>
            </footer>
      </body>
    </html>
  );
}
