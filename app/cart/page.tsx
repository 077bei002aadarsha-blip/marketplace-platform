"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Trash2, Plus, Minus, Loader2, ShoppingBag } from "lucide-react";
import { useRouter } from "next/navigation";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string;
    imageUrl: string;
    stockQuantity: number;
  };
}

export default function CartPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ items: CartItem[]; subtotal: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch("/api/cart");
      if (!response.ok) throw new Error("Failed to fetch cart");
      const data = await response.json();
      setCart(data.cart);
    } catch (error) {
      console.error("Error fetching cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    setUpdating(itemId);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: newQuantity }),
      });

      if (!response.ok) throw new Error("Failed to update cart");
      await fetchCart();
    } catch (error) {
      console.error("Error updating cart:", error);
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdating(itemId);
    try {
      const response = await fetch(`/api/cart/${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove item");
      await fetchCart();
    } catch (error) {
      console.error("Error removing item:", error);
    } finally {
      setUpdating(null);
    }
  };

  const clearCart = async () => {
    if (!confirm("Are you sure you want to clear your cart?")) return;

    try {
      await fetch("/api/cart", { method: "DELETE" });
      await fetchCart();
    } catch (error) {
      console.error("Error clearing cart:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Your cart is empty
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Add some products to get started!
            </p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const estimatedTax = parseFloat(cart.subtotal) * 0.18;
  const total = parseFloat(cart.subtotal) + estimatedTax;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">Shopping Cart</h1>
          <button
            onClick={clearCart}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 text-sm font-medium"
          >
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cart.items.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 flex gap-4 border border-transparent dark:border-gray-800"
              >
                <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded flex-shrink-0 flex items-center justify-center">
                  <span className="text-gray-400 dark:text-gray-600 text-xs">Image</span>
                </div>

                <div className="flex-grow">
                  <Link
                    href={`/products/${item.product.id}`}
                    className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-lg font-bold text-blue-600 dark:text-blue-400 mt-1">
                    Rs. {parseFloat(item.product.price).toLocaleString("en-NP")}
                  </p>

                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating === item.id}
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium text-gray-900 dark:text-gray-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={
                        item.quantity >= item.product.stockQuantity ||
                        updating === item.id
                      }
                      className="w-8 h-8 rounded border border-gray-300 dark:border-gray-700 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.id)}
                    disabled={updating === item.id}
                    className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <p className="text-lg font-bold text-gray-900 dark:text-gray-100">
                    Rs. {(parseFloat(item.product.price) * item.quantity).toLocaleString(
                      "en-NP"
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 sticky top-24 border border-transparent dark:border-gray-800">
              <h2 className="font-display text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Order Summary</h2>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Rs. {parseFloat(cart.subtotal).toLocaleString("en-NP")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Estimated Tax (18%)</span>
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Rs. {estimatedTax.toLocaleString("en-NP")}
                  </span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2">
                  <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                    <span>Total</span>
                    <span>Rs. {total.toLocaleString("en-NP")}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
              >
                Proceed to Checkout
              </button>

              <Link
                href="/products"
                className="block text-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mt-4"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
