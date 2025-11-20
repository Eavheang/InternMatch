"use client";

import { useState, useRef, useEffect } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  UploadedResumeCard,
  AiResumeBuilderCard,
  ResumeAtsScoreCard,
  ResumeInfoCard,
  type ResumeAnalysis,
} from "@/components/dashboard/resume";

export default function ResumePage() {
  const { profileData } = useDashboard();
  const router = useRouter();
  const resumeUrl = profileData?.resumeUrl as string | undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(true);

  // Fetch stored analysis on mount
  useEffect(() => {
    if (resumeUrl) {
      fetchAnalysis();
    } else {
      setIsLoadingAnalysis(false);
    }
  }, [resumeUrl]);

  const fetchAnalysis = async () => {
    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) return;

      const response = await fetch("/api/students/resume/analyze", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
      }
    } catch (error) {
      console.error("Error fetching analysis:", error);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleBuildResume = () => {
    router.push("/dashboard/resume/builder");
  };

  const handleAnalyzeResume = async () => {
    if (!resumeUrl) {
      toast.error("Please upload a resume first");
      return;
    }

    setIsAnalyzing(true);
    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        toast.error("Please log in to analyze your resume");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/students/resume/analyze", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze resume");
      }

      if (data.success && data.analysis) {
        setAnalysis(data.analysis);
        toast.success("Resume analyzed successfully!");
      }
    } catch (error) {
      console.error("Analysis error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to analyze resume"
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("Only PDF files are allowed");
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        toast.error("Please log in to upload your resume");
        router.push("/login");
        return;
      }

      const response = await fetch("/api/students/resume/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload resume");
      }

      toast.success("Resume uploaded successfully!");

      // Refresh the page to update the profile data
      window.location.reload();
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload resume"
      );
    } finally {
      setIsUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="p-8 bg-gradient-to-br from-zinc-50 via-white to-purple-50/30 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-zinc-900 mb-2">Resume</h1>
          <p className="text-zinc-600">
            Manage your resume and build a new one with AI
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UploadedResumeCard
            resumeUrl={resumeUrl}
            isUploading={isUploading}
            onUploadClick={handleUploadClick}
            onFileChange={handleFileChange}
            fileInputRef={fileInputRef}
          />
          <AiResumeBuilderCard onBuildResume={handleBuildResume} />
        </div>

        {/* ATS Score Analysis Section */}
        <ResumeAtsScoreCard
          resumeUrl={resumeUrl}
          analysis={analysis}
          isLoadingAnalysis={isLoadingAnalysis}
          isAnalyzing={isAnalyzing}
          onAnalyzeResume={handleAnalyzeResume}
        />

        {resumeUrl && <ResumeInfoCard />}
      </div>
    </div>
  );
}
