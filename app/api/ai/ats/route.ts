import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { generateJson } from "@/lib/openai";
import { verifyToken } from "@/lib/auth";
import {
  resumes,
  jobPostings,
  resumeAtsAnalysis,
  aiGeneratedContent,
  students,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

type AtsInput = {
  resumeId?: string;
  resumeData?: Record<string, unknown>;
  jobId?: string;
  applicationId?: string;
};

export async function POST(req: NextRequest) {
  try {
    // Verify token directly
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    // Allow any authenticated user to use this endpoint
    if (!decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check usage limit for ATS analyze (students only)
    if (decoded.role === "student") {
      const { checkUsageLimit, incrementUsage } = await import("@/lib/usage-tracking");
      const usageCheck = await checkUsageLimit(
        decoded.userId,
        "ats_analyze",
        "student"
      );
      if (!usageCheck.allowed) {
        return NextResponse.json(
          { error: usageCheck.message || "Usage limit exceeded" },
          { status: 403 }
        );
      }
      // Increment usage for EVERY request
      await incrementUsage(decoded.userId, "ats_analyze", "student");
      console.log("[Usage Increment] ats_analyze incremented - current usage:", usageCheck.current + 1, "/", usageCheck.limit);
    }

    const { resumeId, resumeData, jobId, applicationId } =
      (await req.json()) as AtsInput;

    let resumeContent: Record<string, unknown> | null = null;
    let studentId: string | null = null;

    // Strategy 1: Use provided resumeData (transient analysis)
    if (resumeData) {
      resumeContent = resumeData;
      // Try to find student ID for logging purposes, but don't fail if not found (e.g. company analyzing)
      const [student] = await db
        .select()
        .from(students)
        .where(eq(students.userId, decoded.userId))
        .limit(1);
      if (student) studentId = student.id;
    }
    // Strategy 2: Fetch from DB using resumeId
    else if (resumeId) {
      const [resume] = await db
        .select()
        .from(resumes)
        .where(eq(resumes.id, resumeId))
        .limit(1);
      if (!resume)
        return NextResponse.json(
          { error: "Resume not found" },
          { status: 404 }
        );
      resumeContent = resume.structuredContent as Record<string, unknown>;
      studentId = resume.studentId;
    } else {
      return NextResponse.json(
        { error: "Either resumeId or resumeData is required" },
        { status: 400 }
      );
    }

    let job: { id?: string; [key: string]: unknown } | null = null;
    if (jobId) {
      const found = await db
        .select()
        .from(jobPostings)
        .where(eq(jobPostings.id, jobId))
        .limit(1);
      job = found[0] || null;
    }

    const prompt = `
You are an ATS evaluator. Score the resume against the job (if provided).
Return JSON: { atsScore (0-100), keywordMatch (0-100), readability (0-100), length (integer), missingKeywords: string[], suggestions: [{field, advice}], summary: string, structureScore: number }.

Resume:
${JSON.stringify(resumeContent || {}, null, 2)}

Job:
${JSON.stringify(job || {}, null, 2)}
`;

    const result = await generateJson<{
      atsScore: number;
      keywordMatch: number;
      readability: number;
      structureScore: number;
      length: number;
      missingKeywords: string[];
      suggestions: Array<{ field: string; advice: string }>;
      summary: string;
    }>(prompt);

    // If we have a resumeId, we can persist the analysis
    let analysisRecord: {
      id: string;
      resumeId: string;
      applicationId: string | null;
      jobId: string | null;
      atsScore: number | null;
      keywordMatch: number | null;
      readability: number | null;
      length: number | null;
      suggestions: unknown;
      missingKeywords: unknown;
      analyzedAt: Date;
    } | null = null;
    if (resumeId) {
      const inserted = await db
        .insert(resumeAtsAnalysis)
        .values({
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
        })
        .returning();
      analysisRecord = inserted.length > 0 ? inserted[0] : null;
    }

    // Log AI usage - only if we identified a student ID (optional)
    if (studentId) {
      try {
        await db.insert(aiGeneratedContent).values({
          type: "resume_suggestions",
          studentId: studentId,
          companyId: null,
          jobId: jobId || null,
          content: JSON.stringify(result),
          prompt,
          createdAt: new Date(),
        });
      } catch {}
    }

    return NextResponse.json({
      success: true,
      analysis: analysisRecord, // might be null if not saved
      data: result, // return the raw AI result for immediate display
    });
  } catch (e: unknown) {
    console.error("ATS API Error:", e); // Better error logging
    const errorMessage = e instanceof Error ? e.message : "ATS analysis failed";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    // Verify token directly
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    if (!decoded.userId || decoded.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get("resumeId");
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50", 10),
      100
    );
    const offset = Math.max(parseInt(searchParams.get("offset") || "0", 10), 0);

    // Resolve student by current user
    const [student] = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.userId, decoded.userId))
      .limit(1);
    if (!student)
      return NextResponse.json({ error: "Student not found" }, { status: 404 });

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
      pagination: { limit, offset, count: rows.length },
    });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to fetch ATS analyses";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
