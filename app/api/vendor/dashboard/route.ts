import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendors, products, orders, orderItems } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
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

    // Get total products count
    const [productsCount] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(products)
      .where(eq(products.vendorId, vendor.id));

    // Get orders for vendor's products
    const vendorOrders = await db
      .select({
        orderId: orders.id,
        orderTotal: orders.totalAmount,
        orderStatus: orders.status,
        orderDate: orders.createdAt,
        itemQuantity: orderItems.quantity,
        itemPrice: orderItems.priceAtPurchase,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(products.vendorId, vendor.id));

    // Calculate stats
    const totalRevenue = vendorOrders.reduce((sum, order) => {
      return sum + (parseFloat(order.itemPrice) * order.itemQuantity);
    }, 0);

    const uniqueOrders = new Set(vendorOrders.map(o => o.orderId));
    const totalOrders = uniqueOrders.size;

    const pendingOrders = vendorOrders.filter(
      order => order.orderStatus === "pending"
    );
    const uniquePendingOrders = new Set(pendingOrders.map(o => o.orderId));

    const stats = {
      totalRevenue: Math.round(totalRevenue),
      totalOrders,
      totalProducts: productsCount.count,
      pendingOrders: uniquePendingOrders.size,
      isApproved: vendor.isApproved,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Vendor dashboard error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
