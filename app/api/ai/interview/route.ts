import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import {
  applications, resumes, jobPostings, companies,
  interviewQuestions, aiGeneratedContent
} from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { generateJson } from '@/lib/gemini';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

type InterviewInput = {
  applicationId: string;
  generatedFrom?: 'resume' | 'job' | 'both';
  count?: number; // number of questions
};

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth.userId || auth.role !== 'company') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId, generatedFrom = 'both', count = 10 } = (await req.json()) as InterviewInput;
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

    const [resume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.studentId, appRow.studentId))
      .orderBy(desc(resumes.isPrimary), desc(resumes.updatedAt))
      .limit(1);

    const prompt = `
You are an interviewer. Generate ${count} targeted questions for an internship interview.
Use ${generatedFrom} as the source of truth.
Return JSON: { questions: Array<{ question: string; intent: string; difficulty: 'easy'|'medium'|'hard' }> }.

Job:
${JSON.stringify(job, null, 2)}

Resume:
${JSON.stringify(resume?.structuredContent || {}, null, 2)}
`;

    const result = await generateJson<{ questions: Array<{ question: string; intent: string; difficulty: string }> }>(prompt);

    const inserted = await db.insert(interviewQuestions).values({
      applicationId: appRow.id,
      companyId: company.id,
      questions: result.questions,
      generatedFrom,
      createdAt: new Date(),
    }).returning();

    // Optionally also save to applications.aiGeneratedQuestions for convenience
    try {
      await db.update(applications).set({
        aiGeneratedQuestions: result.questions,
        updatedAt: new Date(),
      }).where(eq(applications.id, appRow.id));
    } catch {}

    try {
      await db.insert(aiGeneratedContent).values({
        type: 'interview_questions',
        studentId: appRow.studentId,
        companyId: company.id,
        jobId: job.id,
        content: JSON.stringify(result),
        prompt,
        createdAt: new Date(),
      });
    } catch {}

    return NextResponse.json({ success: true, questions: inserted[0] });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Question generation failed';
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
  
      const list = await db.select().from(interviewQuestions)
        .where(eq(interviewQuestions.applicationId, applicationId))
        .orderBy(desc(interviewQuestions.createdAt));
  
      return NextResponse.json({ success: true, data: list });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch interview questions';
      return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
  }