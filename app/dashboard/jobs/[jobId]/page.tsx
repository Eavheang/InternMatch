"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  CalendarDays,
  DollarSign,
  Briefcase,
  Users,
  Clock3,
  Edit3,
  Share2,
  Award,
  Sparkles,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { EditJobDialog } from "@/components/dashboard/jobs/edit-job-dialog";
import { type EditFormState } from "@/components/dashboard/jobs/types";
import StudentJobView from "./student-view";

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
};

const statusStyles: Record<
  JobDetail["status"],
  { label: string; bg: string; text: string; dot: string }
> = {
  open: {
    label: "Active",
    bg: "bg-emerald-100/80",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed",
    bg: "bg-rose-100/80",
    text: "text-rose-700",
    dot: "bg-rose-500",
  },
  draft: {
    label: "Draft",
    bg: "bg-zinc-100",
    text: "text-zinc-600",
    dot: "bg-zinc-500",
  },
  paused: {
    label: "Paused",
    bg: "bg-amber-100/80",
    text: "text-amber-700",
    dot: "bg-amber-500",
  },
};

export default function JobDetailPage() {
  const params = useParams<{ jobId: string }>();
  const router = useRouter();
  const { user } = useDashboard();
  const [job, setJob] = useState<JobDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<EditFormState>({
    jobTitle: "",
    department: "",
    location: "",
    programType: "",
    duration: "",
    salaryRange: "",
    jobDescription: "",
    responsibilities: "",
    qualifications: "",
    skills: [],
    benefits: "",
    startDate: "",
    deadline: "",
    status: "draft",
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  
  // Student-specific state
  const [hasApplied, setHasApplied] = useState(false);
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null);
  const [isApplying, setIsApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  useEffect(() => {
    if (!user?.id || !params?.jobId) return;
    if (user.role === "company") {
      fetchJob(user.id, params.jobId);
    } else if (user.role === "student") {
      fetchStudentJobDetails(params.jobId);
    }
  }, [user, params?.jobId]);

  const fetchJob = async (userId: string, jobId: string) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("internmatch_token");
      const response = await fetch(`/api/company/${userId}/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load job");
      }
      setJob(data.data);
    } catch (err) {
      console.error("Failed to load job", err);
      setError(err instanceof Error ? err.message : "Failed to load job");
    } finally {
      setLoading(false);
    }
  };

  const fetchStudentJobDetails = async (jobId: string) => {
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

  const requirementList = useMemo(() => {
    return {
      responsibilities: job?.requirements?.responsibilities || [],
      qualifications: job?.requirements?.qualifications || [],
      skills: job?.requirements?.skills || [],
    };
  }, [job]);

  const openEditDialog = () => {
    if (!job) return;
    setEditForm({
      jobTitle: job.jobTitle || "",
      department: "",
      location: job.location || "",
      programType: job.requirements?.programType || "",
      duration: job.requirements?.duration || "",
      salaryRange: job.salaryRange || "",
      jobDescription: job.jobDescription || "",
      responsibilities: job.requirements?.responsibilities?.join("\n") || "",
      qualifications: job.requirements?.qualifications?.join("\n") || "",
      skills: job.requirements?.skills || [],
      benefits: job.benefits?.join("\n") || "",
      startDate: job.requirements?.startDate || "",
      deadline: job.requirements?.deadline || "",
      status: job.status || "draft",
    });
    setIsEditOpen(true);
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
      toast.error(err instanceof Error ? err.message : "Failed to submit application");
    } finally {
      setIsApplying(false);
    }
  };

  const handleEditSave = async () => {
    if (!job || !user?.id) return;
    setIsSavingEdit(true);
    try {
      const token = localStorage.getItem("internmatch_token");
      const response = await fetch(`/api/company/${user.id}/job/${job.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobTitle: editForm.jobTitle,
          jobDescription: editForm.jobDescription,
          requirements: {
            qualifications: editForm.qualifications.split("\n").filter(Boolean),
            skills: editForm.skills,
            responsibilities: editForm.responsibilities
              .split("\n")
              .filter(Boolean),
            programType: editForm.programType,
            duration: editForm.duration,
            startDate: editForm.startDate,
            deadline: editForm.deadline,
          },
          benefits: editForm.benefits.split("\n").filter(Boolean),
          salaryRange: editForm.salaryRange,
          location: editForm.location,
          jobType: "internship",
          status: editForm.status,
          department: editForm.department,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update job");
      }
      setJob(data.data);
      toast.success("Job updated successfully");
      setIsEditOpen(false);
    } catch (error) {
      console.error("Failed to update job:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update job"
      );
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Route students to student view
  if (user?.role === "student") {
    return <StudentJobView />;
  }

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 py-6 md:py-8 lg:py-10 space-y-6 md:space-y-8">
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
          <div className="flex items-center gap-3">
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
                    // User cancelled or error occurred
                    if (err instanceof Error && err.name !== "AbortError") {
                      console.error("Error sharing:", err);
                      toast.error("Failed to share");
                    }
                  }
                } else {
                  // Fallback: copy to clipboard
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
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 gap-2 shadow-lg shadow-indigo-200"
              onClick={openEditDialog}
            >
              <Edit3 className="w-4 h-4" />
              Edit Job
            </Button>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative overflow-hidden rounded-2xl border border-zinc-200/80 bg-white shadow-lg shadow-zinc-100/50">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-indigo-100/20 to-transparent rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-purple-100/20 to-transparent rounded-full blur-3xl" />

          <div className="relative px-6 py-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div className="space-y-5 flex-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-2 rounded-full bg-indigo-100/80 px-4 py-1.5 text-xs font-semibold text-indigo-700 border border-indigo-200/50">
                    <Briefcase className="w-3.5 h-3.5" />
                    {job.jobType || "Internship"}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold border ${statusStyles[job.status].bg} ${statusStyles[job.status].text} shadow-sm`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${statusStyles[job.status].dot}`}
                    />
                    {statusStyles[job.status].label}
                  </span>
                  {job.aiGenerated && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100/80 px-3 py-1 text-xs font-medium text-purple-700 border border-purple-200/50">
                      <Sparkles className="w-3 h-3" />
                      AI Generated
                    </span>
                  )}
                </div>
                <h1 className="text-4xl md:text-5xl font-bold text-zinc-900 leading-tight tracking-tight">
                  {job.jobTitle}
                </h1>
                <div className="flex flex-wrap gap-6 text-sm">
                  <InlineMeta
                    icon={<MapPin className="w-4 h-4" />}
                    text={job.location || "Remote friendly"}
                  />
                  <InlineMeta
                    icon={<CalendarDays className="w-4 h-4" />}
                    text={`Posted ${
                      job.createdAt
                        ? new Date(job.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })
                        : "—"
                    }`}
                  />
                  <InlineMeta
                    icon={<DollarSign className="w-4 h-4" />}
                    text={job.salaryRange || "Competitive stipend"}
                  />
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <HighlightCard
                icon={<Briefcase className="w-5 h-5" />}
                label="Program Type"
                value={job.requirements?.programType || "Summer Internship"}
              />
              <HighlightCard
                icon={<Clock3 className="w-5 h-5" />}
                label="Duration"
                value={job.requirements?.duration || "12 weeks"}
              />
              <HighlightCard
                icon={<CalendarDays className="w-5 h-5" />}
                label="Application Deadline"
                value={
                  job.requirements?.deadline
                    ? new Date(job.requirements.deadline).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )
                    : "Not set"
                }
              />
              <HighlightCard
                icon={<Users className="w-5 h-5" />}
                label="Applicants"
                value={`${job.applicationCount || 0} ${job.applicationCount === 1 ? "candidate" : "candidates"}`}
                highlight={!!(job.applicationCount && job.applicationCount > 0)}
              />
            </div>
          </div>
        </section>

        {/* Role Overview */}
        <Card className="border-zinc-200/80 shadow-lg shadow-zinc-100/50 bg-white/80 backdrop-blur-sm">
          <CardHeader className="px-6 py-6 border-b border-zinc-100">
            <div className="space-y-1">
              <CardTitle className="text-2xl font-bold text-zinc-900">
                Role Overview
              </CardTitle>
              <p className="text-sm text-zinc-500">
                Detailed description of the position and expectations
              </p>
            </div>
          </CardHeader>
          <CardContent className="px-6 py-6 space-y-6">
            <div className="prose prose-zinc max-w-none">
              <p className="text-base md:text-lg text-zinc-700 leading-relaxed whitespace-pre-wrap">
                {job.jobDescription}
              </p>
            </div>
            <div className="rounded-xl border border-dashed border-indigo-200/60 bg-gradient-to-br from-indigo-50/80 to-purple-50/40 p-6">
              <div className="flex flex-wrap items-center gap-4 text-sm text-indigo-800">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-4 h-4 text-indigo-600" />
                  <span className="text-zinc-600">Start date:</span>
                  <span className="font-semibold text-indigo-900">
                    {job.requirements?.startDate
                      ? new Date(job.requirements.startDate).toLocaleDateString(
                          "en-US",
                          {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          }
                        )
                      : "Flexible"}
                  </span>
                </div>
                <div className="w-1 h-1 rounded-full bg-indigo-300" />
                <div className="flex items-center gap-2">
                  <Clock3 className="w-4 h-4 text-indigo-600" />
                  <span className="text-zinc-600">Duration:</span>
                  <span className="font-semibold text-indigo-900">
                    {job.requirements?.duration || "12 weeks"}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Responsibilities & Qualifications */}
        <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
          <ListCard
            title="Key Responsibilities"
            icon={<CheckCircle2 className="w-5 h-5" />}
            items={requirementList.responsibilities}
            emptyText="No responsibilities added yet."
            color="indigo"
          />
          <ListCard
            title="Qualifications"
            icon={<Award className="w-5 h-5" />}
            items={requirementList.qualifications}
            emptyText="No qualifications listed."
            color="purple"
          />
        </div>

        {/* Skills & Benefits Grid */}
        <div className="grid gap-6 md:gap-8 lg:grid-cols-2">
          <Card className="border-zinc-200/80 shadow-lg shadow-zinc-100/50 bg-white/80 backdrop-blur-sm">
            <CardHeader className="px-6 py-6 border-b border-zinc-100">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-zinc-900">
                  Skill Highlights
                </CardTitle>
                <p className="text-sm text-zinc-500">
                  Technical and soft skills required for this role
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-6">
              {requirementList.skills.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {requirementList.skills.map((skill, idx) => (
                    <span
                      key={`${skill}-${idx}`}
                      className="inline-flex items-center gap-1.5 rounded-full border border-purple-200/60 bg-gradient-to-br from-purple-50 to-indigo-50 px-4 py-2 text-sm font-medium text-purple-700 shadow-sm hover:shadow-md transition-shadow"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                      {skill}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center">
                  <Sparkles className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-400 text-sm font-medium">
                    No specific skills highlighted. Add some to improve AI
                    matching.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-200/80 shadow-lg shadow-zinc-100/50 bg-white/80 backdrop-blur-sm">
            <CardHeader className="px-6 py-6 border-b border-zinc-100">
              <div className="space-y-1">
                <CardTitle className="text-xl font-bold text-zinc-900">
                  Benefits & Perks
                </CardTitle>
                <p className="text-sm text-zinc-500">
                  What makes this opportunity special
                </p>
              </div>
            </CardHeader>
            <CardContent className="px-6 py-6">
              {job.benefits && job.benefits.length > 0 ? (
                <div className="flex flex-wrap gap-3">
                  {job.benefits.map((benefit, idx) => (
                    <BenefitPill key={`${benefit}-${idx}`} text={benefit} />
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center">
                  <Award className="w-8 h-8 text-zinc-300 mx-auto mb-3" />
                  <p className="text-zinc-400 text-sm font-medium">
                    No benefits listed.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <EditJobDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          formData={editForm}
          onFormChange={setEditForm}
          onSave={handleEditSave}
          isSaving={isSavingEdit}
        />
      </div>
    </div>
  );
}

function HighlightCard({
  icon,
  label,
  value,
  highlight,
}: {
  icon: ReactNode;
  label: string;
  value?: string | null;
  highlight?: boolean;
}) {
  return (
    <div
      className={`group relative overflow-hidden rounded-xl border transition-all duration-300 ${
        highlight
          ? "border-indigo-200 bg-gradient-to-br from-indigo-50/80 to-white shadow-sm shadow-indigo-100/50"
          : "border-zinc-200 bg-white shadow-sm hover:shadow-md"
      } p-5 hover:scale-[1.01]`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`rounded-xl p-2.5 transition-colors ${
            highlight
              ? "bg-indigo-600/15 text-indigo-600"
              : "bg-indigo-100/60 text-indigo-600 group-hover:bg-indigo-100"
          }`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1.5">
            {label}
          </p>
          <p
            className={`text-base font-bold text-zinc-900 leading-tight ${
              highlight ? "text-indigo-900" : ""
            }`}
          >
            {value || "—"}
          </p>
        </div>
      </div>
    </div>
  );
}

function InlineMeta({ icon, text }: { icon: ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-2 text-sm font-medium text-zinc-700 bg-white/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-zinc-200/60 shadow-sm">
      <span className="text-indigo-500">{icon}</span>
      {text}
    </span>
  );
}

function ListCard({
  title,
  items,
  emptyText,
  icon: _icon,
  color = "indigo",
}: {
  title: string;
  items: string[];
  emptyText: string;
  icon?: ReactNode;
  color?: "indigo" | "purple";
}) {
  const colorClasses = {
    indigo: {
      iconBg: "bg-indigo-100 text-indigo-600",
      dot: "bg-indigo-500",
      border: "border-indigo-200/60",
    },
    purple: {
      iconBg: "bg-purple-100 text-purple-600",
      dot: "bg-purple-500",
      border: "border-purple-200/60",
    },
  };

  const colors = colorClasses[color];

  return (
    <Card className="border-zinc-200/80 shadow-lg shadow-zinc-100/50 bg-white/80 backdrop-blur-sm h-full">
      <CardHeader className="px-6 py-6 border-b border-zinc-100">
        <div className="space-y-1">
          <CardTitle className="text-xl font-bold text-zinc-900">
            {title}
          </CardTitle>
          <p className="text-sm text-zinc-500">
            {title === "Key Responsibilities"
              ? "What you'll be doing day-to-day"
              : "What we're looking for in candidates"}
          </p>
        </div>
      </CardHeader>
      <CardContent className="px-6 py-6">
        {items.length > 0 ? (
          <ul className="space-y-3">
            {items.map((item, idx) => (
              <li key={`${item}-${idx}`} className="flex gap-3 group/item">
                <span
                  className={`mt-1.5 inline-block h-1.5 w-1.5 rounded-full ${colors.dot} flex-shrink-0 group-hover/item:scale-125 transition-transform`}
                />
                <span className="text-sm text-zinc-700 leading-relaxed flex-1">
                  {item}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50/50 p-8 text-center">
            <p className="text-zinc-400 text-sm font-medium">{emptyText}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function BenefitPill({ text }: { text: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-green-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm hover:shadow-md transition-all hover:scale-105">
      <Award className="w-3.5 h-3.5" />
      {text}
    </span>
  );
}
