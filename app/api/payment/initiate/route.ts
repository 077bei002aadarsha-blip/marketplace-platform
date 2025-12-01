import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { EsewaPayment } from "@/lib/payment/esewa";
import { logger } from "@/lib/logger";

const esewaPayment = new EsewaPayment();

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { orderId, gateway } = await request.json();

    if (!orderId || !gateway) {
      return NextResponse.json(
        { error: "Order ID and gateway are required" },
        { status: 400 }
      );
    }

    // Validate gateway
    if (gateway !== "esewa") {
      return NextResponse.json(
        { error: "Only eSewa payment gateway is supported" },
        { status: 400 }
      );
    }

    // Get order details
    const [order] = await db
      .select()
      .from(orders)
      .where(eq(orders.id, orderId))
      .limit(1);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order belongs to user
    if (order.userId !== authResult.user.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Check if already paid
    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { error: "Order already paid" },
        { status: 400 }
      );
    }

    const amount = parseFloat(order.totalAmount);

    // Initialize payment based on gateway
    if (gateway === "esewa") {
      const paymentData = esewaPayment.initiatePayment({
        amount,
        orderId: order.id,
        productName: `Order #${order.id.slice(0, 8)}`,
      });

      // Update order with payment gateway
      await db
        .update(orders)
        .set({ paymentGateway: "esewa" })
        .where(eq(orders.id, orderId));

      return NextResponse.json({
        success: true,
        gateway: "esewa",
        data: paymentData,
      });
    }

    return NextResponse.json(
      { error: "Payment gateway not supported" },
      { status: 400 }
    );
  } catch (error) {
    logger.error("Payment initiation failed", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
