import { NextRequest, NextResponse } from "next/server";
import { generateJson } from "@/lib/openai";
import { verifyToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    // Verify token - REQUIRED for rate limiting
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

    if (decoded.role !== "student") {
      return NextResponse.json(
        { error: "Only students can analyze resumes" },
        { status: 403 }
      );
    }

    // Check usage limit for ATS analyze
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
    console.log("[Usage Increment] ats_analyze (resume/analyze) incremented - current usage:", usageCheck.current + 1, "/", usageCheck.limit);

    const body = await req.json();
    const { resumeData } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert Resume ATS Optimizer. Analyze the following resume data and provide a score and specific improvements.
The user is currently building this resume, so provide actionable feedback to help them improve it right now.

Return JSON with this structure:
{
  "atsScore": number (0-100),
  "keywordMatch": number (0-100),
  "readability": number (0-100),
  "structureScore": number (0-100),
  "summary": "string (brief overview)",
  "missingKeywords": ["string"],
  "suggestions": [
    { "field": "string (e.g., Summary, Experience)", "advice": "string" }
  ]
}

Resume Data:
${JSON.stringify(resumeData, null, 2)}
`;

    const result = await generateJson<{
      atsScore: number;
      keywordMatch: number;
      readability: number;
      structureScore: number;
      missingKeywords: string[];
      suggestions: Array<{ field: string; advice: string }>;
      summary: string;
    }>(prompt);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (e: unknown) {
    console.error("Resume Analysis API Error:", e);
    const errorMessage = e instanceof Error ? e.message : "Analysis failed";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
