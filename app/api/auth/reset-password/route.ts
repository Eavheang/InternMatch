import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, validateEmail, validatePassword } from "@/lib/auth";

// Remove the POST method - only keep PUT for actual password reset
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, resetCode, newPassword } = body;

    // Validate required fields
    if (!email || !resetCode || !newPassword) {
      return NextResponse.json(
        { error: "Email, reset code, and new password are required" },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate password strength
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Find user with matching email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid reset code" },
        { status: 400 }
      );
    }

    // Check if reset code matches and hasn't expired
    if (!user.verificationCode || user.verificationCode !== resetCode) {
      return NextResponse.json(
        { error: "Invalid reset code" },
        { status: 400 }
      );
    }

    if (user.verificationExpires && new Date() > user.verificationExpires) {
      return NextResponse.json(
        { error: "Reset code has expired" },
        { status: 400 }
      );
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password and clear reset data
    await db
      .update(users)
      .set({
        password: hashedPassword,
        verificationCode: null,
        verificationExpires: null,
      })
      .where(eq(users.id, user.id));

    return NextResponse.json(
      {
        message: "Password reset successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Password reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
