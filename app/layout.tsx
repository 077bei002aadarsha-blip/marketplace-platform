import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import "@/lib/suppress-hydration-warnings";
import Navbar from "@/components/Navbar";
import Script from "next/script";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const theme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
                document.documentElement.classList.toggle('dark', theme === 'dark');
              })();
            `,
          }}
        />
        <Script
          id="disable-darkreader"
          strategy="beforeInteractive"
        >
          {`
            (function() {
              if (typeof window !== 'undefined') {
                const style = document.createElement('style');
                style.textContent = '*[data-darkreader-inline-bgcolor], *[data-darkreader-inline-color], *[data-darkreader-inline-stroke] { display: revert !important; }';
                document.head.appendChild(style);
              }
            })();
          `}
        </Script>
      </head>
      <body className={`${inter.variable} ${spaceGrotesk.variable} font-sans antialiased`} suppressHydrationWarning>
        <Navbar />
        <main className="min-h-screen">{children}</main>
                    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 px-4">
              <div className="container mx-auto text-center text-gray-600 dark:text-gray-400">
                © 2025 Luga Marketplace. All rights reserved.
              </div>
            </footer>
      </body>
    </html>
  );
}
