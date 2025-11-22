"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { type User, type ProfileData } from "./dashboard-context";

type StudentDashboardProps = {
  user: User | null;
  profileData: ProfileData | null;
};

type Job = {
  id: string;
  jobTitle: string;
  jobDescription?: string;
  companyName?: string;
  companyLogo?: string;
  location?: string;
  industry?: string;
  salaryRange?: string;
  jobType?: string;
  experienceLevel?: string;
  status?: string;
  createdAt?: string;
  [key: string]: unknown;
};

export function StudentDashboard({ user, profileData }: StudentDashboardProps) {
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    activePostings: 0,
    activePostingsChange: "+0 from last week",
    totalApplications: 0,
    applicationsChange: "+0 from last week",
    interviewsScheduled: 0,
    interviewsChange: "+0 from last week",
  });

  useEffect(() => {
    const fetchRecentJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the 5 most recent open jobs
        const jobsResponse = await fetch(`/api/job?status=open&limit=5`);

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();

          if (jobsData?.success && jobsData.data?.jobs) {
            const jobs = jobsData.data.jobs;

            // Transform the job data for easier use
            const transformedJobs = jobs.map(
              (job: {
                id: string;
                jobTitle: string;
                jobDescription: string;
                requirements?: unknown;
                benefits?: unknown;
                company?: {
                  id?: string;
                  companyName?: string;
                  companyLogo?: string;
                  industry?: string;
                  companySize?: string;
                  website?: string;
                };
                [key: string]: unknown;
              }) => ({
                id: job.id,
                jobTitle: job.jobTitle,
                jobDescription: job.jobDescription,
                requirements:
                  typeof job.requirements === "string"
                    ? job.requirements
                    : JSON.stringify(job.requirements),
                benefits:
                  typeof job.benefits === "string"
                    ? job.benefits
                    : JSON.stringify(job.benefits),
                salaryRange:
                  typeof job.salaryRange === "string"
                    ? job.salaryRange
                    : undefined,
                location:
                  typeof job.location === "string" ? job.location : undefined,
                jobType:
                  typeof job.jobType === "string" ? job.jobType : undefined,
                experienceLevel:
                  typeof job.experienceLevel === "string"
                    ? job.experienceLevel
                    : undefined,
                createdAt:
                  typeof job.createdAt === "string" ? job.createdAt : undefined,
                status: typeof job.status === "string" ? job.status : undefined,
                companyId: job.company?.id,
                companyName: job.company?.companyName,
                companyLogo: job.company?.companyLogo,
                industry: job.company?.industry,
                companySize: job.company?.companySize,
                website: job.company?.website,
              })
            );

            setRecentJobs(transformedJobs);

            // Update stats based on recent jobs
            setStats({
              activePostings: transformedJobs.length,
              activePostingsChange: `+${transformedJobs.length} from last week`,
              totalApplications: 0,
              applicationsChange: "+0 from last week",
              interviewsScheduled: 0,
              interviewsChange: "+0 from last week",
            });
          } else {
            setError("No jobs available at the moment");
          }
        } else {
          setError("Failed to load jobs");
        }
      } catch (err) {
        console.error("Error fetching recent jobs:", err);
        setError("Failed to load recent jobs");
      } finally {
        setLoading(false);
      }
    };

    fetchRecentJobs();
  }, []);

  return (
    <main className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900">
          Welcome back,{" "}
          {profileData?.firstName || user?.email?.split("@")[0] || "User"}! 👋
        </h1>
        <p className="mt-2 text-zinc-600">
          Here&apos;s what&apos;s happening with your internship search
        </p>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-3">
        <StatsCard
          title="New Jobs This Week"
          value={stats.activePostings.toString()}
          change={stats.activePostingsChange}
          changeType={stats.activePostings > 0 ? "positive" : "neutral"}
        />

        <StatsCard
          title="Applications"
          value={stats.totalApplications.toString()}
          change={stats.applicationsChange}
          changeType={stats.totalApplications > 0 ? "positive" : "neutral"}
        />

        <StatsCard
          title="Interviews Scheduled"
          value={stats.interviewsScheduled.toString()}
          change={stats.interviewsChange}
          changeType={stats.interviewsScheduled > 0 ? "positive" : "neutral"}
        />
      </div>

      {/* Recent Job Posts */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 flex items-center gap-2">
            <BriefcaseIcon className="h-6 w-6 text-indigo-600" />
            Recent Job Posts
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            Latest internship opportunities from companies
          </p>
        </div>
        <Link
          href="/dashboard/jobs"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Browse All Jobs
        </Link>
      </div>

      {/* Recent Jobs List */}
      <div className="space-y-6">
        {loading ? (
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="rounded-xl border border-zinc-200 bg-white p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-zinc-200 rounded-lg"></div>
                    <div className="flex-1">
                      <div className="h-5 bg-zinc-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-zinc-200 rounded w-1/2 mb-3"></div>
                      <div className="h-3 bg-zinc-200 rounded w-full mb-2"></div>
                      <div className="h-3 bg-zinc-200 rounded w-2/3"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              Unable to load jobs
            </h3>
            <p className="mt-2 text-sm text-zinc-600">{error}</p>
          </div>
        ) : recentJobs.length > 0 ? (
          <div className="space-y-6">
            {recentJobs.map((job) => (
              <RecentJobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <BriefcaseIcon className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              No jobs available
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              Check back later for new internship opportunities!
            </p>
          </div>
        )}
      </div>
    </main>
  );
}

function StatsCard({
  title,
  value,
  change,
  changeType,
  children,
}: {
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative" | "neutral";
  children?: React.ReactNode;
}) {
  const changeColors = {
    positive: "text-emerald-600",
    negative: "text-rose-600",
    neutral: "text-zinc-600",
  };

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium text-zinc-600">{title}</p>
      <p className="mt-2 text-3xl font-bold text-zinc-900">{value}</p>
      {change && (
        <p className={`mt-2 text-sm font-medium ${changeColors[changeType]}`}>
          {change}
        </p>
      )}
      {children}
    </div>
  );
}

function RecentJobCard({ job }: { job: Job }) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) return "1 day ago";
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return `${Math.ceil(diffDays / 30)} months ago`;
  };

  const getJobTypeColor = (jobType: string | null) => {
    switch (jobType) {
      case "internship":
        return "bg-blue-100 text-blue-800";
      case "full-time":
        return "bg-green-100 text-green-800";
      case "part-time":
        return "bg-yellow-100 text-yellow-800";
      case "contract":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-zinc-100 text-zinc-800";
    }
  };

  const getExperienceLevelColor = (level: string | null) => {
    switch (level) {
      case "entry":
        return "bg-emerald-100 text-emerald-800";
      case "mid":
        return "bg-orange-100 text-orange-800";
      case "senior":
        return "bg-red-100 text-red-800";
      case "executive":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-zinc-100 text-zinc-800";
    }
  };

  return (
    <Link href={`/dashboard/jobs/${job.id}`} className="block">
      <div className="group rounded-xl border border-zinc-200 bg-white p-6 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-200 cursor-pointer">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {job.companyLogo ? (
              <Image
                src={job.companyLogo}
                alt={`${job.companyName || "Company"} logo`}
                width={48}
                height={48}
                className="w-12 h-12 rounded-lg object-cover border border-zinc-200"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-lg font-bold text-white">
                  {job.companyName?.charAt(0).toUpperCase() || "?"}
                </span>
              </div>
            )}
          </div>

          {/* Job Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-zinc-900 group-hover:text-indigo-600 transition-colors truncate">
                  {job.jobTitle}
                </h3>
                <p className="text-sm font-medium text-zinc-600 truncate">
                  {job.companyName}
                </p>
              </div>
              <span className="text-xs text-zinc-500 ml-4 flex-shrink-0">
                {job.createdAt && typeof job.createdAt === "string"
                  ? formatDate(job.createdAt)
                  : "Recently"}
              </span>
            </div>

            {/* Job Meta Info */}
            <div className="flex items-center gap-3 mb-3 text-sm text-zinc-500">
              {job.location && (
                <span className="flex items-center gap-1">
                  <LocationIcon className="w-4 h-4" />
                  {job.location}
                </span>
              )}
              {job.industry && typeof job.industry === "string" && (
                <span className="flex items-center gap-1">
                  <BuildingIcon className="w-4 h-4" />
                  {job.industry}
                </span>
              )}
              {job.salaryRange && typeof job.salaryRange === "string" && (
                <span className="flex items-center gap-1">
                  <DollarIcon className="w-4 h-4" />
                  {job.salaryRange}
                </span>
              )}
            </div>

            {/* Job Description */}
            <p className="text-sm text-zinc-700 mb-4 line-clamp-2 leading-relaxed">
              {job.jobDescription || "No description available."}
            </p>

            {/* Tags */}
            <div className="flex items-center gap-2 mb-4">
              {job.status && typeof job.status === "string" && (
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                    job.status === "open"
                      ? "bg-green-100 text-green-800"
                      : job.status === "draft"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                  }`}
                >
                  {job.status}
                </span>
              )}
              {job.jobType && typeof job.jobType === "string" && (
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getJobTypeColor(job.jobType)}`}
                >
                  {job.jobType}
                </span>
              )}
              {job.experienceLevel &&
                typeof job.experienceLevel === "string" && (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getExperienceLevelColor(job.experienceLevel)}`}
                  >
                    {job.experienceLevel} Level
                  </span>
                )}
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                <ClockIcon className="w-3 h-3 mr-1" />
                New
              </span>
            </div>

            {/* Action Indicator */}
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                View Details & Apply
                <ArrowRightIcon className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function BuildingIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M6 12h4v4h-4v-4Z" />
      <path d="M14 12h4v4h-4v-4Z" />
      <path d="M6 20h4v2h-4v-2Z" />
      <path d="M14 20h4v2h-4v-2Z" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      className={className}
    >
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
