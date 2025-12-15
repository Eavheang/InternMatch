import {
  pgTable,
  uuid,
  text,
  timestamp,
  integer,
  real,
  json,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// Users table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role", { enum: ["student", "company", "admin"] }).notNull(),
  // 2FA email verification
  isVerified: boolean("is_verified").notNull().default(false),
  verificationCode: text("verification_code"),
  verificationExpires: timestamp("verification_expires"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Students table
export const students = pgTable("students", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  gmail: text("gmail"),
  phoneNumber: text("phone_number"),
  location: text("location"),
  university: text("university"),
  degree: text("degree"),
  major: text("major"),
  graduationYear: integer("graduation_year"),
  gpa: real("gpa"),
  resumeUrl: text("resume_url"),
  profileImageUrl: text("profile_image_url"),
  careerInterest: text("career_interest"),
  aboutMe: text("about_me"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Social links table
export const socialLinks = pgTable("social_links", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  linkedin: text("linkedin"),
  github: text("github"),
  website: text("website"),
});

// Skills table
export const skills = pgTable("skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull().unique(),
});

// Student skills junction table
export const studentSkills = pgTable("student_skills", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  skillId: uuid("skill_id")
    .notNull()
    .references(() => skills.id, { onDelete: "cascade" }),
});

// Projects table
export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  projectName: text("project_name").notNull(),
  projectDescription: text("project_description"),
});

// Experiences table
export const experiences = pgTable("experiences", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  experienceTitle: text("experience_title").notNull(),
  experienceDescription: text("experience_description"),
});

// Companies table
export const companies = pgTable("companies", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  companySize: text("company_size"),
  website: text("website"),
  companyLogo: text("company_logo"),
  location: text("location"),
  headquarters: text("headquarters"),
  otherLocations: text("other_locations"),
  description: text("description"),
  companyCulture: text("company_culture"),
  contactName: text("contact_name"),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  hasInternshipProgram: boolean("has_internship_program").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Job postings table
export const jobPostings = pgTable("job_postings", {
  id: uuid("id").primaryKey().defaultRandom(),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  jobTitle: text("job_title").notNull(),
  jobDescription: text("job_description").notNull(),
  status: text("status", { enum: ["open", "closed", "draft"] })
    .notNull()
    .default("draft"),
  requirements: json("requirements"),
  benefits: json("benefits"),
  salaryRange: text("salary_range"),
  location: text("location"),
  jobType: text("job_type", {
    enum: ["full-time", "part-time", "internship", "contract"],
  }),
  experienceLevel: text("experience_level", {
    enum: ["entry", "mid", "senior", "executive"],
  }),
  aiGenerated: boolean("ai_generated").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Applications table
export const applications = pgTable("applications", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  jobId: uuid("job_id")
    .notNull()
    .references(() => jobPostings.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["applied", "shortlisted", "rejected", "interviewed", "hired"],
  })
    .notNull()
    .default("applied"),
  aiGeneratedQuestions: json("ai_generated_questions"),
  coverLetter: text("cover_letter"),
  appliedAt: timestamp("applied_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Analytics table - REMOVED (unused)

// Student analytics table - REMOVED (unused)

// Resume analysis table - REMOVED (replaced by resumeAtsAnalysis)

// AI generated content table
export const aiGeneratedContent = pgTable("ai_generated_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  type: text("type", {
    enum: [
      "job_description",
      "interview_questions",
      "resume_suggestions",
      "cover_letter",
    ],
  }).notNull(),
  studentId: uuid("student_id").references(() => students.id, {
    onDelete: "cascade",
  }),
  companyId: uuid("company_id").references(() => companies.id, {
    onDelete: "cascade",
  }),
  jobId: uuid("job_id").references(() => jobPostings.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  prompt: text("prompt"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Resumes (resume builder - multiple versions per student)
export const resumes = pgTable("resumes", {
  id: uuid("id").primaryKey().defaultRandom(),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  title: text("title"),
  structuredContent: json("structured_content"), // builder blocks/sections
  publicUrl: text("public_url"),
  fileUrl: text("file_url"),
  isPrimary: boolean("is_primary").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ATS analysis (general per resume, or tied to job/application)
export const resumeAtsAnalysis = pgTable("resume_ats_analysis", {
  id: uuid("id").primaryKey().defaultRandom(),
  resumeId: uuid("resume_id")
    .notNull()
    .references(() => resumes.id, { onDelete: "cascade" }),
  applicationId: uuid("application_id").references(() => applications.id, {
    onDelete: "set null",
  }),
  jobId: uuid("job_id").references(() => jobPostings.id, {
    onDelete: "set null",
  }),
  atsScore: integer("ats_score"),
  keywordMatch: integer("keyword_match"),
  readability: integer("readability"),
  length: integer("length"),
  suggestions: json("suggestions"),
  missingKeywords: json("missing_keywords"),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

// Company-side AI review of an application
export const applicationAiReviews = pgTable("application_ai_reviews", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  matchScore: integer("match_score"),
  matchedSkills: json("matched_skills"), // array of strings
  missingSkills: json("missing_skills"), // array of strings
  alternatives: json("alternatives"), // array of job objects/ids with reasons
  summary: text("summary"),
  analyzedAt: timestamp("analyzed_at").defaultNow().notNull(),
});

// Generated interview questions when shortlisted
export const interviewQuestions = pgTable("interview_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  companyId: uuid("company_id")
    .notNull()
    .references(() => companies.id, { onDelete: "cascade" }),
  questions: json("questions").notNull(), // [{ question, intent, difficulty }]
  generatedFrom: text("generated_from", { enum: ["resume", "job", "both"] }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const resumesRelations = relations(resumes, ({ one, many }) => ({
  student: one(students, {
    fields: [resumes.studentId],
    references: [students.id],
  }),
  atsAnalyses: many(resumeAtsAnalysis),
}));

export const resumeAtsAnalysisRelations = relations(
  resumeAtsAnalysis,
  ({ one }) => ({
    resume: one(resumes, {
      fields: [resumeAtsAnalysis.resumeId],
      references: [resumes.id],
    }),
    application: one(applications, {
      fields: [resumeAtsAnalysis.applicationId],
      references: [applications.id],
    }),
    job: one(jobPostings, {
      fields: [resumeAtsAnalysis.jobId],
      references: [jobPostings.id],
    }),
  })
);

export const applicationAiReviewsRelations = relations(
  applicationAiReviews,
  ({ one }) => ({
    application: one(applications, {
      fields: [applicationAiReviews.applicationId],
      references: [applications.id],
    }),
    company: one(companies, {
      fields: [applicationAiReviews.companyId],
      references: [companies.id],
    }),
  })
);

export const interviewQuestionsRelations = relations(
  interviewQuestions,
  ({ one }) => ({
    application: one(applications, {
      fields: [interviewQuestions.applicationId],
      references: [applications.id],
    }),
    company: one(companies, {
      fields: [interviewQuestions.companyId],
      references: [companies.id],
    }),
  })
);

// Define relations
export const usersRelations = relations(users, ({ one }) => ({
  student: one(students, {
    fields: [users.id],
    references: [students.userId],
  }),
  company: one(companies, {
    fields: [users.id],
    references: [companies.userId],
  }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, {
    fields: [students.userId],
    references: [users.id],
  }),
  socialLinks: many(socialLinks),
  skills: many(studentSkills),
  projects: many(projects),
  experiences: many(experiences),
  applications: many(applications),
}));

export const socialLinksRelations = relations(socialLinks, ({ one }) => ({
  student: one(students, {
    fields: [socialLinks.studentId],
    references: [students.id],
  }),
}));

export const skillsRelations = relations(skills, ({ many }) => ({
  students: many(studentSkills),
}));

export const studentSkillsRelations = relations(studentSkills, ({ one }) => ({
  student: one(students, {
    fields: [studentSkills.studentId],
    references: [students.id],
  }),
  skill: one(skills, {
    fields: [studentSkills.skillId],
    references: [skills.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one }) => ({
  student: one(students, {
    fields: [projects.studentId],
    references: [students.id],
  }),
}));

export const experiencesRelations = relations(experiences, ({ one }) => ({
  student: one(students, {
    fields: [experiences.studentId],
    references: [students.id],
  }),
}));

export const companiesRelations = relations(companies, ({ one, many }) => ({
  user: one(users, {
    fields: [companies.userId],
    references: [users.id],
  }),
  jobPostings: many(jobPostings),
}));

export const jobPostingsRelations = relations(jobPostings, ({ one, many }) => ({
  company: one(companies, {
    fields: [jobPostings.companyId],
    references: [companies.id],
  }),
  applications: many(applications),
}));

export const applicationsRelations = relations(applications, ({ one }) => ({
  student: one(students, {
    fields: [applications.studentId],
    references: [students.id],
  }),
  job: one(jobPostings, {
    fields: [applications.jobId],
    references: [jobPostings.id],
  }),
}));

// analyticsRelations - REMOVED (unused)

// studentAnalyticsRelations - REMOVED (unused)

// resumeAnalysisRelations - REMOVED (unused)

// aiGeneratedContentRelations - REMOVED (unused - no queries use these relations)

// Student Interview Preparation Tables

// Student practice questions generated for interview preparation
export const studentPracticeQuestions = pgTable("student_practice_questions", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  questions: json("questions").notNull(), // Array of {question, category, difficulty, tips, sampleAnswer}
  jobTitle: text("job_title").notNull(),
  companyName: text("company_name").notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Student interview tips generated for specific applications
export const studentInterviewTips = pgTable("student_interview_tips", {
  id: uuid("id").primaryKey().defaultRandom(),
  applicationId: uuid("application_id")
    .notNull()
    .references(() => applications.id, { onDelete: "cascade" }),
  studentId: uuid("student_id")
    .notNull()
    .references(() => students.id, { onDelete: "cascade" }),
  tips: json("tips").notNull(), // {general: [], behavioral: [], technical: [], companySpecific: []}
  jobTitle: text("job_title").notNull(),
  companyName: text("company_name").notNull(),
  industry: text("industry"),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations for student interview preparation
export const studentPracticeQuestionsRelations = relations(
  studentPracticeQuestions,
  ({ one }) => ({
    application: one(applications, {
      fields: [studentPracticeQuestions.applicationId],
      references: [applications.id],
    }),
    student: one(students, {
      fields: [studentPracticeQuestions.studentId],
      references: [students.id],
    }),
  })
);

export const studentInterviewTipsRelations = relations(
  studentInterviewTips,
  ({ one }) => ({
    application: one(applications, {
      fields: [studentInterviewTips.applicationId],
      references: [applications.id],
    }),
    student: one(students, {
      fields: [studentInterviewTips.studentId],
      references: [students.id],
    }),
  })
);

// Transactions table - Payment records
export const transactions = pgTable("transactions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  tranId: text("tran_id").notNull().unique(), // PayWay transaction ID
  amount: real("amount").notNull(),
  currency: text("currency").notNull().default("KHR"),
  plan: text("plan"), // Subscription plan name (e.g., "basic", "pro", "growth", "enterprise")
  status: text("status", {
    enum: ["pending", "completed", "failed", "cancelled", "refunded"],
  })
    .notNull()
    .default("pending"),
  paymentStatus: text("payment_status"), // PayWay payment status code
  paymentStatusMessage: text("payment_status_message"),
  paymentAmount: real("payment_amount"), // Actual amount paid (may differ due to discounts)
  paymentCurrency: text("payment_currency"),
  transactionDate: timestamp("transaction_date"), // PayWay transaction date
  expiresAt: timestamp("expires_at"), // Subscription expiration date (1 month from payment)
  autoRenew: boolean("auto_renew").notNull().default(true), // Auto-renewal enabled
  nextBillingDate: timestamp("next_billing_date"), // Next billing date for auto-renewal
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  metadata: json("metadata"), // Additional PayWay response data
});

// Relations for transactions
export const transactionsRelations = relations(transactions, ({ one }) => ({
  user: one(users, {
    fields: [transactions.userId],
    references: [users.id],
  }),
}));

// Usage tracking table - tracks feature usage per user per month
export const usageTracking = pgTable("usage_tracking", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  feature: text("feature").notNull(), // e.g., "role_suggestion", "interview_prep", "ats_analyze", "resume_generate", "job_prediction", "alternative_role", "interview_questions"
  month: text("month").notNull(), // Format: "YYYY-MM" (e.g., "2025-01")
  count: integer("count").notNull().default(0), // Usage count for this month
  limit: integer("limit").notNull(), // Monthly limit based on plan
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Relations for usage tracking
export const usageTrackingRelations = relations(usageTracking, ({ one }) => ({
  user: one(users, {
    fields: [usageTracking.userId],
    references: [users.id],
  }),
}));

// =============================================
// ADMIN ANALYTICS TABLES
// =============================================

// Analytics events table - tracks all user actions for analytics
export const analyticsEvents = pgTable("analytics_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(), // e.g., "ai.ats_analysis", "job.created", "application.submitted"
  eventData: json("event_data"), // Additional event-specific data
  metadata: json("metadata"), // Browser, device, etc.
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Analytics aggregates table - pre-computed metrics for performance
export const analyticsAggregates = pgTable("analytics_aggregates", {
  id: uuid("id").primaryKey().defaultRandom(),
  metricType: text("metric_type").notNull(), // e.g., "daily_active_users", "feature_usage", "revenue"
  metricValue: real("metric_value").notNull(),
  dimension: json("dimension"), // e.g., { "feature": "ats_analysis", "plan": "pro" }
  period: text("period").notNull(), // e.g., "2025-12-14", "2025-12", "2025-W50"
  periodType: text("period_type", { enum: ["daily", "weekly", "monthly"] }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Admin actions table - audit log for admin operations
export const adminActions = pgTable("admin_actions", {
  id: uuid("id").primaryKey().defaultRandom(),
  adminId: uuid("admin_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  actionType: text("action_type").notNull(), // e.g., "user.update", "user.deactivate", "system.config"
  targetType: text("target_type"), // e.g., "user", "job", "company"
  targetId: uuid("target_id"), // ID of the affected resource
  details: json("details"), // Additional action details
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations for analytics events
export const analyticsEventsRelations = relations(analyticsEvents, ({ one }) => ({
  user: one(users, {
    fields: [analyticsEvents.userId],
    references: [users.id],
  }),
}));

// Relations for admin actions
export const adminActionsRelations = relations(adminActions, ({ one }) => ({
  admin: one(users, {
    fields: [adminActions.adminId],
    references: [users.id],
  }),
}));