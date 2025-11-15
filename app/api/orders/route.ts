import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, carts, cartItems, products } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { createOrderSchema } from "@/lib/validations";
import { eq, desc } from "drizzle-orm";

// POST - Create new order
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
    const validatedData = createOrderSchema.parse(body);

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
        cartItemId: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        price: products.price,
        stockQuantity: products.stockQuantity,
      })
      .from(cartItems)
      .innerJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.cartId, cart.id));

    if (items.length === 0) {
      return NextResponse.json(
        { error: "Cart is empty" },
        { status: 400 }
      );
    }

    // Verify stock availability
    for (const item of items) {
      if (item.stockQuantity < item.quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for one or more items` },
          { status: 400 }
        );
      }
    }

    // Calculate total
    const totalAmount = items.reduce(
      (sum, item) => sum + parseFloat(item.price) * item.quantity,
      0
    );

    // Create order
    const [order] = await db
      .insert(orders)
      .values({
        userId: currentUser.userId,
        totalAmount: totalAmount.toFixed(2),
        shippingAddress: validatedData.shippingAddress,
        status: "pending",
      })
      .returning();

    // Create order items
    await db.insert(orderItems).values(
      items.map((item) => ({
        orderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: item.price,
      }))
    );

    // Update product stock
    for (const item of items) {
      await db
        .update(products)
        .set({
          stockQuantity: item.stockQuantity - item.quantity,
        })
        .where(eq(products.id, item.productId));
    }

    // Clear cart
    await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));

    return NextResponse.json(
      {
        message: "Order created successfully",
        order: {
          id: order.id,
          totalAmount: order.totalAmount,
          status: order.status,
          createdAt: order.createdAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create order error:", error);
    
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

// GET - Get user's orders
export async function GET() {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, currentUser.userId))
      .orderBy(desc(orders.createdAt));

    return NextResponse.json({
      orders: userOrders,
    });
  } catch (error) {
    console.error("Get orders error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
