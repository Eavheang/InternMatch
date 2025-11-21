import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  applications,
  students,
  resumes,
  jobPostings,
  companies,
  applicationAiReviews,
  aiGeneratedContent,
  skills,
  studentSkills,
  projects,
  experiences,
} from "@/db/schema";
import { eq, desc, and, ne } from "drizzle-orm";
import { generateJson } from "@/lib/gemini";
import { verifyToken } from "@/lib/auth";

type ReviewInput = {
  applicationId: string;
};

export async function POST(req: NextRequest) {
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

    const { applicationId } = (await req.json()) as ReviewInput;
    const [appRow] = await db
      .select()
      .from(applications)
      .where(eq(applications.id, applicationId))
      .limit(1);
    if (!appRow)
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );

    const [job] = await db
      .select()
      .from(jobPostings)
      .where(eq(jobPostings.id, appRow.jobId))
      .limit(1);
    if (!job)
      return NextResponse.json({ error: "Job not found" }, { status: 404 });

    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, job.companyId))
      .limit(1);
    if (!company)
      return NextResponse.json({ error: "Company not found" }, { status: 404 });

    // Verify current user belongs to this company
    const [meCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, decoded.userId))
      .limit(1);
    if (!meCompany || meCompany.id !== company.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, appRow.studentId))
      .limit(1);
    if (!student)
      return NextResponse.json({ error: "Student not found" }, { status: 404 });

    // Pick the student's primary resume (or most recent)
    const [resume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.studentId, student.id))
      .orderBy(desc(resumes.isPrimary), desc(resumes.updatedAt))
      .limit(1);

    // Fetch student's complete profile: skills, projects, experiences
    const [studentSkillsData, studentProjects, studentExperiences] =
      await Promise.all([
        db
          .select({
            skill: skills.name,
          })
          .from(studentSkills)
          .innerJoin(skills, eq(studentSkills.skillId, skills.id))
          .where(eq(studentSkills.studentId, student.id)),
        db
          .select()
          .from(projects)
          .where(eq(projects.studentId, student.id)),
        db
          .select()
          .from(experiences)
          .where(eq(experiences.studentId, student.id)),
      ]);

    // Fetch all open jobs from this company (excluding the current job) for alternative suggestions
    const allCompanyJobs = await db
      .select()
      .from(jobPostings)
      .where(
        and(
          eq(jobPostings.companyId, company.id),
          eq(jobPostings.status, "open"),
          ne(jobPostings.id, job.id)
        )
      )
      .limit(20); // Limit to 20 jobs for AI processing

    // Prepare comprehensive student profile
    const studentProfile = {
      ...student,
      skills: studentSkillsData.map((item) => item.skill),
      projects: studentProjects,
      experiences: studentExperiences,
      resume: resume?.structuredContent || {},
    };

    const prompt = `
You are an AI recruiter analyzing a student application. Evaluate how well the student matches the job they applied for, and suggest alternative jobs from the company that might be a better fit.

Student Profile:
- Name: ${student.firstName} ${student.lastName}
- University: ${student.university || "Not specified"}
- Major: ${student.major || "Not specified"}
- Graduation Year: ${student.graduationYear || "Not specified"}
- GPA: ${student.gpa || "Not specified"}
- Location: ${student.location || "Not specified"}
- Career Interest: ${student.careerInterest || "Not specified"}
- About Me: ${student.aboutMe || "Not specified"}
- Skills: ${JSON.stringify(studentProfile.skills)}
- Projects: ${JSON.stringify(studentProjects)}
- Experiences: ${JSON.stringify(studentExperiences)}
- Resume Content: ${JSON.stringify(resume?.structuredContent || {}, null, 2)}

Job Applied For:
${JSON.stringify(job, null, 2)}

Available Alternative Jobs at This Company:
${JSON.stringify(allCompanyJobs, null, 2)}

Analyze:
1. Calculate a match score (0-100) for the current job application
2. List matched skills (skills the student has that the job requires)
3. List missing skills (skills the job requires but student doesn't have)
4. From the available alternative jobs, suggest the TOP 3 most relevant jobs that would suit this student better, with reasons why
5. Provide a comprehensive summary of the student's fit for the current job

Return JSON: {
  matchScore: number (0-100),
  matchedSkills: string[],
  missingSkills: string[],
  alternatives: Array<{ jobId: string; jobTitle: string; reason: string; matchScore: number }>,
  summary: string
}
`;

    const result = await generateJson<{
      matchScore: number;
      matchedSkills: string[];
      missingSkills: string[];
      alternatives: Array<{
        jobId: string;
        jobTitle: string;
        reason: string;
        matchScore: number;
      }>;
      summary: string;
    }>(prompt);

    const inserted = await db
      .insert(applicationAiReviews)
      .values({
        applicationId: appRow.id,
        companyId: company.id,
        matchScore: result.matchScore,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        alternatives: result.alternatives,
        summary: result.summary,
        analyzedAt: new Date(),
      })
      .returning();

    try {
      await db.insert(aiGeneratedContent).values({
        type: "job_description",
        studentId: student.id,
        companyId: company.id,
        jobId: job.id,
        content: JSON.stringify({
          ...result,
          studentProfile: {
            skills: studentProfile.skills,
            projects: studentProjects,
            experiences: studentExperiences,
          },
        }),
        prompt,
        createdAt: new Date(),
      });
    } catch {}

    return NextResponse.json({ success: true, review: inserted[0] });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "AI review failed";
    return NextResponse.json(
      { success: false, error: errorMessage },
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

    const { searchParams } = new URL(req.url);
    const applicationId = searchParams.get("applicationId");
    if (!applicationId)
      return NextResponse.json(
        { error: "applicationId is required" },
        { status: 400 }
      );

    // Verify application belongs to this company
    const [row] = await db
      .select({ companyId: jobPostings.companyId })
      .from(applications)
      .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
      .where(eq(applications.id, applicationId))
      .limit(1);
    if (!row)
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );

    const [meCompany] = await db
      .select()
      .from(companies)
      .where(eq(companies.userId, decoded.userId))
      .limit(1);
    if (!meCompany || meCompany.id !== row.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const reviews = await db
      .select()
      .from(applicationAiReviews)
      .where(eq(applicationAiReviews.applicationId, applicationId))
      .orderBy(desc(applicationAiReviews.analyzedAt));

    return NextResponse.json({ success: true, data: reviews });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to fetch reviews";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
