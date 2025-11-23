/**
 * Usage limits configuration based on subscription plans
 */

export type FeatureType =
  | "role_suggestion" // Student: Role suggestion (duration in months)
  | "interview_prep" // Student: Interview preps (times per month)
  | "ats_analyze" // Student: ATS Analyze (duration in months)
  | "resume_generate" // Student: Resume generation (times per month)
  | "job_prediction" // Company: Job prediction (times per month)
  | "alternative_role" // Company: Alternative role suggestions (times per month)
  | "interview_questions"; // Company: Interview questions (times per month)

export type PlanType = "free" | "basic" | "pro" | "growth" | "enterprise";

interface PlanLimits {
  role_suggestion?: number; // Duration in months (for students)
  interview_prep: number; // Times per month
  ats_analyze?: number; // Duration in months (for students)
  resume_generate: number; // Times per month
  job_prediction?: number; // Times per month (for companies)
  alternative_role?: number; // Times per month (for companies)
  interview_questions?: number; // Times per month (for companies)
}

// Student plan limits
const STUDENT_PLANS: Record<PlanType, PlanLimits> = {
  free: {
    role_suggestion: 1, // 1 month
    interview_prep: 5, // 5 times/month
    ats_analyze: 1, // 1 month
    resume_generate: 1, // 1/month
  },
  basic: {
    role_suggestion: 3, // 3 months
    interview_prep: 15, // 15 times/month
    ats_analyze: 5, // 5 months
    resume_generate: 5, // 5/month
  },
  pro: {
    role_suggestion: 5, // 5 months
    interview_prep: 45, // 45 times/month
    ats_analyze: 15, // 15 months
    resume_generate: 15, // 15/month
  },
  growth: {}, // Not applicable for students
  enterprise: {}, // Not applicable for students
};

// Company plan limits
const COMPANY_PLANS: Record<PlanType, PlanLimits> = {
  free: {
    job_prediction: 5, // 5 times/month
    alternative_role: 5, // 5 times/month
    interview_questions: 5, // 5 times/month
  },
  basic: {}, // Not applicable for companies
  pro: {}, // Not applicable for companies
  growth: {
    job_prediction: 10, // 10 times/month
    alternative_role: 10, // 10 times/month
    interview_questions: 10, // 10 times/month
  },
  enterprise: {
    job_prediction: 20, // 20 times/month
    alternative_role: 20, // 20 times/month
    interview_questions: 20, // 20 times/month
  },
};

/**
 * Get usage limit for a feature based on plan and role
 */
export function getUsageLimit(
  plan: PlanType,
  feature: FeatureType,
  role: "student" | "company"
): number {
  const planLimits =
    role === "student" ? STUDENT_PLANS[plan] : COMPANY_PLANS[plan];
  return planLimits[feature] || 0;
}

/**
 * Get current month string in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Check if a feature has a duration-based limit (not monthly count)
 */
export function isDurationBased(feature: FeatureType): boolean {
  return feature === "role_suggestion" || feature === "ats_analyze";
}

/**
 * Get all limits for a plan and role
 */
export function getAllLimits(
  plan: PlanType,
  role: "student" | "company"
): PlanLimits {
  return role === "student" ? STUDENT_PLANS[plan] : COMPANY_PLANS[plan];
}

