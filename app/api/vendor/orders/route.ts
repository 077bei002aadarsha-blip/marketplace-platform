import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendors, products, orders, orderItems } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
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

    // Get all order items for vendor's products
    const vendorOrderItems = await db
      .select({
        orderItemId: orderItems.id,
        orderItemQuantity: orderItems.quantity,
        orderItemPrice: orderItems.priceAtPurchase,
        orderId: orders.id,
        orderTotal: orders.totalAmount,
        orderStatus: orders.status,
        orderCreatedAt: orders.createdAt,
        orderShippingAddress: orders.shippingAddress,
        productName: products.name,
        productId: products.id,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(products.vendorId, vendor.id))
      .orderBy(orders.createdAt);

    // Group by order ID
    interface OrderGroup {
      id: string;
      total: string;
      status: string;
      createdAt: Date;
      shippingAddress: string;
      items: Array<{
        id: string;
        quantity: number;
        price: string;
        productName: string;
      }>;
    }
    
    const ordersMap = new Map<string, OrderGroup>();
    
    vendorOrderItems.forEach((item) => {
      if (!ordersMap.has(item.orderId)) {
        ordersMap.set(item.orderId, {
          id: item.orderId,
          total: item.orderTotal,
          status: item.orderStatus,
          createdAt: item.orderCreatedAt,
          shippingAddress: item.orderShippingAddress,
          items: [],
        });
      }
      
      const order = ordersMap.get(item.orderId);
      if (order) {
        order.items.push({
          id: item.orderItemId,
          quantity: item.orderItemQuantity,
          price: item.orderItemPrice,
          productName: item.productName,
        });
      }
    });

    const ordersArray = Array.from(ordersMap.values()).reverse();

    return NextResponse.json({ orders: ordersArray });
  } catch (error) {
    console.error("Get vendor orders error:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders" },
      { status: 500 }
    );
  }
}
