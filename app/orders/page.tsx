"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Loader2, Package } from "lucide-react";

interface Order {
  id: string;
  totalAmount: string;
  status: string;
  createdAt: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/orders");
        if (!response.ok) throw new Error("Failed to fetch orders");
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-gray-100">My Orders</h1>

        {orders.length > 0 ? (
          <div className="space-y-4">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="block bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 hover:shadow-lg transition-shadow border border-transparent dark:border-gray-800"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-4">
                    <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                      <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Order ID</p>
                      <p className="font-semibold text-gray-900 dark:text-gray-100">{order.id.slice(0, 8)}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      Rs. {parseFloat(order.totalAmount).toLocaleString("en-NP")}
                    </p>
                    <span className="inline-block mt-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">
                      {order.status}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 border border-transparent dark:border-gray-800">
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No orders yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start shopping to create your first order!
            </p>
            <Link
              href="/products"
              className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg hover:shadow-xl"
            >
              Browse Products
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
