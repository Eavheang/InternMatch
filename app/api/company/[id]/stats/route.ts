import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { jobPostings, companies, applications } from "@/db/schema";
import { eq, and, gte, count } from "drizzle-orm";
import { getAuthenticatedUser } from "@/lib/auth-helpers";

// GET - Fetch weekly statistics for a specific company
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
        { error: "Only companies can view statistics" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Verify ownership - the userId in URL must match authenticated user
    if (!user.userId || user.userId !== id) {
      return NextResponse.json(
        {
          error: "Access denied: You can only view stats for your own company",
        },
        { status: 403 }
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

    // Calculate date for one week ago
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get active postings (jobs created this week)
    const activePostingsResult = await db
      .select({ count: count() })
      .from(jobPostings)
      .where(
        and(
          eq(jobPostings.companyId, company[0].id),
          gte(jobPostings.createdAt, oneWeekAgo)
        )
      );

    // Get total applications this week
    const totalApplicationsResult = await db
      .select({ count: count() })
      .from(applications)
      .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
      .where(
        and(
          eq(jobPostings.companyId, company[0].id),
          gte(applications.appliedAt, oneWeekAgo)
        )
      );

    // Get interviews scheduled (shortlisted candidates)
    const interviewsScheduledResult = await db
      .select({ count: count() })
      .from(applications)
      .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
      .where(
        and(
          eq(jobPostings.companyId, company[0].id),
          eq(applications.status, "shortlisted")
        )
      );

    // Get all-time totals for comparison
    const allTimeJobsResult = await db
      .select({ count: count() })
      .from(jobPostings)
      .where(eq(jobPostings.companyId, company[0].id));

    const allTimeApplicationsResult = await db
      .select({ count: count() })
      .from(applications)
      .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
      .where(eq(jobPostings.companyId, company[0].id));

    const stats = {
      activePostings: activePostingsResult[0]?.count || 0,
      totalApplicants: totalApplicationsResult[0]?.count || 0,
      interviewsScheduled: interviewsScheduledResult[0]?.count || 0,
      allTimeJobs: allTimeJobsResult[0]?.count || 0,
      allTimeApplications: allTimeApplicationsResult[0]?.count || 0,
    };

    return NextResponse.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error fetching company statistics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch company statistics",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
