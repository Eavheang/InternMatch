import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { generateResetToken, validateEmail } from '@/lib/auth';
import { sendPasswordResetEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
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

    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate reset token
      const resetToken = generateResetToken();
      const resetExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

      // Update user with reset token
      await db
        .update(users)
        .set({
          verificationCode: resetToken, // Store token instead of code
          verificationExpires: resetExpires,
        })
        .where(eq(users.id, user.id));

      // Send reset email with link
      const emailSent = await sendPasswordResetEmail(email, resetToken);
      
      if (!emailSent) {
        return NextResponse.json(
          { error: 'Failed to send password reset email' },
          { status: 500 }
        );
      }
    }

    // Always return success message (security best practice)
    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    }, { status: 200 });

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}