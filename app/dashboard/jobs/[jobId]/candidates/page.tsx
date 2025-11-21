"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  useDashboard,
  type User,
} from "@/components/dashboard/dashboard-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import {
  Loader2,
  Users,
  FileText,
  Mail,
  MapPin,
  GraduationCap,
  Award,
  ExternalLink,
  Clock,
  UserCheck,
  XCircle,
  CheckCircle2,
  ArrowLeft,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import {
  CandidateDetailDialog,
  statusConfig,
  type Application,
  type ApplicationStatus,
} from "@/components/dashboard/candidates";

type Statistics = {
  status: ApplicationStatus;
  count: number;
};

type JobDetails = {
  id: string;
  jobTitle: string;
  jobDescription: string;
  location: string | null;
  jobType: string | null;
  experienceLevel: string | null;
  createdAt: string;
};

export default function JobCandidatesPage() {
  const router = useRouter();
  const params = useParams();
  const jobId = params.jobId as string;
  const { user } = useDashboard();

  const [applications, setApplications] = useState<Application[]>([]);
  const [jobDetails, setJobDetails] = useState<JobDetails | null>(null);
  const [statistics, setStatistics] = useState<Statistics[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<
    ApplicationStatus | "all"
  >("all");
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] =
    useState<Application | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    if (!user?.id || user.role !== "company" || !jobId) return;
    fetchJobCandidates(user);
  }, [user, jobId, selectedStatus]);

  const fetchJobCandidates = async (currentUser: User) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const params = new URLSearchParams();
      params.append("jobId", jobId);
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      const response = await fetch(
        `/api/company/${currentUser.id}/applications?${params.toString()}`,
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

      const applicationsList = data.data?.applications || [];
      setApplications(applicationsList);
      setStatistics(data.data?.statistics || []);

      // Set job details from the first application (if any)
      if (applicationsList.length > 0) {
        setJobDetails(applicationsList[0].job);
      } else {
        // Fetch job details separately if no applications
        fetchJobDetails(currentUser, jobId);
      }
    } catch (error) {
      console.error("Failed to load applications:", error);
      toast.error("Failed to load candidates. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobDetails = async (currentUser: User, jobId: string) => {
    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) return;

      const response = await fetch(`/api/job/${jobId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok && data.data) {
        setJobDetails(data.data);
      }
    } catch (error) {
      console.error("Failed to load job details:", error);
    }
  };

  const handleStatusUpdate = async (
    applicationId: string,
    newStatus: ApplicationStatus
  ) => {
    if (!user?.id) return;
    setUpdatingStatus(applicationId);
    try {
      const token = localStorage.getItem("internmatch_token");
      const response = await fetch(
        `/api/company/${user.id}/applications/${applicationId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update status");
      }
      toast.success(
        `Application status updated to ${statusConfig[newStatus].label}`
      );
      // Refresh applications
      fetchJobCandidates(user);
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update status"
      );
    } finally {
      setUpdatingStatus(null);
    }
  };

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      const matchesSearch =
        search === "" ||
        `${app.student.firstName} ${app.student.lastName}`
          .toLowerCase()
          .includes(search.toLowerCase()) ||
        app.student.university?.toLowerCase().includes(search.toLowerCase());
      return matchesSearch;
    });
  }, [applications, search]);

  const statsMap = useMemo(() => {
    const map: Record<string, number> = { all: applications.length };
    statistics.forEach((stat) => {
      map[stat.status] = stat.count;
    });
    return map;
  }, [statistics, applications]);

  if (user?.role !== "company") {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Job Candidates</h1>
        <p className="text-zinc-500">
          Company tools are not available for student accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header with Back Button */}
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>

        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
            <Briefcase className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
              Job Candidates
            </p>
            <h1 className="text-3xl font-bold text-zinc-900 mt-1">
              {jobDetails?.jobTitle || "Loading..."}
            </h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-600">
              {jobDetails?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {jobDetails.location}
                </span>
              )}
              {jobDetails?.jobType && (
                <span className="capitalize">{jobDetails.jobType}</span>
              )}
              {jobDetails?.experienceLevel && (
                <span className="capitalize">{jobDetails.experienceLevel}</span>
              )}
            </div>
            <p className="text-sm text-zinc-500 mt-1">
              Review and manage candidates who applied for this position.
            </p>
          </div>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard
          label="All Candidates"
          value={statsMap.all || 0}
          icon={Users}
          color="indigo"
        />
        <StatCard
          label="Applied"
          value={statsMap.applied || 0}
          icon={Clock}
          color="blue"
        />
        <StatCard
          label="Shortlisted"
          value={statsMap.shortlisted || 0}
          icon={UserCheck}
          color="purple"
        />
        <StatCard
          label="Interviewed"
          value={statsMap.interviewed || 0}
          icon={CheckCircle2}
          color="indigo"
        />
        <StatCard
          label="Hired"
          value={statsMap.hired || 0}
          icon={Award}
          color="emerald"
        />
        <StatCard
          label="Rejected"
          value={statsMap.rejected || 0}
          icon={XCircle}
          color="rose"
        />
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="flex-1 text-black">
          <input
            type="text"
            placeholder="Search by name or university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) =>
              setSelectedStatus(e.target.value as ApplicationStatus | "all")
            }
            className="w-full sm:w-48 px-4 py-2 text-black border border-zinc-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none bg-white pr-10"
          >
            <option value="all">All Statuses</option>
            {Object.entries(statusConfig).map(([value, config]) => (
              <option key={value} value={value}>
                {config.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications List */}
      <section className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center">
            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-zinc-900 mb-2">
              No candidates found
            </h3>
            <p className="text-zinc-600">
              {applications.length === 0
                ? "No one has applied for this position yet."
                : "Try adjusting your search or filters."}
            </p>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <CandidateCard
              key={app.application.id}
              application={app}
              onStatusUpdate={handleStatusUpdate}
              isUpdating={updatingStatus === app.application.id}
              onClick={() => {
                setSelectedApplication(app);
                setIsDialogOpen(true);
              }}
            />
          ))
        )}
      </section>

      {/* Candidate Detail Dialog */}
      {selectedApplication && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <CandidateDetailDialog
            application={selectedApplication}
            onStatusUpdate={handleStatusUpdate}
            isUpdating={updatingStatus === selectedApplication.application.id}
            onClose={() => setIsDialogOpen(false)}
          />
        </Dialog>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: "indigo" | "blue" | "purple" | "emerald" | "rose";
}) {
  const colorClasses = {
    indigo: "bg-indigo-100 text-indigo-600",
    blue: "bg-blue-100 text-blue-600",
    purple: "bg-purple-100 text-purple-600",
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600",
  };

  return (
    <Card className="border-zinc-200/80 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-zinc-500 font-semibold mb-1">
              {label}
            </p>
            <p className="text-2xl font-bold text-zinc-900">{value}</p>
          </div>
          <div className={`rounded-xl p-3 ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CandidateCard({
  application,
  onStatusUpdate,
  isUpdating,
  onClick,
}: {
  application: Application;
  onStatusUpdate: (id: string, status: ApplicationStatus) => void;
  isUpdating: boolean;
  onClick: () => void;
}) {
  const status = statusConfig[application.application.status];
  const StatusIcon = status.icon;

  return (
    <Card
      className="border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Candidate Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-zinc-900">
                  {application.student.firstName} {application.student.lastName}
                </h3>
                <p className="text-sm text-zinc-500 mt-1">
                  Applied on{" "}
                  {new Date(
                    application.application.appliedAt
                  ).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}
              >
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {application.student.university && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <GraduationCap className="w-4 h-4 text-indigo-500" />
                  <span>
                    {application.student.university}
                    {application.student.major &&
                      ` • ${application.student.major}`}
                    {application.student.graduationYear &&
                      ` • ${application.student.graduationYear}`}
                  </span>
                </div>
              )}
              {application.student.location && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span>{application.student.location}</span>
                </div>
              )}
              {application.user.email && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  <span>{application.user.email}</span>
                </div>
              )}
              {application.student.gpa && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Award className="w-4 h-4 text-indigo-500" />
                  <span>GPA: {application.student.gpa.toFixed(1)}</span>
                </div>
              )}
            </div>

            {application.student.aboutMe && (
              <p className="text-sm text-zinc-600 line-clamp-2">
                {application.student.aboutMe}
              </p>
            )}

            {application.application.coverLetter && (
              <div className="mt-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                <p className="text-xs font-semibold text-zinc-500 mb-2">
                  Cover Letter
                </p>
                <p className="text-sm text-zinc-700 line-clamp-3">
                  {application.application.coverLetter}
                </p>
              </div>
            )}
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-3 lg:w-64">
            {application.student.resumeUrl && (
              <Button
                variant="outline"
                className="w-full justify-start gap-2"
                onClick={(e) => {
                  e.stopPropagation();
                  if (application.student.resumeUrl) {
                    window.open(application.student.resumeUrl, "_blank");
                  }
                }}
              >
                <FileText className="w-4 h-4" />
                View Resume
                <ExternalLink className="w-3 h-3 ml-auto" />
              </Button>
            )}

            <div className="space-y-2" onClick={(e) => e.stopPropagation()}>
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide">
                Update Status
              </p>
              <div className="flex flex-col gap-2">
                {application.application.status === "applied" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full"
                      onClick={() =>
                        onStatusUpdate(
                          application.application.id,
                          "shortlisted"
                        )
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Shortlist"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                      onClick={() =>
                        onStatusUpdate(application.application.id, "rejected")
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Reject"
                      )}
                    </Button>
                  </>
                )}
                {application.application.status === "shortlisted" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full"
                      onClick={() =>
                        onStatusUpdate(
                          application.application.id,
                          "interviewed"
                        )
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Mark as Interviewed"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                      onClick={() =>
                        onStatusUpdate(application.application.id, "hired")
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Hire"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                      onClick={() =>
                        onStatusUpdate(application.application.id, "rejected")
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Reject"
                      )}
                    </Button>
                  </>
                )}
                {application.application.status === "interviewed" && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
                      onClick={() =>
                        onStatusUpdate(application.application.id, "hired")
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Hire"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs w-full bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
                      onClick={() =>
                        onStatusUpdate(application.application.id, "rejected")
                      }
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        "Reject"
                      )}
                    </Button>
                  </>
                )}
                {(application.application.status === "hired" ||
                  application.application.status === "rejected") && (
                  <p className="text-xs text-zinc-500 text-center py-2">
                    Status finalized
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
