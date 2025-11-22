import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  DollarSign,
  Building2,
  Clock3,
  Sparkles,
  ArrowRight,
} from "lucide-react";

type StudentJobCardProps = {
  job: {
    id: string;
    jobTitle: string;
    jobDescription: string;
    status: string;
    salaryRange?: string | null;
    location?: string | null;
    jobType?: string | null;
    experienceLevel?: string | null;
    aiGenerated?: boolean | null;
    createdAt: string;
    company: {
      companyName: string;
      industry?: string;
      companyLogo?: string;
    };
    requirements?: {
      duration?: string;
    } | null;
  };
};

export function StudentJobCard({ job }: StudentJobCardProps) {
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
      <Card className="group border-zinc-200/80 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-200 cursor-pointer">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            {/* Company Logo */}
            <div className="flex-shrink-0">
              {job.company.companyLogo ? (
                <img
                  src={job.company.companyLogo}
                  alt={`${job.company.companyName} logo`}
                  className="w-12 h-12 rounded-lg object-cover border border-zinc-200"
                />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                  <span className="text-lg font-bold text-white">
                    {job.company.companyName.charAt(0).toUpperCase()}
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
                    {job.company.companyName}
                  </p>
                </div>
                <span className="text-xs text-zinc-500 ml-4 flex-shrink-0">
                  {formatDate(job.createdAt)}
                </span>
              </div>

              {/* Job Meta Info */}
              <div className="flex items-center gap-3 mb-3 text-sm text-zinc-500">
                {job.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {job.location}
                  </span>
                )}
                {job.company.industry && (
                  <span className="flex items-center gap-1">
                    <Building2 className="w-4 h-4" />
                    {job.company.industry}
                  </span>
                )}
                {job.salaryRange && (
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
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
                {job.status && (
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
                {job.jobType && (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getJobTypeColor(job.jobType)}`}
                  >
                    {job.jobType}
                  </span>
                )}
                {job.experienceLevel && (
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getExperienceLevelColor(job.experienceLevel)}`}
                  >
                    {job.experienceLevel} Level
                  </span>
                )}
                {job.requirements?.duration && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    <Clock3 className="w-3 h-3 mr-1" />
                    {job.requirements.duration}
                  </span>
                )}
                {job.aiGenerated && (
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                    <Sparkles className="w-3 h-3 mr-1" />
                    AI Enhanced
                  </span>
                )}
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
                  <Clock3 className="w-3 h-3 mr-1" />
                  New
                </span>
              </div>

              {/* Action Indicator */}
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-lg group-hover:bg-indigo-100 transition-colors">
                  View Details & Apply
                  <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
