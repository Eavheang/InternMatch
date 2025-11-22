import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/db";
import {
  studentPracticeQuestions,
  studentInterviewTips,
  applications,
  students,
  jobPostings,
  companies,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";

// Mock data for demonstration - replace with actual AI service
const generateMockQuestions = (jobTitle: string, companyName: string) => ({
  id: `questions-${Date.now()}`,
  questions: [
    {
      question: `Tell me about yourself and why you're interested in the ${jobTitle} position.`,
      category: "General",
      difficulty: "Easy",
      tips: [
        "Keep your answer to 2-3 minutes",
        "Focus on relevant experiences and skills",
        "Connect your background to the role requirements",
        "End with why you're excited about this opportunity"
      ],
      sampleAnswer: "Start with your current situation, highlight 2-3 relevant experiences, and explain why this role aligns with your career goals."
    },
    {
      question: `Describe a challenging project you worked on. How did you overcome the obstacles?`,
      category: "Behavioral",
      difficulty: "Medium",
      tips: [
        "Use the STAR method (Situation, Task, Action, Result)",
        "Choose a project relevant to the job requirements",
        "Focus on your specific contributions and problem-solving approach",
        "Quantify the results if possible"
      ],
      sampleAnswer: "Describe the situation and challenge, explain your approach and actions taken, then highlight the positive outcome and what you learned."
    },
    {
      question: `What do you know about ${companyName} and why do you want to work here?`,
      category: "Company",
      difficulty: "Medium",
      tips: [
        "Research the company's mission, values, and recent news",
        "Mention specific aspects that appeal to you",
        "Connect your values and goals with the company's",
        "Show genuine enthusiasm for their work"
      ],
      sampleAnswer: "Demonstrate your research by mentioning specific company initiatives, values, or achievements that resonate with you."
    },
    {
      question: `Where do you see yourself in 5 years?`,
      category: "General",
      difficulty: "Easy",
      tips: [
        "Show ambition but be realistic",
        "Align your goals with potential growth at the company",
        "Focus on skill development and increasing responsibility",
        "Avoid mentioning other companies or unrelated career paths"
      ],
      sampleAnswer: "Express desire for growth within the field, mention skills you want to develop, and show how this role fits your career trajectory."
    },
    {
      question: `Describe a time when you had to work with a difficult team member. How did you handle it?`,
      category: "Behavioral",
      difficulty: "Hard",
      tips: [
        "Focus on your communication and conflict resolution skills",
        "Show empathy and understanding of different perspectives",
        "Emphasize the positive outcome and what you learned",
        "Avoid speaking negatively about others"
      ],
      sampleAnswer: "Describe the situation objectively, explain your approach to understanding their perspective, and highlight how you found a collaborative solution."
    }
  ],
  createdAt: new Date().toISOString(),
});

const generateMockTips = (jobTitle: string, companyName: string, industry?: string) => ({
  general: [
    "Research the company thoroughly, including recent news and achievements",
    "Prepare specific examples that demonstrate your skills and experience",
    "Practice your elevator pitch and key talking points out loud",
    "Prepare thoughtful questions about the role and company culture",
    "Plan your outfit and route to the interview location in advance"
  ],
  behavioral: [
    "Use the STAR method (Situation, Task, Action, Result) for behavioral questions",
    "Prepare 3-5 specific examples from your experience that showcase different skills",
    "Practice telling your stories concisely while including important details",
    "Focus on your individual contributions and the impact of your actions",
    "Be ready to discuss both successes and learning experiences"
  ],
  technical: [
    `Review the key technical skills mentioned in the ${jobTitle} job description`,
    "Be prepared to discuss your experience with relevant tools and technologies",
    "Practice explaining technical concepts in simple terms",
    "Prepare to walk through your problem-solving process",
    "Be honest about your skill level and show enthusiasm for learning"
  ],
  companySpecific: [
    `Research ${companyName}'s mission, values, and company culture`,
    `Look up recent news, projects, or achievements related to ${companyName}`,
    `Understand ${companyName}'s position in the ${industry || 'industry'} and their competitors`,
    `Prepare questions that show your genuine interest in ${companyName}'s work`,
    `Think about how your values align with ${companyName}'s mission and culture`
  ]
});

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "student") {
      return NextResponse.json({ error: "Invalid token or insufficient permissions" }, { status: 401 });
    }

    const { applicationId, type } = await request.json();

    if (!applicationId || !type) {
      return NextResponse.json({ error: "Application ID and type are required" }, { status: 400 });
    }

    // Get student ID
    const [student] = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.userId, payload.userId))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    // Get application with job and company details
    const [application] = await db
      .select({
        applicationId: applications.id,
        jobTitle: jobPostings.jobTitle,
        companyName: companies.companyName,
        industry: companies.industry,
      })
      .from(applications)
      .innerJoin(jobPostings, eq(applications.jobId, jobPostings.id))
      .innerJoin(companies, eq(jobPostings.companyId, companies.id))
      .where(
        and(
          eq(applications.id, applicationId),
          eq(applications.studentId, student.id)
        )
      )
      .limit(1);

    if (!application) {
      return NextResponse.json({ error: "Application not found" }, { status: 404 });
    }

    let responseData;

    if (type === "questions") {
      // Check if questions already exist
      const [existingQuestions] = await db
        .select()
        .from(studentPracticeQuestions)
        .where(eq(studentPracticeQuestions.applicationId, applicationId))
        .limit(1);

      if (existingQuestions) {
        // Return existing questions
        responseData = {
          id: existingQuestions.id,
          questions: existingQuestions.questions,
          createdAt: existingQuestions.generatedAt.toISOString(),
        };
      } else {
        // Generate new questions
        const generatedQuestions = generateMockQuestions(
          application.jobTitle,
          application.companyName
        );

        // Store in database
        const [savedQuestions] = await db
          .insert(studentPracticeQuestions)
          .values({
            applicationId,
            studentId: student.id,
            questions: generatedQuestions.questions,
            jobTitle: application.jobTitle,
            companyName: application.companyName,
          })
          .returning();

        responseData = {
          id: savedQuestions.id,
          questions: savedQuestions.questions,
          createdAt: savedQuestions.generatedAt.toISOString(),
        };
      }
    } else if (type === "tips") {
      // Check if tips already exist
      const [existingTips] = await db
        .select()
        .from(studentInterviewTips)
        .where(eq(studentInterviewTips.applicationId, applicationId))
        .limit(1);

      if (existingTips) {
        // Return existing tips
        responseData = existingTips.tips;
      } else {
        // Generate new tips
        const generatedTips = generateMockTips(
          application.jobTitle,
          application.companyName,
          application.industry
        );

        // Store in database
        const [savedTips] = await db
          .insert(studentInterviewTips)
          .values({
            applicationId,
            studentId: student.id,
            tips: generatedTips,
            jobTitle: application.jobTitle,
            companyName: application.companyName,
            industry: application.industry,
          })
          .returning();

        responseData = savedTips.tips;
      }
    } else {
      return NextResponse.json({ error: "Invalid type. Must be 'questions' or 'tips'" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error("Error generating interview preparation content:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "student") {
      return NextResponse.json({ error: "Invalid token or insufficient permissions" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get("applicationId");
    const type = searchParams.get("type");

    if (!applicationId || !type) {
      return NextResponse.json({ error: "Application ID and type are required" }, { status: 400 });
    }

    // Get student ID
    const [student] = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.userId, payload.userId))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    let data = null;

    if (type === "questions") {
      const [existingQuestions] = await db
        .select()
        .from(studentPracticeQuestions)
        .where(
          and(
            eq(studentPracticeQuestions.applicationId, applicationId),
            eq(studentPracticeQuestions.studentId, student.id)
          )
        )
        .limit(1);

      if (existingQuestions) {
        data = {
          id: existingQuestions.id,
          questions: existingQuestions.questions,
          createdAt: existingQuestions.generatedAt.toISOString(),
        };
      }
    } else if (type === "tips") {
      const [existingTips] = await db
        .select()
        .from(studentInterviewTips)
        .where(
          and(
            eq(studentInterviewTips.applicationId, applicationId),
            eq(studentInterviewTips.studentId, student.id)
          )
        )
        .limit(1);

      if (existingTips) {
        data = existingTips.tips;
      }
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Error fetching interview preparation content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

// DELETE endpoint to allow regeneration (optional - you might want to limit this)
export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const payload = await verifyToken(token);
    if (!payload || payload.role !== "student") {
      return NextResponse.json({ error: "Invalid token or insufficient permissions" }, { status: 401 });
    }

    const { applicationId, type } = await request.json();

    if (!applicationId || !type) {
      return NextResponse.json({ error: "Application ID and type are required" }, { status: 400 });
    }

    // Get student ID
    const [student] = await db
      .select({ id: students.id })
      .from(students)
      .where(eq(students.userId, payload.userId))
      .limit(1);

    if (!student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    if (type === "questions") {
      await db
        .delete(studentPracticeQuestions)
        .where(
          and(
            eq(studentPracticeQuestions.applicationId, applicationId),
            eq(studentPracticeQuestions.studentId, student.id)
          )
        );
    } else if (type === "tips") {
      await db
        .delete(studentInterviewTips)
        .where(
          and(
            eq(studentInterviewTips.applicationId, applicationId),
            eq(studentInterviewTips.studentId, student.id)
          )
        );
    }

    return NextResponse.json({
      success: true,
      message: "Content deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting interview preparation content:", error);
    return NextResponse.json(
      { error: "Failed to delete content" },
      { status: 500 }
    );
  }
}