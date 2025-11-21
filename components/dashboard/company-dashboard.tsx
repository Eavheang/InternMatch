"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { type User, type ProfileData } from "./dashboard-context";

type JobPosting = {
  id: string;
  jobTitle: string;
  location?: string;
  createdAt: string;
  status: string;
  applicantCount?: number;
  viewCount?: number;
  jobType?: string;
  experienceLevel?: string;
};

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  university: string;
  major: string;
  graduationYear: number;
  location: string;
  careerInterest: string;
  createdAt: string;
};

type CompanyDashboardProps = {
  user: User | null;
  profileData: ProfileData | null;
};

export function CompanyDashboard({ profileData }: CompanyDashboardProps) {
  const [stats, setStats] = useState({
    activePostings: 0,
    totalApplicants: 0,
    interviewsScheduled: 0,
    activePostingsChange: "+2 this month",
    applicantsChange: "+45 this week",
    interviewsChange: "5 this week",
  });
  const [jobPostings, setJobPostings] = useState<JobPosting[]>([]);
  const [topStudents, setTopStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!profileData?.id) {
        setLoading(false);
        return;
      }

      try {
        const token = localStorage.getItem("internmatch_token");
        if (!token) return;

        // Fetch weekly statistics for this company
        const statsResponse = await fetch(
          `/api/company/${profileData.userId}/stats`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch job postings for this company (for display)
        const jobsResponse = await fetch(
          `/api/company/${profileData.userId}/job?limit=3`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Fetch top students for scouting with intelligent matching
        const studentsResponse = await fetch(
          `/api/students?limit=6&intelligent=true&companyId=${profileData.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (statsResponse.ok) {
          const statsData = await statsResponse.json();
          const weeklyStats = statsData.data;

          setStats((prev) => ({
            ...prev,
            activePostings: weeklyStats.activePostings,
            totalApplicants: weeklyStats.totalApplicants,
            interviewsScheduled: weeklyStats.interviewsScheduled,
            activePostingsChange:
              weeklyStats.activePostings > 0
                ? `+${weeklyStats.activePostings} this week`
                : "No new jobs this week",
            applicantsChange:
              weeklyStats.totalApplicants > 0
                ? `+${weeklyStats.totalApplicants} this week`
                : "No applications this week",
            interviewsChange:
              weeklyStats.interviewsScheduled > 0
                ? `${weeklyStats.interviewsScheduled} scheduled`
                : "No interviews scheduled",
          }));
        }

        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobPostings(jobsData.data?.jobs || []);
        }

        if (studentsResponse.ok) {
          const studentsData = await studentsResponse.json();
          const intelligentStudents = studentsData.data || [];

          // If intelligent matching returns no results, fallback to basic query
          if (intelligentStudents.length === 0) {
            const fallbackResponse = await fetch(`/api/students?limit=6`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (fallbackResponse.ok) {
              const fallbackData = await fallbackResponse.json();
              setTopStudents(fallbackData.data || []);
            }
          } else {
            setTopStudents(intelligentStudents);
          }
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [profileData?.id, profileData?.userId]);

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
            Welcome back, {profileData?.companyName || "Company"}! 👋
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
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <StatsCard
          title="New Jobs This Week"
          value={stats.activePostings.toString()}
          change={stats.activePostingsChange}
          changeType={stats.activePostings > 0 ? "positive" : "neutral"}
        />
        <StatsCard
          title="Applications This Week"
          value={stats.totalApplicants.toString()}
          change={stats.applicantsChange}
          changeType={stats.totalApplicants > 0 ? "positive" : "neutral"}
        />
        <StatsCard
          title="Interviews Scheduled"
          value={stats.interviewsScheduled.toString()}
          change={stats.interviewsChange}
          changeType={stats.interviewsScheduled > 0 ? "positive" : "neutral"}
        />
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
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-zinc-900">
              Top Candidates
            </h2>
            <p className="text-sm text-zinc-600">
              AI-recommended students based on your job requirements and company
              profile
            </p>
          </div>
          <Link
            href="/dashboard/students"
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Browse All Students
          </Link>
        </div>

        {topStudents.length === 0 ? (
          <div className="rounded-2xl border border-zinc-200 bg-white p-8 text-center">
            <UsersIcon className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              No matching candidates found
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              AI-recommended students will appear here based on your job
              requirements and company profile
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topStudents.map((student) => (
              <StudentCard key={student.id} student={student} />
            ))}
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

function JobPostingCard({ job }: { job: JobPosting }) {
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
      </div>
    </div>
  );
}

function StudentCard({ student }: { student: Student }) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-6 transition-shadow hover:shadow-md relative">
      {/* AI Recommended Badge */}
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-1 text-xs font-medium text-indigo-700">
          <SparklesIcon className="h-3 w-3" />
          AI Match
        </span>
      </div>

      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50">
          <UserIcon className="h-6 w-6 text-emerald-600" />
        </div>
        <div className="flex-1 min-w-0 pr-16">
          {" "}
          {/* Add padding to avoid badge overlap */}
          <h3 className="text-lg font-semibold text-zinc-900 truncate">
            {student.firstName} {student.lastName}
          </h3>
          <p className="text-sm text-zinc-600 truncate">
            {student.major} • Class of {student.graduationYear}
          </p>
          <p className="text-sm text-zinc-500 truncate">{student.university}</p>
        </div>
      </div>

      <div className="mt-4 space-y-2">
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <LocationIcon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{student.location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-zinc-600">
          <BriefcaseIcon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{student.careerInterest}</span>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-zinc-100">
        <Link
          href={`/dashboard/students/${student.id}`}
          className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 text-center block"
        >
          View Profile
        </Link>
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

function _EyeIcon({ className }: { className?: string }) {
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

function UserIcon({ className }: { className?: string }) {
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
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function SparklesIcon({ className }: { className?: string }) {
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
      <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .962 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.582a.5.5 0 0 1 0 .962L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.962 0z" />
      <path d="M20 3v4" />
      <path d="M22 5h-4" />
      <path d="M4 17v2" />
      <path d="M5 18H3" />
    </svg>
  );
}
