"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useDashboard,
  type User,
} from "@/components/dashboard/dashboard-context";
import { Loader2, Briefcase } from "lucide-react";
import { toast } from "sonner";
import {
  InterviewToolsHeader,
  ApplicationsSidebar,
  ApplicationAnalysis,
  RoleSuggestionsCard,
  InterviewQuestionsCard,
} from "@/components/dashboard/interview-tools";

type Application = {
  application: {
    id: string;
    status: string;
    appliedAt: string;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    university: string | null;
    major: string | null;
  };
  job: {
    id: string;
    jobTitle: string;
  };
};

type AIReview = {
  id: string;
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
  analyzedAt: string;
};

type RoleSuggestion = {
  role: string;
  percentage: number;
  reasoning: string;
  matchedSkills: string[];
  requiredSkills: string[];
};

type RoleSuggestionsData = {
  suggestions: RoleSuggestion[];
  totalPercentage: number;
  analysisDate: string;
  profileStrengths: string[];
  recommendedSkillDevelopment: string[];
};

type InterviewQuestions = {
  id: string;
  questions: Array<{
    question: string;
    intent: string;
    difficulty: string;
    relatedTo?: string;
  }>;
  createdAt: string;
};

type _ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "interviewed"
  | "hired"
  | "rejected";

export default function InterviewToolsPage() {
  const router = useRouter();
  const { user } = useDashboard();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [generatingQuestionsId, setGeneratingQuestionsId] = useState<
    string | null
  >(null);
  const [reviews, setReviews] = useState<Record<string, AIReview>>({});
  const [questions, setQuestions] = useState<
    Record<string, InterviewQuestions>
  >({});
  const [roleSuggestions, setRoleSuggestions] = useState<
    Record<string, RoleSuggestionsData>
  >({});
  const [generatingRoleSuggestionsId, setGeneratingRoleSuggestionsId] =
    useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<
    string | null
  >(null);

  // Filter out hired and rejected applications from Interview Tools
  const activeApplications = applications.filter(
    (app) =>
      app.application.status !== "hired" &&
      app.application.status !== "rejected"
  );

  const selectedApplication = activeApplications.find(
    (app) => app.application.id === selectedApplicationId
  );

  // If selected application is no longer active (hired/rejected), select the first active one
  useEffect(() => {
    if (
      selectedApplicationId &&
      !selectedApplication &&
      activeApplications.length > 0
    ) {
      setSelectedApplicationId(activeApplications[0].application.id);
    } else if (activeApplications.length === 0) {
      setSelectedApplicationId(null);
    }
  }, [selectedApplicationId, selectedApplication, activeApplications]);

  const fetchApplications = useCallback(
    async (currentUser: User) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("internmatch_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch(
          `/api/company/${currentUser.id}/applications`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load applications");
        }
        const apps = data.data?.applications || [];
        setApplications(apps);

        // Filter active applications for initial selection
        const activeApps = apps.filter(
          (app: { application: { status: string } }) =>
            app.application.status !== "hired" &&
            app.application.status !== "rejected"
        );

        if (activeApps.length > 0 && !selectedApplicationId) {
          setSelectedApplicationId(activeApps[0].application.id);
        }
      } catch (error) {
        console.error("Failed to load applications:", error);
        toast.error("Failed to load applications. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [router, selectedApplicationId]
  );

  useEffect(() => {
    if (!user?.id || user.role !== "company") return;
    fetchApplications(user);
  }, [user, fetchApplications]);

  useEffect(() => {
    if (selectedApplicationId) {
      loadReview(selectedApplicationId);
      loadQuestions(selectedApplicationId);
      loadRoleSuggestions(selectedApplicationId);
    }
  }, [selectedApplicationId]);

  const analyzeApplication = async (applicationId: string) => {
    if (!user?.id) return;
    setAnalyzingId(applicationId);
    try {
      const token = localStorage.getItem("internmatch_token");
      const response = await fetch("/api/ai/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Analysis failed");
      }

      const reviewResponse = await fetch(
        `/api/ai/review?applicationId=${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const reviewData = await reviewResponse.json();
      if (reviewData.success && reviewData.data?.length > 0) {
        setReviews((prev) => ({
          ...prev,
          [applicationId]: reviewData.data[0],
        }));
      }

      toast.success("Application analyzed successfully!");
    } catch (error) {
      console.error("Failed to analyze application:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to analyze application"
      );
    } finally {
      setAnalyzingId(null);
    }
  };

  const generateInterviewQuestions = async (applicationId: string) => {
    if (!user?.id) return;
    setGeneratingQuestionsId(applicationId);
    try {
      const token = localStorage.getItem("internmatch_token");
      const response = await fetch("/api/ai/interview", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId, count: 5 }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Question generation failed");
      }

      const questionsResponse = await fetch(
        `/api/ai/interview?applicationId=${applicationId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const questionsData = await questionsResponse.json();
      if (questionsData.success && questionsData.data?.length > 0) {
        setQuestions((prev) => ({
          ...prev,
          [applicationId]: questionsData.data[0],
        }));
      }

      toast.success("Interview questions generated successfully!");
    } catch (error) {
      console.error("Failed to generate questions:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate interview questions"
      );
    } finally {
      setGeneratingQuestionsId(null);
    }
  };

  const loadReview = useCallback(
    async (applicationId: string) => {
      if (!user?.id || reviews[applicationId]) return;
      try {
        const token = localStorage.getItem("internmatch_token");
        const response = await fetch(
          `/api/ai/review?applicationId=${applicationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success && data.data?.length > 0) {
          setReviews((prev) => ({
            ...prev,
            [applicationId]: data.data[0],
          }));
        }
      } catch (error) {
        console.error("Failed to load review:", error);
      }
    },
    [user?.id, reviews]
  );

  const loadQuestions = useCallback(
    async (applicationId: string) => {
      if (!user?.id || questions[applicationId]) return;
      try {
        const token = localStorage.getItem("internmatch_token");
        const response = await fetch(
          `/api/ai/interview?applicationId=${applicationId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success && data.data?.length > 0) {
          setQuestions((prev) => ({
            ...prev,
            [applicationId]: data.data[0],
          }));
        }
      } catch (error) {
        console.error("Failed to load questions:", error);
      }
    },
    [user?.id, questions]
  );

  const generateRoleSuggestions = async (applicationId: string) => {
    if (!user?.id) return;
    setGeneratingRoleSuggestionsId(applicationId);
    try {
      const token = localStorage.getItem("internmatch_token");
      const app = applications.find((a) => a.application.id === applicationId);
      if (!app) return;

      const response = await fetch("/api/ai/role-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: app.student.id,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Role suggestions generation failed");
      }

      setRoleSuggestions((prev) => ({
        ...prev,
        [applicationId]: data.data,
      }));

      toast.success("Role suggestions generated successfully!");
    } catch (error) {
      console.error("Failed to generate role suggestions:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate role suggestions"
      );
    } finally {
      setGeneratingRoleSuggestionsId(null);
    }
  };

  const loadRoleSuggestions = useCallback(
    async (applicationId: string) => {
      if (!user?.id || roleSuggestions[applicationId]) return;
      try {
        const token = localStorage.getItem("internmatch_token");
        const app = applications.find(
          (a) => a.application.id === applicationId
        );
        if (!app) return;

        const response = await fetch(
          `/api/ai/role-suggestions?studentId=${app.student.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await response.json();
        if (data.success && data.data?.length > 0) {
          // The content is already parsed in the API response
          setRoleSuggestions((prev) => ({
            ...prev,
            [applicationId]: data.data[0].content,
          }));
        }
      } catch (error) {
        console.error("Failed to load role suggestions:", error);
      }
    },
    [user?.id, roleSuggestions, applications]
  );

  const deleteInterviewData = async (applicationId: string) => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem("internmatch_token");
      const response = await fetch("/api/ai/interview/delete", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete interview data");
      }

      // Clear the local state for this application
      setReviews((prev) => {
        const newReviews = { ...prev };
        delete newReviews[applicationId];
        return newReviews;
      });

      setQuestions((prev) => {
        const newQuestions = { ...prev };
        delete newQuestions[applicationId];
        return newQuestions;
      });

      setRoleSuggestions((prev) => {
        const newRoleSuggestions = { ...prev };
        delete newRoleSuggestions[applicationId];
        return newRoleSuggestions;
      });

      toast.success("Interview data deleted successfully!");
    } catch (error) {
      console.error("Failed to delete interview data:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to delete interview data"
      );
      throw error; // Re-throw to handle in the UI
    }
  };

  if (user?.role !== "company") {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Interview Tools</h1>
        <p className="text-zinc-500">
          Company tools are not available for student accounts.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[80vh]">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col overflow-hidden bg-zinc-50/50">
      <InterviewToolsHeader candidateCount={activeApplications.length} />

      <main className="flex-1 flex overflow-hidden w-full h-full">
        <ApplicationsSidebar
          applications={activeApplications}
          selectedApplicationId={selectedApplicationId}
          onSelectApplication={setSelectedApplicationId}
          reviews={reviews}
          onDeleteInterviewData={deleteInterviewData}
        />

        <section className="flex-1 overflow-y-auto bg-zinc-50/50 p-6 lg:p-8">
          {selectedApplication ? (
            <div className="space-y-6">
              <ApplicationAnalysis
                application={selectedApplication}
                review={reviews[selectedApplication.application.id] || null}
                isAnalyzing={analyzingId === selectedApplication.application.id}
                onAnalyze={() =>
                  analyzeApplication(selectedApplication.application.id)
                }
              />

              {reviews[selectedApplication.application.id] && (
                <>
                  <RoleSuggestionsCard
                    studentName={selectedApplication.student.firstName}
                    roleSuggestions={
                      roleSuggestions[selectedApplication.application.id] ||
                      null
                    }
                    isGenerating={
                      generatingRoleSuggestionsId ===
                      selectedApplication.application.id
                    }
                    onGenerate={() =>
                      generateRoleSuggestions(
                        selectedApplication.application.id
                      )
                    }
                  />

                  <InterviewQuestionsCard
                    applicationStatus={selectedApplication.application.status}
                    studentName={selectedApplication.student.firstName}
                    questions={
                      questions[selectedApplication.application.id] || null
                    }
                    isGenerating={
                      generatingQuestionsId ===
                      selectedApplication.application.id
                    }
                    onGenerate={() =>
                      generateInterviewQuestions(
                        selectedApplication.application.id
                      )
                    }
                  />
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-400">
              <div className="text-center">
                <Briefcase className="w-16 h-16 mx-auto mb-4 opacity-20" />
                {activeApplications.length === 0 ? (
                  <div>
                    <p className="text-lg font-medium text-zinc-600 mb-2">
                      No Active Candidates
                    </p>
                    <p className="text-sm text-zinc-500">
                      Interview Tools shows candidates who are applied,
                      shortlisted, or interviewed.
                      <br />
                      Hired and rejected candidates are managed in the
                      Candidates section.
                    </p>
                  </div>
                ) : (
                  <p>Select a candidate to view interview details</p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
