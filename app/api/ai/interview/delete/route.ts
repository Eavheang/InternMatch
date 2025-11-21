import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  applications,
  applicationAiReviews,
  interviewQuestions,
  aiGeneratedContent,
  companies,
  jobPostings,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyToken } from "@/lib/auth";

type DeleteInterviewDataInput = {
  applicationId: string;
};

export async function DELETE(req: NextRequest) {
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

    const { applicationId } = (await req.json()) as DeleteInterviewDataInput;

    // Verify the application exists and belongs to this company
    const [appRow] = await db
      .select({
        id: applications.id,
        studentId: applications.studentId,
        jobId: applications.jobId,
        companyId: jobPostings.companyId,
      })
      .from(applications)
      .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
      .where(eq(applications.id, applicationId))
      .limit(1);

    if (!appRow) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    // Verify current user belongs to this company
    const [meCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, decoded.userId))
      .limit(1);

    if (!meCompany || meCompany.id !== appRow.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Delete all interview-related data for this application
    const deletePromises = [
      // Delete AI reviews
      db
        .delete(applicationAiReviews)
        .where(eq(applicationAiReviews.applicationId, applicationId)),

      // Delete interview questions
      db
        .delete(interviewQuestions)
        .where(eq(interviewQuestions.applicationId, applicationId)),

      // Delete AI generated content (role suggestions, etc.) for this student and company
      db
        .delete(aiGeneratedContent)
        .where(
          and(
            eq(aiGeneratedContent.studentId, appRow.studentId),
            eq(aiGeneratedContent.companyId, appRow.companyId)
          )
        ),

      // Reset AI generated questions in applications table
      db
        .update(applications)
        .set({
          aiGeneratedQuestions: null,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, applicationId)),
    ];

    await Promise.all(deletePromises);

    return NextResponse.json({
      success: true,
      message: "Interview data deleted successfully",
    });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to delete interview data";
    console.error("Delete interview data error:", e);
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
