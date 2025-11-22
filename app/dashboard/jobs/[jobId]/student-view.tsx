"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Share2 } from "lucide-react";

// Import the smaller components
import {
  JobHeader,
  ApplicationForm,
  JobDescription,
  JobRequirements,
  JobBenefits,
  JobDetailsSidebar,
  CompanyInfoCard,
} from "@/components/dashboard/jobs/student-job-components";

type JobDetail = {
  id: string;
  jobTitle: string;
  jobDescription: string;
  status: "open" | "closed" | "draft" | "paused";
  requirements?: {
    qualifications?: string[];
    skills?: string[];
    responsibilities?: string[];
    programType?: string;
    duration?: string;
    startDate?: string;
    deadline?: string;
  } | null;
  benefits?: string[] | null;
  salaryRange?: string | null;
  location?: string | null;
  jobType?: string | null;
  experienceLevel?: string | null;
  aiGenerated?: boolean | null;
  createdAt?: string;
  updatedAt?: string;
  applicationCount?: number | null;
  company?: {
    id: string;
    companyName: string;
    industry?: string;
    companySize?: string;
    website?: string;
    companyLogo?: string;
    companyLocation?: string;
    description?: string;
    contactName?: string;
    contactEmail?: string;
  };
};

export default function StudentJobView() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const { user } = useDashboard();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Application state
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(
    null
  );
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    if (!user?.id || user.role !== "student" || !params?.jobId) return;
    fetchJobDetails(params.jobId);
  }, [user, params?.jobId]);

  const fetchJobDetails = async (jobId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("internmatch_token");

      // Fetch job details
      const jobResponse = await fetch(`/api/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const jobData = await jobResponse.json();
      if (!jobResponse.ok) {
        throw new Error(jobData.error || "Failed to load job");
      }
      setJob(jobData.data);

      // Check if student has already applied
      const applicationResponse = await fetch(`/api/job/${jobId}/apply`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const applicationData = await applicationResponse.json();
      if (applicationResponse.ok && applicationData.data) {
        setHasApplied(applicationData.data.hasApplied);
        if (applicationData.data.application) {
          setApplicationStatus(applicationData.data.application.status);
        }
      }
    } catch (err) {
      console.error("Failed to load job details", err);
      setError(err instanceof Error ? err.message : "Failed to load job");
    } finally {
      setLoading(false);
    }
  };

  const handleJobApplication = async () => {
    if (!params?.jobId) return;

    try {
      setIsApplying(true);
      const token = localStorage.getItem("internmatch_token");
      const response = await fetch(`/api/job/${params.jobId}/apply`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          coverLetter: coverLetter.trim() || null,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setHasApplied(true);
      setApplicationStatus("applied");
      setShowApplicationForm(false);
      setCoverLetter("");
      toast.success("Application submitted successfully!");
    } catch (err) {
      console.error("Failed to submit application", err);
      toast.error(
        err instanceof Error ? err.message : "Failed to submit application"
      );
    } finally {
      setIsApplying(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800";
      case "reviewed":
        return "bg-yellow-100 text-yellow-800";
      case "interview":
        return "bg-purple-100 text-purple-800";
      case "offer":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "hired":
        return "bg-emerald-100 text-emerald-800";
      default:
        return "bg-zinc-100 text-zinc-800";
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="p-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div className="rounded-2xl border border-dashed border-rose-200 bg-rose-50 p-8 text-center">
          <p className="text-rose-600 font-medium">
            {error || "Job not found"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-indigo-50/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-8 py-6 md:py-8 space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="w-fit hover:bg-white/80 group"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            Back to Jobs
          </Button>
          <Button
            variant="outline"
            className="gap-2 hover:bg-white"
            onClick={async () => {
              const url = window.location.href;
              if (navigator.share) {
                try {
                  await navigator.share({
                    title: job.jobTitle,
                    text: `Check out this ${job.jobTitle} position`,
                    url: url,
                  });
                } catch (err) {
                  if (err instanceof Error && err.name !== "AbortError") {
                    console.error("Error sharing:", err);
                    toast.error("Failed to share");
                  }
                }
              } else {
                try {
                  await navigator.clipboard.writeText(url);
                  toast.success("Link copied to clipboard!");
                } catch (err) {
                  console.error("Failed to copy:", err);
                  toast.error("Failed to copy link");
                }
              }
            }}
          >
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        {/* Job Header */}
        <JobHeader
          job={job}
          hasApplied={hasApplied}
          applicationStatus={applicationStatus}
          onApplyClick={() => setShowApplicationForm(true)}
          getApplicationStatusColor={getApplicationStatusColor}
        />

        {/* Application Form */}
        {showApplicationForm && (
          <ApplicationForm
            jobTitle={job.jobTitle}
            coverLetter={coverLetter}
            setCoverLetter={setCoverLetter}
            onSubmit={handleJobApplication}
            onCancel={() => setShowApplicationForm(false)}
            isSubmitting={isApplying}
          />
        )}

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <JobDescription description={job.jobDescription} />

            {job.requirements && (
              <JobRequirements requirements={job.requirements} />
            )}

            {job.benefits && <JobBenefits benefits={job.benefits} />}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <JobDetailsSidebar job={job} formatDate={formatDate} />

            {job.company && <CompanyInfoCard company={job.company} />}
          </div>
        </div>
      </div>
    </div>
  );
}
