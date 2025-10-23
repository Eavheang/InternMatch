import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users, students, companies } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateToken, comparePassword, validateEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
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

    // Find user by email
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { 
          error: 'Please verify your email before logging in',
          requiresVerification: true,
          email: user.email
        },
        { status: 403 }
      );
    }

    // Get user profile based on role
    let userProfile = null;
    
    if (user.role === 'student') {
      const [studentProfile] = await db
        .select()
        .from(students)
        .where(eq(students.userId, user.id))
        .limit(1);
      userProfile = studentProfile;
    } else if (user.role === 'company') {
      const [companyProfile] = await db
        .select()
        .from(companies)
        .where(eq(companies.userId, user.id))
        .limit(1);
      userProfile = companyProfile;
    }

    // Generate JWT token
    const token = await generateToken(user.id, user.email, user.role, user.isVerified);

    return NextResponse.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        profile: userProfile
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}