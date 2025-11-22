-- Student Interview Preparation Tables
-- Add these to your existing schema.ts file

-- Student practice questions generated for interview preparation
CREATE TABLE IF NOT EXISTS student_practice_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  questions JSONB NOT NULL, -- Array of {question, category, difficulty, tips, sampleAnswer}
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  generated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Student interview tips generated for specific applications
CREATE TABLE IF NOT EXISTS student_interview_tips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  tips JSONB NOT NULL, -- {general: [], behavioral: [], technical: [], companySpecific: []}
  job_title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  industry TEXT,
  generated_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_practice_questions_application ON student_practice_questions(application_id);
CREATE INDEX IF NOT EXISTS idx_student_practice_questions_student ON student_practice_questions(student_id);
CREATE INDEX IF NOT EXISTS idx_student_interview_tips_application ON student_interview_tips(application_id);
CREATE INDEX IF NOT EXISTS idx_student_interview_tips_student ON student_interview_tips(student_id);

-- Unique constraints to prevent duplicates
ALTER TABLE student_practice_questions ADD CONSTRAINT unique_practice_questions_per_application 
  UNIQUE (application_id);
ALTER TABLE student_interview_tips ADD CONSTRAINT unique_interview_tips_per_application 
  UNIQUE (application_id);
