import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { getAllUsage } from "@/lib/usage-tracking";

export async function GET(req: NextRequest) {
  try {
    const user = getAuthenticatedUser(req);

    if (!user.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const role = user.role as "student" | "company";
    const usageData = await getAllUsage(user.userId, role);

    return NextResponse.json(usageData);
  } catch (error: unknown) {
    console.error("Error fetching usage:", error);
    return NextResponse.json(
      { error: "Failed to fetch usage data" },
      { status: 500 }
    );
  }
}

