"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { type User, type ProfileData } from "./dashboard-context";
import {
  Briefcase,
  TrendingUp,
  Award,
  Calendar,
  ChevronRight,
  FileText,
  UserCircle,
  Zap,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";
import { cn } from "@/lib/utils";

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

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
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

  // Calculate profile completeness
  const calculateCompleteness = () => {
    if (!profileData) return 0;
    let score = 0;
    const fields = [
      "firstName",
      "lastName",
      "university",
      "major",
      "graduationYear",
      "resumeUrl",
      "skills",
    ];
    fields.forEach((field) => {
      if (
        profileData[field] &&
        (Array.isArray(profileData[field])
          ? profileData[field].length > 0
          : true)
      ) {
        score += 100 / fields.length;
      }
    });
    return Math.round(score);
  };

  const completeness = calculateCompleteness();

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
            // Existing transformation logic...
            const transformedJobs = jobs.map(
              (job: any) => ({
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

            setStats({
              activePostings: transformedJobs.length,
              activePostingsChange: `+${transformedJobs.length} new`,
              totalApplications: 0, // In a real app, fetch from API
              applicationsChange: "+0 this week",
              interviewsScheduled: 0, // In a real app, fetch from API
              interviewsChange: "+0 upcoming",
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
    <main className="min-h-screen bg-zinc-50/50 p-8 pb-20">
      {/* Decorative Background */}
      <div className="fixed inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/50 via-zinc-50/20 to-zinc-50 pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-xl -mx-8 px-8 py-4 mb-8 border-b border-zinc-200/50 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-all duration-200">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
              {profileData?.firstName || user?.email?.split("@")[0] || "Student"}
            </span>
            !
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Ready to find your next great opportunity?
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 hidden sm:flex">
            <Search className="w-4 h-4" />
            Find Jobs
          </Button>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20">
            <Zap className="w-4 h-4 mr-2" />
            Quick Apply
          </Button>
        </div>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 max-w-7xl mx-auto"
      >
        {/* Top Section: Completion & Quick Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Profile Status Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <div className="h-full rounded-2xl bg-white border border-zinc-200/80 p-6 shadow-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <UserCircle className="w-24 h-24" />
              </div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-zinc-900">Profile Status</h3>
                  <span className="px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium">
                    {completeness}% Complete
                  </span>
                </div>

                <Progress value={completeness} className="h-2 mb-4 bg-zinc-100" indicatorClassName="bg-gradient-to-r from-indigo-500 to-violet-500" />

                <div className="space-y-3">
                  <p className="text-sm text-zinc-600">
                    {completeness === 100
                      ? "Great job! Your profile is ready for applications."
                      : "Complete your profile to stand out to recruiters."}
                  </p>

                  {completeness < 100 && (
                    <Button variant="ghost" className="p-0 h-auto text-indigo-600 font-medium text-xs flex items-center gap-1 hover:text-indigo-700 hover:bg-transparent">
                      Complete Profile <ChevronRight className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right: Stats Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <motion.div variants={itemVariants}>
              <StatsCard
                title="Active Jobs"
                value={stats.activePostings.toString()}
                change={stats.activePostingsChange}
                icon={Briefcase}
                color="blue"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatsCard
                title="Applications"
                value={stats.totalApplications.toString()}
                change={stats.applicationsChange}
                icon={FileText}
                color="indigo"
              />
            </motion.div>
            <motion.div variants={itemVariants}>
              <StatsCard
                title="Interviews"
                value={stats.interviewsScheduled.toString()}
                change={stats.interviewsChange}
                icon={Calendar}
                color="violet"
              />
            </motion.div>
          </div>
        </div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <h2 className="text-lg font-semibold text-zinc-900 mb-4 px-1">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <QuickActionCard
              icon={FileText}
              label="Resume"
              subLabel="Update your CV"
              href="/dashboard/resume"
              color="emerald"
            />
            <QuickActionCard
              icon={TrendingUp}
              label="Interview Prep"
              subLabel="Practice questions"
              href="/dashboard/interview"
              color="amber"
            />
            <QuickActionCard
              icon={Award}
              label="Skills"
              subLabel="Add new skills"
              href="/dashboard/profile"
              color="cyan"
            />
            <QuickActionCard
              icon={Briefcase}
              label="Saved Jobs"
              subLabel="View favorites"
              href="/dashboard/jobs/saved"
              color="rose"
            />
          </div>
        </motion.div>

        {/* Recent Job Posts */}
        <motion.div variants={itemVariants}>
          <div className="flex items-center justify-between mb-6 px-1">
            <div>
              <h2 className="text-lg font-semibold text-zinc-900">Recommended Jobs</h2>
              <p className="text-sm text-zinc-500">Based on your profile and interests</p>
            </div>
            <Link href="/dashboard/jobs">
              <Button variant="ghost" className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                View All <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4">
            {loading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-6 border border-zinc-200/80">
                  <div className="flex gap-4">
                    <Skeleton className="w-12 h-12 rounded-lg" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="w-1/3 h-5" />
                      <Skeleton className="w-1/4 h-4" />
                    </div>
                  </div>
                </div>
              ))
            ) : error ? (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-zinc-200">
                <AlertCircle className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500">{error}</p>
              </div>
            ) : recentJobs.length > 0 ? (
              recentJobs.map((job) => (
                <motion.div key={job.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                  <RecentJobCard job={job} />
                </motion.div>
              ))
            ) : (
              <div className="text-center py-12 bg-white rounded-xl border border-dashed border-zinc-200">
                <Briefcase className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500">No jobs found.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}

// --- Sub Components ---

function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color,
}: {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: "blue" | "indigo" | "violet";
}) {
  const colors = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
    violet: "bg-violet-50 text-violet-600 border-violet-100",
  };

  return (
    <div className="h-full rounded-2xl bg-white border border-zinc-200/80 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-2.5 rounded-xl border", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full",
          change.includes("+") ? "bg-emerald-50 text-emerald-700" : "bg-zinc-100 text-zinc-600"
        )}>
          {change}
        </span>
      </div>
      <div>
        <p className="text-sm font-medium text-zinc-500">{title}</p>
        <p className="text-2xl font-bold text-zinc-900 mt-1">{value}</p>
      </div>
    </div>
  );
}

function QuickActionCard({ icon: Icon, label, subLabel, href, color }: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  subLabel: string;
  href: string;
  color: "emerald" | "amber" | "cyan" | "rose";
}) {
  const colors = {
    emerald: "bg-emerald-50 text-emerald-600 group-hover:bg-emerald-100",
    amber: "bg-amber-50 text-amber-600 group-hover:bg-amber-100",
    cyan: "bg-cyan-50 text-cyan-600 group-hover:bg-cyan-100",
    rose: "bg-rose-50 text-rose-600 group-hover:bg-rose-100",
  };

  return (
    <Link href={href}>
      <div className="h-full p-4 bg-white border border-zinc-200/80 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all duration-200 group cursor-pointer flex flex-col items-start gap-3">
        <div className={cn("p-2 rounded-lg transition-colors", colors[color])}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <h3 className="font-semibold text-zinc-900 text-sm group-hover:text-indigo-700 transition-colors">{label}</h3>
          <p className="text-xs text-zinc-500">{subLabel}</p>
        </div>
      </div>
    </Link>
  )
}

function RecentJobCard({ job }: { job: Job }) {
  const getJobTypeColor = (type?: string) => {
    switch (type) {
      case "internship": return "bg-blue-50 text-blue-700 border-blue-100";
      case "full-time": return "bg-emerald-50 text-emerald-700 border-emerald-100";
      default: return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
  };

  return (
    <Link href={`/dashboard/jobs/${job.id}`} className="block">
      <motion.div
        whileHover={{ y: -2, scale: 1.01 }}
        className="group relative rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-md"
      >
        <div className="flex flex-col md:flex-row gap-6">
          {/* Logo */}
          <div className="flex-shrink-0">
            {job.companyLogo ? (
              <Image
                src={job.companyLogo}
                alt={job.companyName || "Company"}
                width={56}
                height={56}
                className="w-14 h-14 rounded-xl object-cover border border-zinc-100 shadow-sm"
              />
            ) : (
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-inner">
                {job.companyName?.charAt(0).toUpperCase() || "?"}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-lg font-bold text-zinc-900 group-hover:text-indigo-600 transition-colors">
                  {job.jobTitle}
                </h3>
                <p className="text-sm font-medium text-zinc-500 flex items-center gap-2">
                  {job.companyName}
                  {job.createdAt && (
                    <>
                      <span className="w-1 h-1 rounded-full bg-zinc-300" />
                      <span className="text-xs text-zinc-400">Published {new Date(job.createdAt).toLocaleDateString()}</span>
                    </>
                  )}
                </p>
              </div>
              {job.jobType && (
                <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border hidden sm:inline-flex", getJobTypeColor(job.jobType))}>
                  {job.jobType}
                </span>
              )}
            </div>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-4 text-sm text-zinc-500">
              {job.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-zinc-400" />
                  {job.location}
                </div>
              )}
              {job.salaryRange && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-zinc-400" />
                  {job.salaryRange}
                </div>
              )}
              {job.experienceLevel && (
                <div className="flex items-center gap-1.5 capitalize">
                  <Briefcase className="w-4 h-4 text-zinc-400" />
                  {job.experienceLevel}
                </div>
              )}
            </div>

            {/* Description Preview */}
            <p className="text-sm text-zinc-600 line-clamp-2 leading-relaxed mb-4">
              {job.jobDescription || "No description provided."}
            </p>

            {/* Footer Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
              <div className="flex gap-2">
                {/* Tags (Mobile) */}
                {job.jobType && (
                  <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full border sm:hidden", getJobTypeColor(job.jobType))}>
                    {job.jobType}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform">
                View Position <ChevronRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
