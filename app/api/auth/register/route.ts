import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, students, companies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateToken, generateVerificationCode, hashPassword, validateEmail, validatePassword } from '@/lib/auth';
import { sendVerificationEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, role, ...additionalData } = body;

    // Validate required fields
    if (!email || !password || !role) {
      return NextResponse.json(
        { error: 'Email, password, and role are required' },
        { status: 400 }
      );
    }

    // Validate email format
    if (!validateEmail(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
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
    if (!['student', 'company'].includes(role)) {
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
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Create user in database
    const [newUser] = await db
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

    // Create role-specific profile
    if (role === 'student') {
      const { firstName, lastName, ...studentData } = additionalData;
      
      if (!firstName || !lastName) {
        return NextResponse.json(
          { error: 'First name and last name are required for students' },
          { status: 400 }
        );
      }

      await db.insert(students).values({
        userId: newUser.id,
        firstName,
        lastName,
        ...studentData,
      });
    } else if (role === 'company') {
      const { companyName, ...companyData } = additionalData;
      
      if (!companyName) {
        return NextResponse.json(
          { error: 'Company name is required for companies' },
          { status: 400 }
        );
      }

      await db.insert(companies).values({
        userId: newUser.id,
        companyName,
        ...companyData,
      });
    }

    // Send verification email
    const emailSent = await sendVerificationEmail(email, verificationCode, role);
    
    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send verification email' },
        { status: 500 }
      );
    }

    // Generate JWT token
    const token = generateToken(newUser.id, newUser.email, newUser.role, newUser.isVerified);

    return NextResponse.json({
      message: 'Registration successful. Please check your email for verification code.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        isVerified: newUser.isVerified,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}