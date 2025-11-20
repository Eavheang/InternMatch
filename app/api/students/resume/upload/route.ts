import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";
import { uploadResumeToCloudinary } from "@/lib/cloudinary";

// POST: Upload resume file to Cloudinary and save URL to student profile
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
        { error: "Only students can upload resumes" },
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

    // Parse FormData
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 10MB" },
        { status: 400 }
      );
    }

    // Upload to Cloudinary
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const fileName = file.name.replace(/\.pdf$/i, "") || "resume";

    let cloudinaryUrl: string;
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

    // Update student's resumeUrl in database
    await db
      .update(students)
      .set({ resumeUrl: cloudinaryUrl })
      .where(eq(students.id, student.id));

    return NextResponse.json({
      success: true,
      resumeUrl: cloudinaryUrl,
      message: "Resume uploaded successfully",
    });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to upload resume";
    console.error("Resume upload error:", e);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
