import { NextRequest } from "next/server";

export function getAuthenticatedUser(request: NextRequest) {
  return {
    userId: request.headers.get("x-user-id"),
    role: request.headers.get("x-user-role"),
    email: request.headers.get("x-user-email"),
    isVerified: request.headers.get("x-user-verified") === "true",
  };
}

export function requireRole(request: NextRequest, allowedRoles: string[]) {
  const user = getAuthenticatedUser(request);

  if (!user.userId) {
    throw new Error("User not authenticated");
  }

  if (!user.role || !allowedRoles.includes(user.role)) {
    throw new Error("Insufficient permissions");
  }

  return user;
}

export function requireOwnership(request: NextRequest, resourceUserId: string) {
  const user = getAuthenticatedUser(request);

  if (!user.userId) {
    throw new Error("User not authenticated");
  }

  if (user.userId !== resourceUserId) {
    throw new Error("Access denied: You can only access your own resources");
  }

  return user;
}

/**
 * Require admin role for accessing admin-only routes
 */
export function requireAdmin(request: NextRequest) {
  const user = getAuthenticatedUser(request);

  if (!user.userId) {
    throw new Error("User not authenticated");
  }

  if (user.role !== "admin") {
    throw new Error("Access denied: Admin privileges required");
  }

  return user;
}

/**
 * Check if the authenticated user is an admin
 */
export function isAdmin(request: NextRequest): boolean {
  const user = getAuthenticatedUser(request);
  return user.role === "admin";
}

/**
 * Get client IP address from request headers
 */
export function getClientIp(request: NextRequest): string | null {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    request.headers.get("x-real-ip") ||
    null
  );
}
