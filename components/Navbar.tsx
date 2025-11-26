"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ShoppingCart, User, LogOut, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [cartItemCount, setCartItemCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUser();
  }, [pathname]);

  useEffect(() => {
    if (user) {
      fetchCartCount();
    }
  }, [user]);

  const fetchUser = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchCartCount = async () => {
    try {
      const response = await fetch("/api/cart");
      if (response.ok) {
        const data = await response.json();
        setCartItemCount(data.cart.itemCount);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      setUser(null);
      setCartItemCount(0);
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-white dark:bg-black border-b border-gray-200 dark:border-gray-800 sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-black/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <span className="font-display text-2xl font-bold text-blue-600 dark:text-blue-500 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors tracking-tight">Luga</span>
            <span className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">Nepal</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/products"
              className={`${
                pathname === "/products"
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              } transition-colors font-medium`}
            >
              Products
            </Link>
            <Link
              href="/products?category=jewelry"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Jewelry
            </Link>
            <Link
              href="/products?category=clothing"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Clothing
            </Link>
            <Link
              href="/products?category=accessories"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium"
            >
              Accessories
            </Link>
          </div>

          {/* Right Side Icons */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {loading ? (
              <div className="w-24 h-8 bg-gray-200 dark:bg-gray-800 animate-pulse rounded"></div>
            ) : user ? (
              <>
                <Link
                  href="/cart"
                  className="relative p-2 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  <ShoppingCart className="w-6 h-6" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-blue-600 dark:bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </Link>
                <Link
                  href="/orders"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Orders
                </Link>
                {user.role === "vendor" && (
                  <Link
                    href="/vendor/dashboard"
                    className="bg-purple-600 dark:bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-700 dark:hover:bg-purple-600 transition-colors font-medium"
                  >
                    Vendor Dashboard
                  </Link>
                )}
                {user.role === "admin" && (
                  <Link
                    href="/admin/dashboard"
                    className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors font-medium shadow-md"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-all hover:shadow-md font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-gray-700 dark:text-gray-300"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
            <div className="flex flex-col space-y-4">
              <Link
                href="/products"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Products
              </Link>
              <Link
                href="/products?category=jewelry"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Jewelry
              </Link>
              <Link
                href="/products?category=clothing"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Clothing
              </Link>
              <Link
                href="/products?category=accessories"
                className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 font-medium py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                Accessories
              </Link>
              {user ? (
                <>
                  <Link
                    href="/cart"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Cart ({cartItemCount})
                  </Link>
                  <Link
                    href="/orders"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Orders
                  </Link>
                  {user.role === "vendor" && (
                    <Link
                      href="/vendor/dashboard"
                      className="bg-purple-600 dark:bg-purple-500 text-white px-4 py-2 rounded-lg text-center font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Vendor Dashboard
                    </Link>
                  )}
                  {user.role === "vendor" && (
                    <Link
                      href="/vendor/dashboard"
                      className="bg-purple-600 dark:bg-purple-500 text-white px-4 py-2 rounded-lg text-center font-medium"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Vendor Dashboard
                    </Link>
                  )}
                  {user.role === "admin" && (
                    <Link
                      href="/admin/dashboard"
                      className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg text-center font-medium shadow-md"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="text-sm text-gray-700 dark:text-gray-300 pt-2 border-t border-gray-200 dark:border-gray-800">
                    {user.name}
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="text-left text-red-600 dark:text-red-400"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
