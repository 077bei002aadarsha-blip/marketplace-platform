import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { orders, orderItems, products } from "@/lib/db/schema";
import { and, sql, desc } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";
import { STATUS_COLORS } from "@/lib/constants";

function getStatusColor(status: string): string {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || '#6b7280';
}

function getCategoryColor(category: string): string {
  const colors: Record<string, string> = {
    jewelry: '#f59e0b',
    clothing: '#8b5cf6',
    accessories: '#10b981',
    electronics: '#3b82f6',
    home: '#ef4444',
    beauty: '#ec4899',
  };
  return colors[category.toLowerCase()] || '#6b7280';
}

export async function GET(request: Request) {
  try {
    // Verify admin authentication
    const authResult = await verifyAuth(request);
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (authResult.user.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }

    // Get revenue data for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const revenueData = await db
      .select({
        date: sql<string>`DATE(${orders.createdAt})`,
        revenue: sql<number>`SUM(${orders.totalAmount})`,
        orders: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .where(and(
        sql`${orders.createdAt} >= ${thirtyDaysAgo}`,
        sql`${orders.paymentStatus} = 'paid'`
      ))
      .groupBy(sql`DATE(${orders.createdAt})`)
      .orderBy(sql`DATE(${orders.createdAt})`);

    // Get top products across all vendors
    const topProducts = await db
      .select({
        productId: products.id,
        productName: products.name,
        totalSold: sql<number>`SUM(${orderItems.quantity})`,
        revenue: sql<number>`SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity})`,
      })
      .from(orderItems)
      .innerJoin(products, sql`${orderItems.productId} = ${products.id}`)
      .innerJoin(orders, sql`${orderItems.orderId} = ${orders.id}`)
      .where(sql`${orders.paymentStatus} = 'paid'`)
      .groupBy(products.id, products.name)
      .orderBy(desc(sql`SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity})`))
      .limit(10);

    // Get sales by category
    const categoryData = await db
      .select({
        category: products.category,
        totalSold: sql<number>`SUM(${orderItems.quantity})`,
        revenue: sql<number>`SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity})`,
      })
      .from(orderItems)
      .innerJoin(products, sql`${orderItems.productId} = ${products.id}`)
      .innerJoin(orders, sql`${orderItems.orderId} = ${orders.id}`)
      .where(sql`${orders.paymentStatus} = 'paid'`)
      .groupBy(products.category)
      .orderBy(desc(sql`SUM(${orderItems.priceAtPurchase} * ${orderItems.quantity})`));

    // Get order status distribution
    const statusData = await db
      .select({
        status: orders.status,
        count: sql<number>`COUNT(*)`,
      })
      .from(orders)
      .groupBy(orders.status);

    // Format revenue data for line chart
    const formattedRevenueData = revenueData.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      }),
      revenue: Number(item.revenue),
      orders: item.orders,
    }));

    // Format category data for pie chart
    const formattedCategoryData = categoryData.map(item => ({
      name: item.category.charAt(0).toUpperCase() + item.category.slice(1),
      value: Number(item.revenue),
      units: item.totalSold,
      color: getCategoryColor(item.category),
    }));

    // Format status data
    const formattedStatusData = statusData.map(item => ({
      name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
      value: item.count,
      color: getStatusColor(item.status),
    }));

    return NextResponse.json({
      revenueData: formattedRevenueData,
      topProducts: topProducts.map(product => ({
        name: product.productName.length > 25
          ? product.productName.substring(0, 25) + '...'
          : product.productName,
        sold: product.totalSold,
        revenue: Number(product.revenue),
      })),
      categoryData: formattedCategoryData,
      statusData: formattedStatusData,
    });

  } catch (error) {
    console.error("Error fetching admin analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
