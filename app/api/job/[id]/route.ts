import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobPostings, companies, applications } from "@/db/schema";
import { eq, count } from "drizzle-orm";

// GET - Fetch job details by ID for students
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const jobId = (await params).id;

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

    // Fetch job details with company information and application count
    const jobDetails = await db
      .select({
        id: jobPostings.id,
        jobTitle: jobPostings.jobTitle,
        jobDescription: jobPostings.jobDescription,
        status: jobPostings.status,
        requirements: jobPostings.requirements,
        benefits: jobPostings.benefits,
        salaryRange: jobPostings.salaryRange,
        location: jobPostings.location,
        jobType: jobPostings.jobType,
        experienceLevel: jobPostings.experienceLevel,
        aiGenerated: jobPostings.aiGenerated,
        createdAt: jobPostings.createdAt,
        updatedAt: jobPostings.updatedAt,
        applicationCount: count(applications.id),
        company: {
          id: companies.id,
          companyName: companies.companyName,
          industry: companies.industry,
          companySize: companies.companySize,
          website: companies.website,
          companyLogo: companies.companyLogo,
          companyLocation: companies.location,
          description: companies.description,
          contactName: companies.contactName,
          contactEmail: companies.contactEmail,
        },
      })
      .from(jobPostings)
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .leftJoin(applications, eq(jobPostings.id, applications.jobId))
      .where(eq(jobPostings.id, jobId))
      .groupBy(jobPostings.id, companies.id)
      .limit(1);

    if (jobDetails.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found",
        },
        { status: 404 }
      );
    }

    const job = jobDetails[0];

    // Only show open jobs to students (not draft or closed)
    if (job.status !== "open") {
      return NextResponse.json(
        {
          success: false,
          error: "Job is not available for viewing",
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      data: job,
    });
  } catch (error) {
    console.error("Error fetching job details:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch job details",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
