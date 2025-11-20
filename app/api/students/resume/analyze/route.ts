import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students, resumeAnalysis } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";
import { generateJson } from "@/lib/openai";

// POST: Analyze uploaded resume PDF and store ATS score
export async function POST(req: NextRequest) {
  try {
    // Verify token
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
        { error: "Only students can analyze resumes" },
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

    // Check if student has a resume uploaded
    if (!student.resumeUrl) {
      return NextResponse.json(
        { error: "No resume uploaded. Please upload a resume first." },
        { status: 400 }
      );
    }

    // Fetch PDF from Cloudinary URL
    let pdfBuffer: Buffer;
    try {
      // Fetch with broader Accept header to handle Cloudinary responses
      const pdfResponse = await fetch(student.resumeUrl, {
        headers: {
          Accept: "application/pdf, application/octet-stream, */*",
        },
      });

      if (!pdfResponse.ok) {
        throw new Error(
          `Failed to fetch resume PDF: ${pdfResponse.status} ${pdfResponse.statusText}`
        );
      }

      // Log content type for debugging
      const contentType = pdfResponse.headers.get("content-type") || "";
      console.log("PDF Content-Type from Cloudinary:", contentType);

      // Get the response as array buffer
      const arrayBuffer = await pdfResponse.arrayBuffer();
      pdfBuffer = Buffer.from(arrayBuffer);

      // Validate PDF by checking magic number (%PDF)
      if (pdfBuffer.length < 4) {
        throw new Error("File is too small to be a valid PDF");
      }

      const pdfHeader = pdfBuffer.slice(0, 4).toString("ascii");
      if (pdfHeader !== "%PDF") {
        console.error(
          "Invalid PDF header:",
          pdfHeader,
          "First 20 bytes:",
          pdfBuffer.slice(0, 20).toString("hex")
        );
        return NextResponse.json(
          {
            error:
              "The file does not appear to be a valid PDF. Please ensure the resume was uploaded correctly.",
          },
          { status: 400 }
        );
      }

      console.log(
        `Successfully fetched PDF (${pdfBuffer.length} bytes, header: ${pdfHeader})`
      );
    } catch (error) {
      console.error("Error fetching PDF:", error);
      return NextResponse.json(
        {
          error: `Failed to fetch resume PDF: ${error instanceof Error ? error.message : "Unknown error"}`,
        },
        { status: 500 }
      );
    }

    // Extract text from PDF using pdf2json (pure Node.js, no browser APIs)
    let resumeText: string;
    try {
      // Use pdf2json for Node.js environment (no browser dependencies)
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const PDFParser = require("pdf2json");

      // Create parser instance
      const pdfParser = new PDFParser(null, 1);

      // Parse PDF buffer
      const parsePromise = new Promise<string>((resolve, reject) => {
        pdfParser.on(
          "pdfParser_dataError",
          (errData: { parserError: Error }) => {
            reject(
              new Error(`PDF parsing error: ${errData.parserError.message}`)
            );
          }
        );

        pdfParser.on(
          "pdfParser_dataReady",
          (pdfData: {
            Pages: Array<{ Texts: Array<{ R: Array<{ T: string }> }> }>;
          }) => {
            try {
              // Extract text from all pages
              const textParts: string[] = [];

              if (pdfData && pdfData.Pages) {
                for (const page of pdfData.Pages) {
                  if (page.Texts) {
                    const pageTexts: string[] = [];
                    for (const textObj of page.Texts) {
                      if (textObj.R && Array.isArray(textObj.R)) {
                        for (const run of textObj.R) {
                          if (run.T) {
                            // Decode URI component if needed
                            try {
                              pageTexts.push(decodeURIComponent(run.T));
                            } catch {
                              pageTexts.push(run.T);
                            }
                          }
                        }
                      }
                    }
                    textParts.push(pageTexts.join(" "));
                  }
                }
              }

              const extractedText = textParts.join("\n\n");
              resolve(extractedText);
            } catch (err) {
              reject(
                err instanceof Error
                  ? err
                  : new Error("Failed to extract text from parsed PDF")
              );
            }
          }
        );

        // Parse the buffer
        pdfParser.parseBuffer(pdfBuffer);
      });

      resumeText = await parsePromise;

      if (!resumeText || resumeText.trim().length === 0) {
        return NextResponse.json(
          {
            error:
              "Could not extract text from PDF. Please ensure the PDF contains readable text.",
          },
          { status: 400 }
        );
      }
    } catch (error) {
      console.error("PDF parsing error:", error);
      return NextResponse.json(
        {
          error: `Failed to parse PDF: ${error instanceof Error ? error.message : "Unknown error"}. Please ensure it's a valid PDF file.`,
        },
        { status: 500 }
      );
    }

    // Analyze resume using AI
    const prompt = `
You are an expert Resume ATS Optimizer. Analyze the following resume text extracted from a PDF and provide a comprehensive ATS score and feedback.

Return JSON with this structure:
{
  "atsScore": number (0-100),
  "keywordMatch": number (0-100),
  "readability": number (0-100),
  "length": number (word count),
  "summary": "string (brief overview of the resume quality)",
  "missingKeywords": ["string"] (common keywords that might be missing),
  "suggestions": [
    { "field": "string (e.g., Summary, Experience, Skills)", "advice": "string" }
  ]
}

Resume Text:
${resumeText}
`;

    const analysisResult = await generateJson<{
      atsScore: number;
      keywordMatch: number;
      readability: number;
      length: number;
      summary: string;
      missingKeywords: string[];
      suggestions: Array<{ field: string; advice: string }>;
    }>(prompt);

    // Store analysis in database
    const [savedAnalysis] = await db
      .insert(resumeAnalysis)
      .values({
        studentId: student.id,
        atsScore: analysisResult.atsScore,
        keywordMatch: analysisResult.keywordMatch,
        readability: analysisResult.readability,
        length: analysisResult.length,
        suggestions: analysisResult.suggestions,
        analyzedAt: new Date(),
      })
      .returning();

    return NextResponse.json({
      success: true,
      analysis: savedAnalysis,
      data: analysisResult,
    });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to analyze resume";
    console.error("Resume analysis error:", e);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}

// GET: Fetch stored ATS analysis for the student
export async function GET(req: NextRequest) {
  try {
    // Verify token
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
        { error: "Only students can view resume analysis" },
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

    // Fetch latest analysis
    const analyses = await db
      .select()
      .from(resumeAnalysis)
      .where(eq(resumeAnalysis.studentId, student.id))
      .orderBy(desc(resumeAnalysis.analyzedAt))
      .limit(1);

    if (analyses.length === 0) {
      return NextResponse.json({
        success: true,
        analysis: null,
        message: "No analysis found. Please analyze your resume first.",
      });
    }

    return NextResponse.json({
      success: true,
      analysis: analyses[0],
    });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to fetch resume analysis";
    console.error("Fetch analysis error:", e);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
