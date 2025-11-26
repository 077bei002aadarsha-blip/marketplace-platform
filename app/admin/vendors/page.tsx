"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Store,
  Mail,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  Filter,
  Search,
} from "lucide-react";

interface Vendor {
  id: string;
  userId: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string | null;
  description: string | null;
  logoUrl: string | null;
  isApproved: boolean;
  createdAt: string;
  userName: string;
  userEmail: string;
  userPhone: string | null;
}

export default function AdminVendorsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState(searchParams.get("status") || "all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchVendors();
  }, [statusFilter]);

  const fetchVendors = async () => {
    try {
      const url = `/api/admin/vendors?status=${statusFilter}`;
      const response = await fetch(url);

      if (response.status === 401) {
        router.push("/auth/login");
        return;
      }

      if (response.status === 403) {
        router.push("/");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch vendors");
      }

      const data = await response.json();
      setVendors(data.vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (vendorId: string) => {
    if (!confirm("Are you sure you want to approve this vendor?")) {
      return;
    }

    setProcessing(vendorId);
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/approve`, {
        method: "PUT",
      });

      if (!response.ok) {
        throw new Error("Failed to approve vendor");
      }

      // Refresh the list
      await fetchVendors();
    } catch (error) {
      console.error("Error approving vendor:", error);
      alert("Failed to approve vendor");
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (vendorId: string) => {
    if (!confirm("Are you sure you want to reject this vendor application?")) {
      return;
    }

    setProcessing(vendorId);
    try {
      const response = await fetch(`/api/admin/vendors/${vendorId}/approve`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to reject vendor");
      }

      // Refresh the list
      await fetchVendors();
    } catch (error) {
      console.error("Error rejecting vendor:", error);
      alert("Failed to reject vendor");
    } finally {
      setProcessing(null);
    }
  };

  const filteredVendors = vendors.filter((vendor) => {
    const query = searchQuery.toLowerCase();
    return (
      vendor.businessName.toLowerCase().includes(query) ||
      vendor.businessEmail.toLowerCase().includes(query) ||
      vendor.userName.toLowerCase().includes(query) ||
      vendor.userEmail.toLowerCase().includes(query)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading vendors...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                Vendor Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Review and manage vendor applications
              </p>
            </div>
            <Link
              href="/admin/dashboard"
              className="bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              ← Back to Dashboard
            </Link>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 dark:text-gray-500" />
              <input
                type="text"
                placeholder="Search vendors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-blue-600 dark:bg-blue-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                All ({vendors.length})
              </button>
              <button
                onClick={() => setStatusFilter("pending")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "pending"
                    ? "bg-orange-600 dark:bg-orange-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Pending
              </button>
              <button
                onClick={() => setStatusFilter("approved")}
                className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                  statusFilter === "approved"
                    ? "bg-green-600 dark:bg-green-500 text-white"
                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                }`}
              >
                Approved
              </button>
            </div>
          </div>
        </div>

        {/* Vendors List */}
        {filteredVendors.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-12 text-center border border-transparent dark:border-gray-800">
            <Store className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Vendors Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery
                ? "No vendors match your search criteria"
                : "No vendor applications yet"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredVendors.map((vendor) => (
              <div
                key={vendor.id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-6 border border-transparent dark:border-gray-800"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4">
                    <div className="bg-purple-100 dark:bg-purple-900/30 rounded-full p-3 flex-shrink-0">
                      <Store className="w-8 h-8 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-display text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                        {vendor.businessName}
                      </h3>
                      <div className="space-y-1 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <Mail className="w-4 h-4" />
                          {vendor.businessEmail}
                        </div>
                        {vendor.businessPhone && (
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                            <Phone className="w-4 h-4" />
                            {vendor.businessPhone}
                          </div>
                        )}
                        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                          <User className="w-4 h-4" />
                          {vendor.userName} ({vendor.userEmail})
                        </div>
                      </div>
                      {vendor.description && (
                        <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                          {vendor.description}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        Applied: {new Date(vendor.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-3">
                    {vendor.isApproved ? (
                      <span className="inline-flex items-center gap-2 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                        <CheckCircle className="w-4 h-4" />
                        Approved
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 px-3 py-1 rounded-full text-sm font-semibold">
                        <Clock className="w-4 h-4" />
                        Pending
                      </span>
                    )}

                    <div className="flex gap-2">
                      {!vendor.isApproved && (
                        <>
                          <button
                            onClick={() => handleApprove(vendor.id)}
                            disabled={processing === vendor.id}
                            className="bg-green-600 dark:bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-700 dark:hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                          >
                            {processing === vendor.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(vendor.id)}
                            disabled={processing === vendor.id}
                            className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                          >
                            {processing === vendor.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <XCircle className="w-4 h-4" />
                            )}
                            Reject
                          </button>
                        </>
                      )}
                      {vendor.isApproved && (
                        <button
                          onClick={() => handleReject(vendor.id)}
                          disabled={processing === vendor.id}
                          className="bg-gray-600 dark:bg-gray-700 text-white px-4 py-2 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                        >
                          {processing === vendor.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
