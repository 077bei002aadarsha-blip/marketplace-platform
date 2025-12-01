import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, createToken, setAuthCookie } from "@/lib/auth";
import { loginSchema } from "@/lib/validations";
import { logger } from "@/lib/logger";
import { ApiErrors } from "@/lib/api-errors";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input
    const validatedData = loginSchema.parse(body);

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, validatedData.email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(
      validatedData.password,
      user.password
    );

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Create JWT token
    const token = await createToken({
      userId: user.id,
      id: user.id,
      email: user.email,
    });

    // Set cookie
    await setAuthCookie(token);

    return NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        fullName: user.name,
      },
    });
  } catch (error) {
    logger.error("Login failed", error);
    
    if (error instanceof Error && error.name === "ZodError") {
      const validationError = ApiErrors.ValidationError("Invalid email or password format");
      return NextResponse.json(
        { error: validationError.message },
        { status: validationError.statusCode }
      );
    }

    const internalError = ApiErrors.InternalError();
    return NextResponse.json(
      { error: internalError.message },
      { status: internalError.statusCode }
    );
  }
}
