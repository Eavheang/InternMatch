import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";
import { uploadStudentProfileImageToCloudinary } from "@/lib/cloudinary";

// POST: Upload student profile image to Cloudinary
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

    if (!decoded.userId || decoded.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get student profile
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.userId, decoded.userId))
      .limit(1);

    if (!student) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    // Get file from form data
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only JPG, PNG, and WebP images are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary
    const cloudinaryResult = await uploadStudentProfileImageToCloudinary(
      buffer,
      file.name.replace(/\.[^/.]+$/, ""), // Remove file extension
      student.id
    );

    const cloudinaryUrl = cloudinaryResult.secure_url;

    // Update student's profile image URL in database
    await db
      .update(students)
      .set({ profileImageUrl: cloudinaryUrl })
      .where(eq(students.id, student.id));

    return NextResponse.json({
      success: true,
      imageUrl: cloudinaryUrl,
      message: "Profile image uploaded successfully",
    });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to upload profile image";
    console.error("Profile image upload error:", e);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
