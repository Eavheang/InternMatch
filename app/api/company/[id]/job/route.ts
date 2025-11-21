import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobPostings, companies, applications } from "@/db/schema";
import { eq, and, desc, count } from "drizzle-orm";
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
      status,
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
        status: status || "draft", // Default to draft if not provided
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

