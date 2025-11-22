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
import {
  sendApplicationAcceptanceEmail,
  sendApplicationRejectionEmail,
} from "@/lib/email";

// Add retry helper function
async function retryQuery<T>(
  queryFn: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await queryFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Check if it's a transient error (connection reset, timeout, etc.)
      const isTransientError =
        error instanceof Error &&
        (error.message.includes("ECONNRESET") ||
          error.message.includes("fetch failed") ||
          error.message.includes("timeout") ||
          error.message.includes("connection") ||
          (error as unknown as { code?: string }).code === "ECONNRESET");

      if (!isTransientError || attempt === maxRetries - 1) {
        throw error;
      }

      // Exponential backoff: wait longer between retries
      const waitTime = delay * Math.pow(2, attempt);
      console.warn(
        `Database query failed (attempt ${attempt + 1}/${maxRetries}), retrying in ${waitTime}ms...`,
        error instanceof Error ? error.message : String(error)
      );
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
  }

  throw lastError || new Error("Query failed after retries");
}

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

    // Verify company exists (with retry)
    const company = await retryQuery(async () => {
      return await db
        .select()
        .from(companies)
        .where(eq(companies.userId, userId))
        .limit(1);
    });

    if (company.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Company not found",
        },
        { status: 404 }
      );
    }

    // Verify application exists and belongs to company, and get full details (with retry)
    const existingApplication = await retryQuery(async () => {
      return await db
        .select({
          application: applications,
          student: students,
          studentUser: {
            email: users.email,
          },
          job: jobPostings,
          company: companies,
        })
        .from(applications)
        .innerJoin(students, eq(applications.studentId, students.id))
        .innerJoin(users, eq(students.userId, users.id))
        .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
        .innerJoin(companies, eq(jobPostings.companyId, companies.id))
        .where(
          and(
            eq(applications.id, applicationId),
            eq(jobPostings.companyId, company[0].id)
          )
        )
        .limit(1);
    });

    if (existingApplication.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Application not found or does not belong to this company",
        },
        { status: 404 }
      );
    }

    const appData = existingApplication[0];
    const oldStatus = appData.application.status;

    // Update application status (with retry)
    const updatedApplication = await retryQuery(async () => {
      return await db
        .update(applications)
        .set({
          status,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, applicationId))
        .returning();
    });

    // Send email notification to student based on status change
    try {
      // Only send email if status actually changed
      if (oldStatus !== status) {
        const studentName = `${appData.student.firstName} ${appData.student.lastName}`;
        const studentEmail = appData.studentUser.email;
        const companyName = appData.company.companyName;
        const jobTitle = appData.job.jobTitle;
        const jobId = appData.job.id;

        if (status === "rejected") {
          // Send rejection email
          await sendApplicationRejectionEmail(
            studentEmail,
            studentName,
            companyName,
            jobTitle,
            jobId
          );
        } else if (
          status === "shortlisted" ||
          status === "interviewed" ||
          status === "hired"
        ) {
          // Send acceptance email
          await sendApplicationAcceptanceEmail(
            studentEmail,
            studentName,
            companyName,
            jobTitle,
            status as "shortlisted" | "interviewed" | "hired",
            jobId
          );
        }
      }
    } catch (emailError) {
      // Don't fail the status update if email fails
      console.error("Failed to send status update email:", emailError);
    }

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
