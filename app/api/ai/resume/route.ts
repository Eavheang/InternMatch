import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { resumes, students, aiGeneratedContent } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { model, generateJson } from '@/lib/gemini';
import { getAuthenticatedUser } from '@/lib/auth-helpers';

type BuildResumeInput = {
  title?: string;
  sections: {
    summary?: string;
    education?: Array<{ school: string; degree: string; start?: string; end?: string; details?: string[] }>;
    experience?: Array<{ company: string; role: string; start?: string; end?: string; bullets?: string[] }>;
    projects?: Array<{ name: string; description?: string; bullets?: string[] }>;
    skills?: string[];
  };
  exportPdfUrl?: string; // if your app already exported a PDF
  makePrimary?: boolean;
};

// POST: Build or improve a resume
export async function POST(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth.userId || auth.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as BuildResumeInput;
    const [student] = await db.select().from(students).where(eq(students.userId, auth.userId)).limit(1);
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    // Prompt Gemini to normalize/upgrade resume content (keeps structure)
    const prompt = `
You are a resume builder. Improve and normalize the following resume data for an internship application.
Ensure concise, bullet-driven achievements with metrics where possible.
Return JSON with keys: title, structuredContent {summary, education, experience, projects, skills}.

Input:
${JSON.stringify(body, null, 2)}
`;
    const aiResult = await generateJson<{
      title?: string;
      structuredContent: BuildResumeInput['sections'];
    }>(prompt);

    const inserted = await db.insert(resumes).values({
      studentId: student.id,
      title: aiResult.title || body.title || 'Resume',
      structuredContent: aiResult.structuredContent || body.sections,
      fileUrl: body.exportPdfUrl || null,
      publicUrl: null,
      isPrimary: !!body.makePrimary,
      createdAt: new Date(),
      updatedAt: new Date(),
    }).returning();

    // Persist raw AI content if you keep this table
    try {
      await db.insert(aiGeneratedContent).values({
        type: 'resume_suggestions',
        studentId: student.id,
        companyId: null,
        jobId: null,
        content: JSON.stringify(aiResult),
        prompt,
        createdAt: new Date(),
      });
    } catch {}

    // If makePrimary, unset others
    if (body.makePrimary) {
      await db.update(resumes)
        .set({ isPrimary: false })
        .where(eq(resumes.studentId, student.id));
      await db.update(resumes)
        .set({ isPrimary: true })
        .where(eq(resumes.id, inserted[0].id));
    }

    return NextResponse.json({ success: true, resume: inserted[0] });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to build resume' }, { status: 500 });
  }
}

// GET: Retrieve all resumes for the authenticated student
export async function GET(req: NextRequest) {
  try {
    const auth = getAuthenticatedUser(req);
    if (!auth.userId || auth.role !== 'student') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Find the studentId for the logged in user
    const [student] = await db.select().from(students).where(eq(students.userId, auth.userId)).limit(1);
    if (!student) return NextResponse.json({ error: 'Student not found' }, { status: 404 });

    // Get all resumes for the student
    const resumeList = await db
      .select()
      .from(resumes)
      .where(eq(resumes.studentId, student.id));

    return NextResponse.json({ success: true, resumes: resumeList });
  } catch (e: any) {
    return NextResponse.json({ success: false, error: e?.message || 'Failed to fetch resumes' }, { status: 500 });
  }
}