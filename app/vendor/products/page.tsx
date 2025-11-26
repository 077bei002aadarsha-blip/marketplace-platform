"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package, Plus, Edit, Trash2, Eye } from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string;
  price: string;
  stockQuantity: number;
  category: string;
  imageUrls: string[];
  createdAt: string;
}

export default function VendorProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch("/api/vendor/products");
      
      if (!response.ok) {
        throw new Error("Failed to fetch products");
      }

      const data = await response.json();
      setProducts(data.products);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return;
    }

    setDeleteId(id);
    try {
      const response = await fetch(`/api/vendor/products/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete product");
      }

      setProducts(products.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Failed to delete product");
    } finally {
      setDeleteId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-black">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              My Products
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your product listings
            </p>
          </div>
          <Link
            href="/vendor/products/new"
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 flex items-center gap-2 transition-colors shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Add Product
          </Link>
        </div>

        {/* Products Grid */}
        {products.length === 0 ? (
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 p-12 text-center border border-transparent dark:border-gray-800">
            <Package className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h2 className="font-display text-2xl md:text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              No Products Yet
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start by adding your first product to the marketplace
            </p>
            <Link
              href="/vendor/products/new"
              className="inline-flex items-center gap-2 bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Add Your First Product
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden hover:shadow-lg transition-shadow border border-transparent dark:border-gray-800"
              >
                  <div className="relative h-48 bg-gray-200 dark:bg-gray-800">
                  <Image
                    src={product.imageUrls[0] || "/placeholder.jpg"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      product.stockQuantity > 0 
                        ? "bg-green-100 text-green-800" 
                        : "bg-red-100 text-red-800"
                    }`}>
                      {product.stockQuantity > 0 ? `${product.stockQuantity} in stock` : "Out of stock"}
                    </span>
                  </div>
                </div>                <div className="p-4">
                  <div className="mb-2">
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase">
                      {product.category}
                    </span>
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>
                  
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                    Rs. {parseFloat(product.price).toLocaleString("en-NP")}
                  </p>
                  
                  <div className="flex gap-2">
                    <Link
                      href={`/products/${product.id}`}
                      className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-center flex items-center justify-center gap-2"
                      target="_blank"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </Link>
                    
                    <Link
                      href={`/vendor/products/${product.id}/edit`}
                      className="flex-1 bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-600 transition-colors text-center flex items-center justify-center gap-2 shadow-md"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(product.id)}
                      disabled={deleteId === product.id}
                      className="bg-red-600 dark:bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 dark:hover:bg-red-600 transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 shadow-md"
                    >
                      {deleteId === product.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
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
