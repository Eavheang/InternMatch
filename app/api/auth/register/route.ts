import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, students, companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import {
  generateToken,
  generateVerificationCode,
  hashPassword,
  validateEmail,
  validatePassword,
} from "@/lib/auth";
import { sendVerificationEmail } from "@/lib/email";
import { trackEvent } from "@/lib/analytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role, ...additionalData } = body;

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: "Email, password, and role are required" },
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
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      );
    }

    // Validate role
    if (!["student", "company"].includes(role)) {
      return NextResponse.json(
        { error: 'Role must be either "student" or "company"' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Check database connection
    if (!process.env.DATABASE_URL) {
      console.error("DATABASE_URL is not set");
      return NextResponse.json(
        { error: "Database configuration error" },
        { status: 500 }
      );
    }

    // Create user in database
    let newUser;
    try {
      const result = await db
        .insert(users)
        .values({
          email,
          password: hashedPassword,
          role,
          isVerified: false,
          verificationCode,
          verificationExpires,
        })
        .returning();

      if (!result || result.length === 0) {
        throw new Error("Failed to create user - no data returned");
      }

      newUser = result[0];
      console.log("User created successfully:", {
        id: newUser.id,
        email: newUser.email,
      });
    } catch (dbError) {
      console.error("Database insert error (users table):", dbError);
      throw dbError;
    }

    // Create role-specific profile
    try {
      if (role === "student") {
        const { firstName, lastName, ...studentData } = additionalData;

        if (!firstName || !lastName) {
          return NextResponse.json(
            { error: "First name and last name are required for students" },
            { status: 400 }
          );
        }

        await db.insert(students).values({
          userId: newUser.id,
          firstName,
          lastName,
          ...studentData,
        });
        console.log("Student profile created successfully:", {
          userId: newUser.id,
        });
      } else if (role === "company") {
        const { companyName, ...companyData } = additionalData;

        if (!companyName) {
          return NextResponse.json(
            { error: "Company name is required for companies" },
            { status: 400 }
          );
        }

        await db.insert(companies).values({
          userId: newUser.id,
          companyName,
          ...companyData,
        });
        console.log("Company profile created successfully:", {
          userId: newUser.id,
        });
      }
    } catch (profileError) {
      console.error("Database insert error (profile table):", profileError);
      // If profile creation fails, we should rollback the user creation
      // But since we're using serverless, we'll just log and continue
      // The user will exist but without a profile
      throw profileError;
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(
      email,
      verificationCode,
      role
    );

    if (!emailSent) {
      console.error("Failed to send verification email to:", email);
      console.error("Email configuration check:", {
        hasHost: !!process.env.EMAIL_HOST,
        hasPort: !!process.env.EMAIL_PORT,
        hasUser: !!process.env.EMAIL_USER,
        hasPass: !!process.env.EMAIL_PASS,
        hasFrom: !!process.env.EMAIL_FROM,
      });
      return NextResponse.json(
        {
          error:
            "Failed to send verification email. Please check your email configuration or try resending the code.",
        },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = generateToken(
      newUser.id,
      newUser.email,
      newUser.role,
      newUser.isVerified
    );

    // Track registration event
    await trackEvent("user.registered", newUser.id, {
      role: newUser.role,
      registrationSource: "web",
    });

    return NextResponse.json(
      {
        message:
          "Registration successful. Please check your email for verification code.",
        token,
        user: {
          id: newUser.id,
          email: newUser.email,
          role: newUser.role,
          isVerified: newUser.isVerified,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
    });

    // Check if it's a database error
    if (error instanceof Error) {
      // Check for common database errors
      if (
        error.message.includes("duplicate") ||
        error.message.includes("unique")
      ) {
        return NextResponse.json(
          { error: "User with this email already exists" },
          { status: 409 }
        );
      }
      if (
        error.message.includes("connection") ||
        error.message.includes("DATABASE_URL")
      ) {
        return NextResponse.json(
          {
            error:
              "Database connection error. Please check your database configuration.",
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}
