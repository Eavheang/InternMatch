import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  students,
  socialLinks,
  skills,
  studentSkills,
  projects,
  experiences,
} from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params; // FIXED: Await the params Promise
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

    // Try to get student by student ID first, then by user ID
    let studentWithUser = await db
      .select({
        student: students,
        user: {
          id: users.id,
          email: users.email,
          role: users.role,
          isVerified: users.isVerified,
          createdAt: users.createdAt,
        },
      })
      .from(students)
      .innerJoin(users, eq(users.id, students.userId))
      .where(eq(students.id, userId))
      .limit(1);

    // If not found by student ID, try by user ID
    if (studentWithUser.length === 0) {
      studentWithUser = await db
        .select({
          student: students,
          user: {
            id: users.id,
            email: users.email,
            role: users.role,
            isVerified: users.isVerified,
            createdAt: users.createdAt,
          },
        })
        .from(students)
        .innerJoin(users, eq(users.id, students.userId))
        .where(eq(students.userId, userId))
        .limit(1);
    }

    const studentData = studentWithUser[0];

    if (!studentData?.student) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 });
    }

    const student = studentData.student;
    const user = studentData.user;

    // Get related data in parallel
    const [socialLink, studentSkillsData, studentProjects, studentExperiences] =
      await Promise.all([
        db
          .select()
          .from(socialLinks)
          .where(eq(socialLinks.studentId, student.id))
          .limit(1),
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

    // Public profile data
    const publicProfile = {
      id: student.id,
      userId: user.id,
      firstName: student.firstName,
      lastName: student.lastName,
      email: user.email,
      phoneNumber: student.phoneNumber,
      university: student.university,
      major: student.major,
      graduationYear: student.graduationYear,
      gpa: student.gpa,
      location: student.location,
      careerInterest: student.careerInterest,
      aboutMe: student.aboutMe,
      resumeUrl: student.resumeUrl,
      socialLinks: socialLink[0]
        ? {
            linkedin: socialLink[0].linkedin || null,
            github: socialLink[0].github || null,
            website: socialLink[0].website || null,
          }
        : {
            linkedin: null,
            github: null,
            website: null,
          },
      skills: studentSkillsData.map((item) => item.skill),
      projects: studentProjects.map((project) => ({
        id: project.id,
        projectName: project.projectName,
        projectDescription: project.projectDescription,
      })),
      experiences: studentExperiences.map((experience) => ({
        id: experience.id,
        experienceTitle: experience.experienceTitle,
        experienceDescription: experience.experienceDescription,
      })),
      isVerified: user.isVerified,
      profileCreatedAt: student.createdAt,
    };

    return NextResponse.json(
      {
        success: true,
        data: publicProfile,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Student profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
