import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { generateJson } from '@/lib/gemini';
import { getAuthenticatedUser } from '@/lib/auth-helpers';
// add students
import { resumes, jobPostings, resumeAtsAnalysis, aiGeneratedContent, students } from '@/db/schema';
// add and, desc
import { eq, and, desc } from 'drizzle-orm';
type AtsInput = {
  resumeId: string;
  jobId?: string;
  applicationId?: string;
};

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth.userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { resumeId, jobId, applicationId } = (await req.json()) as AtsInput;
    const [resume] = await db.select().from(resumes).where(eq(resumes.id, resumeId)).limit(1);
    if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });

    let job: { id?: string; [key: string]: unknown } | null = null;
    if (jobId) {
      const found = await db.select().from(jobPostings).where(eq(jobPostings.id, jobId)).limit(1);
      job = found[0] || null;
    }

    const prompt = `
You are an ATS evaluator. Score the resume against the job (if provided).
Return JSON: { atsScore (0-100), keywordMatch (0-100), readability (0-100), length (integer), missingKeywords: string[], suggestions: [{field, advice}] }.

Resume:
${JSON.stringify(resume.structuredContent || {}, null, 2)}

Job:
${JSON.stringify(job || {}, null, 2)}
`;

    const result = await generateJson<{
      atsScore: number; keywordMatch: number; readability: number; length: number;
      missingKeywords: string[]; suggestions: Array<{ field: string; advice: string }>;
    }>(prompt);

    const inserted = await db.insert(resumeAtsAnalysis).values({
      resumeId,
      applicationId: applicationId || null,
      jobId: jobId || null,
      atsScore: result.atsScore,
      keywordMatch: result.keywordMatch,
      readability: result.readability,
      length: result.length,
      suggestions: result.suggestions,
      missingKeywords: result.missingKeywords,
      analyzedAt: new Date(),
    }).returning();

    try {
      await db.insert(aiGeneratedContent).values({
        type: 'resume_suggestions',
        studentId: resume.studentId,
        companyId: null,
        jobId: jobId || null,
        content: JSON.stringify(result),
        prompt,
        createdAt: new Date(),
      });
    } catch {}

    return NextResponse.json({ success: true, analysis: inserted[0] });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'ATS analysis failed';
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
    try {
      const auth = getAuthenticatedUser(req);
      if (!auth.userId || auth.role !== 'student') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
  
      const { searchParams } = new URL(req.url);
      const resumeId = searchParams.get('resumeId');
      const limit = Math.min(parseInt(searchParams.get('limit') || '50', 10), 100);
      const offset = Math.max(parseInt(searchParams.get('offset') || '0', 10), 0);
  
      // Resolve student by current user
      const [student] = await db.select({ id: students.id }).from(students).where(eq(students.userId, auth.userId)).limit(1);
      if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });
  
      // Join analyses with resumes to ensure ownership; optionally filter by resumeId
      const conditions = [eq(resumes.studentId, student.id)];
      if (resumeId) conditions.push(eq(resumeAtsAnalysis.resumeId, resumeId));
  
      const rows = await db
        .select({
          id: resumeAtsAnalysis.id,
          resumeId: resumeAtsAnalysis.resumeId,
          applicationId: resumeAtsAnalysis.applicationId,
          jobId: resumeAtsAnalysis.jobId,
          atsScore: resumeAtsAnalysis.atsScore,
          keywordMatch: resumeAtsAnalysis.keywordMatch,
          readability: resumeAtsAnalysis.readability,
          length: resumeAtsAnalysis.length,
          missingKeywords: resumeAtsAnalysis.missingKeywords,
          suggestions: resumeAtsAnalysis.suggestions,
          analyzedAt: resumeAtsAnalysis.analyzedAt,
        })
        .from(resumeAtsAnalysis)
        .innerJoin(resumes, eq(resumeAtsAnalysis.resumeId, resumes.id))
        .where(and(...conditions))
        .orderBy(desc(resumeAtsAnalysis.analyzedAt))
        .limit(limit)
        .offset(offset);
  
      return NextResponse.json({
        success: true,
        data: rows,
        pagination: { limit, offset, count: rows.length }
      });
    } catch (e: unknown) {
      const errorMessage = e instanceof Error ? e.message : 'Failed to fetch ATS analyses';
      return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
    }
  }