import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

// Force dynamic rendering
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  try {
    console.log("PDF GET request received:", {
      url: req.url,
      method: req.method,
      hasAuthHeader: !!req.headers.get("authorization"),
      hasTokenParam: !!req.nextUrl.searchParams.get("token"),
    });

    // Get token from Authorization header or query parameter (for iframe compatibility)
    const authHeader = req.headers.get("authorization");
    const tokenParam = req.nextUrl.searchParams.get("token");

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : tokenParam;

    if (!token) {
      console.error("No token found in request");
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    // Verify token
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
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (!student.resumeUrl) {
      return NextResponse.json(
        { error: "No resume uploaded" },
        { status: 404 }
      );
    }

    // Fetch PDF from Cloudinary
    console.log("Fetching PDF from Cloudinary URL:", student.resumeUrl);
    const res = await fetch(student.resumeUrl);

    if (!res.ok) {
      const errorText = await res.text().catch(() => "Unknown error");
      console.error("Failed to fetch PDF from Cloudinary:", {
        status: res.status,
        statusText: res.statusText,
        error: errorText.substring(0, 200),
      });
      return NextResponse.json(
        { error: `Failed to fetch PDF: ${res.status} ${res.statusText}` },
        { status: res.status }
      );
    }

    // Handle range requests for PDF.js
    const rangeHeader = req.headers.get("range");
    const buffer = await res.arrayBuffer();

    if (buffer.byteLength === 0) {
      console.error("PDF buffer is empty");
      return NextResponse.json({ error: "PDF file is empty" }, { status: 500 });
    }

    console.log("PDF fetched successfully, size:", buffer.byteLength, "bytes");

    // Convert ArrayBuffer to Buffer for NextResponse
    const pdfBuffer = Buffer.from(buffer);
    const fileSize = pdfBuffer.length;

    // Handle range requests (for PDF.js chunked loading)
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const chunk = pdfBuffer.slice(start, end + 1);

      console.log(`Range request: ${start}-${end}/${fileSize}`);

      return new NextResponse(chunk, {
        status: 206, // Partial Content
        headers: {
          "Content-Range": `bytes ${start}-${end}/${fileSize}`,
          "Accept-Ranges": "bytes",
          "Content-Length": chunkSize.toString(),
          "Content-Type": "application/pdf",
          "Cache-Control": "public, max-age=3600",
        },
      });
    }

    console.log("Returning full PDF response:", {
      size: pdfBuffer.length,
      contentType: "application/pdf",
    });

    const response = new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": 'inline; filename="resume.pdf"',
        "Content-Length": pdfBuffer.length.toString(),
        "Cache-Control": "public, max-age=3600",
        "Accept-Ranges": "bytes",
        "X-Content-Type-Options": "nosniff",
      },
    });

    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );
    return response;
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to fetch resume";
    console.error("PDF route error:", e);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function HEAD(req: NextRequest) {
  // Handle HEAD request for React PDF Viewer
  try {
    console.log("PDF HEAD request received:", {
      url: req.url,
      method: req.method,
    });

    const authHeader = req.headers.get("authorization");
    const tokenParam = req.nextUrl.searchParams.get("token");

    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.substring(7)
      : tokenParam;

    if (!token) {
      return new NextResponse(null, { status: 401 });
    }

    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch {
      return new NextResponse(null, { status: 401 });
    }

    if (decoded.role !== "student") {
      return new NextResponse(null, { status: 403 });
    }

    const [student] = await db
      .select({
        id: students.id,
        resumeUrl: students.resumeUrl,
      })
      .from(students)
      .where(eq(students.userId, decoded.userId))
      .limit(1);

    if (!student || !student.resumeUrl) {
      return new NextResponse(null, { status: 404 });
    }

    // Fetch PDF to get actual size (Cloudinary HEAD might not work reliably)
    try {
      const res = await fetch(student.resumeUrl);
      if (!res.ok) {
        return new NextResponse(null, { status: 404 });
      }

      // Get Content-Length from response headers, or fetch first chunk to determine size
      let contentLength = res.headers.get("content-length");

      if (!contentLength) {
        // If Content-Length not available, fetch first chunk to determine size
        const buffer = await res.arrayBuffer();
        contentLength = buffer.byteLength.toString();
      }

      console.log("HEAD response prepared with Content-Length:", contentLength);

      // Return HEAD response with PDF headers including Content-Length
      return new NextResponse(null, {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'inline; filename="resume.pdf"',
          "Content-Length": contentLength,
          "Cache-Control": "public, max-age=3600",
          "Accept-Ranges": "bytes",
        },
      });
    } catch (error) {
      console.error("Error fetching PDF for HEAD request:", error);
      return new NextResponse(null, { status: 500 });
    }
  } catch (error) {
    console.error("HEAD request error:", error);
    return new NextResponse(null, { status: 500 });
  }
}

export async function OPTIONS(_req: NextRequest) {
  // Handle CORS preflight requests
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}
