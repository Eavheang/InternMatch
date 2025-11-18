import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { jwtVerify } from 'jose';

// JWT Token Management
export function generateToken(userId: string, email: string, role: string, isVerified: boolean): string {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  
  const payload = { 
    userId, 
    email, 
    role, 
    isVerified 
  };
  
  const options: jwt.SignOptions = { 
    expiresIn: '7d' 
  };
  return jwt.sign(payload, secret, options);
}

export function verifyToken(token: string): any {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  
  try {
    return jwt.verify(token, secret);
  } catch (error) {
    console.error('JWT verification failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20)
    });
    throw error;
  }
}

// Edge Runtime compatible JWT verification (for middleware)
export async function verifyTokenEdge(token: string): Promise<any> {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    console.error('JWT_SECRET is not defined in environment variables');
    throw new Error('JWT_SECRET environment variable is not defined');
  }
  
  try {
    const secretKey = new TextEncoder().encode(secret);
    const { payload } = await jwtVerify(token, secretKey);
    return payload;
  } catch (error) {
    console.error('Edge JWT verification failed:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      tokenLength: token.length,
      tokenPrefix: token.substring(0, 20)
    });
    throw error;
  }
}

// Password Management
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

// Code Generation
export function generateVerificationCode(): string {
  // Generate a code with 6 characters: at least one letter and at least one number
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '23456789';
  const characters = letters + numbers;
  let result = '';

  // Ensure at least one letter
  result += letters.charAt(Math.floor(Math.random() * letters.length));
  // Ensure at least one number
  result += numbers.charAt(Math.floor(Math.random() * numbers.length));

  // Fill remaining with random letters or numbers
  for (let i = 2; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Shuffle to avoid predictable positions
  return result.split('').sort(() => 0.5 - Math.random()).join('');
}

export function generateResetToken(): string {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const numbers = '123456789';
  const characters = letters + numbers;
  let result = '';

  // Ensure at least one letter
  result += letters.charAt(Math.floor(Math.random() * letters.length));
  // Ensure at least one number
  result += numbers.charAt(Math.floor(Math.random() * numbers.length));

  // Fill the rest with random letters or numbers
  for (let i = 2; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  // Shuffle the result to avoid letter/number in a predictable position
  return result.split('').sort(() => 0.5 - Math.random()).join('');
}

// Validation
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' };
  }
  
  if (!/(?=.*[a-z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' };
  }
  
  if (!/(?=.*[A-Z])/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' };
  }
  
  if (!/(?=.*\d)/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}