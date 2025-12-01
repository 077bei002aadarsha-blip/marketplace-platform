"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, CreditCard, Package } from "lucide-react";

interface CartItem {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    price: string;
  };
}

export default function CheckoutPage() {
  const router = useRouter();
  const [cart, setCart] = useState<{ items: CartItem[]; subtotal: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [selectedGateway, setSelectedGateway] = useState<"esewa" | "cod">("esewa");

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const response = await fetch("/api/cart");
        if (!response.ok) throw new Error("Failed to fetch cart");
        const data = await response.json();
        
        if (!data.cart || data.cart.items.length === 0) {
          router.push("/cart");
          return;
        }
        
        setCart(data.cart);
      } catch (error) {
        console.error("Error fetching cart:", error);
        setError("Failed to load cart");
      } finally {
        setLoading(false);
      }
    };
    
    fetchCart();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Create order first
      const orderResponse = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddress }),
      });

      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || "Failed to create order");
      }

      const orderId = orderData.order.id;

      // Handle payment based on selected gateway
      if (selectedGateway === "cod") {
        // Cash on delivery - redirect to order page
        router.push(`/orders/${orderId}`);
        return;
      }

      // Initialize payment
      const paymentResponse = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, gateway: selectedGateway }),
      });

      const paymentData = await paymentResponse.json();

      if (!paymentResponse.ok) {

        throw new Error(paymentData.error || "Failed to initiate payment");
      }



      if (selectedGateway === "esewa") {
        // Redirect to eSewa
        const form = document.createElement("form");
        form.method = "POST";
        form.action = paymentData.data.paymentUrl;

        Object.entries(paymentData.data.params).forEach(([key, value]) => {
          const input = document.createElement("input");
          input.type = "hidden";
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to process order");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (!cart) return null;

  const estimatedTax = parseFloat(cart.subtotal) * 0.18;
  const total = parseFloat(cart.subtotal) + estimatedTax;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Shipping Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
              <h2 className="font-display text-xl font-bold mb-6 text-gray-900 dark:text-gray-100">Shipping & Payment</h2>
              
              <form onSubmit={handleSubmit}>
                {/* Payment Method Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Payment Method *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* eSewa */}
                    <button
                      type="button"
                      onClick={() => setSelectedGateway("esewa")}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        selectedGateway === "esewa"
                          ? "border-green-600 dark:border-green-500 bg-green-50 dark:bg-green-900/20"
                          : "border-gray-300 dark:border-gray-700 hover:border-green-400 dark:hover:border-green-600"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <CreditCard className="w-8 h-8 text-green-600 dark:text-green-500 mb-2" />
                        <span className="font-semibold text-gray-900 dark:text-white">eSewa</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Digital Wallet</span>
                      </div>
                    </button>

                    {/* Cash on Delivery */}
                    <button
                      type="button"
                      onClick={() => setSelectedGateway("cod")}
                      className={`p-4 border-2 rounded-lg transition-all ${
                        selectedGateway === "cod"
                          ? "border-blue-600 dark:border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                          : "border-gray-300 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <Package className="w-8 h-8 text-blue-600 dark:text-blue-500 mb-2" />
                        <span className="font-semibold text-gray-900 dark:text-white">COD</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Cash on Delivery</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Shipping Address */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shipping Address *
                  </label>
                  <textarea
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    required
                    minLength={10}
                    rows={4}
                    placeholder="Enter your complete shipping address..."
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Please provide your complete address including street, city, state, and PIN code
                  </p>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : selectedGateway === "cod" ? (
                    "Place Order (COD)"
                  ) : (
                    "Proceed to eSewa Payment"
                  )}
                </button>

                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  {selectedGateway === "cod" 
                    ? "You will pay when you receive the order"
                    : "You will be redirected to secure payment gateway"
                  }
                </p>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 sticky top-24 border border-transparent dark:border-gray-800">
              <h2 className="font-display text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Order Summary</h2>

              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cart.items.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">
                      {item.product.name} × {item.quantity}
                    </span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      Rs. {(parseFloat(item.product.price) * item.quantity).toLocaleString(
                        "en-NP"
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-800 pt-4 space-y-2">
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

              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  <span className="font-semibold">Secure Payment:</span> All transactions are encrypted and secure. Your payment information is protected.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
