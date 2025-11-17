import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendors, products } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const productSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.string(),
  stockQuantity: z.number().int().min(0, "Stock cannot be negative"),
  category: z.string().min(1, "Category is required"),
  imageUrl: z.string().url("Invalid image URL"),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get vendor profile
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, user.id))
      .limit(1);

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 403 }
      );
    }

    // Get vendor's products
    const vendorProducts = await db
      .select()
      .from(products)
      .where(eq(products.vendorId, vendor.id))
      .orderBy(products.createdAt);

    return NextResponse.json({ products: vendorProducts });
  } catch (error) {
    console.error("Get vendor products error:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = user.userId || user.id;

    // Get vendor profile
    const [vendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, userId))
      .limit(1);

    if (!vendor) {
      return NextResponse.json(
        { error: "Vendor profile not found" },
        { status: 403 }
      );
    }

    if (!vendor.isApproved) {
      return NextResponse.json(
        { error: "Vendor account not approved yet" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validatedData = productSchema.parse(body);

    // Create product
    const [newProduct] = await db
      .insert(products)
      .values({
        name: validatedData.name,
        description: validatedData.description,
        price: validatedData.price,
        stockQuantity: validatedData.stockQuantity,
        category: validatedData.category,
        imageUrls: [validatedData.imageUrl],
        vendorId: vendor.id,
      })
      .returning();

    return NextResponse.json(
      { product: newProduct },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }
    
    console.error("Create product error:", error);
    return NextResponse.json(
      { error: "Failed to create product" },
      { status: 500 }
    );
  }
}
