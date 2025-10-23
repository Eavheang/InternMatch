import { NextRequest } from 'next/server';

export function getAuthenticatedUser(request: NextRequest) {
  return {
    userId: request.headers.get('x-user-id'),
    role: request.headers.get('x-user-role'),
    email: request.headers.get('x-user-email'),
    isVerified: request.headers.get('x-user-verified') === 'true',
  };
}

export function requireRole(request: NextRequest, allowedRoles: string[]) {
  const user = getAuthenticatedUser(request);
  
  if (!user.userId) {
    throw new Error('User not authenticated');
  }

  if (!user.role || !allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions');
  }

  return user;
}

export function requireOwnership(request: NextRequest, resourceUserId: string) {
  const user = getAuthenticatedUser(request);
  
  if (!user.userId) {
    throw new Error('User not authenticated');
  }
  
  if (user.userId !== resourceUserId) {
    throw new Error('Access denied: You can only access your own resources');
  }
  
  return user;
}