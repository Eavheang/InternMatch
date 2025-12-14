import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth-helpers";
import { getAdminAuditLog } from "@/lib/analytics";

/**
 * GET /api/admin/audit
 * Get admin action audit log
 */
export async function GET(request: NextRequest) {
  try {
    requireAdmin(request);
    const { searchParams } = new URL(request.url);

    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const adminId = searchParams.get("adminId") || undefined;

    const result = await getAdminAuditLog(page, limit, adminId);

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[Admin Audit] Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Admin privileges required") || error.message.includes("not authenticated")) {
        return NextResponse.json({ error: error.message }, { status: 403 });
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch audit log" },
      { status: 500 }
    );
  }
}
