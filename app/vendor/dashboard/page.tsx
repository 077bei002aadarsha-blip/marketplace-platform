"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Store, 
  Package, 
  ShoppingCart, 
  DollarSign, 
  Plus,
  AlertCircle,
  TrendingUp,
  BarChart3,
  PieChart,
  LineChart
} from "lucide-react";
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  Pie,
  BarChart as RechartsBarChart,
  Bar,
} from 'recharts';

interface VendorStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  pendingOrders: number;
  isApproved: boolean;
}

interface AnalyticsData {
  salesData: Array<{
    date: string;
    revenue: number;
    orders: number;
  }>;
  statusData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  categoryData: Array<{
    name: string;
    value: number;
    units: number;
    color: string;
  }>;
  topProducts: Array<{
    name: string;
    sold: number;
    revenue: number;
  }>;
}

export default function VendorDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<VendorStats | null>(null);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [statsResponse, analyticsResponse] = await Promise.all([
        fetch("/api/vendor/dashboard"),
        fetch("/api/vendor/analytics")
      ]);
      
      if (statsResponse.status === 403) {
        router.push("/vendor/register");
        return;
      }

      if (!statsResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const statsData = await statsResponse.json();
      setStats(statsData.stats);

      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        setAnalytics(analyticsData);
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 dark:text-red-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Failed to load dashboard</p>
        </div>
      </div>
    );
  }

  if (!stats.isApproved) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-8 text-center">
            <AlertCircle className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
            <h1 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Application Pending
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Your vendor application is currently being reviewed by our team.
              You&apos;ll receive an email once your account is approved.
            </p>
            <Link
              href="/"
              className="inline-block bg-blue-600 dark:bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 shadow-lg"
            >
              Back to Home
            </Link>
          </div>
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
            Vendor Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your products and orders</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-3">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500 dark:text-green-400" />
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Total Revenue
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              Rs. {stats.totalRevenue.toLocaleString("en-NP")}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-3">
                <ShoppingCart className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Total Orders
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalOrders}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Total Products
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.totalProducts}
            </p>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-orange-100 dark:bg-orange-900/30 rounded-full p-3">
                <AlertCircle className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">
              Pending Orders
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100">
              {stats.pendingOrders}
            </p>
          </div>
        </div>

        {/* Analytics Charts */}
        {analytics && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Revenue Over Time Chart */}
              <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
                <div className="flex items-center mb-4">
                  <LineChart className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Revenue Over Time (Last 30 Days)
                  </h3>
                </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={analytics.salesData}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis
                      dataKey="date"
                      fontSize={12}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <YAxis
                      fontSize={12}
                      className="text-gray-600 dark:text-gray-400"
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'rgb(255 255 255)',
                        border: '1px solid rgb(229 231 235)',
                        borderRadius: '6px',
                        color: 'rgb(17 24 39)'
                      }}
                      formatter={(value: number, name: string) => [
                        name === 'revenue' ? `Rs. ${value.toLocaleString()}` : value,
                        name === 'revenue' ? 'Revenue' : 'Orders'
                      ]}
                    />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              </div>
            </div>

              {/* Sales by Category */}
              {analytics.categoryData && analytics.categoryData.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800">
                  <div className="flex items-center mb-4">
                    <PieChart className="w-5 h-5 text-orange-600 dark:text-orange-400 mr-2" />
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Sales by Category
                    </h3>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPieChart>
                        <Pie
                          data={analytics.categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={90}
                          paddingAngle={3}
                          dataKey="value"
                          label={({name, percent}) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                        >
                          {analytics.categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgb(255 255 255)',
                            border: '1px solid rgb(229 231 235)',
                            borderRadius: '6px',
                            color: 'rgb(17 24 39)'
                          }}
                          formatter={(value: number) => [`Rs. ${value.toLocaleString()}`, 'Revenue']}
                        />
                      </RechartsPieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-4 justify-center">
                    {analytics.categoryData.map((item, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-gray-600 dark:text-gray-400">
                          {item.name}: {item.units} units
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Top Products Chart */}
        {analytics && analytics.topProducts.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 mb-8 border border-transparent dark:border-gray-800">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 text-green-600 dark:text-green-400 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Top Performing Products
              </h3>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={analytics.topProducts} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis
                    dataKey="name"
                    fontSize={12}
                    className="text-gray-600 dark:text-gray-400"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    fontSize={12}
                    className="text-gray-600 dark:text-gray-400"
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgb(255 255 255)',
                      border: '1px solid rgb(229 231 235)',
                      borderRadius: '6px',
                      color: 'rgb(17 24 39)'
                    }}
                    formatter={(value: number, name: string) => [
                      name === 'revenue' ? `Rs. ${value.toLocaleString()}` : value,
                      name === 'revenue' ? 'Revenue' : 'Units Sold'
                    ]}
                  />
                  <Bar dataKey="revenue" fill="#10b981" radius={[4, 4, 0, 0]} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            href="/vendor/products/new"
            className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 hover:shadow-lg transition-shadow border border-transparent dark:border-gray-800"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full p-4 mr-4">
                <Plus className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Add New Product
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  List a new product for sale
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/vendor/products"
            className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 hover:shadow-lg transition-shadow border border-transparent dark:border-gray-800"
          >
            <div className="flex items-center">
              <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-4 mr-4">
                <Package className="w-8 h-8 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  Manage Products
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  View and edit your products
                </p>
              </div>
            </div>
          </Link>

          <Link
            href="/vendor/orders"
            className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 hover:shadow-lg transition-shadow border border-transparent dark:border-gray-800"
          >
            <div className="flex items-center">
              <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-4 mr-4">
                <ShoppingCart className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h3 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  View Orders
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Manage customer orders
                </p>
              </div>
            </div>
          </Link>

          <div className="bg-gradient-to-r from-blue-600 to-blue-800 dark:from-blue-500 dark:to-blue-700 rounded-lg shadow-md dark:shadow-gray-900/50 p-6">
            <div className="text-white">
              <Store className="w-10 h-10 mb-3" />
              <h3 className="font-display text-xl font-bold mb-2">
                Vendor Resources
              </h3>
              <p className="text-blue-100 dark:text-blue-200 text-sm mb-4">
                Learn how to maximize your sales and grow your business
              </p>
              <button className="bg-white dark:bg-gray-100 text-blue-600 dark:text-blue-700 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-200 transition-colors shadow-lg">
                View Guides
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
