"use client";

import { type User, type ProfileData } from "./dashboard-context";

type StudentDashboardProps = {
  user: User | null;
  profileData: ProfileData | null;
};

export function StudentDashboard({ user, profileData }: StudentDashboardProps) {
  // Calculate profile strength
  const calculateProfileStrength = () => {
    if (!profileData) return 0;
    let score = 0;
    let total = 0;

    // Education (25%)
    total += 25;
    if (profileData.university) score += 10;
    if (profileData.major) score += 10;
    if (profileData.graduationYear) score += 5;

    // Skills (25%)
    total += 25;
    const skillsCount = profileData.skills?.length || 0;
    score += Math.min(skillsCount * 2.5, 25);

    // Projects (25%)
    total += 25;
    const projectsCount = profileData.projects?.length || 0;
    score += Math.min(projectsCount * 8, 25);

    // Experience (25%)
    total += 25;
    const experiencesCount = profileData.experiences?.length || 0;
    score += Math.min(experiencesCount * 8, 25);

    return Math.round((score / total) * 100);
  };

  const profileStrength = calculateProfileStrength();

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

      {/* Summary Cards */}
      <div className="mb-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Profile Strength"
          value={`${profileStrength}%`}
          description="Complete your profile to improve"
          color="indigo"
        >
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${profileStrength}%` }}
            />
          </div>
        </SummaryCard>

        <SummaryCard
          title="Applications"
          value="0"
          description="Track your progress"
          color="emerald"
          linkText="View Applications"
          linkHref="/dashboard/applications"
        />

        <SummaryCard
          title="Interviews"
          value="0"
          description="No interviews scheduled"
          color="amber"
        />

        <SummaryCard
          title="Matches"
          value="0"
          description="New opportunities"
          color="blue"
          linkText="Browse All Jobs"
          linkHref="/dashboard/jobs"
        />
      </div>

      {/* Recommended for You */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-zinc-900 flex items-center gap-2">
            <StarIcon className="h-6 w-6 text-amber-500" />
            Recommended for You
          </h2>
          <p className="mt-1 text-sm text-zinc-600">
            AI-matched opportunities based on your profile
          </p>
        </div>
        <a
          href="/dashboard/jobs"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Browse All Jobs
        </a>
      </div>

      {/* Recommended Jobs List */}
      <div className="space-y-4">
        <p className="text-zinc-500 text-sm">
          No recommendations available yet. Complete your profile to get
          personalized job matches!
        </p>
      </div>
    </main>
  );
}

function SummaryCard({
  title,
  value,
  description,
  color,
  linkText,
  linkHref,
  children,
}: {
  title: string;
  value: string;
  description: string;
  color: "indigo" | "emerald" | "amber" | "blue";
  linkText?: string;
  linkHref?: string;
  children?: React.ReactNode;
}) {
  const colorClasses = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    blue: "text-blue-600",
  };

  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-6 shadow-sm">
      <h3 className="text-sm font-medium text-zinc-600">{title}</h3>
      <p className={`mt-2 text-3xl font-bold ${colorClasses[color]}`}>
        {value}
      </p>
      <p className="mt-1 text-sm text-zinc-500">{description}</p>
      {children}
      {linkText && linkHref && (
        <a
          href={linkHref}
          className={`mt-4 inline-block text-sm font-medium ${colorClasses[color]} hover:underline`}
        >
          {linkText} →
        </a>
      )}
    </div>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}
