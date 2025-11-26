import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users, vendors, products, orders } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";

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

    // Get platform statistics
    const [
      totalUsersResult,
      totalVendorsResult,
      pendingVendorsResult,
      approvedVendorsResult,
      totalProductsResult,
      activeProductsResult,
      totalOrdersResult,
      pendingOrdersResult,
      totalRevenueResult,
    ] = await Promise.all([
      // Total users
      db.select({ count: sql<number>`count(*)::int` }).from(users),
      
      // Total vendors
      db.select({ count: sql<number>`count(*)::int` }).from(vendors),
      
      // Pending vendors
      db.select({ count: sql<number>`count(*)::int` })
        .from(vendors)
        .where(eq(vendors.isApproved, false)),
      
      // Approved vendors
      db.select({ count: sql<number>`count(*)::int` })
        .from(vendors)
        .where(eq(vendors.isApproved, true)),
      
      // Total products
      db.select({ count: sql<number>`count(*)::int` }).from(products),
      
      // Active products
      db.select({ count: sql<number>`count(*)::int` })
        .from(products)
        .where(eq(products.isActive, true)),
      
      // Total orders
      db.select({ count: sql<number>`count(*)::int` }).from(orders),
      
      // Pending orders
      db.select({ count: sql<number>`count(*)::int` })
        .from(orders)
        .where(eq(orders.status, "pending")),
      
      // Total revenue
      db.select({ total: sql<string>`COALESCE(SUM(total_amount), 0)` })
        .from(orders)
        .where(eq(orders.paymentStatus, "paid")),
    ]);

    // Get recent vendors
    const recentVendors = await db
      .select({
        id: vendors.id,
        businessName: vendors.businessName,
        businessEmail: vendors.businessEmail,
        isApproved: vendors.isApproved,
        createdAt: vendors.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(vendors)
      .leftJoin(users, eq(vendors.userId, users.id))
      .orderBy(sql`${vendors.createdAt} DESC`)
      .limit(5);

    // Get recent orders
    const recentOrders = await db
      .select({
        id: orders.id,
        totalAmount: orders.totalAmount,
        status: orders.status,
        paymentStatus: orders.paymentStatus,
        createdAt: orders.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(orders)
      .leftJoin(users, eq(orders.userId, users.id))
      .orderBy(sql`${orders.createdAt} DESC`)
      .limit(5);

    return NextResponse.json({
      stats: {
        totalUsers: totalUsersResult[0]?.count || 0,
        totalVendors: totalVendorsResult[0]?.count || 0,
        pendingVendors: pendingVendorsResult[0]?.count || 0,
        approvedVendors: approvedVendorsResult[0]?.count || 0,
        totalProducts: totalProductsResult[0]?.count || 0,
        activeProducts: activeProductsResult[0]?.count || 0,
        totalOrders: totalOrdersResult[0]?.count || 0,
        pendingOrders: pendingOrdersResult[0]?.count || 0,
        totalRevenue: parseFloat(totalRevenueResult[0]?.total || "0"),
      },
      recentVendors,
      recentOrders,
    });
  } catch (error) {
    console.error("Error fetching admin dashboard:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard data" },
      { status: 500 }
    );
  }
}
