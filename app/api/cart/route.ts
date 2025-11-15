import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { carts, cartItems, products } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { addToCartSchema } from "@/lib/validations";
import { eq, and } from "drizzle-orm";

// GET - Get user's cart
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user's cart
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, currentUser.userId))
      .limit(1);

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    // Get cart items with product details
    const items = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        addedAt: cartItems.addedAt,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          imageUrl: products.imageUrl,
          stockQuantity: products.stockQuantity,
        },
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

    // Calculate subtotal
    const subtotal = items.reduce(
      (sum, item) => sum + parseFloat(item.product.price) * item.quantity,
      0
    );

    return NextResponse.json({
      cart: {
        id: cart.id,
        items,
        subtotal: subtotal.toFixed(2),
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      },
    });
  } catch (error) {
    console.error("Get cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = addToCartSchema.parse(body);

    // Verify product exists and has stock
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, validatedData.productId))
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

    // Get user's cart
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, currentUser.userId))
      .limit(1);

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    // Check if item already exists in cart
    const [existingItem] = await db
      .select()
      .from(cartItems)
      .where(
        and(
          eq(cartItems.cartId, cart.id),
          eq(cartItems.productId, validatedData.productId)
        )
      )
      .limit(1);

    if (existingItem) {
      // Update quantity
      const newQuantity = existingItem.quantity + validatedData.quantity;

      if (product.stockQuantity < newQuantity) {
        return NextResponse.json(
          { error: "Insufficient stock" },
          { status: 400 }
        );
      }

      const [updatedItem] = await db
        .update(cartItems)
        .set({ quantity: newQuantity })
        .where(eq(cartItems.id, existingItem.id))
        .returning();

      return NextResponse.json({
        message: "Cart updated successfully",
        item: updatedItem,
      });
    } else {
      // Add new item
      const [newItem] = await db
        .insert(cartItems)
        .values({
          cartId: cart.id,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
        })
        .returning();

      return NextResponse.json(
        {
          message: "Item added to cart successfully",
          item: newItem,
        },
        { status: 201 }
      );
    }
  } catch (error) {
    console.error("Add to cart error:", error);
    
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

// DELETE - Clear cart
export async function DELETE() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get user's cart
    const [cart] = await db
      .select()
      .from(carts)
      .where(eq(carts.userId, currentUser.userId))
      .limit(1);

    if (!cart) {
      return NextResponse.json(
        { error: "Cart not found" },
        { status: 404 }
      );
    }

    // Delete all cart items
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    return NextResponse.json({
      message: "Cart cleared successfully",
    });
  } catch (error) {
    console.error("Clear cart error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
