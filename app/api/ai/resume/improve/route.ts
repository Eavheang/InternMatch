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
        { error: "Only students can improve resumes" },
        { status: 403 }
      );
    }

    // Check usage limit for resume generation (improve counts as generation)
    const { checkUsageLimit, incrementUsage } = await import("@/lib/usage-tracking");
    const usageCheck = await checkUsageLimit(
      decoded.userId,
      "resume_generate",
      "student"
    );
    if (!usageCheck.allowed) {
      return NextResponse.json(
        { error: usageCheck.message || "Usage limit exceeded" },
        { status: 403 }
      );
    }
    // Increment usage for EVERY request
    await incrementUsage(decoded.userId, "resume_generate", "student");
    console.log("[Usage Increment] resume_generate (resume/improve) incremented - current usage:", usageCheck.current + 1, "/", usageCheck.limit);

    const body = await req.json();
    const { resumeData, suggestions } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: "Resume data is required" },
        { status: 400 }
      );
    }

    if (
      !suggestions ||
      !Array.isArray(suggestions) ||
      suggestions.length === 0
    ) {
      return NextResponse.json(
        { error: "Suggestions are required" },
        { status: 400 }
      );
    }

    const prompt = `
You are an expert Resume Optimizer. Improve the following resume based on the specific suggestions provided.
Apply the improvements directly to the resume data structure while maintaining the existing format and structure.

Current Resume Data:
${JSON.stringify(resumeData, null, 2)}

Improvement Suggestions:
${suggestions.map((s: string, i: number) => `${i + 1}. ${s}`).join("\n")}

Return the improved resume data in the EXACT same JSON structure as the input, with all improvements applied.
Make sure to:
- Enhance the summary if suggestions mention it
- Improve experience bullet points with metrics and action verbs if suggested
- Add missing keywords to skills or experience if suggested
- Enhance education details if suggested
- Fix any formatting or content issues mentioned

Return ONLY the improved ResumeData JSON object with no additional explanation or markdown formatting.
`;

    const result = await generateJson<{
      personalInfo: {
        fullName: string;
        title: string;
        email: string;
        phone: string;
        location: string;
        linkedin?: string;
        github?: string;
        website?: string;
      };
      summary: string;
      education: Array<{
        id: string;
        school: string;
        degree: string;
        start: string;
        end: string;
        details: string;
      }>;
      experience: Array<{
        id: string;
        company: string;
        role: string;
        start: string;
        end: string;
        bullets: string[];
      }>;
      skills: string[];
    }>(prompt);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (e: unknown) {
    console.error("Resume Improve API Error:", e);
    const errorMessage = e instanceof Error ? e.message : "Improvement failed";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
