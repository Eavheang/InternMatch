import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, students } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

// GET - Fetch list of students (for companies to browse)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const _university = searchParams.get("university");
    const _major = searchParams.get("major");
    const _skills = searchParams.get("skills");

    const offset = (page - 1) * limit;

    // Build query conditions
    const query = db
      .select({
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        university: students.university,
        major: students.major,
        graduationYear: students.graduationYear,
        location: students.location,
        careerInterest: students.careerInterest,
        isVerified: users.isVerified,
        createdAt: students.createdAt,
      })
      .from(students)
      .innerJoin(users, eq(users.id, students.userId))
      .where(eq(users.isVerified, true)) // Only show verified students
      .orderBy(desc(students.createdAt))
      .limit(limit)
      .offset(offset);

    const studentsList = await query;

    return NextResponse.json(
      {
        success: true,
        data: studentsList,
        pagination: {
          page,
          limit,
          total: studentsList.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Students list fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
