"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ShoppingCart, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  category: string;
  stockQuantity: number;
  imageUrl: string;
}

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${params.id}`);
        if (!response.ok) throw new Error("Product not found");
        const data = await response.json();
        setProduct(data.product);
        setRelatedProducts(data.relatedProducts || []);
      } catch {
        setError("Failed to load product");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [params.id]);

  const handleAddToCart = async () => {
    setAdding(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product?.id,
          quantity,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        if (response.status === 401) {
          router.push(`/login?redirect=/products/${params.id}`);
          return;
        }
        throw new Error(data.error || "Failed to add to cart");
      }

      setSuccess("Added to cart!");
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add to cart");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-blue-400" />
      </div>
    );
  }

  if (error && !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Link href="/products" className="text-blue-600 dark:text-blue-400 hover:underline">
            Back to Products
          </Link>
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="bg-gray-50 dark:bg-black min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Product Details */}
        <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden mb-8 border border-transparent dark:border-gray-800">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Image */}
            <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden relative">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>

            {/* Details */}
            <div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                {product.name}
              </h1>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-6">
                Rs. {parseFloat(product.price).toLocaleString("en-NP")}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{product.description}</p>

              <div className="mb-6">
                <span className="inline-block bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  {product.category}
                </span>
              </div>

              {product.stockQuantity > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <label className="font-medium text-gray-900 dark:text-gray-100">Quantity:</label>
                    <select
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value))}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                    >
                      {[...Array(Math.min(product.stockQuantity, 10))].map((_, i) => (
                        <option key={i + 1} value={i + 1}>
                          {i + 1}
                        </option>
                      ))}
                    </select>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      ({product.stockQuantity} available)
                    </span>
                  </div>

                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded">
                      {success}
                    </div>
                  )}

                  <button
                    onClick={handleAddToCart}
                    disabled={adding}
                    className="w-full bg-blue-600 dark:bg-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                  >
                    {adding ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        Add to Cart
                      </>
                    )}
                  </button>
                </div>
              ) : (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded">
                  Out of Stock
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div>
            <h2 className="font-display text-2xl md:text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Related Products</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <Link
                  key={relatedProduct.id}
                  href={`/products/${relatedProduct.id}`}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-800/50 transition-shadow border border-transparent dark:border-gray-800"
                >
                  <div className="aspect-square bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                    <Image
                      src={relatedProduct.imageUrl}
                      alt={relatedProduct.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
                      {relatedProduct.name}
                    </h3>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      Rs. {parseFloat(relatedProduct.price).toLocaleString("en-NP")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
