import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products, vendors } from "@/lib/db/schema";
import { eq, and, sql, desc } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { logger } from "@/lib/logger";
import { STATUS_COLORS } from "@/lib/constants";

function getStatusColor(status: string): string {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280';
}

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

    // Get sales data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const salesData = await db
      .select({
        date: sql<string>`DATE(${orders.createdAt})`,
        revenue: sql<number>`SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity})`,
        orders: sql<number>`COUNT(DISTINCT ${orders.id})`,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(
        eq(products.vendorId, vendor.id),
        sql`${orders.createdAt} >= ${thirtyDaysAgo}`,
        eq(orders.paymentStatus, "paid")
      ))
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);

    // Get order status distribution
    const statusData = await db
      .select({
        status: orders.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(eq(products.vendorId, vendor.id))
      .groupBy(orders.status);

    // Get top products
    const topProducts = await db
      .select({
        productId: products.id,
        productName: products.name,
        totalSold: sql<number>`SUM(${orderItems.quantity})`,
        revenue: sql<number>`SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity})`,
      })
      .from(orderItems)
      .innerJoin(products, eq(orderItems.productId, products.id))
      .innerJoin(orders, eq(orderItems.orderId, orders.id))
      .where(and(
        eq(products.vendorId, vendor.id),
        eq(orders.paymentStatus, "paid")
      ))
      .groupBy(products.id, products.name)
      .orderBy(desc(sql`SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity})`))
      .limit(5);

    // Format sales data for charts
    const formattedSalesData = salesData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      revenue: Number(item.revenue),
      orders: item.orders,
    }));

    // Format status data for pie chart
    const formattedStatusData = statusData.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
      color: getStatusColor(item.status),
    }));

    return NextResponse.json({
      salesData: formattedSalesData,
      statusData: formattedStatusData,
      topProducts: topProducts.map(product => ({
        name: product.productName.length > 20
          ? product.productName.substring(0, 20) + '...'
          : product.productName,
        sold: product.totalSold,
        revenue: Number(product.revenue),
      })),
    });

  } catch (error) {
    logger.error("Failed to fetch vendor analytics", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}