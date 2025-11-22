import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user exists
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    // Always return success to prevent email enumeration attacks
    if (!user) {
      return NextResponse.json({
        success: true,
        message:
          "If an account with that email exists, we've sent a password reset link.",
      });
    }

    // Generate reset code (6-digit number)
    const resetCode = crypto.randomInt(100000, 999999).toString();
    const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Update user with reset code
    await db
      .update(users)
      .set({
        verificationCode: resetCode,
        verificationExpires: resetExpires,
      })
      .where(eq(users.id, user.id));

    // Send password reset email
    const emailResult = await sendPasswordResetEmail(email, resetCode);

    if (!emailResult.success) {
      console.error("Failed to send password reset email:", emailResult.error);
      // Don't fail the request - still return success for security
      // But log the error for debugging
    }

    return NextResponse.json({
      success: true,
      message:
        "If an account with that email exists, we've sent a password reset link.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
