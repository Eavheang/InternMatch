import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students, resumes, resumeAtsAnalysis } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";
import { generateJson } from "@/lib/openai";

// Ensure this runs in Node.js runtime (required for pdf2json)
export const runtime = "nodejs";

// Dynamic import for pdf2json (CommonJS module)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let PDFParser: any;
async function getPDFParser() {
  if (!PDFParser) {
    const pdf2jsonModule = await import("pdf2json");
    PDFParser = pdf2jsonModule.default || pdf2jsonModule;
  }
  return PDFParser;
}

// GET: Fetch the latest analysis for the student's uploaded resume
export async function GET(req: NextRequest) {
  try {
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

    if (decoded.role !== "student") {
      return NextResponse.json(
        { error: "Only students can access this endpoint" },
        { status: 403 }
      );
    }

    // Get student record
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.userId, decoded.userId))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!student.resumeUrl) {
      return NextResponse.json(
        { success: true, analysis: null },
        { status: 200 }
      );
    }

    // Find or create a resume record for the uploaded PDF
    let resume = await db
      .select()
      .from(resumes)
      .where(
        and(
          eq(resumes.studentId, student.id),
          eq(resumes.fileUrl, student.resumeUrl)
        )
      )
      .limit(1)
      .then((results) => results[0] || null);

    // If no resume record exists, create one
    if (!resume) {
      const [newResume] = await db
        .insert(resumes)
        .values({
          studentId: student.id,
          title: "Uploaded Resume",
          fileUrl: student.resumeUrl,
          publicUrl: student.resumeUrl,
          isPrimary: true,
        })
        .returning();
      resume = newResume;
    }

    // Get the latest analysis for this resume
    const [analysis] = await db
      .select()
      .from(resumeAtsAnalysis)
      .where(eq(resumeAtsAnalysis.resumeId, resume.id))
      .orderBy(desc(resumeAtsAnalysis.analyzedAt))
      .limit(1);

    if (!analysis) {
      return NextResponse.json(
        { success: true, analysis: null },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        atsScore: analysis.atsScore,
        keywordMatch: analysis.keywordMatch,
        readability: analysis.readability,
        length: analysis.length,
        suggestions: analysis.suggestions,
        missingKeywords: analysis.missingKeywords,
        analyzedAt: analysis.analyzedAt,
      },
    });
  } catch (error) {
    console.error("Error fetching resume analysis:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch analysis" },
      { status: 500 }
    );
  }
}

// POST: Analyze the student's uploaded resume PDF
export async function POST(req: NextRequest) {
  try {
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

    if (decoded.role !== "student") {
      return NextResponse.json(
        { error: "Only students can analyze resumes" },
        { status: 403 }
      );
    }

    // Check usage limit for ATS analyze
    const { checkUsageLimit } = await import("@/lib/usage-tracking");
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

    // Get student record
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.userId, decoded.userId))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!student.resumeUrl) {
      return NextResponse.json(
        { error: "No resume uploaded. Please upload a resume first." },
        { status: 400 }
      );
    }

    // Fetch PDF from Cloudinary
    const pdfResponse = await fetch(student.resumeUrl);
    if (!pdfResponse.ok) {
      return NextResponse.json(
        { error: "Failed to fetch resume PDF" },
        { status: 500 }
      );
    }

    const pdfBuffer = Buffer.from(await pdfResponse.arrayBuffer());

    // Parse PDF to extract text
    const PDFParserClass = await getPDFParser();
    const pdfParser = new PDFParserClass(null, 1);
    const pdfText = await new Promise<string>((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error("PDF parsing timeout"));
      }, 30000); // 30 second timeout

      pdfParser.on("pdfParser_dataError", (err: Error) => {
        clearTimeout(timeout);
        reject(err);
      });
      pdfParser.on("pdfParser_dataReady", (pdfData: unknown) => {
        clearTimeout(timeout);
        let text = "";
        if (pdfData && typeof pdfData === "object" && "Pages" in pdfData) {
          for (const page of (pdfData as { Pages: unknown[] }).Pages) {
            if (page && typeof page === "object" && "Texts" in page) {
              for (const textItem of (page as { Texts: unknown[] }).Texts) {
                if (
                  textItem &&
                  typeof textItem === "object" &&
                  "R" in textItem
                ) {
                  for (const r of (textItem as { R: unknown[] }).R) {
                    if (r && typeof r === "object" && "T" in r) {
                      text += decodeURIComponent((r as { T: string }).T) + " ";
                    }
                  }
                }
              }
            }
          }
        }
        resolve(text.trim());
      });
      try {
        pdfParser.parseBuffer(pdfBuffer);
      } catch (err) {
        clearTimeout(timeout);
        reject(err);
      }
    });

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 400 }
      );
    }

    // Use AI to analyze the resume
    const prompt = `
You are an expert Resume ATS Optimizer. Analyze the following resume text and provide a score and specific improvements.

Return JSON with this structure:
{
  "atsScore": number (0-100),
  "keywordMatch": number (0-100),
  "readability": number (0-100),
  "structureScore": number (0-100),
  "length": number (approximate word count),
  "summary": "string (brief overview)",
  "missingKeywords": ["string"],
  "suggestions": [
    { "field": "string (e.g., Summary, Experience)", "advice": "string" }
  ]
}

Resume Text:
${pdfText.substring(0, 8000)}${pdfText.length > 8000 ? "..." : ""}
`;

    const aiResult = await generateJson<{
      atsScore: number;
      keywordMatch: number;
      readability: number;
      structureScore: number;
      length: number;
      missingKeywords: string[];
      suggestions: Array<{ field: string; advice: string }>;
      summary: string;
    }>(prompt);

    // Find or create a resume record for the uploaded PDF
    let resume = await db
      .select()
      .from(resumes)
      .where(
        and(
          eq(resumes.studentId, student.id),
          eq(resumes.fileUrl, student.resumeUrl)
        )
      )
      .limit(1)
      .then((results) => results[0] || null);

    // If no resume record exists, create one
    if (!resume) {
      const [newResume] = await db
        .insert(resumes)
        .values({
          studentId: student.id,
          title: "Uploaded Resume",
          fileUrl: student.resumeUrl,
          publicUrl: student.resumeUrl,
          isPrimary: true,
        })
        .returning();
      resume = newResume;
    }

    // Store the analysis
    const [analysis] = await db
      .insert(resumeAtsAnalysis)
      .values({
        resumeId: resume.id,
        atsScore: aiResult.atsScore,
        keywordMatch: aiResult.keywordMatch,
        readability: aiResult.readability,
        length: aiResult.length,
        suggestions: aiResult.suggestions,
        missingKeywords: aiResult.missingKeywords,
        analyzedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      analysis: {
        id: analysis.id,
        atsScore: analysis.atsScore,
        keywordMatch: analysis.keywordMatch,
        readability: analysis.readability,
        length: analysis.length,
        suggestions: analysis.suggestions,
        missingKeywords: analysis.missingKeywords,
        analyzedAt: analysis.analyzedAt,
      },
    });
  } catch (error) {
    console.error("Error analyzing resume:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to analyze resume";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
