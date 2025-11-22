import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  applications,
  students,
  users,
  jobPostings,
  companies,
} from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

// GET - Fetch all applications for a student
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from middleware
    const user = getAuthenticatedUser(request);

    // Verify user is authenticated
    if (!user.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Verify user is a student
    if (user.role !== "student") {
      return NextResponse.json(
        { error: "Only students can view their applications" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Find student by authenticated user ID
    const student = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.userId, user.userId))
      .limit(1);

    if (student.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Student profile not found",
        },
        { status: 404 }
      );
    }

    const studentId = student[0].id;

    // Build query conditions
    const conditions = [eq(applications.studentId, studentId)];

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

    // Fetch applications with job and company details
    const applicationsList = await db
      .select({
        // Application details
        id: applications.id,
        status: applications.status,
        coverLetter: applications.coverLetter,
        appliedAt: applications.appliedAt,
        updatedAt: applications.updatedAt,
        
        // Job details
        jobId: jobPostings.id,
        jobTitle: jobPostings.jobTitle,
        jobDescription: jobPostings.jobDescription,
        jobStatus: jobPostings.status,
        requirements: jobPostings.requirements,
        benefits: jobPostings.benefits,
        salaryRange: jobPostings.salaryRange,
        location: jobPostings.location,
        jobType: jobPostings.jobType,
        experienceLevel: jobPostings.experienceLevel,
        aiGenerated: jobPostings.aiGenerated,
        jobCreatedAt: jobPostings.createdAt,
        
        // Company details
        companyId: companies.id,
        companyName: companies.companyName,
        industry: companies.industry,
        companySize: companies.companySize,
        website: companies.website,
        companyLogo: companies.companyLogo,
        companyLocation: companies.location,
        companyDescription: companies.description,
        contactName: companies.contactName,
        contactEmail: companies.contactEmail,
      })
      .from(applications)
      .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .where(and(...conditions))
      .orderBy(desc(applications.appliedAt))
      .limit(limit)
      .offset(offset);

    // Transform the results to match expected structure
    const transformedApplications = applicationsList.map((app) => ({
      application: {
        id: app.id,
        status: app.status,
        coverLetter: app.coverLetter,
        appliedAt: app.appliedAt,
        updatedAt: app.updatedAt,
      },
      job: {
        id: app.jobId,
        jobTitle: app.jobTitle,
        jobDescription: app.jobDescription,
        status: app.jobStatus,
        requirements: app.requirements,
        benefits: app.benefits,
        salaryRange: app.salaryRange,
        location: app.location,
        jobType: app.jobType,
        experienceLevel: app.experienceLevel,
        aiGenerated: app.aiGenerated,
        createdAt: app.jobCreatedAt,
      },
      company: {
        id: app.companyId,
        companyName: app.companyName,
        industry: app.industry,
        companySize: app.companySize,
        website: app.website,
        companyLogo: app.companyLogo,
        companyLocation: app.companyLocation,
        description: app.companyDescription,
        contactName: app.contactName,
        contactEmail: app.contactEmail,
      },
    }));

    // Get statistics
    const totalApplications = applicationsList.length;
    const statusCounts = applicationsList.reduce((acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return NextResponse.json({
      success: true,
      data: {
        applications: transformedApplications,
        statistics: {
          total: totalApplications,
          applied: statusCounts.applied || 0,
          shortlisted: statusCounts.shortlisted || 0,
          interviewed: statusCounts.interviewed || 0,
          hired: statusCounts.hired || 0,
          rejected: statusCounts.rejected || 0,
        },
        pagination: {
          limit,
          offset,
          total: totalApplications,
          hasMore: totalApplications === limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching student applications:", error);
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
