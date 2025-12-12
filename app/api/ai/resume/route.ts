import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { resumes, students, aiGeneratedContent } from "@/db/schema";
import { eq } from "drizzle-orm";
import { generateJson } from "@/lib/openai";
import { verifyToken } from "@/lib/auth";
import { uploadResumeToCloudinary } from "@/lib/cloudinary";

type BuildResumeInput = {
  title?: string;
  sections: {
    summary?: string;
    education?: Array<{
      school: string;
      degree: string;
      start?: string;
      end?: string;
      details?: string[];
    }>;
    experience?: Array<{
      company: string;
      role: string;
      start?: string;
      end?: string;
      bullets?: string[];
    }>;
    projects?: Array<{
      name: string;
      description?: string;
      bullets?: string[];
    }>;
    skills?: string[];
  };
  exportPdfUrl?: string; // if your app already exported a PDF
  makePrimary?: boolean;
};

// POST: Build or improve a resume
export async function POST(req: NextRequest) {
  try {
    // Verify token directly (more reliable than middleware headers)
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

    // Check if user is a student
    if (decoded.role !== "student") {
      return NextResponse.json(
        { error: "Only students can upload resumes" },
        { status: 403 }
      );
    }

    // Check usage limit for resume generation
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
    console.log("[Usage Increment] resume_generate incremented - current usage:", usageCheck.current + 1, "/", usageCheck.limit);

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.userId, decoded.userId))
      .limit(1);
    if (!student)
      return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Check if request contains FormData (file upload) or JSON
    const contentType = req.headers.get("content-type") || "";
    let cloudinaryUrl: string | null = null;
    let body: BuildResumeInput;

    // Try to handle FormData first (for file uploads)
    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const resumeData = formData.get("resumeData") as string | null;

      if (!resumeData) {
        return NextResponse.json(
          { error: "Resume data is required" },
          { status: 400 }
        );
      }

      body = JSON.parse(resumeData) as BuildResumeInput;

      // Upload PDF to Cloudinary if file is provided
      if (file) {
        if (file.type !== "application/pdf") {
          return NextResponse.json(
            { error: "Only PDF files are allowed" },
            { status: 400 }
          );
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const fileName = file.name.replace(/\.pdf$/i, "") || "resume";

        try {
          const uploadResult = await uploadResumeToCloudinary(
            buffer,
            fileName,
            student.id
          );
          cloudinaryUrl = uploadResult.secure_url;
        } catch (uploadError) {
          console.error("Cloudinary upload error:", uploadError);
          return NextResponse.json(
            { error: "Failed to upload resume to Cloudinary" },
            { status: 500 }
          );
        }
      } else if (body.exportPdfUrl) {
        // Use existing URL if provided
        cloudinaryUrl = body.exportPdfUrl;
      }
    } else {
      // Handle JSON request (legacy support)
      body = (await req.json()) as BuildResumeInput;
      cloudinaryUrl = body.exportPdfUrl || null;
    }

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
      structuredContent: BuildResumeInput["sections"];
    }>(prompt);

    const inserted = await db
      .insert(resumes)
      .values({
        studentId: student.id,
        title: aiResult.title || body.title || "Resume",
        structuredContent: aiResult.structuredContent || body.sections,
        fileUrl: cloudinaryUrl, // Store Cloudinary URL here
        publicUrl: cloudinaryUrl, // Also store in publicUrl for easy access
        isPrimary: !!body.makePrimary,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Persist raw AI content if you keep this table
    try {
      await db.insert(aiGeneratedContent).values({
        type: "resume_suggestions",
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
      await db
        .update(resumes)
        .set({ isPrimary: false })
        .where(eq(resumes.studentId, student.id));
      await db
        .update(resumes)
        .set({ isPrimary: true })
        .where(eq(resumes.id, inserted[0].id));
    }

    return NextResponse.json({
      success: true,
      resume: inserted[0],
      cloudinaryUrl: cloudinaryUrl, // Return the Cloudinary URL
    });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to build resume";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// GET: Retrieve all resumes for the authenticated student
export async function GET(req: NextRequest) {
  try {
    // Verify token directly (more reliable than middleware headers)
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

    // Check if user is a student
    if (decoded.role !== "student") {
      return NextResponse.json(
        { error: "Only students can view resumes" },
        { status: 403 }
      );
    }

    // Find the studentId for the logged in user
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.userId, decoded.userId))
      .limit(1);
    if (!student)
      return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Get all resumes for the student
    const resumeList = await db
      .select()
      .from(resumes)
      .where(eq(resumes.studentId, student.id));

    return NextResponse.json({ success: true, resumes: resumeList });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to fetch resumes";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
