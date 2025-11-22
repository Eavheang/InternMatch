import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  applications,
  resumes,
  jobPostings,
  companies,
  interviewQuestions,
  aiGeneratedContent,
  students,
  skills,
  studentSkills,
  projects,
  experiences,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateJson } from "@/lib/gemini";
import { verifyToken } from "@/lib/auth";

type InterviewInput = {
  applicationId: string;
  generatedFrom?: "resume" | "job" | "both";
  count?: number; // number of questions (defaults to 5)
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

    const {
      applicationId,
      generatedFrom = "both",
      count = 5, // Default to 5 questions as requested
    } = (await req.json()) as InterviewInput;
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

    // Fetch student profile
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, appRow.studentId))
      .limit(1);
    if (!student)
      return NextResponse.json({ error: "Student not found" }, { status: 404 });

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
        db.select().from(projects).where(eq(projects.studentId, student.id)),
        db
          .select()
          .from(experiences)
          .where(eq(experiences.studentId, student.id)),
      ]);

    // Pick the student's primary resume (or most recent)
    const [resume] = await db
      .select()
      .from(resumes)
      .where(eq(resumes.studentId, appRow.studentId))
      .orderBy(desc(resumes.isPrimary), desc(resumes.updatedAt))
      .limit(1);

    // Prepare comprehensive student profile
    const studentProfile = {
      name: `${student.firstName} ${student.lastName}`,
      university: student.university,
      major: student.major,
      graduationYear: student.graduationYear,
      gpa: student.gpa,
      location: student.location,
      careerInterest: student.careerInterest,
      aboutMe: student.aboutMe,
      skills: studentSkillsData.map((item) => item.skill),
      projects: studentProjects,
      experiences: studentExperiences,
      resume: resume?.structuredContent || {},
    };

    const prompt = `
You are an experienced interviewer preparing questions for a student interview. Generate exactly ${count} targeted interview questions based on the student's complete profile and the job description.

Student Profile:
- Name: ${studentProfile.name}
- University: ${studentProfile.university || "Not specified"}
- Major: ${studentProfile.major || "Not specified"}
- Graduation Year: ${studentProfile.graduationYear || "Not specified"}
- GPA: ${studentProfile.gpa || "Not specified"}
- Location: ${studentProfile.location || "Not specified"}
- Career Interest: ${studentProfile.careerInterest || "Not specified"}
- About Me: ${studentProfile.aboutMe || "Not specified"}
- Skills: ${JSON.stringify(studentProfile.skills)}
- Projects: ${JSON.stringify(studentProjects)}
- Experiences: ${JSON.stringify(studentExperiences)}
- Resume Content: ${JSON.stringify(resume?.structuredContent || {}, null, 2)}

Job Description:
${JSON.stringify(job, null, 2)}

Generate exactly ${count} interview questions that:
1. Are relevant to the job requirements and responsibilities
2. Reference specific details from the student's profile (projects, experiences, skills)
3. Test both technical and behavioral competencies
4. Vary in difficulty (mix of easy, medium, and hard)
5. Help assess the student's fit for this specific role

Return JSON: { 
  questions: Array<{ 
    question: string; 
    intent: string; 
    difficulty: 'easy'|'medium'|'hard';
    relatedTo: string; // What part of their profile/job this relates to
  }> 
}
`;

    const result = await generateJson<{
      questions: Array<{
        question: string;
        intent: string;
        difficulty: string;
        relatedTo?: string;
      }>;
    }>(prompt);

    // Ensure exactly the requested number of questions (or 5 if not specified)
    const questionsToUse = result.questions.slice(0, count);

    const inserted = await db
      .insert(interviewQuestions)
      .values({
        applicationId: appRow.id,
        companyId: company.id,
        questions: questionsToUse,
        generatedFrom,
        createdAt: new Date(),
      })
      .returning();

    // Optionally also save to applications.aiGeneratedQuestions for convenience
    try {
      await db
        .update(applications)
        .set({
          aiGeneratedQuestions: questionsToUse,
          updatedAt: new Date(),
        })
        .where(eq(applications.id, appRow.id));
    } catch {}

    try {
      await db.insert(aiGeneratedContent).values({
        type: "interview_questions",
        studentId: appRow.studentId,
        companyId: company.id,
        jobId: job.id,
        content: JSON.stringify({
          questions: questionsToUse,
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

    return NextResponse.json({ success: true, questions: inserted[0] });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Question generation failed";
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

    const list = await db
      .select()
      .from(interviewQuestions)
      .where(eq(interviewQuestions.applicationId, applicationId))
      .orderBy(desc(interviewQuestions.createdAt));

    return NextResponse.json({ success: true, data: list });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to fetch interview questions";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
