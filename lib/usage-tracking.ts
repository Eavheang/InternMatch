import { db } from "@/db";
import { usageTracking, transactions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getUsageLimit, getCurrentMonth, FeatureType, PlanType } from "./usage-limits";
import { getAuthenticatedUser } from "./auth-helpers";
import { NextRequest } from "next/server";

/**
 * Get user's current plan from their most recent completed transaction
 */
export async function getUserPlan(userId: string): Promise<PlanType> {
  const [latestTransaction] = await db
    .select()
    .from(transactions)
    .where(
      and(
        eq(transactions.userId, userId),
        eq(transactions.status, "completed")
      )
    )
    .orderBy(desc(transactions.createdAt))
    .limit(1);

  // Check if subscription has expired
  if (latestTransaction?.expiresAt) {
    const now = new Date();
    const expirationDate = new Date(latestTransaction.expiresAt);
    if (now > expirationDate && !latestTransaction.autoRenew) {
      return "free";
    }
  }

  if (
    latestTransaction?.plan &&
    latestTransaction.plan.trim() !== "" &&
    latestTransaction.plan !== "free"
  ) {
    return latestTransaction.plan as PlanType;
  }

  return "free";
}

/**
 * Check if user can use a feature (hasn't exceeded limit)
 */
export async function checkUsageLimit(
  userId: string,
  feature: FeatureType,
  role: "student" | "company"
): Promise<{ allowed: boolean; current: number; limit: number; message?: string }> {
  const plan = await getUserPlan(userId);
  const limit = getUsageLimit(plan, feature, role);

  // If limit is 0, feature is not available for this plan
  if (limit === 0) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      message: `This feature is not available for your current plan (${plan}). Please upgrade to access this feature.`,
    };
  }

  // For duration-based features (role_suggestion, ats_analyze), check subscription expiration
  if (feature === "role_suggestion" || feature === "ats_analyze") {
    const [latestTransaction] = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.userId, userId),
          eq(transactions.status, "completed")
        )
      )
      .orderBy(desc(transactions.createdAt))
      .limit(1);

    if (latestTransaction?.expiresAt) {
      const now = new Date();
      const expirationDate = new Date(latestTransaction.expiresAt);
      if (now > expirationDate && !latestTransaction.autoRenew) {
        return {
          allowed: false,
          current: 0,
          limit: 0,
          message: `Your subscription has expired. Please renew to continue using this feature.`,
        };
      }
    }

    // For duration-based features, we check if subscription is still active
    // The limit represents months of access, not monthly count
    return {
      allowed: true,
      current: 0,
      limit: limit,
    };
  }

  // For count-based features, check monthly usage
  const currentMonth = getCurrentMonth();
  const [usage] = await db
    .select()
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.feature, feature),
        eq(usageTracking.month, currentMonth)
      )
    )
    .limit(1);

  const currentCount = usage?.count || 0;
  const allowed = currentCount < limit;

  return {
    allowed,
    current: currentCount,
    limit,
    message: allowed
      ? undefined
      : `You have reached your monthly limit of ${limit} for this feature. Your limit will reset next month, or upgrade your plan for higher limits.`,
  };
}

/**
 * Increment usage count for a feature
 */
export async function incrementUsage(
  userId: string,
  feature: FeatureType,
  role: "student" | "company"
): Promise<void> {
  const plan = await getUserPlan(userId);
  const limit = getUsageLimit(plan, feature, role);

  // Don't track usage for duration-based features or if limit is 0
  if (feature === "role_suggestion" || feature === "ats_analyze" || limit === 0) {
    return;
  }

  const currentMonth = getCurrentMonth();
  const [existingUsage] = await db
    .select()
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.feature, feature),
        eq(usageTracking.month, currentMonth)
      )
    )
    .limit(1);

  if (existingUsage) {
    // Update existing usage record
    await db
      .update(usageTracking)
      .set({
        count: existingUsage.count + 1,
        updatedAt: new Date(),
      })
      .where(eq(usageTracking.id, existingUsage.id));
  } else {
    // Create new usage record
    await db.insert(usageTracking).values({
      userId,
      feature,
      month: currentMonth,
      count: 1,
      limit,
    });
  }
}

/**
 * Middleware helper to check usage before processing a request
 */
export async function checkAndIncrementUsage(
  req: NextRequest,
  feature: FeatureType,
  role: "student" | "company"
): Promise<{ allowed: boolean; message?: string }> {
  try {
    const user = getAuthenticatedUser(req);
    if (!user.userId) {
      return {
        allowed: false,
        message: "Authentication required",
      };
    }

    // Verify role matches
    if (user.role !== role) {
      return {
        allowed: false,
        message: "Unauthorized: This feature is not available for your role.",
      };
    }

    const usageCheck = await checkUsageLimit(user.userId, feature, role);
    
    if (!usageCheck.allowed) {
      return {
        allowed: false,
        message: usageCheck.message,
      };
    }

    // Increment usage if allowed
    await incrementUsage(user.userId, feature, role);

    return { allowed: true };
  } catch (error: any) {
    console.error("Error checking usage:", error);
    return {
      allowed: false,
      message: "Error checking usage limits. Please try again.",
    };
  }
}

