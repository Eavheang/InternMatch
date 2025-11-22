import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  jobPostings,
  companies,
  applications,
  students,
  users,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth-helpers";
import { sendApplicationNotificationToCompany } from "@/lib/email";

// POST - Apply for a job
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: "Only students can apply for jobs" },
        { status: 403 }
      );
    }

    const jobId = (await params).id;
    const body = await request.json();

    const { coverLetter, aiGeneratedQuestions } = body;

    // Validate job ID format (should be UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(jobId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid job ID format",
        },
        { status: 400 }
      );
    }

    // Verify job exists and is open for applications
    const job = await db
      .select({
        id: jobPostings.id,
        status: jobPostings.status,
        jobTitle: jobPostings.jobTitle,
        companyId: jobPostings.companyId,
        company: {
          id: companies.id,
          companyName: companies.companyName,
          userId: companies.userId,
        },
      })
      .from(jobPostings)
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .where(eq(jobPostings.id, jobId))
      .limit(1);

    if (job.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found",
        },
        { status: 404 }
      );
    }

    const jobData = job[0];

    // Check if job is open for applications
    if (jobData.status !== "open") {
      return NextResponse.json(
        {
          success: false,
          error: "This job is not currently accepting applications",
        },
        { status: 403 }
      );
    }

    // Find student by authenticated user ID
    const student = await db
      .select({
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        user: {
          email: users.email,
          isVerified: users.isVerified,
        },
      })
      .from(students)
      .innerJoin(users, eq(users.id, students.userId))
      .where(eq(students.userId, user.userId))
      .limit(1);

    if (student.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Student not found",
        },
        { status: 404 }
      );
    }

    const studentData = student[0];

    // Check if student is verified
    if (!studentData.user.isVerified) {
      return NextResponse.json(
        {
          success: false,
          error: "Student account must be verified to apply for jobs",
        },
        { status: 403 }
      );
    }

    // Check if student has already applied for this job
    const existingApplication = await db
      .select()
      .from(applications)
      .where(
        and(
          eq(applications.studentId, studentData.id),
          eq(applications.jobId, jobId)
        )
      )
      .limit(1);

    if (existingApplication.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "You have already applied for this job",
        },
        { status: 409 }
      );
    }

    // Create new application
    const newApplication = await db
      .insert(applications)
      .values({
        studentId: studentData.id,
        jobId,
        status: "applied", // Default status
        coverLetter: coverLetter || null,
        aiGeneratedQuestions: aiGeneratedQuestions || null,
        appliedAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Send email notification to company
    try {
      // Get company user email
      const [companyUser] = await db
        .select({ email: users.email })
        .from(users)
        .where(eq(users.id, jobData.company.userId))
        .limit(1);

      if (companyUser) {
        const studentName = `${studentData.firstName} ${studentData.lastName}`;
        await sendApplicationNotificationToCompany(
          companyUser.email,
          jobData.company.companyName,
          studentName,
          jobData.jobTitle,
          jobId
        );
      }
    } catch (emailError) {
      // Don't fail the application if email fails
      console.error(
        "Failed to send application notification email:",
        emailError
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        application: newApplication[0],
        job: {
          id: jobData.id,
          jobTitle: jobData.jobTitle,
          companyName: jobData.company.companyName,
        },
        student: {
          id: studentData.id,
          userId: user.userId,
          firstName: studentData.firstName,
          lastName: studentData.lastName,
          email: studentData.user.email,
        },
      },
      message: "Application submitted successfully",
    });
  } catch (error) {
    console.error("Error submitting job application:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit application",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// GET - Check if student has applied for this job
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
        { error: "Only students can check application status" },
        { status: 403 }
      );
    }

    const jobId = (await params).id;

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

    // Check if student has applied for this job
    const application = await db
      .select({
        id: applications.id,
        status: applications.status,
        coverLetter: applications.coverLetter,
        appliedAt: applications.appliedAt,
        updatedAt: applications.updatedAt,
      })
      .from(applications)
      .where(
        and(
          eq(applications.studentId, studentId),
          eq(applications.jobId, jobId)
        )
      )
      .limit(1);

    if (application.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          hasApplied: false,
          application: null,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        hasApplied: true,
        application: application[0],
      },
    });
  } catch (error) {
    console.error("Error checking application status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to check application status",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
