// Analytics Event Types - Strict type definitions for analytics tracking

// AI Feature Events
export type AIEventType =
  | "ai.ats_analysis"
  | "ai.resume_generation"
  | "ai.interview_prep"
  | "ai.role_suggestions"
  | "ai.job_prediction"
  | "ai.alternative_role"
  | "ai.interview_questions"
  | "ai.cover_letter"
  | "ai.review";

// Job Events
export type JobEventType =
  | "job.created"
  | "job.updated"
  | "job.viewed"
  | "job.closed"
  | "job.deleted";

// Application Events
export type ApplicationEventType =
  | "application.submitted"
  | "application.viewed"
  | "application.shortlisted"
  | "application.rejected"
  | "application.hired";

// User Events
export type UserEventType =
  | "user.registered"
  | "user.login"
  | "user.logout"
  | "user.profile_updated"
  | "user.profile_completed"
  | "user.deactivated";

// Subscription Events
export type SubscriptionEventType =
  | "subscription.created"
  | "subscription.upgraded"
  | "subscription.downgraded"
  | "subscription.cancelled"
  | "subscription.renewed";

// Resume Events
export type ResumeEventType =
  | "resume.created"
  | "resume.updated"
  | "resume.downloaded"
  | "resume.analyzed";

// All Analytics Event Types
export type AnalyticsEventType =
  | AIEventType
  | JobEventType
  | ApplicationEventType
  | UserEventType
  | SubscriptionEventType
  | ResumeEventType;

// Event Data Interfaces
export interface BaseEventData {
  timestamp?: string;
  sessionId?: string;
}

export interface AIEventData extends BaseEventData {
  feature?: string;
  model?: string;
  inputTokens?: number;
  outputTokens?: number;
  duration?: number;
  success?: boolean;
  error?: string;
}

export interface JobEventData extends BaseEventData {
  jobId?: string;
  jobTitle?: string;
  companyId?: string;
  jobType?: string;
  location?: string;
}

export interface ApplicationEventData extends BaseEventData {
  applicationId?: string;
  jobId?: string;
  studentId?: string;
  previousStatus?: string;
  newStatus?: string;
}

export interface UserEventData extends BaseEventData {
  role?: string;
  registrationSource?: string;
  profileCompleteness?: number;
}

export interface SubscriptionEventData extends BaseEventData {
  plan?: string;
  previousPlan?: string;
  amount?: number;
  currency?: string;
  transactionId?: string;
}

export interface ResumeEventData extends BaseEventData {
  resumeId?: string;
  atsScore?: number;
  format?: string;
}

// Event Metadata
export interface EventMetadata {
  userAgent?: string;
  ipAddress?: string;
  referrer?: string;
  platform?: string;
  country?: string;
  city?: string;
}

// Analytics Event
export interface AnalyticsEvent {
  eventType: AnalyticsEventType;
  userId?: string;
  eventData?: Record<string, unknown>;
  metadata?: EventMetadata;
}

// Metric Types
export type MetricType =
  | "daily_active_users"
  | "monthly_active_users"
  | "feature_usage"
  | "total_revenue"
  | "new_registrations"
  | "total_applications"
  | "total_jobs"
  | "conversion_rate"
  | "plan_distribution"
  | "user_retention";

// Period Types
export type PeriodType = "daily" | "weekly" | "monthly";

// Analytics Aggregate
export interface AnalyticsAggregate {
  metricType: MetricType;
  metricValue: number;
  dimension?: Record<string, string | number>;
  period: string;
  periodType: PeriodType;
}

// Dashboard Overview Stats
export interface OverviewStats {
  totalUsers: number;
  totalStudents: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  activeSubscriptions: number;
  verifiedUsers: number;
  totalRevenue: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  // Trend percentages (compared to previous period)
  studentsTrend: number;
  companiesTrend: number;
  jobsTrend: number;
  applicationsTrend: number;
  subscriptionsTrend: number;
  verifiedUsersTrend: number;
}

// Feature Usage Stats
export interface FeatureUsageStats {
  feature: string;
  totalUsage: number;
  uniqueUsers: number;
  usageByPlan: Record<string, number>;
  trend: number; // percentage change from previous period
  avgUsagePerUser: number; // average uses per user
  adoptionRate: number; // percentage of total users using this feature
  growthRate: number; // percentage growth from previous period
}

// User Growth Stats
export interface UserGrowthStats {
  period: string;
  newStudents: number;
  newCompanies: number;
  totalNew: number;
  cumulativeTotal: number;
}

// Revenue Stats
export interface RevenueStats {
  period: string;
  totalRevenue: number;
  subscriptionsByPlan: Record<string, number>;
  newSubscriptions: number;
  cancellations: number;
  mrr: number; // Monthly Recurring Revenue
}

// Platform Activity Stats
export interface PlatformActivityStats {
  period: string;
  jobsCreated: number;
  applicationsSubmitted: number;
  profilesCompleted: number;
  aiFeatureUsage: number;
}

// Admin Action Types
export type AdminActionType =
  | "user.view"
  | "user.update"
  | "user.deactivate"
  | "user.reactivate"
  | "user.role_change"
  | "job.remove"
  | "job.approve"
  | "system.config_update"
  | "analytics.export";

// Admin Action
export interface AdminAction {
  actionType: AdminActionType;
  targetType?: string;
  targetId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
}

// User List Filters
export interface UserListFilters {
  role?: "student" | "company" | "admin";
  isVerified?: boolean;
  search?: string;
  plan?: string;
  createdAfter?: string;
  createdBefore?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// User List Response
export interface UserListItem {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
  profile?: {
    firstName?: string;
    lastName?: string;
    companyName?: string;
    university?: string;
  };
  plan?: string;
  lastActive?: string;
}

export interface UserListResponse {
  users: UserListItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
