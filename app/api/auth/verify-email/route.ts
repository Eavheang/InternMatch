import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { companies, students, users } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { generateToken, validateEmail } from '@/lib/auth';
import { sendWelcomeEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, verificationCode } = body;

    if (!email || !verificationCode) {
      return NextResponse.json(
        { error: 'Email and verification code are required' },
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

    // Find user with matching email and verification code
    const [user] = await db
      .select()
      .from(users)
      .where(
        and(
          eq(users.email, email),
          eq(users.verificationCode, verificationCode)
        )
      )
      .limit(1);

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      );
    }

    // Check if verification code has expired
    if (user.verificationExpires && new Date() > user.verificationExpires) {
      return NextResponse.json(
        { error: 'Verification code has expired' },
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
      if (user.role === 'student') {
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
      console.error('Welcome email failed:', emailError);
    }

    return NextResponse.json({
      message: 'Email verified successfully',
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: true,
      },
    });

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}