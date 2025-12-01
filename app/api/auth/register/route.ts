import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, createToken, setAuthCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { ApiErrors } from "@/lib/api-errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const passwordHash = await hashPassword(validatedData.password);

    // Create user
    const [newUser] = await db
      .insert(users)
      .values({
        email: validatedData.email,
        password: passwordHash,
        name: validatedData.fullName,
      })
      .returning();

    // Create cart for user
    await db.insert(carts).values({
      userId: newUser.id,
    });

    // Create JWT token
    const token = await createToken({
      userId: newUser.id,
      id: newUser.id,
      email: newUser.email,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json(
      {
        message: "User registered successfully",
        user: {
          id: newUser.id,
          email: newUser.email,
          fullName: newUser.name,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error("Registration failed", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Invalid input" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
