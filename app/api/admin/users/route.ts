import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getClientIp } from "@/lib/auth-helpers";
import { getUserList, trackAdminAction } from "@/lib/analytics";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import type { UserListFilters } from "@/lib/analytics-types";

/**
 * GET /api/admin/users
 * Get paginated list of users with filters
 */
export async function GET(request: NextRequest) {
  try {
    const user = requireAdmin(request);
    const { searchParams } = new URL(request.url);

    const filters: UserListFilters = {
      role: searchParams.get("role") as "student" | "company" | "admin" | undefined,
      isVerified: searchParams.get("isVerified") === "true" ? true : searchParams.get("isVerified") === "false" ? false : undefined,
      search: searchParams.get("search") || undefined,
      page: parseInt(searchParams.get("page") || "1"),
      limit: parseInt(searchParams.get("limit") || "20"),
      sortBy: searchParams.get("sortBy") || "createdAt",
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    const result = await getUserList(filters);

    // Track admin view action
    await trackAdminAction(
      user.userId!,
      "user.view",
      "user_list",
      undefined,
      { filters },
      getClientIp(request) || undefined
    );

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[Admin Users] Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Admin privileges required") || error.message.includes("not authenticated")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch users" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/users
 * Update a user (role, verification status)
 */
export async function PUT(request: NextRequest) {
  try {
    const adminUser = requireAdmin(request);
    const body = await request.json();
    const { userId, role, isVerified } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Prevent admin from modifying their own role
    if (userId === adminUser.userId && role !== undefined) {
      return NextResponse.json(
        { error: "Cannot modify your own role" },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: Partial<{ role: "student" | "company" | "admin"; isVerified: boolean }> = {};
    
    if (role !== undefined) {
      if (!["student", "company", "admin"].includes(role)) {
        return NextResponse.json(
          { error: "Invalid role. Must be student, company, or admin" },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    if (typeof isVerified === "boolean") {
      updateData.isVerified = isVerified;
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Update user
    const [updatedUser] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Track admin action
    await trackAdminAction(
      adminUser.userId!,
      role !== undefined ? "user.role_change" : "user.update",
      "user",
      userId,
      { previousRole: body.previousRole, newRole: role, isVerified },
      getClientIp(request) || undefined
    );

    return NextResponse.json({
      success: true,
      data: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
      },
    });
  } catch (error) {
    console.error("[Admin Users] Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Admin privileges required") || error.message.includes("not authenticated")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
