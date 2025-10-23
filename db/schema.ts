import { pgTable, uuid, text, timestamp, integer, real, json, boolean } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  role: text('role', { enum: ['student', 'company'] }).notNull(),
  // 2FA email verification
  isVerified: boolean('is_verified').notNull().default(false),
  verificationCode: text('verification_code'),
  verificationExpires: timestamp('verification_expires'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Students table
export const students = pgTable('students', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  gmail: text('gmail'),
  phoneNumber: text('phone_number'),
  location: text('location'),
  university: text('university'),
  major: text('major'),
  graduationYear: integer('graduation_year'),
  gpa: real('gpa'),
  resumeUrl: text('resume_url'),
  careerInterest: text('career_interest'),
  aboutMe: text('about_me'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Social links table
export const socialLinks = pgTable('social_links', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  linkedin: text('linkedin'),
  github: text('github'),
  website: text('website'),
});

// Skills table
export const skills = pgTable('skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
});

// Student skills junction table
export const studentSkills = pgTable('student_skills', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  skillId: uuid('skill_id').notNull().references(() => skills.id, { onDelete: 'cascade' }),
});

// Projects table
export const projects = pgTable('projects', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  projectName: text('project_name').notNull(),
  projectDescription: text('project_description'),
});

// Experiences table
export const experiences = pgTable('experiences', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  experienceTitle: text('experience_title').notNull(),
  experienceDescription: text('experience_description'),
});

// Companies table
export const companies = pgTable('companies', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  companyName: text('company_name').notNull(),
  industry: text('industry'),
  companySize: text('company_size'),
  website: text('website'),
  companyLogo: text('company_logo'),
  location: text('location'),
  description: text('description'),
  contactName: text('contact_name'),
  contactEmail: text('contact_email'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Job postings table
export const jobPostings = pgTable('job_postings', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').notNull().references(() => companies.id, { onDelete: 'cascade' }),
  jobTitle: text('job_title').notNull(),
  jobDescription: text('job_description').notNull(),
  status: text('status', { enum: ['open', 'closed', 'draft'] }).notNull().default('draft'),
  requirements: json('requirements'),
  benefits: json('benefits'),
  salaryRange: text('salary_range'),
  location: text('location'),
  jobType: text('job_type', { enum: ['full-time', 'part-time', 'internship', 'contract'] }),
  experienceLevel: text('experience_level', { enum: ['entry', 'mid', 'senior', 'executive'] }),
  aiGenerated: boolean('ai_generated').default(false),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Applications table
export const applications = pgTable('applications', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').notNull().references(() => jobPostings.id, { onDelete: 'cascade' }),
  status: text('status', { enum: ['applied', 'shortlisted', 'rejected', 'interviewed', 'hired'] }).notNull().default('applied'),
  aiGeneratedQuestions: json('ai_generated_questions'),
  coverLetter: text('cover_letter'),
  appliedAt: timestamp('applied_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Analytics table
export const analytics = pgTable('analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  totalJobs: integer('total_jobs').default(0),
  totalApplications: integer('total_applications').default(0),
  shortlisted: integer('shortlisted').default(0),
  rejected: integer('rejected').default(0),
  hired: integer('hired').default(0),
  topUniversities: json('top_universities'),
  popularSkills: json('popular_skills'),
  avgResponseTime: text('avg_response_time'),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// Student analytics table
export const studentAnalytics = pgTable('student_analytics', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  totalApplications: integer('total_applications').default(0),
  shortlisted: integer('shortlisted').default(0),
  interviewed: integer('interviewed').default(0),
  hired: integer('hired').default(0),
  rejected: integer('rejected').default(0),
  avgResponseTime: text('avg_response_time'),
  skillDemand: json('skill_demand'),
  marketInsights: json('market_insights'),
  lastUpdated: timestamp('last_updated').defaultNow().notNull(),
});

// Resume analysis table
export const resumeAnalysis = pgTable('resume_analysis', {
  id: uuid('id').primaryKey().defaultRandom(),
  studentId: uuid('student_id').notNull().references(() => students.id, { onDelete: 'cascade' }),
  atsScore: integer('ats_score'),
  keywordMatch: integer('keyword_match'),
  readability: integer('readability'),
  length: integer('length'),
  suggestions: json('suggestions'),
  analyzedAt: timestamp('analyzed_at').defaultNow().notNull(),
});

// AI generated content table
export const aiGeneratedContent = pgTable('ai_generated_content', {
  id: uuid('id').primaryKey().defaultRandom(),
  type: text('type', { enum: ['job_description', 'interview_questions', 'resume_suggestions', 'cover_letter'] }).notNull(),
  studentId: uuid('student_id').references(() => students.id, { onDelete: 'cascade' }),
  companyId: uuid('company_id').references(() => companies.id, { onDelete: 'cascade' }),
  jobId: uuid('job_id').references(() => jobPostings.id, { onDelete: 'cascade' }),
  content: text('content').notNull(),
  prompt: text('prompt'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Define relations
export const usersRelations = relations(users, ({ one, many }) => ({
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
  analytics: many(studentAnalytics),
  resumeAnalysis: many(resumeAnalysis),
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
  analytics: many(analytics),
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

export const analyticsRelations = relations(analytics, ({ one }) => ({
  company: one(companies, {
    fields: [analytics.companyId],
    references: [companies.id],
  }),
}));

export const studentAnalyticsRelations = relations(studentAnalytics, ({ one }) => ({
  student: one(students, {
    fields: [studentAnalytics.studentId],
    references: [students.id],
  }),
}));

export const resumeAnalysisRelations = relations(resumeAnalysis, ({ one }) => ({
  student: one(students, {
    fields: [resumeAnalysis.studentId],
    references: [students.id],
  }),
}));

export const aiGeneratedContentRelations = relations(aiGeneratedContent, ({ one }) => ({
  student: one(students, {
    fields: [aiGeneratedContent.studentId],
    references: [students.id],
  }),
  company: one(companies, {
    fields: [aiGeneratedContent.companyId],
    references: [companies.id],
  }),
  job: one(jobPostings, {
    fields: [aiGeneratedContent.jobId],
    references: [jobPostings.id],
  }),
}));
