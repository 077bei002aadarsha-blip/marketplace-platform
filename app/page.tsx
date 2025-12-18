import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ShoppingBag, Shield, TruckIcon } from "lucide-react";

export const dynamic = "force-dynamic";

interface Product {
  id: string;
  name: string;
  price: string;
  imageUrl: string;
}

async function getFeaturedProducts() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/products?limit=8`,
      { cache: "no-store" }
    );
    if (!response.ok) return [];
    const data = await response.json();
    return data.products;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

export default async function Home() {
  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="bg-white dark:bg-black">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 dark:from-blue-600 dark:via-blue-800 dark:to-indigo-900 text-white py-24 overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-400 rounded-full blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400 rounded-full blur-3xl opacity-20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center">
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
              Discover Authentic Nepalese Fashion
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-blue-100 dark:text-blue-200 max-w-3xl mx-auto">
              Premium jewelry, traditional clothing, and handcrafted accessories from the heart of Nepal
            </p>
            <Link
              href="/products"
              className="inline-flex items-center bg-white dark:bg-gray-900 text-blue-600 dark:text-blue-400 px-10 py-4 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition-all shadow-xl hover:shadow-2xl hover:scale-105 transform"
            >
              Shop Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <ShoppingBag className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Authentic Products</h3>
              <p className="text-gray-600 dark:text-gray-400">
                100% genuine traditional Nepalese fashion items crafted by local artisans
              </p>
            </div>
            <div className="text-center bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
              <div className="bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Secure Shopping</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Safe and secure payment processing with buyer protection
              </p>
            </div>
            <div className="text-center bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-sm hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-800">
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 dark:from-amber-600 dark:to-amber-700 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <TruckIcon className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-display text-xl font-bold mb-3 text-gray-900 dark:text-gray-100">Fast Delivery</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Quick and reliable shipping across Nepal within 2-5 days
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-white dark:bg-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-center mb-4 text-gray-900 dark:text-gray-100">
            Shop by Category
          </h2>
          <p className="text-center text-gray-600 dark:text-gray-400 mb-12 max-w-2xl mx-auto">
            Explore our curated collection of authentic Nepalese products
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: "Jewelry", href: "/products?category=jewelry", gradient: "from-purple-500 to-pink-500" },
              { name: "Clothing", href: "/products?category=clothing", gradient: "from-blue-500 to-cyan-500" },
              { name: "Accessories", href: "/products?category=accessories", gradient: "from-orange-500 to-red-500" },
            ].map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="group relative bg-gradient-to-br bg-gray-50 dark:bg-gray-900 rounded-2xl p-12 text-center hover:shadow-2xl transition-all overflow-hidden border border-gray-200 dark:border-gray-800"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
                <h3 className="font-display text-2xl font-bold text-gray-900 dark:text-gray-100 relative z-10">{category.name}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products Section */}
      <section className="py-20 bg-gray-50 dark:bg-gray-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-display text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-2">Featured Products</h2>
              <p className="text-gray-600 dark:text-gray-400">Handpicked selections from our collection</p>
            </div>
            <Link
              href="/products"
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-5 py-2.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
            >
              View All
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
          <div className="h-px bg-gradient-to-r from-transparent via-gray-300 dark:via-gray-700 to-transparent mb-12"></div>
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product: Product) => (
                <Link
                  key={product.id}
                  href={`/products/${product.id}`}
                  className="bg-white dark:bg-gray-900 rounded-lg shadow-md dark:shadow-gray-900/50 overflow-hidden hover:shadow-xl dark:hover:shadow-gray-800/50 transition-shadow border border-transparent dark:border-gray-800"
                >
                  <div className="aspect-square bg-gray-200 dark:bg-gray-800 relative overflow-hidden">
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      Rs. {parseFloat(product.price).toLocaleString("en-NP")}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              No products available yet. Please seed the database.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
