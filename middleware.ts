import { NextRequest, NextResponse } from "next/server";
import { verifyTokenEdge } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = [
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/verify-email",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/job", // GET only
    "/api/company", // GET only
    "/api/students", // GET only
  ];

  // Check if route is public
  const isPublicRoute = publicRoutes.some((route) => {
    if (
      route.endsWith("/job") ||
      route.endsWith("/company") ||
      route.endsWith("/students")
    ) {
      return pathname.startsWith(route) && request.method === "GET";
    }
    return pathname.startsWith(route);
  });

  if (isPublicRoute) {
    return NextResponse.next();
  }

  // For /api/auth/me PUT requests, let the API route handle authentication
  // (Middleware might have issues with Edge Runtime and jwt library)
  if (pathname === "/api/auth/me" && request.method === "PUT") {
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
    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return NextResponse.json(
        {
          error: "Server configuration error",
          details: "JWT_SECRET not configured",
        },
        { status: 500 }
      );
    }

    // Verify token (using Edge-compatible function)
    const decoded = await verifyTokenEdge(token);

    console.log("Token verified successfully:", {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      isVerified: decoded.isVerified,
    });

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
  } catch (error) {
    console.error("Middleware token verification error:", error);
    console.error(
      "Token being verified:",
      token ? `${token.substring(0, 20)}...` : "No token"
    );

    const errorMessage =
      error instanceof Error ? error.message : "Invalid or expired token";
    const errorName = error instanceof Error ? error.name : "Unknown";
    const errorCode = (error as any)?.code || "";

    // Check for specific JWT errors (jose uses different error codes)
    if (
      errorName === "TokenExpiredError" ||
      errorCode === "ERR_JWT_EXPIRED" ||
      errorMessage.includes("expired")
    ) {
      return NextResponse.json(
        {
          error: "Token has expired",
          details:
            process.env.NODE_ENV === "development" ? errorMessage : undefined,
        },
        { status: 401 }
      );
    }

    if (
      errorName === "JsonWebTokenError" ||
      errorCode === "ERR_JWT_INVALID" ||
      errorMessage.includes("invalid")
    ) {
      return NextResponse.json(
        {
          error: "Invalid token format",
          details:
            process.env.NODE_ENV === "development" ? errorMessage : undefined,
        },
        { status: 401 }
      );
    }

    return NextResponse.json(
      {
        error: "Invalid or expired token",
        details:
          process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 401 }
    );
  }
}

export const config = {
  matcher: [
    "/api/auth/me",
    "/api/company/:path*",
    "/api/students/:path*",
    "/api/job/:path*",
  ],
};
