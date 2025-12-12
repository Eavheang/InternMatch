/**
 * Usage limits configuration based on subscription plans
 * All limits are times/month (count-based)
 */

export type FeatureType =
  | "role_suggestion" // Student: Role suggestion (times per month)
  | "interview_prep" // Student: Interview preps (times per month)
  | "ats_analyze" // Student: ATS Analyze (times per month)
  | "resume_generate" // Student: Resume generation (times per month)
  | "job_prediction" // Company: Job prediction (times per month)
  | "alternative_role" // Company: Alternative role suggestions (times per month)
  | "interview_questions"; // Company: Interview questions (times per month)

export type StudentPlanType = "free" | "basic" | "pro";
export type CompanyPlanType = "free" | "growth" | "enterprise";
export type PlanType = StudentPlanType | CompanyPlanType;

interface PlanLimits {
  role_suggestion?: number; // Times per month (for students)
  interview_prep?: number; // Times per month (for students)
  ats_analyze?: number; // Times per month (for students)
  resume_generate?: number; // Times per month (for students)
  job_prediction?: number; // Times per month (for companies)
  alternative_role?: number; // Times per month (for companies)
  interview_questions?: number; // Times per month (for companies)
}

// Student plan limits (matching pricing cards)
const STUDENT_PLANS: Record<StudentPlanType, PlanLimits> = {
  free: {
    role_suggestion: 1, // 1 time/month
    interview_prep: 5, // 5 times/month
    ats_analyze: 1, // 1 time/month
    resume_generate: 1, // 1 time/month
  },
  basic: {
    role_suggestion: 3, // 3 times/month
    interview_prep: 15, // 15 times/month
    ats_analyze: 5, // 5 times/month
    resume_generate: 5, // 5 times/month
  },
  pro: {
    role_suggestion: 5, // 5 times/month
    interview_prep: 45, // 45 times/month
    ats_analyze: 15, // 15 times/month
    resume_generate: 15, // 15 times/month
  },
};

// Company plan limits (matching pricing cards)
const COMPANY_PLANS: Record<CompanyPlanType, PlanLimits> = {
  free: {
    job_prediction: 5, // 5 times/month
    alternative_role: 5, // 5 times/month
    interview_questions: 5, // 5 times/month
  },
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
 * Get all student features
 */
export const STUDENT_FEATURES: FeatureType[] = [
  "role_suggestion",
  "interview_prep",
  "ats_analyze",
  "resume_generate",
];

/**
 * Get all company features
 */
export const COMPANY_FEATURES: FeatureType[] = [
  "job_prediction",
  "alternative_role",
  "interview_questions",
];

/**
 * Feature display names for UI
 */
export const FEATURE_DISPLAY_NAMES: Record<FeatureType, string> = {
  role_suggestion: "Role Suggestion",
  interview_prep: "Interview Preps",
  ats_analyze: "ATS Analyze",
  resume_generate: "Resume",
  job_prediction: "Job Prediction",
  alternative_role: "Alternative Role",
  interview_questions: "Interview Questions",
};

/**
 * Get usage limit for a feature based on plan and role
 */
export function getUsageLimit(
  plan: PlanType,
  feature: FeatureType,
  role: "student" | "company"
): number {
  if (role === "student") {
    const studentPlan = plan as StudentPlanType;
    // Map company plans to free for students
    if (plan === "growth" || plan === "enterprise") {
      return STUDENT_PLANS["free"][feature] || 0;
    }
    return STUDENT_PLANS[studentPlan]?.[feature] || 0;
  } else {
    const companyPlan = plan as CompanyPlanType;
    // Map student plans to free for companies
    if (plan === "basic" || plan === "pro") {
      return COMPANY_PLANS["free"][feature] || 0;
    }
    return COMPANY_PLANS[companyPlan]?.[feature] || 0;
  }
}

/**
 * Get current month string in YYYY-MM format
 */
export function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

/**
 * Get all limits for a plan and role
 */
export function getAllLimits(
  plan: PlanType,
  role: "student" | "company"
): PlanLimits {
  if (role === "student") {
    const studentPlan = plan as StudentPlanType;
    if (plan === "growth" || plan === "enterprise") {
      return STUDENT_PLANS["free"];
    }
    return STUDENT_PLANS[studentPlan] || STUDENT_PLANS["free"];
  } else {
    const companyPlan = plan as CompanyPlanType;
    if (plan === "basic" || plan === "pro") {
      return COMPANY_PLANS["free"];
    }
    return COMPANY_PLANS[companyPlan] || COMPANY_PLANS["free"];
  }
}

/**
 * Get features for a specific role
 */
export function getFeaturesForRole(role: "student" | "company"): FeatureType[] {
  return role === "student" ? STUDENT_FEATURES : COMPANY_FEATURES;
}
