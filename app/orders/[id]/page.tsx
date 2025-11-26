"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, Package } from "lucide-react";

interface OrderItem {
  id: string;
  quantity: number;
  priceAtPurchase: string;
  product: {
    id: string;
    name: string;
    imageUrl: string;
  };
}

interface Order {
  id: string;
  totalAmount: string;
  status: string;
  shippingAddress: string;
  createdAt: string;
  items: OrderItem[];
}

export default function OrderDetailPage() {
  const params = useParams();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`);
        if (!response.ok) throw new Error("Order not found");
        const data = await response.json();
        setOrder(data.order);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load order");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error || "Order not found"}</p>
          <Link href="/orders" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to Orders
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Success Message */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 mb-8">
          <div className="flex items-center space-x-3">
            <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            <div>
              <h2 className="font-display text-2xl font-bold text-green-900 dark:text-green-100">
                Order Placed Successfully!
              </h2>
              <p className="text-green-700 dark:text-green-300 mt-1">
                Thank you for your order. We&apos;ll process it shortly.
              </p>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-6 border border-transparent dark:border-gray-800">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100">Order Details</h3>
            <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">{order.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Order Date</p>
              <p className="font-semibold text-gray-900 dark:text-gray-100">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">Shipping Address</p>
              <p className="font-semibold whitespace-pre-line text-gray-900 dark:text-gray-100">
                {order.shippingAddress}
              </p>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-6 border border-transparent dark:border-gray-800">
          <h3 className="font-display text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Items Ordered</h3>
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-800 last:border-b-0"
              >
                <div className="w-20 h-20 bg-gray-200 dark:bg-gray-800 rounded flex-shrink-0 flex items-center justify-center">
                  <Package className="w-8 h-8 text-gray-400 dark:text-gray-600" />
                </div>
                <div className="flex-grow">
                  <Link
                    href={`/products/${item.product.id}`}
                    className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400"
                  >
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Quantity: {item.quantity}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-blue-600 dark:text-blue-400">
                    Rs. {(
                      parseFloat(item.priceAtPurchase) * item.quantity
                    ).toLocaleString("en-NP")}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Rs. {parseFloat(item.priceAtPurchase).toLocaleString("en-NP")}{" "}
                    each
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
          <h3 className="font-display text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Order Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                ₹{parseFloat(order.totalAmount).toLocaleString("en-IN")}
              </span>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-800 pt-2 mt-2">
              <div className="flex justify-between text-lg font-bold text-gray-900 dark:text-gray-100">
                <span>Total</span>
                <span className="text-blue-600 dark:text-blue-400">
                  ₹{parseFloat(order.totalAmount).toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <Link
              href="/products"
              className="block w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-center shadow-lg hover:shadow-xl"
            >
              Continue Shopping
            </Link>
            <Link
              href="/orders"
              className="block w-full border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-center"
            >
              View All Orders
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
