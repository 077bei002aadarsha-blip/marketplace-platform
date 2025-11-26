"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  Store,
  Package,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalVendors: number;
  pendingVendors: number;
  approvedVendors: number;
  totalProducts: number;
  activeProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}

interface RecentVendor {
  id: string;
  businessName: string;
  businessEmail: string;
  isApproved: boolean;
  createdAt: string;
  userName: string;
  userEmail: string;
}

interface RecentOrder {
  id: string;
  totalAmount: string;
  status: string;
  paymentStatus: string;
  createdAt: string;
  userName: string;
  userEmail: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentVendors, setRecentVendors] = useState<RecentVendor[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch("/api/admin/dashboard");

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (response.status === 403) {
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard");
      }

      const data = await response.json();
      setStats(data.stats);
      setRecentVendors(data.recentVendors || []);
      setRecentOrders(data.recentOrders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 mb-4">{error || "Failed to load dashboard"}</p>
          <button
            onClick={fetchDashboard}
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Platform overview and management</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Total Users */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Total Users
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalUsers}
            </p>
          </div>

          {/* Total Vendors */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
                <Store className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              {stats.pendingVendors > 0 && (
                <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 text-xs font-semibold px-2 py-1 rounded-full">
                  {stats.pendingVendors} pending
                </span>
              )}
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Total Vendors
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalVendors}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {stats.approvedVendors} approved
            </p>
          </div>

          {/* Total Products */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                <Package className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Total Products
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalProducts}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {stats.activeProducts} active
            </p>
          </div>

          {/* Total Revenue */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-emerald-100 dark:bg-emerald-900/30 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Total Revenue
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Rs. {stats.totalRevenue.toLocaleString("en-NP")}
            </p>
          </div>

          {/* Total Orders */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 rounded-full p-3">
                <ShoppingCart className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Total Orders
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalOrders}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">
              {stats.pendingOrders} pending
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Link
            href="/admin/vendors?status=pending"
            className="bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 text-white hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-xl font-bold mb-2">
                  Pending Vendor Applications
                </h3>
                <p className="text-orange-100 dark:text-orange-200 mb-4">
                  {stats.pendingVendors} application{stats.pendingVendors !== 1 ? "s" : ""} awaiting review
                </p>
                <span className="inline-flex items-center gap-2 bg-white dark:bg-orange-800 text-orange-600 dark:text-orange-100 px-4 py-2 rounded-lg font-semibold text-sm shadow-lg">
                  <Clock className="w-4 h-4" />
                  Review Now
                </span>
              </div>
            </div>
          </Link>

          <Link
            href="/admin/vendors"
            className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 hover:shadow-lg transition-shadow border border-transparent dark:border-gray-800"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-4 mr-4">
                <Store className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Manage All Vendors
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  View and manage all vendor accounts
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Vendors */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Recent Vendor Applications
            </h2>
            {recentVendors.length > 0 ? (
              <div className="space-y-3">
                {recentVendors.map((vendor) => (
                  <div
                    key={vendor.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        {vendor.businessName}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {vendor.userName} • {vendor.userEmail}
                      </p>
                    </div>
                    {vendor.isApproved ? (
                      <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400" />
                    ) : (
                      <Clock className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-500 text-center py-4">
                No recent vendor applications
              </p>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
            <h2 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Recent Orders
            </h2>
            {recentOrders.length > 0 ? (
              <div className="space-y-3">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex-grow">
                      <p className="font-semibold text-gray-900 dark:text-gray-100">
                        Rs. {parseFloat(order.totalAmount).toLocaleString("en-NP")}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {order.userName} • {order.status}
                      </p>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                      order.paymentStatus === "paid"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300"
                    }`}>
                      {order.paymentStatus}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-500 text-center py-4">
                No recent orders
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
