import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and, gte, lte, ilike, or, desc, asc, sql } from "drizzle-orm";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    
    // Parse query parameters
    const categories = searchParams.getAll("category");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "newest";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // Build filters
    const filters = [eq(products.isActive, true)];

    if (categories.length > 0) {
      const categoryFilters = categories.map(cat => eq(products.category, cat));
      filters.push(or(...categoryFilters)!);
    }

    if (minPrice) {
      filters.push(gte(products.price, minPrice));
    }

    if (maxPrice) {
      filters.push(lte(products.price, maxPrice));
    }

    if (search) {
      filters.push(
        or(
          ilike(products.name, `%${search}%`),
          ilike(products.description, `%${search}%`)
        )!
      );
    }

    // Build sort order
    let orderBy;
    switch (sortBy) {
      case "price_asc":
        orderBy = asc(products.price);
        break;
      case "price_desc":
        orderBy = desc(products.price);
        break;
      case "name":
        orderBy = asc(products.name);
        break;
      case "newest":
      default:
        orderBy = desc(products.createdAt);
        break;
    }

    // Fetch products
    const productList = await db
      .select()
      .from(products)
      .where(and(...filters))
      .orderBy(orderBy)
      .limit(limit)
      .offset(offset);

    // Get total count
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(and(...filters));

    // Transform products to include imageUrl from imageUrls array
    const transformedProducts = productList.map(product => ({
      ...product,
      imageUrl: (product.imageUrls as string[])?.[0] || "/placeholder.jpg"
    }));

    return NextResponse.json({
      products: transformedProducts,
      pagination: {
        page,
        limit,
        total: count,
        totalPages: Math.ceil(count / limit),
      },
    });
  } catch (error) {
    logger.error("Failed to fetch products", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
