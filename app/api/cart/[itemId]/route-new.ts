import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { cartItems, products } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { updateCartItemSchema } from "@/lib/validations";
import { eq } from "drizzle-orm";

// PUT - Update cart item quantity
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { itemId } = await params;
    const body = await request.json();
    const validatedData = updateCartItemSchema.parse(body);

    // Get cart item
    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(eq(cartItems.id, itemId))
      .limit(1);

    if (!cartItem) {
      return NextResponse.json(
        { error: "Cart item not found" },
        { status: 404 }
      );
    }

    // Check product stock
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, cartItem.productId))
      .limit(1);

    if (!product) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    if (product.stockQuantity < validatedData.quantity) {
      return NextResponse.json(
        { error: "Insufficient stock" },
        { status: 400 }
      );
    }

    // Update quantity
    const [updatedItem] = await db
      .update(cartItems)
      .set({ quantity: validatedData.quantity })
      .where(eq(cartItems.id, itemId))
      .returning();

    return NextResponse.json({
      message: "Cart item updated successfully",
      item: updatedItem,
    });
  } catch (error) {
    console.error("Update cart item error:", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Remove cart item
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ itemId: string }> }
) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { itemId } = await params;

    await db.delete(cartItems).where(eq(cartItems.id, itemId));

    return NextResponse.json({
      message: "Cart item removed successfully",
    });
  } catch (error) {
    console.error("Delete cart item error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
