import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { esewaPayment } from "@/lib/payment/esewa";
import { khaltiPayment } from "@/lib/payment/khalti";

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
    if (!["esewa", "khalti"].includes(gateway)) {
      return NextResponse.json(
        { error: "Invalid payment gateway" },
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
    } else if (gateway === "khalti") {
      console.log("Initiating Khalti payment for order:", order.id, "Amount:", amount);
      
      const paymentResult = await khaltiPayment.initiatePayment({
        amount,
        orderId: order.id,
        productName: `Order #${order.id.slice(0, 8)}`,
        customerName: "Customer",
        customerEmail: authResult.user.email || "test@example.com",
        customerPhone: "9800000000",
      });

      console.log("Khalti payment result:", paymentResult);

      if (!paymentResult.success) {
        console.error("Khalti payment failed:", paymentResult.error);
        return NextResponse.json(
          { error: paymentResult.error || "Khalti payment initiation failed" },
          { status: 500 }
        );
      }

      // Update order with payment gateway
      await db
        .update(orders)
        .set({ paymentGateway: "khalti" })
        .where(eq(orders.id, orderId));

      return NextResponse.json({
        success: true,
        gateway: "khalti",
        payment_url: paymentResult.payment_url,
        pidx: paymentResult.pidx,
      });
    }

    return NextResponse.json(
      { error: "Gateway not supported" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Payment initiation error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
