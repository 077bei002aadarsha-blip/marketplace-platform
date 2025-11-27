import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { esewaPayment } from "@/lib/payment/esewa";
import { khaltiPayment } from "@/lib/payment/khalti";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { orderId, gateway, ...paymentData } = body;

    if (!orderId || !gateway) {
      return NextResponse.json(
        { error: "Order ID and gateway are required" },
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

    // Check if already paid
    if (order.paymentStatus === "paid") {
      return NextResponse.json(
        { message: "Order already paid", orderId: order.id },
        { status: 200 }
      );
    }

    const amount = parseFloat(order.totalAmount);
    let verified = false;
    let transactionId = "";

    // Verify payment based on gateway
    if (gateway === "esewa") {
      const { refId } = paymentData;
      
      if (!refId) {
        return NextResponse.json(
          { error: "eSewa reference ID is required" },
          { status: 400 }
        );
      }

      verified = await esewaPayment.verifyPayment({
        orderId: order.id,
        amount,
        refId,
      });

      transactionId = refId;
    } else if (gateway === "khalti") {
      const { pidx } = paymentData;
      
      if (!pidx) {
        return NextResponse.json(
          { error: "Khalti pidx is required" },
          { status: 400 }
        );
      }

      const result = await khaltiPayment.verifyPayment(pidx);
      verified = result.success && result.data?.status === "Completed";
      
      if (result.data?.transaction_id) {
        transactionId = result.data.transaction_id;
      }
    } else {
      return NextResponse.json(
        { error: "Invalid payment gateway" },
        { status: 400 }
      );
    }

    if (!verified) {
      return NextResponse.json(
        { error: "Payment verification failed" },
        { status: 400 }
      );
    }

    // Update order status
    await db
      .update(orders)
      .set({
        paymentStatus: "paid",
        status: "processing",
        transactionId,
        paymentIntentId: transactionId,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, orderId));

    return NextResponse.json({
      success: true,
      message: "Payment verified successfully",
      orderId: order.id,
      transactionId,
    });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 }
    );
  }
}
