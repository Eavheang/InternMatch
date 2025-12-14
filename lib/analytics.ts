import { db } from "@/db";
import {
  analyticsEvents,
  analyticsAggregates,
  adminActions,
  users,
  students,
  companies,
  jobPostings,
  applications,
  transactions,
  usageTracking,
} from "@/db/schema";
import { eq, sql, and, gte, lte, count, desc, asc } from "drizzle-orm";
import type {
  AnalyticsEventType,
  EventMetadata,
  OverviewStats,
  FeatureUsageStats,
  UserGrowthStats,
  RevenueStats,
  PlatformActivityStats,
  AdminActionType,
  UserListFilters,
  UserListResponse,
  MetricType,
  PeriodType,
} from "./analytics-types";

// ==============================================
// EVENT TRACKING
// ==============================================

/**
 * Track an analytics event
 */
export async function trackEvent(
  eventType: AnalyticsEventType,
  userId?: string,
  eventData?: Record<string, unknown>,
  metadata?: EventMetadata
): Promise<void> {
  try {
    await db.insert(analyticsEvents).values({
      eventType,
      userId: userId || null,
      eventData: eventData || null,
      metadata: metadata || null,
    });
  } catch (error) {
    // Log error but don't throw - analytics should not break main functionality
    console.error("[Analytics] Failed to track event:", error);
  }
}

/**
 * Track an admin action for audit logging
 */
export async function trackAdminAction(
  adminId: string,
  actionType: AdminActionType,
  targetType?: string,
  targetId?: string,
  details?: Record<string, unknown>,
  ipAddress?: string
): Promise<void> {
  try {
    await db.insert(adminActions).values({
      adminId,
      actionType,
      targetType: targetType || null,
      targetId: targetId || null,
      details: details || null,
      ipAddress: ipAddress || null,
    });
  } catch (error) {
    console.error("[Analytics] Failed to track admin action:", error);
  }
}

// ==============================================
// OVERVIEW STATS
// ==============================================

/**
 * Get overview statistics for admin dashboard
 */
export async function getOverviewStats(): Promise<OverviewStats> {
  const now = new Date();
  const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  // Get current month counts
  const [totalUsersResult] = await db
    .select({ count: count() })
    .from(users);

  const [studentsResult] = await db
    .select({ count: count() })
    .from(students);

  const [companiesResult] = await db
    .select({ count: count() })
    .from(companies);

  const [jobsResult] = await db
    .select({ count: count() })
    .from(jobPostings);

  const [applicationsResult] = await db
    .select({ count: count() })
    .from(applications);

  // Get active subscriptions (non-free plans with valid expiration)
  const [activeSubscriptionsResult] = await db
    .select({ count: count() })
    .from(transactions)
    .where(
      and(
        eq(transactions.status, "completed"),
        gte(transactions.expiresAt, now)
      )
    );

  // Get verified users
  const [verifiedUsersResult] = await db
    .select({ count: count() })
    .from(users)
    .where(eq(users.isVerified, true));

  // Get total revenue
  const [revenueResult] = await db
    .select({ total: sql<number>`COALESCE(SUM(${transactions.paymentAmount}), 0)` })
    .from(transactions)
    .where(eq(transactions.status, "completed"));

  // Get daily active users (users with events today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [dauResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${analyticsEvents.userId})` })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, today));

  // Get monthly active users (users with events this month)
  const [mauResult] = await db
    .select({ count: sql<number>`COUNT(DISTINCT ${analyticsEvents.userId})` })
    .from(analyticsEvents)
    .where(gte(analyticsEvents.createdAt, currentMonthStart));

  // Get previous month counts for trend calculation
  const [prevStudentsResult] = await db
    .select({ count: count() })
    .from(students)
    .where(
      and(
        gte(students.createdAt, previousMonthStart),
        lte(students.createdAt, previousMonthEnd)
      )
    );

  const [prevCompaniesResult] = await db
    .select({ count: count() })
    .from(companies)
    .where(
      and(
        gte(companies.createdAt, previousMonthStart),
        lte(companies.createdAt, previousMonthEnd)
      )
    );

  const [prevJobsResult] = await db
    .select({ count: count() })
    .from(jobPostings)
    .where(
      and(
        gte(jobPostings.createdAt, previousMonthStart),
        lte(jobPostings.createdAt, previousMonthEnd)
      )
    );

  const [prevApplicationsResult] = await db
    .select({ count: count() })
    .from(applications)
    .where(
      and(
        gte(applications.appliedAt, previousMonthStart),
        lte(applications.appliedAt, previousMonthEnd)
      )
    );

  const [prevSubscriptionsResult] = await db
    .select({ count: count() })
    .from(transactions)
    .where(
      and(
        eq(transactions.status, "completed"),
        gte(transactions.createdAt, previousMonthStart),
        lte(transactions.createdAt, previousMonthEnd)
      )
    );

  const [prevVerifiedResult] = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        eq(users.isVerified, true),
        gte(users.createdAt, previousMonthStart),
        lte(users.createdAt, previousMonthEnd)
      )
    );

  // Calculate current month counts
  const [currentStudentsResult] = await db
    .select({ count: count() })
    .from(students)
    .where(gte(students.createdAt, currentMonthStart));

  const [currentCompaniesResult] = await db
    .select({ count: count() })
    .from(companies)
    .where(gte(companies.createdAt, currentMonthStart));

  const [currentJobsResult] = await db
    .select({ count: count() })
    .from(jobPostings)
    .where(gte(jobPostings.createdAt, currentMonthStart));

  const [currentApplicationsResult] = await db
    .select({ count: count() })
    .from(applications)
    .where(gte(applications.appliedAt, currentMonthStart));

  const [currentSubscriptionsResult] = await db
    .select({ count: count() })
    .from(transactions)
    .where(
      and(
        eq(transactions.status, "completed"),
        gte(transactions.createdAt, currentMonthStart)
      )
    );

  const [currentVerifiedResult] = await db
    .select({ count: count() })
    .from(users)
    .where(
      and(
        eq(users.isVerified, true),
        gte(users.createdAt, currentMonthStart)
      )
    );

  // Helper function to calculate percentage change
  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const currentStudents = currentStudentsResult?.count || 0;
  const currentCompanies = currentCompaniesResult?.count || 0;
  const currentJobs = currentJobsResult?.count || 0;
  const currentApplications = currentApplicationsResult?.count || 0;
  const currentSubscriptions = currentSubscriptionsResult?.count || 0;
  const currentVerified = currentVerifiedResult?.count || 0;

  const previousStudents = prevStudentsResult?.count || 0;
  const previousCompanies = prevCompaniesResult?.count || 0;
  const previousJobs = prevJobsResult?.count || 0;
  const previousApplications = prevApplicationsResult?.count || 0;
  const previousSubscriptions = prevSubscriptionsResult?.count || 0;
  const previousVerified = prevVerifiedResult?.count || 0;

  return {
    totalUsers: totalUsersResult?.count || 0,
    totalStudents: studentsResult?.count || 0,
    totalCompanies: companiesResult?.count || 0,
    totalJobs: jobsResult?.count || 0,
    totalApplications: applicationsResult?.count || 0,
    activeSubscriptions: activeSubscriptionsResult?.count || 0,
    verifiedUsers: verifiedUsersResult?.count || 0,
    totalRevenue: revenueResult?.total || 0,
    dailyActiveUsers: dauResult?.count || 0,
    monthlyActiveUsers: mauResult?.count || 0,
    studentsTrend: Math.round(calculateTrend(currentStudents, previousStudents) * 100) / 100,
    companiesTrend: Math.round(calculateTrend(currentCompanies, previousCompanies) * 100) / 100,
    jobsTrend: Math.round(calculateTrend(currentJobs, previousJobs) * 100) / 100,
    applicationsTrend: Math.round(calculateTrend(currentApplications, previousApplications) * 100) / 100,
    subscriptionsTrend: Math.round(calculateTrend(currentSubscriptions, previousSubscriptions) * 100) / 100,
    verifiedUsersTrend: Math.round(calculateTrend(currentVerified, previousVerified) * 100) / 100,
  };
}

// ==============================================
// FEATURE USAGE STATS
// ==============================================

/**
 * Get feature usage statistics
 */
export async function getFeatureUsageStats(
  period: "day" | "week" | "month" = "month"
): Promise<FeatureUsageStats[]> {
  const now = new Date();
  let startDate: Date;
  let previousStartDate: Date;
  let previousEndDate: Date;

  switch (period) {
    case "day":
      startDate = new Date(now);
      startDate.setHours(0, 0, 0, 0);
      previousEndDate = new Date(startDate);
      previousStartDate = new Date(previousEndDate);
      previousStartDate.setDate(previousEndDate.getDate() - 1);
      break;
    case "week":
      startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      previousStartDate = new Date(startDate);
      previousStartDate.setDate(startDate.getDate() - 7);
      previousEndDate = new Date(startDate);
      break;
    case "month":
    default:
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
      previousStartDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      previousEndDate = new Date(startDate);
      break;
  }

  // Get total users count for adoption rate calculation
  const [totalUsersResult] = await db
    .select({ count: count() })
    .from(users);
  const totalUsers = totalUsersResult?.count || 1; // Avoid division by zero

  // Get AI feature usage from usage_tracking table for current period
  const featureUsage = await db
    .select({
      feature: usageTracking.feature,
      totalUsage: sql<number>`SUM(${usageTracking.count})`,
      uniqueUsers: sql<number>`COUNT(DISTINCT ${usageTracking.userId})`,
    })
    .from(usageTracking)
    .where(gte(usageTracking.createdAt, startDate))
    .groupBy(usageTracking.feature);

  // Get AI feature usage from previous period for growth rate
  const previousFeatureUsage = await db
    .select({
      feature: usageTracking.feature,
      totalUsage: sql<number>`SUM(${usageTracking.count})`,
    })
    .from(usageTracking)
    .where(
      and(
        gte(usageTracking.createdAt, previousStartDate),
        lte(usageTracking.createdAt, previousEndDate)
      )
    )
    .groupBy(usageTracking.feature);

  // Create a map of previous usage for quick lookup
  const previousUsageMap = new Map(
    previousFeatureUsage.map((item) => [
      item.feature,
      Number(item.totalUsage) || 0,
    ])
  );

  return featureUsage.map((item) => {
    const totalUsageNum = Number(item.totalUsage) || 0;
    const uniqueUsersNum = Number(item.uniqueUsers) || 0;
    const previousUsage = previousUsageMap.get(item.feature) || 0;

    // Calculate metrics
    const avgUsagePerUser =
      uniqueUsersNum > 0 ? totalUsageNum / uniqueUsersNum : 0;
    const adoptionRate = (uniqueUsersNum / totalUsers) * 100;
    const growthRate =
      previousUsage > 0
        ? ((totalUsageNum - previousUsage) / previousUsage) * 100
        : totalUsageNum > 0
          ? 100
          : 0;

    return {
      feature: item.feature,
      totalUsage: totalUsageNum,
      uniqueUsers: uniqueUsersNum,
      usageByPlan: {}, // Would need additional query to populate
      trend: growthRate, // Now using actual calculated growth rate
      avgUsagePerUser: Math.round(avgUsagePerUser * 100) / 100,
      adoptionRate: Math.round(adoptionRate * 100) / 100,
      growthRate: Math.round(growthRate * 100) / 100,
    };
  });
}

// ==============================================
// USER GROWTH STATS
// ==============================================

/**
 * Get user growth statistics over time
 */
export async function getUserGrowthStats(
  days: number = 30
): Promise<UserGrowthStats[]> {
  const results: UserGrowthStats[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    // Get new students for this day
    const [newStudentsResult] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.role, "student"),
          gte(users.createdAt, date),
          lte(users.createdAt, nextDate)
        )
      );

    // Get new companies for this day
    const [newCompaniesResult] = await db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.role, "company"),
          gte(users.createdAt, date),
          lte(users.createdAt, nextDate)
        )
      );

    // Get cumulative total up to this day
    const [cumulativeResult] = await db
      .select({ count: count() })
      .from(users)
      .where(lte(users.createdAt, nextDate));

    results.push({
      period: date.toISOString().split("T")[0],
      newStudents: newStudentsResult?.count || 0,
      newCompanies: newCompaniesResult?.count || 0,
      totalNew: (newStudentsResult?.count || 0) + (newCompaniesResult?.count || 0),
      cumulativeTotal: cumulativeResult?.count || 0,
    });
  }

  return results;
}

// ==============================================
// REVENUE STATS
// ==============================================

/**
 * Get revenue statistics
 */
export async function getRevenueStats(
  months: number = 6
): Promise<RevenueStats[]> {
  const results: RevenueStats[] = [];
  const now = new Date();

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    const period = `${monthStart.getFullYear()}-${String(monthStart.getMonth() + 1).padStart(2, "0")}`;

    // Get total revenue for this month (completed transactions)
    const [revenueResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.paymentAmount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "completed"),
          gte(transactions.transactionDate, monthStart),
          lte(transactions.transactionDate, monthEnd)
        )
      );

    // Get new subscriptions for this month (newly created completed transactions)
    const [newSubsResult] = await db
      .select({ count: count() })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "completed"),
          gte(transactions.createdAt, monthStart),
          lte(transactions.createdAt, monthEnd)
        )
      );

    // Get cancelled subscriptions for this month
    const [cancelledResult] = await db
      .select({ count: count() })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "cancelled"),
          gte(transactions.updatedAt, monthStart),
          lte(transactions.updatedAt, monthEnd)
        )
      );

    // Get subscriptions by plan for this month
    const planDistribution = await db
      .select({
        plan: transactions.plan,
        count: count(),
        avgAmount: sql<number>`AVG(${transactions.paymentAmount})`,
      })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "completed"),
          gte(transactions.transactionDate, monthStart),
          lte(transactions.transactionDate, monthEnd)
        )
      )
      .groupBy(transactions.plan);

    const subscriptionsByPlan: Record<string, number> = {};
    planDistribution.forEach((item) => {
      if (item.plan) {
        subscriptionsByPlan[item.plan] = item.count;
      }
    });

    // Calculate MRR: Active subscriptions (not expired) for next month
    const nextMonthStart = new Date(monthEnd);
    nextMonthStart.setDate(nextMonthStart.getDate() + 1);
    const [mrrResult] = await db
      .select({ total: sql<number>`COALESCE(SUM(${transactions.paymentAmount}), 0)` })
      .from(transactions)
      .where(
        and(
          eq(transactions.status, "completed"),
          gte(transactions.expiresAt, nextMonthStart),
          lte(transactions.transactionDate, monthEnd)
        )
      );

    results.push({
      period,
      totalRevenue: revenueResult?.total || 0,
      subscriptionsByPlan,
      newSubscriptions: newSubsResult?.count || 0,
      cancellations: cancelledResult?.count || 0,
      mrr: mrrResult?.total || 0, // Actual MRR from active subscriptions
    });
  }

  return results;
}

// ==============================================
// PLATFORM ACTIVITY STATS
// ==============================================

/**
 * Get platform activity statistics
 */
export async function getPlatformActivityStats(
  days: number = 30
): Promise<PlatformActivityStats[]> {
  const results: PlatformActivityStats[] = [];
  const now = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(now.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(date.getDate() + 1);

    // Get jobs created on this day
    const [jobsResult] = await db
      .select({ count: count() })
      .from(jobPostings)
      .where(
        and(
          gte(jobPostings.createdAt, date),
          lte(jobPostings.createdAt, nextDate)
        )
      );

    // Get applications submitted on this day
    const [appsResult] = await db
      .select({ count: count() })
      .from(applications)
      .where(
        and(
          gte(applications.appliedAt, date),
          lte(applications.appliedAt, nextDate)
        )
      );

    // Get AI feature usage on this day
    const [aiUsageResult] = await db
      .select({ count: count() })
      .from(analyticsEvents)
      .where(
        and(
          sql`${analyticsEvents.eventType} LIKE 'ai.%'`,
          gte(analyticsEvents.createdAt, date),
          lte(analyticsEvents.createdAt, nextDate)
        )
      );

    results.push({
      period: date.toISOString().split("T")[0],
      jobsCreated: jobsResult?.count || 0,
      applicationsSubmitted: appsResult?.count || 0,
      profilesCompleted: 0, // Would need profile completion tracking
      aiFeatureUsage: aiUsageResult?.count || 0,
    });
  }

  return results;
}

// ==============================================
// USER MANAGEMENT
// ==============================================

/**
 * Get paginated list of users with filters
 */
export async function getUserList(
  filters: UserListFilters
): Promise<UserListResponse> {
  const {
    role,
    isVerified,
    search,
    page = 1,
    limit = 20,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = filters;

  // Build where conditions
  const conditions = [];

  if (role) {
    conditions.push(eq(users.role, role));
  }

  if (typeof isVerified === "boolean") {
    conditions.push(eq(users.isVerified, isVerified));
  }

  if (search) {
    conditions.push(sql`${users.email} ILIKE ${"%" + search + "%"}`);
  }

  // Get total count
  const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
  const [totalResult] = await db
    .select({ count: count() })
    .from(users)
    .where(whereClause);

  const total = totalResult?.count || 0;
  const totalPages = Math.ceil(total / limit);
  const offset = (page - 1) * limit;

  // Get users with pagination
  const orderByClause = sortOrder === "asc" ? asc(users.createdAt) : desc(users.createdAt);
  const userList = await db
    .select({
      id: users.id,
      email: users.email,
      role: users.role,
      isVerified: users.isVerified,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(whereClause)
    .orderBy(orderByClause)
    .limit(limit)
    .offset(offset);

  // Enrich with profile data
  const enrichedUsers = await Promise.all(
    userList.map(async (user) => {
      let profile: {
        firstName?: string;
        lastName?: string;
        companyName?: string;
        university?: string;
      } | undefined;

      if (user.role === "student") {
        const [studentProfile] = await db
          .select({
            firstName: students.firstName,
            lastName: students.lastName,
            university: students.university,
          })
          .from(students)
          .where(eq(students.userId, user.id));
        if (studentProfile) {
          profile = {
            firstName: studentProfile.firstName,
            lastName: studentProfile.lastName,
            university: studentProfile.university ?? undefined,
          };
        }
      } else if (user.role === "company") {
        const [companyProfile] = await db
          .select({
            companyName: companies.companyName,
          })
          .from(companies)
          .where(eq(companies.userId, user.id));
        profile = companyProfile;
      }

      // Get user's plan
      const [latestTransaction] = await db
        .select({ plan: transactions.plan })
        .from(transactions)
        .where(
          and(
            eq(transactions.userId, user.id),
            eq(transactions.status, "completed"),
            gte(transactions.expiresAt, new Date())
          )
        )
        .orderBy(desc(transactions.createdAt))
        .limit(1);

      return {
        ...user,
        createdAt: user.createdAt.toISOString(),
        profile,
        plan: latestTransaction?.plan || "free",
      };
    })
  );

  return {
    users: enrichedUsers,
    total,
    page,
    limit,
    totalPages,
  };
}

/**
 * Get detailed user information
 */
export async function getUserDetails(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId));

  if (!user) {
    return null;
  }

  let profile = null;

  if (user.role === "student") {
    const [studentProfile] = await db
      .select()
      .from(students)
      .where(eq(students.userId, userId));
    profile = studentProfile;
  } else if (user.role === "company") {
    const [companyProfile] = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, userId));
    profile = companyProfile;
  }

  // Get user's transactions
  const userTransactions = await db
    .select()
    .from(transactions)
    .where(eq(transactions.userId, userId))
    .orderBy(desc(transactions.createdAt));

  // Get user's recent activity
  const recentActivity = await db
    .select()
    .from(analyticsEvents)
    .where(eq(analyticsEvents.userId, userId))
    .orderBy(desc(analyticsEvents.createdAt))
    .limit(50);

  return {
    user: {
      id: user.id,
      email: user.email,
      role: user.role,
      isVerified: user.isVerified,
      createdAt: user.createdAt.toISOString(),
    },
    profile,
    transactions: userTransactions,
    recentActivity,
  };
}

// ==============================================
// AGGREGATION FUNCTIONS
// ==============================================

/**
 * Save an aggregated metric
 */
export async function saveAggregate(
  metricType: MetricType,
  metricValue: number,
  period: string,
  periodType: PeriodType,
  dimension?: Record<string, string | number>
): Promise<void> {
  try {
    await db.insert(analyticsAggregates).values({
      metricType,
      metricValue,
      period,
      periodType,
      dimension: dimension || null,
    });
  } catch (error) {
    console.error("[Analytics] Failed to save aggregate:", error);
  }
}

/**
 * Get aggregated metrics for a specific period
 */
export async function getAggregates(
  metricType: MetricType,
  periodType: PeriodType,
  limit: number = 30
) {
  return db
    .select()
    .from(analyticsAggregates)
    .where(
      and(
        eq(analyticsAggregates.metricType, metricType),
        eq(analyticsAggregates.periodType, periodType)
      )
    )
    .orderBy(desc(analyticsAggregates.period))
    .limit(limit);
}

// ==============================================
// ADMIN AUDIT LOG
// ==============================================

/**
 * Get admin action audit log
 */
export async function getAdminAuditLog(
  page: number = 1,
  limit: number = 50,
  adminId?: string
) {
  const offset = (page - 1) * limit;
  const conditions = adminId ? [eq(adminActions.adminId, adminId)] : [];

  const [totalResult] = await db
    .select({ count: count() })
    .from(adminActions)
    .where(conditions.length > 0 ? and(...conditions) : undefined);

  const logs = await db
    .select({
      id: adminActions.id,
      adminId: adminActions.adminId,
      actionType: adminActions.actionType,
      targetType: adminActions.targetType,
      targetId: adminActions.targetId,
      details: adminActions.details,
      ipAddress: adminActions.ipAddress,
      createdAt: adminActions.createdAt,
    })
    .from(adminActions)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(adminActions.createdAt))
    .limit(limit)
    .offset(offset);

  return {
    logs,
    total: totalResult?.count || 0,
    page,
    limit,
    totalPages: Math.ceil((totalResult?.count || 0) / limit),
  };
}

// ==============================================
// PLAN DISTRIBUTION
// ==============================================

/**
 * Get current plan distribution
 */
export async function getPlanDistribution() {
  const now = new Date();

  // Get all active subscriptions grouped by plan
  const activeSubs = await db
    .select({
      plan: transactions.plan,
      count: count(),
    })
    .from(transactions)
    .where(
      and(
        eq(transactions.status, "completed"),
        gte(transactions.expiresAt, now)
      )
    )
    .groupBy(transactions.plan);

  // Get total users count
  const [totalUsersResult] = await db
    .select({ count: count() })
    .from(users);

  const totalUsers = totalUsersResult?.count || 0;
  const paidUsers = activeSubs.reduce((sum, item) => sum + item.count, 0);
  const freeUsers = totalUsers - paidUsers;

  const distribution: Record<string, number> = {
    free: freeUsers,
  };

  activeSubs.forEach((item) => {
    if (item.plan) {
      distribution[item.plan] = item.count;
    }
  });

  return distribution;
}
