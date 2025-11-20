import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  users,
  students,
  companies,
  socialLinks,
  skills,
  studentSkills,
  projects,
  experiences,
} from "@/db/schema";
import { eq } from "drizzle-orm";
// import { getAuthenticatedUser } from "@/lib/auth-helpers"; // Unused for now
import { verifyToken } from "@/lib/auth";

// GET - Fetch user profile
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded;
    try {
      decoded = await verifyToken(token);
    } catch (error) {
      console.error("Token verification error:", error);
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 }
      );
    }

    const userId = decoded.userId;
    const userRole = decoded.role;

    // Get user basic info
    const [userData] = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Remove sensitive data
    const {
      password: _password,
      verificationCode: _verificationCode,
      verificationExpires: _verificationExpires,
      ...userInfo
    } = userData;

    const profileData: {
      id: string;
      email: string;
      role: string;
      isVerified: boolean;
      createdAt: Date | null;
      profile: unknown;
      [key: string]: unknown;
    } = {
      ...userInfo,
      profile: null,
    };

    // Get role-specific profile data
    if (userRole === "student") {
      try {
        // Get student with social links in one query
        const [studentWithSocialLinks] = await db
          .select({
            student: students,
            socialLink: socialLinks,
          })
          .from(students)
          .leftJoin(socialLinks, eq(socialLinks.studentId, students.id))
          .where(eq(students.userId, userId))
          .limit(1);

        if (studentWithSocialLinks?.student) {
          const student = studentWithSocialLinks.student;
          const socialLink = studentWithSocialLinks.socialLink;

          // Get skills, projects, and experiences in parallel
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

          profileData.profile = {
            ...student,
            socialLinks: socialLink
              ? {
                  linkedin: socialLink.linkedin || null,
                  github: socialLink.github || null,
                  website: socialLink.website || null,
                }
              : {
                  linkedin: null,
                  github: null,
                  website: null,
                },
            skills: studentSkillsData.map((item) => item.skill),
            projects: studentProjects,
            experiences: studentExperiences,
          };
        }
      } catch (dbError) {
        console.error("Error fetching student profile:", dbError);
        return NextResponse.json(
          { error: "Failed to fetch student profile" },
          { status: 500 }
        );
      }
    } else if (userRole === "company") {
      try {
        const [company] = await db
          .select()
          .from(companies)
          .where(eq(companies.userId, userId))
          .limit(1);

        if (company) {
          profileData.profile = {
            ...company,
            headquarters: company.headquarters || company.location,
            location: company.location || company.headquarters,
          };
        }
      } catch (dbError) {
        console.error("Error fetching company profile:", dbError);
        return NextResponse.json(
          { error: "Failed to fetch company profile" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        data: profileData,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT - Update user profile
export async function PUT(request: NextRequest) {
  try {
    // Get user info - try middleware headers first, then fallback to token verification
    let userId = request.headers.get("x-user-id");
    let userRole = request.headers.get("x-user-role");
    let userEmail = request.headers.get("x-user-email");

    // Always verify token directly in API route (more reliable than middleware)
    const authHeader = request.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization token required" },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Verify token
    let decoded;
    try {
      decoded = await verifyToken(token);
      // Use decoded values (they're the source of truth)
      userId = decoded.userId;
      userRole = decoded.role;
      userEmail = decoded.email;

      console.log("Token verified in API route:", {
        userId,
        email: userEmail,
        role: userRole,
        isVerified: decoded.isVerified,
      });
    } catch (error) {
      console.error("Token verification error in API route:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Invalid or expired token";
      const errorName = error instanceof Error ? error.name : "Unknown";

      return NextResponse.json(
        {
          error: "Invalid or expired token",
          details:
            process.env.NODE_ENV === "development"
              ? `${errorName}: ${errorMessage}`
              : undefined,
        },
        { status: 401 }
      );
    }

    if (!userId || !userRole) {
      return NextResponse.json(
        { error: "User information not found" },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Update role-specific profile
    if (userRole === "student") {
      const {
        firstName,
        lastName,
        gmail,
        phoneNumber,
        location,
        university,
        major,
        graduationYear,
        gpa,
        resumeUrl,
        careerInterest,
        aboutMe,
        socialLinks: socialLinksData,
        skills: skillsData,
        projects: projectsData,
        experiences: experiencesData,
      } = body;

      // Get student record
      const [student] = await db
        .select()
        .from(students)
        .where(eq(students.userId, userId))
        .limit(1);

      if (!student) {
        return NextResponse.json(
          { error: "Student profile not found" },
          { status: 404 }
        );
      }

      // Update student basic info
      await db
        .update(students)
        .set({
          firstName,
          lastName,
          gmail,
          phoneNumber,
          location,
          university,
          major,
          graduationYear,
          gpa,
          resumeUrl,
          careerInterest,
          aboutMe,
        })
        .where(eq(students.id, student.id));

      // Update social links
      if (socialLinksData) {
        const [existingSocialLinks] = await db
          .select()
          .from(socialLinks)
          .where(eq(socialLinks.studentId, student.id))
          .limit(1);

        if (existingSocialLinks) {
          await db
            .update(socialLinks)
            .set(socialLinksData)
            .where(eq(socialLinks.id, existingSocialLinks.id));
        } else {
          await db.insert(socialLinks).values({
            studentId: student.id,
            ...socialLinksData,
          });
        }
      }

      // Update skills (delete existing and insert new)
      if (skillsData && Array.isArray(skillsData)) {
        // Delete existing skills
        await db
          .delete(studentSkills)
          .where(eq(studentSkills.studentId, student.id));

        // Insert new skills
        for (const skillName of skillsData) {
          // Check if skill exists, if not create it
          const [existingSkill] = await db
            .select()
            .from(skills)
            .where(eq(skills.name, skillName))
            .limit(1);

          let skillId;
          if (existingSkill) {
            skillId = existingSkill.id;
          } else {
            const [newSkill] = await db
              .insert(skills)
              .values({ name: skillName })
              .returning();
            skillId = newSkill.id;
          }

          // Link skill to student
          await db.insert(studentSkills).values({
            studentId: student.id,
            skillId: skillId,
          });
        }
      }

      // Update projects
      if (projectsData && Array.isArray(projectsData)) {
        // Delete existing projects
        await db.delete(projects).where(eq(projects.studentId, student.id));

        // Insert new projects (only if array is not empty)
        if (projectsData.length > 0) {
          for (const project of projectsData) {
            if (project.projectName) {
              await db.insert(projects).values({
                studentId: student.id,
                projectName: project.projectName,
                projectDescription: project.projectDescription || "",
              });
            }
          }
        }
      }

      // Update experiences
      if (experiencesData && Array.isArray(experiencesData)) {
        // Delete existing experiences
        await db
          .delete(experiences)
          .where(eq(experiences.studentId, student.id));

        // Insert new experiences (only if array is not empty)
        if (experiencesData.length > 0) {
          for (const experience of experiencesData) {
            if (experience.experienceTitle) {
              await db.insert(experiences).values({
                studentId: student.id,
                experienceTitle: experience.experienceTitle,
                experienceDescription: experience.experienceDescription || "",
              });
            }
          }
        }
      }
    } else if (userRole === "company") {
      const {
        companyName,
        industry,
        companySize,
        website,
        companyLogo,
        location,
        headquarters,
        otherLocations,
        description,
        companyCulture,
        contactName,
        contactEmail,
        contactPhone,
        hasInternshipProgram,
      } = body;

      // Get company record
      const [company] = await db
        .select()
        .from(companies)
        .where(eq(companies.userId, userId))
        .limit(1);

      if (!company) {
        return NextResponse.json(
          { error: "Company profile not found" },
          { status: 404 }
        );
      }

      // Update company info
      await db
        .update(companies)
        .set({
          companyName,
          industry,
          companySize,
          website,
          companyLogo,
          location,
          headquarters,
          otherLocations,
          description,
          companyCulture,
          contactName,
          contactEmail,
          contactPhone,
          hasInternshipProgram:
            typeof hasInternshipProgram === "boolean"
              ? hasInternshipProgram
              : null,
        })
        .where(eq(companies.id, company.id));
    }

    // No need to generate new token - token payload (userId, email, role, isVerified) doesn't change
    // Profile data is stored in database, not in token
    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Profile update error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : "Unknown error",
      stack: error instanceof Error ? error.stack : undefined,
    });
    return NextResponse.json(
      {
        error: "Internal server error",
        details:
          process.env.NODE_ENV === "development"
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : undefined,
      },
      { status: 500 }
    );
  }
}
