import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendors, users } from "@/lib/db/schema";
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

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status"); // "pending" | "approved" | "all"

    // Build query
    let query = db
      .select({
        id: vendors.id,
        userId: vendors.userId,
        businessName: vendors.businessName,
        businessEmail: vendors.businessEmail,
        businessPhone: vendors.businessPhone,
        description: vendors.description,
        logoUrl: vendors.logoUrl,
        isApproved: vendors.isApproved,
        createdAt: vendors.createdAt,
        userName: users.name,
        userEmail: users.email,
        userPhone: users.phone,
      })
      .from(vendors)
      .leftJoin(users, eq(vendors.userId, users.id));

    // Apply filters
    if (status === "pending") {
      query = query.where(eq(vendors.isApproved, false)) as typeof query;
    } else if (status === "approved") {
      query = query.where(eq(vendors.isApproved, true)) as typeof query;
    }

    // Execute query with ordering
    const vendorsList = await query.orderBy(sql`${vendors.createdAt} DESC`);

    return NextResponse.json({
      vendors: vendorsList,
    });
  } catch (error) {
    console.error("Error fetching vendors:", error);
    return NextResponse.json(
      { error: "Failed to fetch vendors" },
      { status: 500 }
    );
  }
}
