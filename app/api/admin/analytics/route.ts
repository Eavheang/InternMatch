import { NextRequest, NextResponse } from "next/server";
import { requireAdmin, getClientIp } from "@/lib/auth-helpers";
import {
  getOverviewStats,
  getFeatureUsageStats,
  getUserGrowthStats,
  getRevenueStats,
  getPlatformActivityStats,
  getPlanDistribution,
  trackAdminAction,
} from "@/lib/analytics";

/**
 * GET /api/admin/analytics
 * Get analytics data for admin dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const user = requireAdmin(request);
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "overview";

    // Track admin view action
    await trackAdminAction(
      user.userId!,
      "user.view",
      "analytics",
      undefined,
      { type },
      getClientIp(request) || undefined
    );

    switch (type) {
      case "overview": {
        const stats = await getOverviewStats();
        return NextResponse.json({ success: true, data: stats });
      }

      case "feature-usage": {
        const period = (searchParams.get("period") as "day" | "week" | "month") || "month";
        const stats = await getFeatureUsageStats(period);
        return NextResponse.json({ success: true, data: stats });
      }

      case "user-growth": {
        const days = parseInt(searchParams.get("days") || "30");
        const stats = await getUserGrowthStats(days);
        return NextResponse.json({ success: true, data: stats });
      }

      case "revenue": {
        const months = parseInt(searchParams.get("months") || "6");
        const stats = await getRevenueStats(months);
        return NextResponse.json({ success: true, data: stats });
      }

      case "platform-activity": {
        const days = parseInt(searchParams.get("days") || "30");
        const stats = await getPlatformActivityStats(days);
        return NextResponse.json({ success: true, data: stats });
      }

      case "plan-distribution": {
        const distribution = await getPlanDistribution();
        return NextResponse.json({ success: true, data: distribution });
      }

      case "all": {
        // Return all analytics data for dashboard
        const [overview, featureUsage, userGrowth, revenue, platformActivity, planDistribution] =
          await Promise.all([
            getOverviewStats(),
            getFeatureUsageStats("month"),
            getUserGrowthStats(30),
            getRevenueStats(6),
            getPlatformActivityStats(30),
            getPlanDistribution(),
          ]);

        return NextResponse.json({
          success: true,
          data: {
            overview,
            featureUsage,
            userGrowth,
            revenue,
            platformActivity,
            planDistribution,
          },
        });
      }

      default:
        return NextResponse.json(
          { error: "Invalid analytics type" },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Admin Analytics] Error:", error);

    if (error instanceof Error) {
      if (error.message.includes("Admin privileges required") || error.message.includes("not authenticated")) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch analytics data" },
      { status: 500 }
    );
  }
}
