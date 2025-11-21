import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  students,
  resumes,
  skills,
  studentSkills,
  projects,
  experiences,
  aiGeneratedContent,
} from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { generateJson } from "@/lib/gemini";
import { verifyToken } from "@/lib/auth";
import { careers } from "@/constants/career";

type RoleSuggestionInput = {
  studentId?: string;
  resumeId?: string;
};

type RoleSuggestion = {
  role: string;
  percentage: number;
  reasoning: string;
  matchedSkills: string[];
  requiredSkills: string[];
};

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const token = authHeader.split(" ")[1];
    const decoded = await verifyToken(token);

    if (!decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { studentId, resumeId } = (await req.json()) as RoleSuggestionInput;

    let targetStudentId = studentId;

    // If no studentId provided, use the current user's student profile
    if (!targetStudentId && decoded.role === "student") {
      const [student] = await db
        .select()
        .from(students)
        .where(eq(students.userId, decoded.userId))
        .limit(1);
      if (student) {
        targetStudentId = student.id;
      }
    }

    if (!targetStudentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Fetch student profile
    const [student] = await db
      .select()
      .from(students)
      .where(eq(students.id, targetStudentId))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Authorization check - only allow access to own profile or company access
    if (decoded.role === "student") {
      if (student.userId !== decoded.userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

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

    // Get the student's resume
    let resume;
    if (resumeId) {
      const [specificResume] = await db
        .select()
        .from(resumes)
        .where(eq(resumes.id, resumeId))
        .limit(1);
      resume = specificResume;
    } else {
      // Get primary or most recent resume
      const [primaryResume] = await db
        .select()
        .from(resumes)
        .where(eq(resumes.studentId, student.id))
        .orderBy(desc(resumes.isPrimary), desc(resumes.updatedAt))
        .limit(1);
      resume = primaryResume;
    }

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
You are an AI career counselor analyzing a student's complete profile to suggest alternative career roles. Based on their skills, experience, education, and projects, provide percentage-based recommendations for different career paths.

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

Available Career Options:
${JSON.stringify(careers)}

Analyze the student's profile and provide alternative role suggestions with the following requirements:

1. **Comprehensive Analysis**: Consider ALL aspects of their profile - education, skills, projects, experiences, and career interests
2. **Percentage Distribution**: Provide percentage recommendations that add up to 100%
3. **Realistic Assessment**: Base percentages on actual skill matches, experience relevance, and educational background
4. **Diverse Suggestions**: Include 8-12 different roles covering various career paths they could pursue
5. **Detailed Reasoning**: For each suggestion, explain why this role fits and what makes them suitable

**Percentage Guidelines:**
- Primary fit (strongest match): 15-25%
- Strong secondary fits: 10-20% each
- Good alternative fits: 5-15% each
- Emerging possibilities: 2-8% each
- Total must equal exactly 100%

**Analysis Criteria:**
- Technical skills alignment
- Educational background relevance
- Project experience applicability
- Work experience transferability
- Soft skills and interests match
- Industry knowledge and exposure
- Growth potential and learning curve

Return JSON with exactly this structure:
{
  "suggestions": [
    {
      "role": "exact role name from careers list",
      "percentage": number,
      "reasoning": "detailed explanation of why this role fits",
      "matchedSkills": ["skill1", "skill2"],
      "requiredSkills": ["skill1", "skill2"]
    }
  ],
  "totalPercentage": 100,
  "analysisDate": "${new Date().toISOString()}",
  "profileStrengths": ["strength1", "strength2"],
  "recommendedSkillDevelopment": ["skill1", "skill2"]
}

Ensure the percentages are realistic and the total equals exactly 100%.
`;

    const result = await generateJson<{
      suggestions: RoleSuggestion[];
      totalPercentage: number;
      analysisDate: string;
      profileStrengths: string[];
      recommendedSkillDevelopment: string[];
    }>(prompt);

    // Validate that percentages add up to 100%
    const totalPercentage = result.suggestions.reduce(
      (sum, suggestion) => sum + suggestion.percentage,
      0
    );

    if (Math.abs(totalPercentage - 100) > 0.1) {
      // If percentages don't add up, normalize them
      const normalizedSuggestions = result.suggestions.map((suggestion) => ({
        ...suggestion,
        percentage:
          Math.round((suggestion.percentage / totalPercentage) * 100 * 10) / 10,
      }));
      result.suggestions = normalizedSuggestions;
      result.totalPercentage = 100;
    }

    // Sort suggestions by percentage (highest first)
    result.suggestions.sort((a, b) => b.percentage - a.percentage);

    // Save to AI generated content for tracking
    try {
      await db.insert(aiGeneratedContent).values({
        type: "resume_suggestions",
        studentId: student.id,
        companyId: null,
        jobId: null,
        content: JSON.stringify({
          ...result,
          studentProfile: {
            skills: studentProfile.skills,
            projects: studentProjects,
            experiences: studentExperiences,
            major: student.major,
            university: student.university,
          },
        }),
        prompt,
        createdAt: new Date(),
      });
    } catch (error) {
      console.error("Failed to save AI content:", error);
    }

    return NextResponse.json({
      success: true,
      data: result,
      studentInfo: {
        name: studentProfile.name,
        major: student.major,
        university: student.university,
        graduationYear: student.graduationYear,
      },
    });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Role suggestion analysis failed";
    console.error("Role suggestion error:", e);
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

    if (!decoded.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");

    let targetStudentId = studentId;

    // If no studentId provided, use the current user's student profile
    if (!targetStudentId && decoded.role === "student") {
      const [student] = await db
        .select()
        .from(students)
        .where(eq(students.userId, decoded.userId))
        .limit(1);
      if (student) {
        targetStudentId = student.id;
      }
    }

    if (!targetStudentId) {
      return NextResponse.json(
        { error: "Student ID is required" },
        { status: 400 }
      );
    }

    // Fetch previous role suggestions for this student
    const previousSuggestions = await db
      .select()
      .from(aiGeneratedContent)
      .where(eq(aiGeneratedContent.studentId, targetStudentId))
      .orderBy(desc(aiGeneratedContent.createdAt))
      .limit(10);

    const roleSuggestions = previousSuggestions.filter(
      (content) => content.type === "resume_suggestions"
    );

    return NextResponse.json({
      success: true,
      data: roleSuggestions.map((suggestion) => ({
        id: suggestion.id,
        content: JSON.parse(suggestion.content),
        createdAt: suggestion.createdAt,
      })),
    });
  } catch (e: unknown) {
    const errorMessage =
      e instanceof Error ? e.message : "Failed to fetch role suggestions";
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    );
  }
}
