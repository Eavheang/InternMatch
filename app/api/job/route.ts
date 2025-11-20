import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobPostings, companies } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const jobType = searchParams.get("jobType");
    const experienceLevel = searchParams.get("experienceLevel");
    const location = searchParams.get("location");
    const limit = searchParams.get("limit");
    const offset = searchParams.get("offset");

    // Build query conditions
    const conditions = [];

    // Only show open jobs by default, unless specifically requested otherwise
    if (status) {
      conditions.push(
        eq(jobPostings.status, status as "open" | "closed" | "draft")
      );
    } else {
      conditions.push(eq(jobPostings.status, "open"));
    }

    if (jobType) {
      conditions.push(
        eq(
          jobPostings.jobType,
          jobType as "full-time" | "part-time" | "internship" | "contract"
        )
      );
    }

    if (experienceLevel) {
      conditions.push(
        eq(
          jobPostings.experienceLevel,
          experienceLevel as "entry" | "mid" | "senior" | "executive"
        )
      );
    }

    if (location) {
      conditions.push(eq(jobPostings.location, location));
    }

    // Fetch job listings with company information
    const jobs = await db
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
        company: {
          id: companies.id,
          companyName: companies.companyName,
          industry: companies.industry,
          companySize: companies.companySize,
          website: companies.website,
          companyLogo: companies.companyLogo,
          companyLocation: companies.location,
          description: companies.description,
        },
      })
      .from(jobPostings)
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .where(and(...conditions))
      .orderBy(desc(jobPostings.createdAt))
      .limit(limit ? parseInt(limit) : 50)
      .offset(offset ? parseInt(offset) : 0);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: jobPostings.id })
      .from(jobPostings)
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      data: {
        jobs,
        pagination: {
          total: totalCount.length,
          limit: limit ? parseInt(limit) : 50,
          offset: offset ? parseInt(offset) : 0,
          hasMore:
            totalCount.length >
            (offset ? parseInt(offset) : 0) + (limit ? parseInt(limit) : 50),
        },
      },
    });
  } catch (error) {
    console.error("Error fetching job listings:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch job listings",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Optional: Add POST endpoint for creating new job listings
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      companyId,
      jobTitle,
      jobDescription,
      requirements,
      benefits,
      salaryRange,
      location,
      jobType,
      experienceLevel,
      aiGenerated = false,
    } = body;

    // Validate required fields
    if (!companyId || !jobTitle || !jobDescription) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: companyId, jobTitle, and jobDescription are required",
        },
        { status: 400 }
      );
    }

    // Create new job posting
    const newJob = await db
      .insert(jobPostings)
      .values({
        companyId,
        jobTitle,
        jobDescription,
        requirements,
        benefits,
        salaryRange,
        location,
        jobType,
        experienceLevel,
        aiGenerated,
        status: "draft", // New jobs start as draft
      })
      .returning();

    return NextResponse.json({
      success: true,
      data: newJob[0],
      message: "Job posting created successfully",
    });
  } catch (error) {
    console.error("Error creating job posting:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create job posting",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
