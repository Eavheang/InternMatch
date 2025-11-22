"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Briefcase, Loader2 } from "lucide-react";
import { StudentJobCard } from "./student-job-card";
import { StudentJobFilters } from "./student-job-filters";

type StudentJob = {
  id: string;
  jobTitle: string;
  jobDescription: string;
  status: string;
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
  createdAt: string;
  updatedAt?: string;
  company: {
    companyName: string;
    industry?: string;
    companySize?: string;
    website?: string;
    companyLogo?: string;
    companyLocation?: string;
    description?: string;
  };
};

export function StudentJobBrowsing() {
  const [jobs, setJobs] = useState<StudentJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search state
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters - only fetch open jobs
      const params = new URLSearchParams();
      params.append("status", "open"); // Only show open jobs
      params.append("limit", "50"); // Get more jobs for browsing

      const response = await fetch(`/api/job?${params.toString()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load jobs");
      }

      if (data.success && data.data?.jobs) {
        setJobs(data.data.jobs);
      } else {
        setJobs([]);
      }
    } catch (err) {
      console.error("Error fetching jobs:", err);
      setError(err instanceof Error ? err.message : "Failed to load jobs");
      toast.error("Failed to load jobs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter jobs by search term
  const filteredJobs = useMemo(() => {
    if (!search.trim()) return jobs;

    const searchLower = search.toLowerCase();
    return jobs.filter(
      (job) =>
        job.jobTitle.toLowerCase().includes(searchLower) ||
        job.company.companyName.toLowerCase().includes(searchLower) ||
        job.jobDescription.toLowerCase().includes(searchLower) ||
        job.company.industry?.toLowerCase().includes(searchLower) ||
        job.location?.toLowerCase().includes(searchLower)
    );
  }, [jobs, search]);

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4">
        <div>
          <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
            Find Your Next Opportunity
          </p>
          <h1 className="text-3xl font-bold text-zinc-900 mt-1">
            Browse Internships & Jobs
          </h1>
          <p className="text-sm text-zinc-500 mt-2">
            Discover exciting opportunities from top companies looking for
            talented students like you.
          </p>
        </div>
      </header>

      {/* Search */}
      <StudentJobFilters search={search} onSearchChange={setSearch} />

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-indigo-600" />
          <span className="text-sm font-medium text-zinc-700">
            {loading ? "Loading..." : `${filteredJobs.length} jobs found`}
          </span>
        </div>
      </div>

      {/* Job Listings */}
      <section className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              Unable to load jobs
            </h3>
            <p className="mt-2 text-sm text-zinc-600">{error}</p>
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="space-y-4">
            {filteredJobs.map((job) => (
              <StudentJobCard key={job.id} job={job} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-zinc-400" />
            <h3 className="mt-4 text-lg font-semibold text-zinc-900">
              No jobs found
            </h3>
            <p className="mt-2 text-sm text-zinc-600">
              {search
                ? "Try adjusting your search criteria."
                : "Check back later for new opportunities!"}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
