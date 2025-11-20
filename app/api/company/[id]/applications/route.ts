import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  applications,
  students,
  users,
  jobPostings,
  companies,
} from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";

// GET - Fetch all applications for a company's jobs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = (await params).id; // This is the company's userId
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get("jobId");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Validate user ID format (should be UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid user ID format",
        },
        { status: 400 }
      );
    }

    // Verify company exists
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, userId))
      .limit(1);

    if (company.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Company not found",
        },
        { status: 404 }
      );
    }

    const companyData = company[0];

    // Build query conditions
    const conditions = [eq(jobPostings.companyId, companyData.id)];

    if (jobId) {
      conditions.push(eq(jobPostings.id, jobId));
    }

    if (status) {
      conditions.push(
        eq(
          applications.status,
          status as
            | "applied"
            | "shortlisted"
            | "rejected"
            | "interviewed"
            | "hired"
        )
      );
    }

    // Fetch applications with student and job details
    const applicationsList = await db
      .select({
        application: {
          id: applications.id,
          status: applications.status,
          coverLetter: applications.coverLetter,
          aiGeneratedQuestions: applications.aiGeneratedQuestions,
          appliedAt: applications.appliedAt,
          updatedAt: applications.updatedAt,
        },
        student: {
          id: students.id,
          firstName: students.firstName,
          lastName: students.lastName,
          gmail: students.gmail,
          phoneNumber: students.phoneNumber,
          location: students.location,
          university: students.university,
          major: students.major,
          graduationYear: students.graduationYear,
          gpa: students.gpa,
          resumeUrl: students.resumeUrl,
          careerInterest: students.careerInterest,
          aboutMe: students.aboutMe,
          createdAt: students.createdAt,
        },
        user: {
          email: users.email,
          isVerified: users.isVerified,
        },
        job: {
          id: jobPostings.id,
          jobTitle: jobPostings.jobTitle,
          jobDescription: jobPostings.jobDescription,
          status: jobPostings.status,
          location: jobPostings.location,
          jobType: jobPostings.jobType,
          experienceLevel: jobPostings.experienceLevel,
          createdAt: jobPostings.createdAt,
        },
      })
      .from(applications)
      .innerJoin(students, eq(applications.studentId, students.id))
      .innerJoin(users, eq(users.id, students.userId))
      .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
      .where(and(...conditions))
      .orderBy(desc(applications.appliedAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: applications.id })
      .from(applications)
      .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
      .where(and(...conditions));

    // Get application statistics
    const stats = await db
      .select({
        status: applications.status,
        count: count(applications.id),
      })
      .from(applications)
      .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
      .where(eq(jobPostings.companyId, companyData.id))
      .groupBy(applications.status);

    return NextResponse.json({
      success: true,
      data: {
        company: {
          id: companyData.id,
          companyName: companyData.companyName,
        },
        applications: applicationsList,
        statistics: stats,
        pagination: {
          total: totalCount.length,
          limit,
          offset,
          hasMore: totalCount.length > offset + limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching company applications:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch applications",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
