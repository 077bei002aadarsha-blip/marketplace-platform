import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { vendors, users } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

const vendorRegisterSchema = z.object({
  businessName: z.string().min(2, "Business name must be at least 2 characters"),
  businessEmail: z.string().email("Invalid email address"),
  businessPhone: z.string().optional(),
  description: z.string().min(10, "Description must be at least 10 characters"),
});

export async function POST(request: NextRequest) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    // Get the user ID (handle both userId and id for backward compatibility)
    const userId = currentUser.userId || currentUser.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Invalid user session. Please log in again." },
        { status: 401 }
      );
    }

    // Check if user is already a vendor
    const [existingVendor] = await db
      .select()
      .from(vendors)
      .where(eq(vendors.userId, userId))
      .limit(1);

    if (existingVendor) {
      return NextResponse.json(
        { error: "You are already registered as a vendor" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = vendorRegisterSchema.parse(body);

    // Create vendor profile
    const [vendor] = await db
      .insert(vendors)
      .values({
        userId: userId,
        businessName: validatedData.businessName,
        businessEmail: validatedData.businessEmail,
        businessPhone: validatedData.businessPhone || null,
        description: validatedData.description,
        isApproved: false, // Requires admin approval
      })
      .returning();

    // Update user role to vendor
    await db
      .update(users)
      .set({ role: "vendor" })
      .where(eq(users.id, userId));

    return NextResponse.json(
      {
        message: "Vendor application submitted successfully. Pending approval.",
        vendor: {
          id: vendor.id,
          businessName: vendor.businessName,
          isApproved: vendor.isApproved,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Vendor registration error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.issues[0].message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
