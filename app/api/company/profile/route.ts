import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { companies } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

export async function PUT(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    if (!decoded.userId || decoded.role !== "company") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      companyName,
      industry,
      companySize,
      website,
      companyLogo,
      description,
      companyCulture,
      location,
      headquarters,
      otherLocations,
      contactName,
      contactEmail,
      contactPhone,
      hasInternshipProgram,
    } = await req.json();

    // Validate required fields
    if (!companyName) {
      return NextResponse.json(
        { error: "Company name is required" },
        { status: 400 }
      );
    }

    // Update company profile
    const [updatedCompany] = await db
      .update(companies)
      .set({
        companyName,
        industry,
        companySize,
        website,
        companyLogo,
        description,
        companyCulture,
        location,
        headquarters,
        otherLocations,
        contactName,
        contactEmail,
        contactPhone,
        hasInternshipProgram,
      })
      .where(eq(companies.userId, decoded.userId))
      .returning();

    if (!updatedCompany) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Company profile updated successfully",
      company: updatedCompany,
    });
  } catch (error) {
    console.error("Error updating company profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    if (!decoded.userId || decoded.role !== "company") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get company profile
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, decoded.userId))
      .limit(1);

    if (!company) {
      return NextResponse.json(
        { error: "Company profile not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      company,
    });
  } catch (error) {
    console.error("Error fetching company profile:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
