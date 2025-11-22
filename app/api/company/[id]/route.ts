import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, companies } from "@/db/schema";
import { eq } from "drizzle-orm";

/**
 * GET - Fetch public company profile by user ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = id;

    // Validate user ID format (should be UUID)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(userId)) {
      return NextResponse.json(
        { error: "Invalid user ID format" },
        { status: 400 }
      );
    }

    // Get company by user ID, joined with user info
    const [companyWithUser] = await db
      .select({
        company: companies,
        user: {
          id: users.id,
          email: users.email,
          role: users.role,
          isVerified: users.isVerified,
          createdAt: users.createdAt,
        },
      })
      .from(companies)
      .innerJoin(users, eq(users.id, companies.userId))
      .where(eq(companies.userId, userId))
      .limit(1);

    if (!companyWithUser?.company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 });
    }

    const company = companyWithUser.company;
    const user = companyWithUser.user;

    // Public company profile
    const publicProfile = {
      id: company.id,
      userId: user.id,
      companyName: company.companyName,
      industry: company.industry,
      companySize: company.companySize,
      website: company.website,
      companyLogo: company.companyLogo,
      location: company.location,
      description: company.description,
      contactName: company.contactName,
      contactEmail: company.contactEmail,
      isVerified: user.isVerified,
      profileCreatedAt: company.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: publicProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Company profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
