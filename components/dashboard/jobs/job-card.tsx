import { useRouter } from "next/navigation";
import { Briefcase, Users, Edit3, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { JobStatusBadge } from "./job-status-badge";
import { JobMeta } from "./job-meta";
import { type JobPosting } from "./types";

type JobCardProps = {
  job: JobPosting;
  onEdit: (job: JobPosting) => void;
  onDelete: (jobId: string) => void;
  isDeleting?: boolean;
};

export function JobCard({ job, onEdit, onDelete, isDeleting }: JobCardProps) {
  const router = useRouter();

  return (
    <Card
      className="border-zinc-200 shadow-sm hover:shadow-md transition cursor-pointer"
      onClick={() => router.push(`/dashboard/jobs/${job.id}`)}
    >
      <CardContent className="p-6 space-y-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-indigo-50 p-2 text-indigo-600">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-xl font-semibold text-zinc-900">
                    {job.jobTitle}
                  </h3>
                  <JobStatusBadge status={job.status} />
                </div>
                <p className="text-sm text-zinc-500">
                  {job.jobType || "Internship"} • {job.location || "Remote"} • Posted{" "}
                  {job.createdAt
                    ? new Date(job.createdAt).toLocaleDateString()
                    : "—"}
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-4">
              <JobMeta
                label="Type"
                value={job.requirements?.programType || "Summer 2025"}
              />
              <JobMeta
                label="Duration"
                value={job.requirements?.duration || "12 weeks"}
              />
              <JobMeta label="Salary" value={job.salaryRange || "$—"} />
              <JobMeta
                label="Deadline"
                value={
                  job.requirements?.deadline ||
                  (job.updatedAt
                    ? new Date(job.updatedAt).toLocaleDateString().toString()
                    : "—")
                }
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="text-sm text-zinc-500 flex items-center gap-2 justify-end">
              <Users className="w-4 h-4 text-zinc-400" />
              {job.applicationCount || 0} applicants
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(job);
                }}
              >
                <Edit3 className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(job.id);
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

