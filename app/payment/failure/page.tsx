"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

function FailureContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("oid") || "";
  const message = searchParams.get("message") || "Payment was cancelled or failed";

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-gray-900/50 p-8 text-center border border-transparent dark:border-gray-800">
        <XCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          {decodeURIComponent(message)}
        </p>
        
        {orderId && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Order ID
            </p>
            <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
              {orderId.slice(0, 8).toUpperCase()}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          {orderId && (
            <Link
              href={`/checkout?retry=${orderId}`}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
            >
              Retry Payment
            </Link>
          )}
          <Link
            href="/"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Go to Home
          </Link>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mt-6">
          Need help? <Link href="/contact" className="text-blue-600 dark:text-blue-400 hover:underline">Contact Support</Link>
        </p>
      </div>
    </div>
  );
}

export default function PaymentFailurePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 text-center">
          <Loader2 className="w-16 h-16 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    }>
      <FailureContent />
    </Suspense>
  );
}
