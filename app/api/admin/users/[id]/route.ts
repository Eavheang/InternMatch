import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getClientIp } from "@/lib/auth-helpers";
import { getUserDetails, trackAdminAction } from "@/lib/analytics";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/admin/users/[id]
 * Get detailed user information
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const adminUser = requireAdmin(request);
    const { id } = await params;

    const userDetails = await getUserDetails(id);

    if (!userDetails) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Track admin view action
    await trackAdminAction(
      adminUser.userId!,
      "user.view",
      "user",
      id,
      undefined,
      getClientIp(request) || undefined
    );

    return NextResponse.json({ success: true, data: userDetails });
  } catch (error) {
    console.error("[Admin User Detail] Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Admin privileges required") || error.message.includes("not authenticated")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch user details" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users/[id]
 * Deactivate a user (soft delete by setting a flag or changing role)
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const adminUser = requireAdmin(request);
    const { id } = await params;

    // Prevent admin from deleting themselves
    if (id === adminUser.userId) {
      return NextResponse.json(
        { error: "Cannot deactivate your own account" },
        { status: 400 }
      );
    }

    // Check if user exists
    const [targetUser] = await db
      .select()
      .from(users)
      .where(eq(users.id, id));

    if (!targetUser) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Prevent deactivating other admins (optional security measure)
    if (targetUser.role === "admin") {
      return NextResponse.json(
        { error: "Cannot deactivate admin accounts" },
        { status: 400 }
      );
    }

    // Soft delete by setting isVerified to false
    // In a production system, you might want a separate "isActive" field
    await db
      .update(users)
      .set({ isVerified: false })
      .where(eq(users.id, id));

    // Track admin action
    await trackAdminAction(
      adminUser.userId!,
      "user.deactivate",
      "user",
      id,
      { email: targetUser.email, role: targetUser.role },
      getClientIp(request) || undefined
    );

    return NextResponse.json({
      success: true,
      message: "User deactivated successfully",
    });
  } catch (error) {
    console.error("[Admin User Delete] Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Admin privileges required") || error.message.includes("not authenticated")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to deactivate user" },
      { status: 500 }
    );
  }
}
