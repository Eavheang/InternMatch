"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import {
  Briefcase,
  Loader2,
  FileText,
  Users,
  Clock,
  UserCheck,
  XCircle,
  CheckCircle2,
  Award,
  ChevronDown,
  Calendar,
  MapPin,
  GraduationCap,
  ExternalLink,
  Building2,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type ApplicationStatus = "all" | "applied" | "shortlisted" | "rejected" | "interviewed" | "hired";

type StudentApplication = {
  application: {
    id: string;
    status: "applied" | "shortlisted" | "rejected" | "interviewed" | "hired";
    coverLetter?: string | null;
    appliedAt: string;
    updatedAt: string;
  };
  job: {
    id: string;
    jobTitle: string;
    jobDescription: string;
    status: string;
    salaryRange?: string | null;
    location?: string | null;
    jobType?: string | null;
    experienceLevel?: string | null;
    createdAt: string;
  };
  company: {
    id: string;
    companyName: string;
    industry?: string;
    companySize?: string;
    companyLogo?: string | null;
    companyLocation?: string;
  };
};

export default function StudentApplicationsPage() {
  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeStatus, setActiveStatus] = useState<ApplicationStatus>("all");
  const [statistics, setStatistics] = useState({
    total: 0,
    applied: 0,
    shortlisted: 0,
    interviewed: 0,
    hired: 0,
    rejected: 0,
  });

  useEffect(() => {
    fetchApplications();
  }, [activeStatus]);

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        throw new Error("Authentication required");
      }

      // Build query parameters
      const params = new URLSearchParams();
      if (activeStatus !== "all") {
        params.append("status", activeStatus);
      }
      params.append("limit", "50");
      
      const response = await fetch(`/api/student/applications?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to load applications");
      }
      
      if (data.success) {
        setApplications(data.data.applications || []);
        setStatistics(data.data.statistics || {
          total: 0,
          applied: 0,
          shortlisted: 0,
          interviewed: 0,
          hired: 0,
          rejected: 0,
        });
      } else {
        setApplications([]);
      }
    } catch (err) {
      console.error("Error fetching applications:", err);
      setError(err instanceof Error ? err.message : "Failed to load applications");
      toast.error("Failed to load applications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [activeStatus]);

  const filteredApplications = useMemo(() => {
    return applications.filter((app) => {
      if (activeStatus === "all") return true;
      return app.application.status === activeStatus;
    });
  }, [applications, activeStatus]);

  const statsMap = useMemo(() => {
    return {
      all: statistics.total || 0,
      applied: statistics.applied || 0,
      shortlisted: statistics.shortlisted || 0,
      interviewed: statistics.interviewed || 0,
      hired: statistics.hired || 0,
      rejected: statistics.rejected || 0,
    };
  }, [statistics]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
            Track Your Progress
          </p>
          <h1 className="text-3xl font-bold text-zinc-900 mt-1">
            My Applications
          </h1>
          <p className="text-sm text-zinc-500">
            Keep track of all your job applications and their current status.
          </p>
        </div>
      </header>

      {/* Statistics Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <StatCard
          label="All Applications"
          value={statsMap.all}
          icon={Users}
          color="indigo"
        />
        <StatCard
          label="Applied"
          value={statsMap.applied}
          icon={Clock}
          color="blue"
        />
        <StatCard
          label="Shortlisted"
          value={statsMap.shortlisted}
          icon={UserCheck}
          color="purple"
        />
        <StatCard
          label="Interviewed"
          value={statsMap.interviewed}
          icon={CheckCircle2}
          color="indigo"
        />
        <StatCard
          label="Hired"
          value={statsMap.hired}
          icon={Award}
          color="emerald"
        />
        <StatCard
          label="Rejected"
          value={statsMap.rejected}
          icon={XCircle}
          color="rose"
        />
      </div>



      {/* Applications List */}
      <section className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center">
            <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-600 font-medium">
              Unable to load applications. {error}
            </p>
          </div>
        ) : filteredApplications.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-10 text-center">
            <Users className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
            <p className="text-zinc-600 font-medium">
              {activeStatus === "all" 
                ? "No applications found. Start applying to jobs to see them here!"
                : `No ${activeStatus} applications found.`}
            </p>
          </div>
        ) : (
          filteredApplications.map((app) => (
            <ApplicationCard key={app.application.id} application={app} />
          ))
        )}
      </section>
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

function ApplicationCard({ application }: { application: StudentApplication }) {
  const { application: app, job, company } = application;

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "applied":
        return {
          label: "Applied",
          bg: "bg-blue-100",
          text: "text-blue-700",
          icon: Clock,
        };
      case "shortlisted":
        return {
          label: "Shortlisted",
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          icon: UserCheck,
        };
      case "interviewed":
        return {
          label: "Interviewed",
          bg: "bg-purple-100",
          text: "text-purple-700",
          icon: CheckCircle2,
        };
      case "hired":
        return {
          label: "Hired",
          bg: "bg-emerald-100",
          text: "text-emerald-700",
          icon: Award,
        };
      case "rejected":
        return {
          label: "Rejected",
          bg: "bg-rose-100",
          text: "text-rose-700",
          icon: XCircle,
        };
      default:
        return {
          label: "Applied",
          bg: "bg-zinc-100",
          text: "text-zinc-700",
          icon: Clock,
        };
    }
  };

  const status = getStatusConfig(app.status);
  const StatusIcon = status.icon;

  return (
    <Card className="border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: Job & Company Info */}
          <div className="flex-1 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                {/* Company Logo */}
                <div className="flex-shrink-0">
                  {company.companyLogo ? (
                    <img
                      src={company.companyLogo}
                      alt={`${company.companyName} logo`}
                      className="w-12 h-12 rounded-lg object-cover border border-zinc-200"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {company.companyName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-xl font-bold text-zinc-900">
                    {job.jobTitle}
                  </h3>
                  <p className="text-sm text-zinc-500 mt-1">
                    <span className="font-semibold text-zinc-700">
                      {company.companyName}
                    </span>
                  </p>
                </div>
              </div>
              
              <span
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${status.bg} ${status.text}`}
              >
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {job.location && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <MapPin className="w-4 h-4 text-indigo-500" />
                  <span>{job.location}</span>
                </div>
              )}
              {company.industry && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Building2 className="w-4 h-4 text-indigo-500" />
                  <span>{company.industry}</span>
                </div>
              )}
              {job.salaryRange && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <DollarSign className="w-4 h-4 text-indigo-500" />
                  <span>{job.salaryRange}</span>
                </div>
              )}
              {job.jobType && (
                <div className="flex items-center gap-2 text-sm text-zinc-600">
                  <Briefcase className="w-4 h-4 text-indigo-500" />
                  <span className="capitalize">{job.jobType}</span>
                </div>
              )}
            </div>

            <p className="text-sm text-zinc-600 line-clamp-2">
              {job.jobDescription}
            </p>

            {app.coverLetter && (
              <div className="mt-4 p-4 bg-zinc-50 rounded-xl border border-zinc-200">
                <p className="text-xs font-semibold text-zinc-500 mb-2">
                  Cover Letter
                </p>
                <p className="text-sm text-zinc-700 line-clamp-3">
                  {app.coverLetter}
                </p>
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <Calendar className="w-3 h-3" />
              <span>
                Applied{" "}
                {new Date(app.appliedAt).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col gap-3 lg:w-64">
            <Button
              variant="outline"
              className="w-full justify-start gap-2"
              onClick={() => {
                window.open(`/dashboard/jobs/${job.id}`, "_blank");
              }}
            >
              <FileText className="w-4 h-4" />
              View Job Details
              <ExternalLink className="w-3 h-3 ml-auto" />
            </Button>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200">
              <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-2">
                Application Status
              </p>
              <div className="flex items-center gap-2">
                <StatusIcon className="w-4 h-4 text-zinc-600" />
                <span className="text-sm font-medium text-zinc-900">
                  {status.label}
                </span>
              </div>
              {app.updatedAt !== app.appliedAt && (
                <p className="text-xs text-zinc-500 mt-2">
                  Last updated{" "}
                  {new Date(app.updatedAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
