import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  applications, students, resumes, jobPostings, companies,
  applicationAiReviews, aiGeneratedContent
} from '@/db/schema';
import { eq,  desc } from 'drizzle-orm';
import { generateJson } from '@/lib/gemini';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

type ReviewInput = {
  applicationId: string;
};

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth.userId || auth.role !== 'company') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId } = (await req.json()) as ReviewInput;
    const [appRow] = await db.select().from(applications).where(eq(applications.id, applicationId)).limit(1);
    if (!appRow) return NextResponse.json({ error: 'Application not found' }, { status: 404 });

    const [job] = await db.select().from(jobPostings).where(eq(jobPostings.id, appRow.jobId)).limit(1);
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const [company] = await db.select().from(companies).where(eq(companies.id, job.companyId)).limit(1);
    if (!company) return NextResponse.json({ error: 'Company not found' }, { status: 404 });

    // Verify current user belongs to this company
    const [meCompany] = await db.select().from(companies).where(eq(companies.userId, auth.userId)).limit(1);
    if (!meCompany || meCompany.id !== company.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const [student] = await db.select().from(students).where(eq(students.id, appRow.studentId)).limit(1);
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    // Pick the student's primary resume (or most recent)
    const [resume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.studentId, student.id))
      .orderBy(desc(resumes.isPrimary), desc(resumes.updatedAt))
      .limit(1);
    if (!resume) return NextResponse.json({ error: 'Resume not found for student' }, { status: 404 });

    const prompt = `
You are an AI recruiter. Given the job and candidate resume, evaluate fit.
Return JSON: {
  matchScore: number (0-100),
  matchedSkills: string[],
  missingSkills: string[],
  alternatives: Array<{ jobTitle: string; reason: string }>,
  summary: string
}

Job:
${JSON.stringify(job, null, 2)}

Resume:
${JSON.stringify(resume.structuredContent || {}, null, 2)}
`;

    const result = await generateJson<{
      matchScore: number;
      matchedSkills: string[];
      missingSkills: string[];
      alternatives: Array<{ jobTitle: string; reason: string }>;
      summary: string;
    }>(prompt);

    const inserted = await db.insert(applicationAiReviews).values({
      applicationId: appRow.id,
      companyId: company.id,
      matchScore: result.matchScore,
      matchedSkills: result.matchedSkills,
      missingSkills: result.missingSkills,
      alternatives: result.alternatives,
      summary: result.summary,
      analyzedAt: new Date(),
    }).returning();

    try {
      await db.insert(aiGeneratedContent).values({
        type: 'job_description',
        studentId: student.id,
        companyId: company.id,
        jobId: job.id,
        content: JSON.stringify(result),
        prompt,
        createdAt: new Date(),
      });
    } catch {}

    return NextResponse.json({ success: true, review: inserted[0] });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'AI review failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
export async function GET(req: NextRequest) {
    try {
      const auth = getAuthenticatedUser(req);
      if (!auth.userId || auth.role !== 'company') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { searchParams } = new URL(req.url);
      const applicationId = searchParams.get('applicationId');
      if (!applicationId) return NextResponse.json({ error: 'applicationId is required' }, { status: 400 });
  
      // Verify application belongs to this company
      const [row] = await db
        .select({ companyId: jobPostings.companyId })
        .from(applications)
        .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
        .where(eq(applications.id, applicationId))
        .limit(1);
      if (!row) return NextResponse.json({ error: 'Application not found' }, { status: 404 });
  
      const [meCompany] = await db.select().from(companies).where(eq(companies.userId, auth.userId)).limit(1);
      if (!meCompany || meCompany.id !== row.companyId) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
  
      const reviews = await db.select().from(applicationAiReviews)
        .where(eq(applicationAiReviews.applicationId, applicationId))
        .orderBy(desc(applicationAiReviews.analyzedAt));
  
      return NextResponse.json({ success: true, data: reviews });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch reviews';
      return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
  }