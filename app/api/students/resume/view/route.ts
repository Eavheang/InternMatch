import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

// GET: Proxy PDF from Cloudinary with proper headers to display inline
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
        { error: "Only students can view resumes" },
        { status: 403 }
      );
    }

    // Get student record with resumeUrl
    const [student] = await db
      .select({
        id: students.id,
        resumeUrl: students.resumeUrl,
      })
      .from(students)
      .where(eq(students.userId, decoded.userId))
      .limit(1);

    if (!student) {
      console.error("Student not found for userId:", decoded.userId);
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Check if student has a resume uploaded
    if (!student.resumeUrl) {
      console.error("No resumeUrl found for student:", student.id);
      return NextResponse.json(
        { error: "No resume uploaded" },
        { status: 404 }
      );
    }

    console.log(
      "Found resumeUrl for student:",
      student.id,
      "URL:",
      student.resumeUrl
    );

    // Fetch PDF from Cloudinary
    // Note: For raw files (PDFs), Cloudinary doesn't support fl_inline transformation
    // We'll use the original URL and set Content-Disposition: inline header ourselves
    const pdfUrl = student.resumeUrl;

    console.log("Fetching PDF from Cloudinary URL:", pdfUrl);

    const pdfResponse = await fetch(pdfUrl, {
      headers: {
        Accept: "application/pdf",
      },
    });

    if (!pdfResponse.ok) {
      const errorText = await pdfResponse.text().catch(() => "Unknown error");
      console.error("Failed to fetch PDF from Cloudinary:", {
        status: pdfResponse.status,
        statusText: pdfResponse.statusText,
        url: pdfUrl,
        error: errorText.substring(0, 200),
      });
      return NextResponse.json(
        {
          error: `Failed to fetch resume PDF from Cloudinary: ${pdfResponse.status} ${pdfResponse.statusText}`,
        },
        { status: pdfResponse.status >= 500 ? 500 : pdfResponse.status }
      );
    }

    // Get file buffer
    const arrayBuffer = await pdfResponse.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Detect file type from content
    const fileHeader = buffer.slice(0, 8).toString("ascii");
    const contentType = pdfResponse.headers.get("content-type") || "";

    console.log("File header:", fileHeader);
    console.log("Content-Type from Cloudinary:", contentType);

    // Determine file type
    let detectedType = "application/pdf";
    let detectedExtension = "pdf";

    if (fileHeader.startsWith("%PDF")) {
      detectedType = "application/pdf";
      detectedExtension = "pdf";
    } else if (fileHeader.startsWith("PK")) {
      // ZIP file (could be DOCX, XLSX, etc.)
      detectedType = "application/zip";
      detectedExtension = "zip";
    } else if (fileHeader.startsWith("PK\x03\x04")) {
      // Office Open XML (DOCX, XLSX, PPTX)
      detectedType =
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
      detectedExtension = "docx";
    } else if (fileHeader.includes("Microsoft Office")) {
      detectedType = "application/msword";
      detectedExtension = "doc";
    } else if (contentType.includes("image")) {
      detectedType = contentType;
      detectedExtension = contentType.split("/")[1] || "image";
    } else if (contentType.includes("text")) {
      detectedType = contentType;
      detectedExtension = "txt";
    } else {
      // Use content type from Cloudinary if available
      if (contentType) {
        detectedType = contentType;
        detectedExtension = contentType.split("/")[1]?.split(";")[0] || "file";
      }
    }

    console.log(
      "Detected file type:",
      detectedType,
      "Extension:",
      detectedExtension
    );

    // Return file with proper headers to display inline
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": detectedType,
        "Content-Disposition": `inline; filename=resume.${detectedExtension}`,
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to fetch resume";
    console.error("Resume view error:", e);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
