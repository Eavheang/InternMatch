import { db } from "@/db";
import { usageTracking, transactions } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import {
  getUsageLimit,
  getCurrentMonth,
  FeatureType,
  PlanType,
  getFeaturesForRole,
  FEATURE_DISPLAY_NAMES,
} from "./usage-limits";
import { getAuthenticatedUser } from "./auth-helpers";
import { NextRequest } from "next/server";

export interface UsageInfo {
  feature: FeatureType;
  displayName: string;
  current: number;
  limit: number;
  percentage: number;
}

export interface AllUsageInfo {
  plan: PlanType;
  usage: UsageInfo[];
}

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

  console.log(`[checkUsageLimit] userId=${userId}, feature=${feature}, role=${role}, plan=${plan}, limit=${limit}`);

  // If limit is 0, feature is not available for this plan
  if (limit === 0) {
    return {
      allowed: false,
      current: 0,
      limit: 0,
      message: `This feature is not available for your current plan (${plan}). Please upgrade to access this feature.`,
    };
  }

  // Check monthly usage
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

  console.log(`[checkUsageLimit] month=${currentMonth}, currentCount=${currentCount}, allowed=${allowed}`);

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

  console.log(`[incrementUsage] userId=${userId}, feature=${feature}, role=${role}, plan=${plan}, limit=${limit}`);

  // Don't track usage if limit is 0
  if (limit === 0) {
    console.log(`[incrementUsage] Skipping - limit is 0`);
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
    const newCount = existingUsage.count + 1;
    console.log(`[incrementUsage] Updating existing record: ${existingUsage.count} -> ${newCount}`);
    await db
      .update(usageTracking)
      .set({
        count: newCount,
        updatedAt: new Date(),
      })
      .where(eq(usageTracking.id, existingUsage.id));
  } else {
    // Create new usage record
    console.log(`[incrementUsage] Creating new record with count=1`);
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
 * Get all usage information for a user
 */
export async function getAllUsage(
  userId: string,
  role: "student" | "company"
): Promise<AllUsageInfo> {
  const plan = await getUserPlan(userId);
  const features = getFeaturesForRole(role);
  const currentMonth = getCurrentMonth();

  const usageRecords = await db
    .select()
    .from(usageTracking)
    .where(
      and(
        eq(usageTracking.userId, userId),
        eq(usageTracking.month, currentMonth)
      )
    );

  const usageMap = new Map(
    usageRecords.map((record) => [record.feature, record.count])
  );

  const usage: UsageInfo[] = features.map((feature) => {
    const limit = getUsageLimit(plan, feature, role);
    const current = usageMap.get(feature) || 0;
    return {
      feature,
      displayName: FEATURE_DISPLAY_NAMES[feature],
      current,
      limit,
      percentage: limit > 0 ? Math.round((current / limit) * 100) : 0,
    };
  });

  return { plan, usage };
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
  } catch (error: unknown) {
    console.error("Error checking usage:", error);
    return {
      allowed: false,
      message: "Error checking usage limits. Please try again.",
    };
  }
}
