"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  useDashboard,
  type User,
} from "@/components/dashboard/dashboard-context";
import { Button } from "@/components/ui/button";
import { Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  type JobPosting,
  type EditFormState,
  type JobStatus,
} from "@/components/dashboard/jobs/types";
import { JobSummaryCards } from "@/components/dashboard/jobs/job-summary-cards";
import { JobSearchBar } from "@/components/dashboard/jobs/job-search-bar";
import { JobCard } from "@/components/dashboard/jobs/job-card";
import { EditJobDialog } from "@/components/dashboard/jobs/edit-job-dialog";
import { StudentJobBrowsing } from "@/components/dashboard/jobs/student-job-browsing";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

type SummaryKey = "all" | "open" | "paused" | "closed" | "draft";

export default function JobsPage() {
  const router = useRouter();
  const { user } = useDashboard();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<SummaryKey>("all");
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
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
  const [deletingJobId, setDeletingJobId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const fetchJobs = useCallback(
    async (currentUser: User) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("internmatch_token");
        if (!token) {
          router.push("/login");
          return;
        }
        const response = await fetch(`/api/company/${currentUser.id}/job`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(data.error || "Failed to load jobs");
        }
        setJobs(data.data?.jobs || []);
      } catch (error) {
        console.error("Failed to load jobs:", error);
        toast.error("Failed to load jobs. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  useEffect(() => {
    if (!user?.id || user.role !== "company") return;
    fetchJobs(user);
  }, [user, fetchJobs]);

  const _statusCounts = useMemo(() => {
    return jobs.reduce(
      (acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      },
      {} as Record<JobStatus, number>
    );
  }, [jobs]);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        job.jobTitle.toLowerCase().includes(search.toLowerCase()) ||
        (job.location || "").toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        activeFilter === "all" ? true : job.status === activeFilter;
      return matchesSearch && matchesFilter;
    });
  }, [jobs, search, activeFilter]);

  const openEditDialog = (job: JobPosting) => {
    setSelectedJob(job);
    setEditForm({
      jobTitle: job.jobTitle || "",
      department: "", // Not stored separately, would need to extract from description if needed
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

  const handleEditSave = async () => {
    if (!selectedJob || !user?.id) return;
    setIsSavingEdit(true);
    try {
      const token = localStorage.getItem("internmatch_token");
      const response = await fetch(
        `/api/company/${user.id}/job/${selectedJob.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            jobTitle: editForm.jobTitle,
            jobDescription: editForm.jobDescription,
            requirements: {
              qualifications: editForm.qualifications
                .split("\n")
                .filter(Boolean),
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
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update job");
      }
      setJobs((prev) =>
        prev.map((job) =>
          job.id === data.data.id ? { ...job, ...data.data } : job
        )
      );
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

  const handleDelete = (jobId: string) => {
    setJobToDelete(jobId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!jobToDelete || !user?.id) return;
    try {
      setDeletingJobId(jobToDelete);
      const token = localStorage.getItem("internmatch_token");
      const response = await fetch(
        `/api/company/${user.id}/job/${jobToDelete}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to delete job");
      }
      setJobs((prev) => prev.filter((job) => job.id !== jobToDelete));
      toast.success("Job deleted successfully");
      setDeleteDialogOpen(false);
      setJobToDelete(null);
    } catch (error) {
      console.error("Failed to delete job:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to delete job"
      );
    } finally {
      setDeletingJobId(null);
    }
  };

  // Show student job browsing interface for students
  if (user?.role === "student") {
    return <StudentJobBrowsing />;
  }

  // Show company management interface for companies
  if (user?.role !== "company") {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Browse Jobs</h1>
        <p className="text-zinc-500">Please log in to access job features.</p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
            Manage Jobs
          </p>
          <h1 className="text-3xl font-bold text-zinc-900 mt-1">
            View and edit your job postings
          </h1>
          <p className="text-sm text-zinc-500">
            Monitor performance, update details, and track candidate interest.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard/jobs/new")}
          className="bg-indigo-600 hover:bg-indigo-700 flex items-center gap-2 self-start"
        >
          <Briefcase className="w-4 h-4" />
          Post New Job
        </Button>
      </header>

      <JobSummaryCards
        jobs={jobs}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
      />

      <JobSearchBar search={search} onSearchChange={setSearch} />

      <section className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center">
            <p className="text-zinc-600">
              No jobs found. Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              isDeleting={deletingJobId === job.id}
            />
          ))
        )}
      </section>

      <EditJobDialog
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        formData={editForm}
        onFormChange={setEditForm}
        onSave={handleEditSave}
        isSaving={isSavingEdit}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Job Posting</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this job posting? This action
              cannot be undone and all associated applications will be removed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setJobToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={!!deletingJobId}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              {deletingJobId ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
