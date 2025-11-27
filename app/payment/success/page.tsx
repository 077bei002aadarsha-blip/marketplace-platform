"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");
  const [orderId, setOrderId] = useState("");

  useEffect(() => {
    const verifyPayment = async () => {
      const gateway = searchParams.get("gateway");
      const oid = searchParams.get("oid");
      const refId = searchParams.get("refId");
      const pidx = searchParams.get("pidx");
      const amount = searchParams.get("amt");

      if (!gateway || !oid) {
        setError("Invalid payment parameters");
        setVerifying(false);
        return;
      }

      setOrderId(oid);

      try {
        const response = await fetch("/api/payment/verify", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            orderId: oid,
            gateway,
            refId,
            pidx,
            amount,
          }),
        });

        const data = await response.json();

        if (response.ok && data.success) {
          setVerified(true);
        } else {
          setError(data.error || "Payment verification failed");
        }
      } catch {
        setError("Failed to verify payment");
      } finally {
        setVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams]);

  if (verifying) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-gray-900/50 p-8 text-center border border-transparent dark:border-gray-800">
          <Loader2 className="w-16 h-16 text-blue-600 dark:text-blue-400 animate-spin mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Verifying Payment...
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Please wait while we confirm your payment
          </p>
        </div>
      </div>
    );
  }

  if (error || !verified) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-gray-900/50 p-8 text-center border border-transparent dark:border-gray-800">
          <XCircle className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Payment Verification Failed
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {error || "We couldn't verify your payment. Please contact support."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href={orderId ? `/orders/${orderId}` : "/orders"}
              className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
            >
              View Order
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-900 rounded-lg shadow-lg dark:shadow-gray-900/50 p-8 text-center border border-transparent dark:border-gray-800">
        <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Your payment has been confirmed and your order is being processed.
        </p>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
            Order ID
          </p>
          <p className="text-lg font-mono font-semibold text-gray-900 dark:text-white">
            {orderId.slice(0, 8).toUpperCase()}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/orders/${orderId}`}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-semibold"
          >
            View Order Details
          </Link>
          <Link
            href="/products"
            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
