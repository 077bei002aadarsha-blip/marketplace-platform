import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products, vendors, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { sendOrderStatusEmail } from "@/lib/email";

const validStatuses = ["pending", "processing", "shipped", "delivered", "cancelled"];

export async function PUT(
  request: Request,
  { params }: { params: { orderId: string } }
) {
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
        { error: "Vendor access required" },
        { status: 403 }
      );
    }

    const { status } = await request.json();

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: " + validStatuses.join(", ") },
        { status: 400 }
      );
    }

    const orderId = params.orderId;

    // Verify the order contains products from this vendor
    const orderItemsCheck = await db
      .select({
        orderId: orders.id,
        customerEmail: users.email,
        customerName: users.name,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .innerJoin(users, eq(orders.userId, users.id))
      .where(and(
        eq(orderItems.orderId, orderId),
        eq(products.vendorId, vendor.id)
      ))
      .limit(1);

    if (orderItemsCheck.length === 0) {
      return NextResponse.json(
        { error: "Order not found or doesn't belong to your products" },
        { status: 404 }
      );
    }

    const { customerEmail, customerName } = orderItemsCheck[0];

    // Update order status
    await db
      .update(orders)
      .set({
        status: status,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    // Send email notification to customer
    try {
      await sendOrderStatusEmail({
        to: customerEmail,
        orderId: orderId,
        status: status,
      });
    } catch (emailError) {
      console.error("Failed to send order status email:", emailError);
      // Don't fail the request if email fails
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${status}`,
      orderId: orderId,
    });

  } catch (error) {
    console.error("Update order status error:", error);
    return NextResponse.json(
      { error: "Failed to update order status" },
      { status: 500 }
    );
  }
}