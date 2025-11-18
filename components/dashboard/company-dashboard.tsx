"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type CompanyDashboardProps = {
  user: {
    id: string;
    email: string;
    role: string;
    isVerified: boolean;
  };
  profileData: {
    id: string;
    companyName: string;
    industry?: string;
    companyLogo?: string;
  };
};

export function CompanyDashboard({ user, profileData }: CompanyDashboardProps) {
  const router = useRouter();
  const [stats, setStats] = useState({
    activePostings: 0,
    totalApplicants: 0,
    interviewsScheduled: 0,
    avgMatchScore: 0,
    activePostingsChange: "+2 this month",
    applicantsChange: "+45 this week",
    interviewsChange: "5 this week",
  });
  const [jobPostings, setJobPostings] = useState<any[]>([]);
  const [topCandidates, setTopCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const token = localStorage.getItem("internmatch_token");
        if (!token) return;

        // Fetch job postings
        const jobsResponse = await fetch(`/api/company/${profileData.id}/job`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobPostings(jobsData.data || []);

          // Calculate stats from job postings
          const activeJobs = (jobsData.data || []).filter(
            (job: any) => job.status === "open"
          );
          setStats((prev) => ({
            ...prev,
            activePostings: activeJobs.length,
          }));
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [profileData.id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-zinc-600">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <main className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">
            Welcome back, {profileData.companyName}! 👋
          </h1>
          <p className="mt-2 text-zinc-600">
            Here&apos;s an overview of your internship program
          </p>
        </div>
        <Link
          href="/dashboard/jobs/new"
          className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-colors"
        >
          <PlusIcon className="h-5 w-5" />
          Post New Job
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Active Postings"
          value={stats.activePostings.toString()}
          change={stats.activePostingsChange}
          changeType="positive"
        />
        <StatsCard
          title="Total Applicants"
          value={stats.totalApplicants.toString()}
          change={stats.applicantsChange}
          changeType="positive"
        />
        <StatsCard
          title="Interviews Scheduled"
          value={stats.interviewsScheduled.toString()}
          change={stats.interviewsChange}
          changeType="neutral"
        />
        <StatsCard
          title="Avg. Match Score"
          value={`${stats.avgMatchScore}%`}
          change=""
          changeType="neutral"
        >
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${stats.avgMatchScore}%` }}
            />
          </div>
        </StatsCard>
      </div>

      {/* Active Job Postings */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              Active Job Postings
            </h2>
            <p className="text-sm text-zinc-600">Manage your open positions</p>
          </div>
          <Link
            href="/dashboard/jobs"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View All
          </Link>
        </div>

        <div className="space-y-4">
          {jobPostings.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-12 text-center">
              <BriefcaseIcon className="mx-auto h-12 w-12 text-zinc-400" />
              <h3 className="mt-4 text-lg font-semibold text-zinc-900">
                No active job postings
              </h3>
              <p className="mt-2 text-sm text-zinc-600">
                Get started by posting your first internship opportunity
              </p>
              <Link
                href="/dashboard/jobs/new"
                className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500"
              >
                <PlusIcon className="h-5 w-5" />
                Post Your First Job
              </Link>
            </div>
          ) : (
            jobPostings
              .slice(0, 3)
              .map((job) => <JobPostingCard key={job.id} job={job} />)
          )}
        </div>
      </div>

      {/* Top Candidates */}
      <div>
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-zinc-900">
            Top Candidates
          </h2>
          <p className="text-sm text-zinc-600">
            AI-recommended matches for your positions
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
          <UsersIcon className="mx-auto h-12 w-12 text-zinc-400" />
          <h3 className="mt-4 text-lg font-semibold text-zinc-900">
            No candidates yet
          </h3>
          <p className="mt-2 text-sm text-zinc-600">
            Post a job to start receiving applications from talented students
          </p>
        </div>
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

function JobPostingCard({ job }: { job: any }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
            <BriefcaseIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-zinc-900">
              {job.jobTitle}
            </h3>
            <div className="mt-2 flex items-center gap-4 text-sm text-zinc-600">
              <span className="flex items-center gap-1">
                <LocationIcon className="h-4 w-4" />
                {job.location || "Remote"}
              </span>
              <span className="flex items-center gap-1">
                <ClockIcon className="h-4 w-4" />
                {formatDate(job.createdAt)}
              </span>
            </div>
          </div>
        </div>

        <Link
          href={`/dashboard/jobs/${job.id}/candidates`}
          className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
        >
          View Candidates
        </Link>
      </div>

      <div className="mt-4 flex items-center gap-6 border-t border-zinc-100 pt-4">
        <div className="flex items-center gap-2">
          <UsersIcon className="h-5 w-5 text-zinc-400" />
          <span className="text-sm text-zinc-600">
            <span className="font-semibold text-zinc-900">
              {job.applicantCount || 0}
            </span>{" "}
            Applicants
          </span>
        </div>
        <div className="flex items-center gap-2">
          <EyeIcon className="h-5 w-5 text-zinc-400" />
          <span className="text-sm text-zinc-600">
            <span className="font-semibold text-zinc-900">
              {job.viewCount || 0}
            </span>{" "}
            Views
          </span>
        </div>
      </div>
    </div>
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 14) return "1 week ago";
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 60) return "1 month ago";
  return `${Math.floor(diffDays / 30)} months ago`;
}

// Icons
function PlusIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
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
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
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
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}
