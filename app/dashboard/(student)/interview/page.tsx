"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useDashboard,
  type User,
} from "@/components/dashboard/dashboard-context";
import { Loader2, BookOpen } from "lucide-react";
import { toast } from "sonner";
import {
  StudentInterviewHeader,
  ApplicationsSidebar,
  InterviewPreparation,
  PracticeQuestionsCard,
  InterviewTipsCard,
} from "@/components/dashboard/student-interview";

type Application = {
  application: {
    id: string;
    status: string;
    appliedAt: string;
    coverLetter?: string;
  };
  job: {
    id: string;
    jobTitle: string;
    jobDescription: string;
    requirements: string[];
  };
  company: {
    id: string;
    companyName: string;
    companyLogo?: string;
    industry?: string;
  };
};

type PracticeQuestions = {
  id: string;
  questions: Array<{
    question: string;
    category: string;
    difficulty: string;
    tips: string[];
    sampleAnswer?: string;
  }>;
  createdAt: string;
};

type InterviewTips = {
  general: string[];
  technical: string[];
  behavioral: string[];
  companySpecific: string[];
};

export default function StudentInterviewPage() {
  const router = useRouter();
  const { user } = useDashboard();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [generatingQuestionsId, setGeneratingQuestionsId] = useState<string | null>(null);
  const [practiceQuestions, setPracticeQuestions] = useState<Record<string, PracticeQuestions>>({});
  const [interviewTips, setInterviewTips] = useState<Record<string, InterviewTips>>({});
  const [generatingTipsId, setGeneratingTipsId] = useState<string | null>(null);
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(null);

  // Filter applications that are likely to have interviews (shortlisted, interviewed)
  const interviewApplications = applications.filter(
    (app) =>
      app.application.status === "shortlisted" ||
      app.application.status === "interviewed" ||
      app.application.status === "applied"
  );

  const selectedApplication = interviewApplications.find(
    (app) => app.application.id === selectedApplicationId
  );

  // Auto-select first application if none selected
  useEffect(() => {
    if (
      !selectedApplicationId &&
      interviewApplications.length > 0
    ) {
      setSelectedApplicationId(interviewApplications[0].application.id);
    } else if (interviewApplications.length === 0) {
      setSelectedApplicationId(null);
    }
  }, [selectedApplicationId, interviewApplications]);

  const fetchApplications = useCallback(async (currentUser: User) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/student/applications", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned an invalid response");
      }
      
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load applications");
      }
      const apps = data.data?.applications || [];
      setApplications(apps);

      // Filter for interview-relevant applications
      const interviewApps = apps.filter(
        (app: Application) =>
          app.application.status === "shortlisted" ||
          app.application.status === "interviewed" ||
          app.application.status === "applied"
      );

      if (interviewApps.length > 0 && !selectedApplicationId) {
        setSelectedApplicationId(interviewApps[0].application.id);
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
      toast.error("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [router, selectedApplicationId]);

  useEffect(() => {
    if (!user?.id || user.role !== "student") {
      // For demo purposes, load mock data if no user
      if (!user?.id) {
        setApplications([
          {
            application: {
              id: "mock-app-1",
              status: "shortlisted",
              appliedAt: new Date().toISOString(),
              coverLetter: "I am very interested in this position because it aligns perfectly with my career goals and technical skills. I have experience in React, Node.js, and database management which are directly relevant to this role."
            },
            job: {
              id: "mock-job-1",
              jobTitle: "Software Engineer Intern",
              jobDescription: "Join our engineering team to build scalable web applications",
              requirements: ["React", "JavaScript", "Node.js", "Database Management", "Problem Solving", "Team Collaboration"]
            },
            company: {
              id: "mock-company-1",
              companyName: "TechCorp",
              industry: "Technology",
              companyLogo: undefined
            }
          }
        ]);
        setSelectedApplicationId("mock-app-1");
        setLoading(false);
      }
      return;
    }
    fetchApplications(user);
  }, [user, fetchApplications]);

  useEffect(() => {
    if (selectedApplicationId) {
      loadPracticeQuestions(selectedApplicationId);
      loadInterviewTips(selectedApplicationId);
    }
  }, [selectedApplicationId]);

  const generatePracticeQuestions = async (applicationId: string) => {
    if (!user?.id) return;
    setGeneratingQuestionsId(applicationId);
    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        return;
      }

      const response = await fetch("/api/ai/student-interview-prep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId, type: "questions" }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Question generation failed");
      }

      setPracticeQuestions((prev) => ({
        ...prev,
        [applicationId]: data.data,
      }));

      toast.success("Practice questions generated successfully!");
    } catch (error) {
      console.error("Failed to generate questions:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate practice questions"
      );
    } finally {
      setGeneratingQuestionsId(null);
    }
  };

  const generateInterviewTips = async (applicationId: string) => {
    if (!user?.id) return;
    setGeneratingTipsId(applicationId);
    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        toast.error("Authentication required. Please log in again.");
        return;
      }

      const response = await fetch("/api/ai/student-interview-prep", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ applicationId, type: "tips" }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Tips generation failed");
      }

      setInterviewTips((prev) => ({
        ...prev,
        [applicationId]: data.data,
      }));

      toast.success("Interview tips generated successfully!");
    } catch (error) {
      console.error("Failed to generate tips:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate interview tips"
      );
    } finally {
      setGeneratingTipsId(null);
    }
  };

  const loadPracticeQuestions = async (applicationId: string) => {
    if (!user?.id || practiceQuestions[applicationId]) return;
    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) return;

      const response = await fetch(
        `/api/ai/student-interview-prep?applicationId=${applicationId}&type=questions`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success && data.data) {
        setPracticeQuestions((prev) => ({
          ...prev,
          [applicationId]: data.data,
        }));
      }
    } catch (error) {
      console.error("Failed to load practice questions:", error);
    }
  };

  const loadInterviewTips = async (applicationId: string) => {
    if (!user?.id || interviewTips[applicationId]) return;
    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) return;

      const response = await fetch(
        `/api/ai/student-interview-prep?applicationId=${applicationId}&type=tips`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (data.success && data.data) {
        setInterviewTips((prev) => ({
          ...prev,
          [applicationId]: data.data,
        }));
      }
    } catch (error) {
      console.error("Failed to load interview tips:", error);
    }
  };

  if (user?.role !== "student") {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Interview Preparation</h1>
        <p className="text-zinc-500">
          Student tools are not available for company accounts.
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
      <StudentInterviewHeader applicationCount={interviewApplications.length} />

      <main className="flex-1 flex overflow-hidden w-full h-full">
        <ApplicationsSidebar
          applications={interviewApplications}
          selectedApplicationId={selectedApplicationId}
          onSelectApplication={setSelectedApplicationId}
        />

        <section className="flex-1 overflow-y-auto bg-zinc-50/50 p-6 lg:p-8">
          {selectedApplication ? (
            <div className="space-y-6">
              <InterviewPreparation
                application={selectedApplication}
              />

              <PracticeQuestionsCard
                jobTitle={selectedApplication.job.jobTitle}
                companyName={selectedApplication.company.companyName}
                questions={practiceQuestions[selectedApplication.application.id] || null}
                isGenerating={generatingQuestionsId === selectedApplication.application.id}
                onGenerate={() => generatePracticeQuestions(selectedApplication.application.id)}
              />

              <InterviewTipsCard
                jobTitle={selectedApplication.job.jobTitle}
                companyName={selectedApplication.company.companyName}
                industry={selectedApplication.company.industry}
                tips={interviewTips[selectedApplication.application.id] || null}
                isGenerating={generatingTipsId === selectedApplication.application.id}
                onGenerate={() => generateInterviewTips(selectedApplication.application.id)}
              />
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-400">
              <div className="text-center">
                <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-20" />
                {interviewApplications.length === 0 ? (
                  <div>
                    <p className="text-lg font-medium text-zinc-600 mb-2">
                      No Applications for Interview Prep
                    </p>
                    <p className="text-sm text-zinc-500">
                      Apply to jobs to access interview preparation tools.
                      <br />
                      Practice questions and tips will be generated based on your applications.
                    </p>
                  </div>
                ) : (
                  <p>Select an application to start interview preparation</p>
                )}
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}