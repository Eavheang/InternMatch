"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Step2Education } from "./steps/step2-education";
import { Step3Skills } from "./steps/step3-skills";
import { Step4ProjectsExperience } from "./steps/step4-projects-experience";
import { Step6Resume } from "./steps/step6-resume";
import { Step5Review } from "./steps/step5-review";

type ProfileData = {
  // Step 2: Education
  university: string;
  major: string;
  graduationYear: string;
  gpa: string;

  // Step 3: Skills
  skills: string[];

  // Step 4: Projects & Experience
  projects: Array<{
    projectName: string;
    projectDescription: string;
    technologiesUsed: string;
  }>;
  experiences: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;

  // Step 5: Resume
  resumeFile?: File | null;
  resumeUrl?: string | null;
};

const TOTAL_STEPS = 5;

export function CompleteProfileFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState<ProfileData>({
    university: "",
    major: "",
    graduationYear: "",
    gpa: "",
    skills: [],
    projects: [],
    experiences: [],
    resumeFile: null,
    resumeUrl: null,
  });

  // Check if profile is already complete on mount
  useEffect(() => {
    const checkProfile = async () => {
      try {
        const token = localStorage.getItem("internmatch_token");
        if (!token) {
          // Layout already handles this, but just in case
          return;
        }

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Only proceed if response is OK - don't redirect on errors (layout handles that)
        if (response.ok) {
          const data = await response.json();
          const profile = data.data?.profile || data.profile;

          // If profile is complete, redirect to dashboard
          if (
            profile &&
            profile.university &&
            profile.major &&
            profile.graduationYear
          ) {
            router.push("/dashboard");
            return;
          }

          // Pre-fill form with existing data if available
          if (profile) {
            setFormData({
              university: profile.university || "",
              major: profile.major || "",
              graduationYear: profile.graduationYear?.toString() || "",
              gpa: profile.gpa?.toString() || "",
              skills: profile.skills || [],
              projects:
                profile.projects?.map(
                  (p: {
                    projectName?: string;
                    projectDescription?: string;
                  }) => ({
                    projectName: p.projectName || "",
                    projectDescription: p.projectDescription || "",
                    technologiesUsed: "",
                  })
                ) || [],
              experiences:
                profile.experiences?.map(
                  (e: {
                    experienceTitle?: string;
                    experienceDescription?: string;
                  }) => {
                    // Parse experience title and description
                    const titleMatch =
                      e.experienceTitle?.match(/(.+?)\s+at\s+(.+)/);
                    const durationMatch = e.experienceDescription?.match(
                      /Duration:\s*(.+?)\n\n/
                    );
                    return {
                      company: titleMatch?.[2] || "",
                      role: titleMatch?.[1] || "",
                      duration: durationMatch?.[1] || "",
                      description:
                        e.experienceDescription?.replace(
                          /Duration:.*?\n\n/,
                          ""
                        ) || "",
                    };
                  }
                ) || [],
            });
          }
        }
      } catch (error) {
        console.error("Error checking profile:", error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, [router]);

  const updateFormData = (
    stepData: Partial<ProfileData>,
    callback?: () => void
  ) => {
    console.log("updateFormData called with:", stepData);
    setFormData((prev) => {
      const updated = { ...prev, ...stepData };
      console.log("Updated formData:", updated);
      // If callback provided, execute it after state update
      if (callback) {
        // Use setTimeout to ensure state update is applied
        setTimeout(callback, 0);
      }
      return updated;
    });
  };

  // Debug: Log formData changes
  useEffect(() => {
    console.log("formData changed:", formData);
    console.log("Current step:", currentStep);
  }, [formData, currentStep]);

  const handleNext = () => {
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        console.error("No token found in localStorage");
        router.push("/login");
        return;
      }

      // Debug: Log token info
      console.log(
        "Token found:",
        token ? `${token.substring(0, 20)}...` : "No token"
      );

      // Try to decode token to check if it's valid (just for debugging)
      let tokenPayload: {
        userId?: string;
        email?: string;
        role?: string;
        isVerified?: boolean;
        exp?: number;
      } | null = null;
      try {
        const tokenParts = token.split(".");
        if (tokenParts.length === 3) {
          tokenPayload = JSON.parse(atob(tokenParts[1]));
          if (tokenPayload) {
            console.log("Token payload:", {
              userId: tokenPayload.userId,
              email: tokenPayload.email,
              role: tokenPayload.role,
              isVerified: tokenPayload.isVerified,
              exp: tokenPayload.exp
                ? new Date(tokenPayload.exp * 1000).toISOString()
                : "No expiration",
              isExpired: tokenPayload.exp
                ? Date.now() > tokenPayload.exp * 1000
                : false,
            });
          }

          // Check if token is expired
          if (
            tokenPayload &&
            tokenPayload.exp &&
            Date.now() > tokenPayload.exp * 1000
          ) {
            console.warn("Token is expired, redirecting to login");
            localStorage.removeItem("internmatch_token");
            alert("Your session has expired. Please log in again.");
            router.push("/login");
            return;
          }
        }
      } catch (e) {
        console.warn("Could not decode token:", e);
      }

      // If token shows isVerified: false, try to refresh it by calling verify-email again
      // This shouldn't happen if user verified email, but just in case
      if (tokenPayload && !tokenPayload.isVerified) {
        console.warn(
          "Token shows user is not verified. Please verify your email first."
        );
        router.push("/verify-2fa");
        return;
      }

      // Debug: Log formData before sending
      console.log("FormData before submit:", formData);
      console.log("Projects:", formData.projects);
      console.log("Experiences:", formData.experiences);

      // Prepare data for API
      const payload = {
        university: formData.university,
        major: formData.major,
        graduationYear: formData.graduationYear
          ? parseInt(formData.graduationYear)
          : null,
        gpa: formData.gpa ? parseFloat(formData.gpa) : null,
        skills: formData.skills || [],
        projects: (formData.projects || []).map((p) => ({
          projectName: p.projectName,
          projectDescription: p.technologiesUsed
            ? `${p.projectDescription}\n\nTechnologies: ${p.technologiesUsed}`
            : p.projectDescription,
        })),
        experiences: (formData.experiences || []).map((e) => ({
          experienceTitle: `${e.role} at ${e.company}`,
          experienceDescription: `Duration: ${e.duration}\n\n${e.description}`,
        })),
      };

      console.log("Payload being sent:", payload);

      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      // Check response status first
      if (!response.ok) {
        let errorData: { error?: string; details?: string } = {};
        const contentType = response.headers.get("content-type");

        try {
          if (contentType && contentType.includes("application/json")) {
            errorData = await response.json();
          } else {
            const text = await response.text();
            errorData = { error: text || "Failed to save profile" };
          }
        } catch (parseError) {
          console.error("Error parsing response:", parseError);
          errorData = { error: "Failed to save profile" };
        }

        console.error("API Error:", errorData);
        console.error("Response status:", response.status);
        console.error(
          "Token being used:",
          token ? `${token.substring(0, 20)}...` : "No token"
        );

        // If token is invalid, redirect to login
        if (response.status === 401) {
          console.error(
            "Token validation failed. Clearing token and redirecting to login."
          );
          localStorage.removeItem("internmatch_token");
          alert("Your session has expired. Please log in again.");
          router.push("/login");
          return;
        }
        throw new Error(
          errorData.error || errorData.details || "Failed to save profile"
        );
      }

      // Parse response only if successful
      const responseData = await response.json();
      console.log("API Response:", responseData);
      console.log("Profile saved successfully");

      // No new token needed - existing token remains valid since token payload doesn't change
      // Profile data is stored in database, not in token
      console.log(
        "[Profile Complete] Profile saved successfully, redirecting to dashboard"
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 100);
    } catch (error) {
      console.error("Error saving profile:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save profile. Please try again.";

      // Only redirect to login if it's an authentication error
      // For other errors, show alert but stay on the page
      if (
        error instanceof Error &&
        (error.message.includes("401") ||
          error.message.includes("unauthorized"))
      ) {
        localStorage.removeItem("internmatch_token");
        alert("Your session has expired. Please log in again.");
        router.push("/login");
      } else {
        alert(errorMessage);
        // Stay on the page so user can try again
      }
    }
  };

  const progress = (currentStep / TOTAL_STEPS) * 100;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl px-4 py-12">
      <div className="mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-zinc-900">
                Complete Your Profile
              </h1>
              <p className="mt-2 text-zinc-600">
                Let&apos;s set up your account to find the perfect internship
              </p>
            </div>
            <div className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white">
              Step {currentStep} of {TOTAL_STEPS}
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {currentStep === 1 && (
            <Step2Education
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
            />
          )}
          {currentStep === 2 && (
            <Step3Skills
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
          {currentStep === 3 && (
            <Step4ProjectsExperience
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
          {currentStep === 4 && (
            <Step6Resume
              data={formData}
              onUpdate={updateFormData}
              onNext={handleNext}
              onPrevious={handlePrevious}
            />
          )}
          {currentStep === 5 && (
            <Step5Review
              data={formData}
              onPrevious={handlePrevious}
              onSubmit={handleSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}
