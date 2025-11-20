import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobPostings, companies } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

// POST - Create new job posting for a company
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

    // Verify user is a company
    if (user.role !== "company") {
      return NextResponse.json(
        { error: "Only companies can create job postings" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify ownership - the userId in URL must match authenticated user
    if (!user.userId || user.userId !== id) {
      return NextResponse.json(
        {
          error: "Access denied: You can only create jobs for your own company",
        },
        { status: 403 }
      );
    }
    const body = await request.json();

    const {
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
    if (!jobTitle || !jobDescription) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Missing required fields: jobTitle and jobDescription are required",
        },
        { status: 400 }
      );
    }

    // Verify company exists by userId
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, id))
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

    // Create new job posting using the company's actual ID
    const newJob = await db
      .insert(jobPostings)
      .values({
        companyId: company[0].id, // ✅ Use company.id, not userId
        jobTitle,
        jobDescription,
        requirements: requirements || null,
        benefits: benefits || null,
        salaryRange: salaryRange || null,
        location: location || null,
        jobType: jobType || null,
        experienceLevel: experienceLevel || null,
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

// GET - Fetch all jobs for a specific company
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

    // Verify user is a company
    if (user.role !== "company") {
      return NextResponse.json(
        { error: "Only companies can view job postings" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify ownership - the userId in URL must match authenticated user
    if (!user.userId || user.userId !== id) {
      return NextResponse.json(
        { error: "Access denied: You can only view jobs for your own company" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Verify company exists by userId
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, id))
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

    // Build query conditions using the actual company ID
    const conditions = [eq(jobPostings.companyId, company[0].id)];

    if (status) {
      conditions.push(
        eq(jobPostings.status, status as "open" | "closed" | "draft")
      );
    }

    // Fetch jobs with application counts
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
        applicationCount: count(applications.id),
      })
      .from(jobPostings)
      .leftJoin(applications, eq(jobPostings.id, applications.jobId))
      .where(and(...conditions))
      .groupBy(jobPostings.id)
      .orderBy(desc(jobPostings.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: jobPostings.id })
      .from(jobPostings)
      .where(and(...conditions));

    return NextResponse.json({
      success: true,
      data: {
        company: company[0],
        jobs,
        pagination: {
          total: totalCount.length,
          limit,
          offset,
          hasMore: totalCount.length > offset + limit,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching company jobs:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch company jobs",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// PUT - Update job posting
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
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

    // Verify user is a company
    if (user.role !== "company") {
      return NextResponse.json(
        { error: "Only companies can update job postings" },
        { status: 403 }
      );
    }

    const { id, jobId } = await params;

    // Verify ownership - the userId in URL must match authenticated user
    if (!user.userId || user.userId !== id) {
      return NextResponse.json(
        {
          error: "Access denied: You can only update jobs for your own company",
        },
        { status: 403 }
      );
    }

    const body = await request.json();

    const {
      jobTitle,
      jobDescription,
      status,
      requirements,
      benefits,
      salaryRange,
      location,
      jobType,
      experienceLevel,
      aiGenerated,
    } = body;

    // First, verify company exists by userId
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, id))
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

    // Verify job exists and belongs to company
    const existingJob = await db
      .select()
      .from(jobPostings)
      .where(
        and(
          eq(jobPostings.id, jobId),
          eq(jobPostings.companyId, company[0].id) // Use company.id
        )
      )
      .limit(1);

    if (existingJob.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found or does not belong to this company",
        },
        { status: 404 }
      );
    }

    // Update job posting
    const updatedJob = await db
      .update(jobPostings)
      .set({
        ...(jobTitle && { jobTitle }),
        ...(jobDescription && { jobDescription }),
        ...(status && { status }),
        ...(requirements !== undefined && { requirements }),
        ...(benefits !== undefined && { benefits }),
        ...(salaryRange !== undefined && { salaryRange }),
        ...(location !== undefined && { location }),
        ...(jobType && { jobType }),
        ...(experienceLevel && { experienceLevel }),
        ...(aiGenerated !== undefined && { aiGenerated }),
        updatedAt: new Date(),
      })
      .where(eq(jobPostings.id, jobId))
      .returning();

    return NextResponse.json({
      success: true,
      data: updatedJob[0],
      message: "Job posting updated successfully",
    });
  } catch (error) {
    console.error("Error updating job posting:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to update job posting",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// DELETE - Delete job posting
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; jobId: string }> }
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

    // Verify user is a company
    if (user.role !== "company") {
      return NextResponse.json(
        { error: "Only companies can delete job postings" },
        { status: 403 }
      );
    }

    const { id, jobId } = await params;

    // Verify ownership - the userId in URL must match authenticated user
    if (!user.userId || user.userId !== id) {
      return NextResponse.json(
        {
          error: "Access denied: You can only delete jobs for your own company",
        },
        { status: 403 }
      );
    }

    // First, verify company exists by userId
    const company = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, id))
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

    // Verify job exists and belongs to company
    const existingJob = await db
      .select()
      .from(jobPostings)
      .where(
        and(
          eq(jobPostings.id, jobId),
          eq(jobPostings.companyId, company[0].id) // Use company.id
        )
      )
      .limit(1);

    if (existingJob.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "Job not found or does not belong to this company",
        },
        { status: 404 }
      );
    }

    // Delete job posting (cascade will handle applications)
    await db.delete(jobPostings).where(eq(jobPostings.id, jobId));

    return NextResponse.json({
      success: true,
      message: "Job posting deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting job posting:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete job posting",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
