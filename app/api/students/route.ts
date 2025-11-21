import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  students,
  studentSkills,
  skills,
  companies,
  jobPostings,
} from "@/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// GET - Fetch list of students (for companies to browse)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const university = searchParams.get("university");
    const major = searchParams.get("major");
    const _skillsParam = searchParams.get("skills");
    const companyId = searchParams.get("companyId"); // For intelligent matching
    const intelligent = searchParams.get("intelligent") === "true"; // Enable smart matching

    const offset = (page - 1) * limit;

    if (intelligent && companyId) {
      // Phase 1: Basic Intelligence - Smart candidate selection
      const intelligentCandidates = await getIntelligentCandidates(
        companyId,
        limit,
        offset
      );
      return NextResponse.json({
        success: true,
        data: intelligentCandidates,
        pagination: {
          page,
          limit,
          total: intelligentCandidates.length,
        },
      });
    }

    // Fallback to basic query for non-intelligent requests
    const conditions = [eq(users.isVerified, true)];

    if (university) {
      conditions.push(eq(students.university, university));
    }
    if (major) {
      conditions.push(eq(students.major, major));
    }

    // Build query conditions
    const query = db
      .select({
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        university: students.university,
        major: students.major,
        graduationYear: students.graduationYear,
        location: students.location,
        careerInterest: students.careerInterest,
        gpa: students.gpa,
        resumeUrl: students.resumeUrl,
        aboutMe: students.aboutMe,
        isVerified: users.isVerified,
        createdAt: students.createdAt,
      })
      .from(students)
      .innerJoin(users, eq(users.id, students.userId))
      .where(and(...conditions))
      .orderBy(desc(students.createdAt))
      .limit(limit)
      .offset(offset);

    const studentsList = await query;

    return NextResponse.json(
      {
        success: true,
        data: studentsList,
        pagination: {
          page,
          limit,
          total: studentsList.length,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Students list fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Phase 1: Basic Intelligence Algorithm
async function getIntelligentCandidates(
  companyId: string,
  limit: number,
  offset: number
) {
  try {
    // Step 1: Get company details and job requirements
    const [company] = await db
      .select()
      .from(companies)
      .where(eq(companies.id, companyId))
      .limit(1);

    if (!company) {
      return [];
    }

    // Step 2: Get company's job requirements (skills from recent job postings)
    const companyJobs = await db
      .select({
        requirements: jobPostings.requirements,
        jobTitle: jobPostings.jobTitle,
        location: jobPostings.location,
      })
      .from(jobPostings)
      .where(
        and(
          eq(jobPostings.companyId, companyId),
          eq(jobPostings.status, "open")
        )
      )
      .limit(10); // Recent jobs

    // Extract skills from job requirements
    const requiredSkills = new Set<string>();
    const jobLocations = new Set<string>();

    companyJobs.forEach((job) => {
      if (job.requirements && Array.isArray(job.requirements)) {
        job.requirements.forEach((req: string) => {
          // Simple skill extraction (can be enhanced with NLP)
          const skillKeywords = req
            .toLowerCase()
            .match(
              /\b(javascript|python|react|node|sql|java|typescript|html|css|git|aws|docker|kubernetes|mongodb|postgresql|redis|graphql|rest|api|agile|scrum)\b/g
            );
          if (skillKeywords) {
            skillKeywords.forEach((skill) => requiredSkills.add(skill));
          }
        });
      }
      if (job.location) {
        jobLocations.add(job.location);
      }
    });

    // Step 3: Get students with intelligent scoring
    const studentsWithScores = await db
      .select({
        id: students.id,
        firstName: students.firstName,
        lastName: students.lastName,
        university: students.university,
        major: students.major,
        graduationYear: students.graduationYear,
        location: students.location,
        careerInterest: students.careerInterest,
        gpa: students.gpa,
        resumeUrl: students.resumeUrl,
        aboutMe: students.aboutMe,
        createdAt: students.createdAt,
        // Profile completeness score
        profileScore: sql<number>`
          (CASE WHEN ${students.resumeUrl} IS NOT NULL THEN 1 ELSE 0 END +
           CASE WHEN ${students.aboutMe} IS NOT NULL THEN 1 ELSE 0 END +
           CASE WHEN ${students.gpa} IS NOT NULL THEN 1 ELSE 0 END +
           CASE WHEN ${students.university} IS NOT NULL THEN 1 ELSE 0 END +
           CASE WHEN ${students.major} IS NOT NULL THEN 1 ELSE 0 END)
        `,
        // Skills count (will be calculated separately)
        skillsCount: sql<number>`0`,
      })
      .from(students)
      .innerJoin(users, eq(users.id, students.userId))
      .where(eq(users.isVerified, true))
      .limit(limit * 3) // Get more candidates to score and filter
      .offset(offset);

    // Step 4: Calculate skills matching for each student
    const studentsWithSkillsScores = await Promise.all(
      studentsWithScores.map(async (student) => {
        // Get student's skills
        const studentSkillsList = await db
          .select({ skillName: skills.name })
          .from(studentSkills)
          .innerJoin(skills, eq(studentSkills.skillId, skills.id))
          .where(eq(studentSkills.studentId, student.id));

        const studentSkillsSet = new Set(
          studentSkillsList.map((s) => s.skillName.toLowerCase())
        );

        // Calculate skills match score
        const skillsMatchCount = Array.from(requiredSkills).filter((skill) =>
          studentSkillsSet.has(skill)
        ).length;

        // Calculate career interest match
        const careerInterestMatch =
          company.industry && student.careerInterest
            ? student.careerInterest
                .toLowerCase()
                .includes(company.industry.toLowerCase())
              ? 1
              : 0
            : 0;

        // Calculate location match
        const locationMatch = Array.from(jobLocations).some((loc) =>
          student.location?.toLowerCase().includes(loc.toLowerCase())
        )
          ? 1
          : 0;

        // Calculate total intelligence score
        const intelligenceScore =
          skillsMatchCount * 3 + // Skills matching (weight: 3)
          careerInterestMatch * 2 + // Career interest (weight: 2)
          student.profileScore * 1 + // Profile completeness (weight: 1)
          locationMatch * 1 + // Location match (weight: 1)
          (student.gpa || 0) * 0.5; // GPA bonus (weight: 0.5)

        return {
          ...student,
          skillsMatchCount,
          careerInterestMatch,
          locationMatch,
          intelligenceScore,
        };
      })
    );

    // Step 5: Sort by intelligence score and return top candidates
    const topCandidates = studentsWithSkillsScores
      .sort((a, b) => b.intelligenceScore - a.intelligenceScore)
      .slice(0, limit)
      .map(
        ({
          skillsMatchCount: _skillsMatchCount,
          careerInterestMatch: _careerInterestMatch,
          locationMatch: _locationMatch,
          intelligenceScore: _intelligenceScore,
          ...student
        }) => student
      );

    return topCandidates;
  } catch (error) {
    console.error("Error in intelligent candidate selection:", error);
    return [];
  }
}
