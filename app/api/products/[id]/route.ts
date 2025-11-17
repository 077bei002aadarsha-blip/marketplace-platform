import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { products } from "@/lib/db/schema";
import { eq, and, sql } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const [product] = await db
      .select()
      .from(products)
      .where(and(eq(products.id, id), eq(products.isActive, true)))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Get related products (same category)
    const relatedProducts = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.category, product.category),
          eq(products.isActive, true),
          sql`${products.id} != ${id}`
        )
      )
      .limit(4);

    // Transform products to include imageUrl from imageUrls array
    const transformedProduct = {
      ...product,
      imageUrl: (product.imageUrls as string[])?.[0] || "/placeholder.jpg"
    };

    const transformedRelatedProducts = relatedProducts.map(p => ({
      ...p,
      imageUrl: (p.imageUrls as string[])?.[0] || "/placeholder.jpg"
    }));

    return NextResponse.json({
      product: transformedProduct,
      relatedProducts: transformedRelatedProducts,
    });
  } catch (error) {
    console.error("Get product error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
