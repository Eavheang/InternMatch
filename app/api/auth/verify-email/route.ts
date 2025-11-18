import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies, students, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  generateToken,
  generateVerificationCode,
  validateEmail,
} from "@/lib/auth";
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, verificationCode } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // If no verification code provided, resend verification code
    if (!verificationCode) {
      // Find user by email
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email))
        .limit(1);

      if (!user) {
        // Return success to prevent email enumeration
        return NextResponse.json(
          {
            message:
              "If an account with that email exists, a verification code has been sent.",
          },
          { status: 200 }
        );
      }

      // Check if user is already verified
      if (user.isVerified) {
        return NextResponse.json(
          { error: "Email is already verified" },
          { status: 400 }
        );
      }

      // Generate new verification code
      const newVerificationCode = generateVerificationCode();
      const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Update user with new verification code
      await db
        .update(users)
        .set({
          verificationCode: newVerificationCode,
          verificationExpires,
        })
        .where(eq(users.id, user.id));

      // Send verification email
      const emailSent = await sendVerificationEmail(
        email,
        newVerificationCode,
        user.role
      );

      if (!emailSent) {
        console.error("Failed to send verification email to:", email);
        return NextResponse.json(
          {
            error:
              "Failed to send verification email. Please check your email configuration.",
          },
          { status: 500 }
        );
      }

      // Always return success message (security best practice)
      return NextResponse.json(
        {
          message:
            "If an account with that email exists, a verification code has been sent.",
        },
        { status: 200 }
      );
    }

    // Verify email with verification code
    // Normalize verification code to uppercase for case-insensitive comparison
    const normalizedCode = verificationCode.toUpperCase();

    // Find user with matching email and verification code
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(eq(users.email, email), eq(users.verificationCode, normalizedCode))
      )
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if verification code has expired
    if (user.verificationExpires && new Date() > user.verificationExpires) {
      return NextResponse.json(
        { error: "Verification code has expired" },
        { status: 400 }
      );
    }

    // Update user as verified and clear verification data
    await db
      .update(users)
      .set({
        isVerified: true,
        verificationCode: null,
        verificationExpires: null,
      })
      .where(eq(users.id, user.id));

    // Generate new JWT token with verified status
    const token = generateToken(user.id, user.email, user.role, true);

    // Send welcome email (optional)
    try {
      if (user.role === "student") {
        // Get student name for welcome email
        const [student] = await db
          .select()
          .from(students)
          .where(eq(students.userId, user.id))
          .limit(1);

        if (student) {
          await sendWelcomeEmail(email, student.firstName, user.role);
        }
      } else {
        // Get company name for welcome email
        const [company] = await db
          .select()
          .from(companies)
          .where(eq(companies.userId, user.id))
          .limit(1);

        if (company) {
          await sendWelcomeEmail(email, company.companyName, user.role);
        }
      }
    } catch (emailError) {
      // Don't fail verification if welcome email fails
      console.error("Welcome email failed:", emailError);
    }

    return NextResponse.json({
      message: "Email verified successfully",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
    });
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
