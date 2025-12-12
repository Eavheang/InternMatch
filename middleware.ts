import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/verify-email",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/payway/return", // PayWay callback doesn't include auth headers
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => {
    return pathname.startsWith(route);
  });

  // Special case: Allow GET requests to browse jobs, companies, and students
  const isBrowsingRoute =
    (pathname === "/api/job" ||
      pathname.startsWith("/api/job?") ||
      pathname === "/api/company" ||
      pathname.startsWith("/api/company?") ||
      pathname === "/api/students" ||
      pathname.startsWith("/api/students?")) &&
    request.method === "GET";

  if (isPublicRoute || isBrowsingRoute) {
    return NextResponse.next();
  }

  // Get token from Authorization header
  const authHeader = request.headers.get("authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return NextResponse.json(
      { error: "Authorization token required" },
      { status: 401 }
    );
  }

  const token = authHeader.substring(7);

  try {
    // Verify token
    const decoded = await verifyToken(token);

    // Add user info to request headers for use in API routes
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set("x-user-id", decoded.userId);
    requestHeaders.set("x-user-role", decoded.role);
    requestHeaders.set("x-user-email", decoded.email);
    requestHeaders.set("x-user-verified", decoded.isVerified.toString());

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    "/api/auth/me",
    "/api/company/:path*",
    "/api/student/:path*",
    "/api/students/:path*",
    "/api/job/:path*",
    "/api/payway/:path*",
    "/api/user/:path*",
    "/api/subscriptions/:path*",
  ],
};
