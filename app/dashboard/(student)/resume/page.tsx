"use client";

import { useState, useRef } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { FileText, Sparkles, Download, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function ResumePage() {
  const { profileData } = useDashboard();
  const router = useRouter();
  const resumeUrl = profileData?.resumeUrl as string | undefined;
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleBuildResume = () => {
    router.push("/dashboard/resume/builder");
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
          {/* Uploaded Resume Card */}
          <Card className="p-6 border-2 border-zinc-200 hover:border-purple-300 transition-colors">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-zinc-900 mb-1">
                  Uploaded Resume
                </h2>
                <p className="text-sm text-zinc-600 mb-4">
                  {resumeUrl
                    ? "Your resume is ready to view and download"
                    : "No resume uploaded yet"}
                </p>
                {resumeUrl ? (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={handleUploadClick}
                      disabled={isUploading}
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload New Resume
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 gap-2"
                      onClick={() => {
                        const link = document.createElement("a");
                        link.href = resumeUrl;
                        link.download = "resume.pdf";
                        link.click();
                      }}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={handleUploadClick}
                      disabled={isUploading}
                      className="w-full gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
                    >
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          Upload Resume
                        </>
                      )}
                    </Button>
                    <p className="text-xs text-zinc-500 text-center">
                      PDF format only, max 10MB
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
            </div>
          </Card>

          {/* AI Resume Builder Card */}
          <Card className="p-6 border-2 border-purple-200 hover:border-purple-400 transition-colors bg-gradient-to-br from-purple-50/50 to-white">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-semibold text-zinc-900 mb-1">
                  Build Resume with AI
                </h2>
                <p className="text-sm text-zinc-600 mb-4">
                  Create a professional resume using our AI-powered builder. Get
                  personalized suggestions and optimize for ATS systems.
                </p>
                <Button
                  onClick={handleBuildResume}
                  className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white gap-2 shadow-lg shadow-purple-500/20"
                >
                  <Sparkles className="w-4 h-4" />
                  Start Building
                </Button>
              </div>
            </div>
          </Card>
        </div>

        {/* Additional Info Section */}
        {resumeUrl && (
          <Card className="mt-6 p-6 bg-blue-50/50 border-blue-200">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg
                  className="w-3 h-3 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold text-blue-900 mb-1">
                  About Your Resumes
                </h3>
                <p className="text-sm text-blue-800">
                  You can have both an uploaded resume and an AI-built resume.
                  The uploaded resume is what you provided during sign-up, while
                  the AI builder helps you create an optimized version tailored
                  for specific job applications.
                </p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
