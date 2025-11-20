import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  applications,
  students,
  users,
  jobPostings,
  companies,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET - Fetch specific application details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    const userId = (await params).id;
    const applicationId = (await params).applicationId;

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

    // Fetch application with full details
    const applicationDetails = await db
      .select({
        application: applications,
        student: students,
        user: {
          email: users.email,
          isVerified: users.isVerified,
        },
        job: jobPostings,
        company: {
          companyName: companies.companyName,
        },
      })
      .from(applications)
      .innerJoin(students, eq(applications.studentId, students.id))
      .innerJoin(users, eq(users.id, students.userId))
      .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .where(
        and(eq(applications.id, applicationId), eq(companies.id, company[0].id))
      )
      .limit(1);

    if (applicationDetails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Application not found or does not belong to this company",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: applicationDetails[0],
    });
  } catch (error) {
    console.error("Error fetching application details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch application details",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update application status (shortlist, reject, interview, hire)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; applicationId: string }> }
) {
  try {
    const userId = (await params).id;
    const applicationId = (await params).applicationId;
    const body = await request.json();

    const { status, notes: _notes } = body;

    // Validate status
    const validStatuses = [
      "applied",
      "shortlisted",
      "rejected",
      "interviewed",
      "hired",
    ];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid status. Must be one of: applied, shortlisted, rejected, interviewed, hired",
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

    // Verify application exists and belongs to company
    const existingApplication = await db
      .select()
      .from(applications)
      .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
      .where(
        and(
          eq(applications.id, applicationId),
          eq(jobPostings.companyId, company[0].id)
        )
      )
      .limit(1);

    if (existingApplication.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Application not found or does not belong to this company",
        },
        { status: 404 }
      );
    }

    // Update application status
    const updatedApplication = await db
      .update(applications)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(applications.id, applicationId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedApplication[0],
      message: `Application status updated to ${status}`,
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update application status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
