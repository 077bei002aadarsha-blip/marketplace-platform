import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendors, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyAuth } from "@/lib/auth";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const vendorId = id;

    // Check if vendor exists
    const vendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);

    if (!vendor || vendor.length === 0) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Update vendor approval status
    const [updatedVendor] = await db
      .update(vendors)
      .set({
        isApproved: true,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendorId))
      .returning();

    // Update user role to vendor
    await db
      .update(users)
      .set({
        role: "vendor",
        updatedAt: new Date(),
      })
      .where(eq(users.id, vendor[0].userId));

    return NextResponse.json({
      message: "Vendor approved successfully",
      vendor: updatedVendor,
    });
  } catch (error) {
    console.error("Error approving vendor:", error);
    return NextResponse.json(
      { error: "Failed to approve vendor" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
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

    const vendorId = id;

    // Check if vendor exists
    const vendor = await db
      .select()
      .from(vendors)
      .where(eq(vendors.id, vendorId))
      .limit(1);

    if (!vendor || vendor.length === 0) {
      return NextResponse.json(
        { error: "Vendor not found" },
        { status: 404 }
      );
    }

    // Reject/Delete vendor application
    await db
      .update(vendors)
      .set({
        isApproved: false,
        updatedAt: new Date(),
      })
      .where(eq(vendors.id, vendorId));

    // Reset user role to customer
    await db
      .update(users)
      .set({
        role: "customer",
        updatedAt: new Date(),
      })
      .where(eq(users.id, vendor[0].userId));

    return NextResponse.json({
      message: "Vendor application rejected",
    });
  } catch (error) {
    console.error("Error rejecting vendor:", error);
    return NextResponse.json(
      { error: "Failed to reject vendor" },
      { status: 500 }
    );
  }
}
