import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  DollarSign,
  Briefcase,
  Award,
  Clock3,
  Sparkles,
  Building2,
  CheckCircle2,
} from "lucide-react";

type JobDetail = {
  id: string;
  jobTitle: string;
  status: "open" | "closed" | "draft" | "paused";
  requirements?: {
    duration?: string;
  } | null;
  salaryRange?: string | null;
  location?: string | null;
  jobType?: string | null;
  experienceLevel?: string | null;
  aiGenerated?: boolean | null;
  company?: {
    companyName: string;
    industry?: string;
    companyLogo?: string;
  };
};

interface JobHeaderProps {
  job: JobDetail;
  hasApplied: boolean;
  applicationStatus: string | null;
  onApplyClick: () => void;
  getApplicationStatusColor: (status: string) => string;
}

export function JobHeader({ 
  job, 
  hasApplied, 
  applicationStatus, 
  onApplyClick, 
  getApplicationStatusColor 
}: JobHeaderProps) {
  return (
    <Card className="border-zinc-200/80 shadow-lg">
      <CardContent className="p-8">
        <div className="flex items-start gap-6">
          {/* Company Logo */}
          <div className="flex-shrink-0">
            {job.company?.companyLogo ? (
              <img
                src={job.company.companyLogo}
                alt={`${job.company.companyName} logo`}
                className="w-16 h-16 rounded-xl object-cover border border-zinc-200"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">
                  {job.company?.companyName?.charAt(0).toUpperCase() || "C"}
                </span>
              </div>
            )}
          </div>

          {/* Job Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-zinc-900 mb-2">
                  {job.jobTitle}
                </h1>
                <p className="text-lg font-semibold text-zinc-700 mb-1">
                  {job.company?.companyName}
                </p>
                <div className="flex items-center gap-4 text-sm text-zinc-600">
                  {job.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </span>
                  )}
                  {job.company?.industry && (
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
              </div>

              {/* Application Status */}
              {hasApplied && applicationStatus && (
                <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getApplicationStatusColor(applicationStatus)}`}>
                  <CheckCircle2 className="w-4 h-4 mr-1.5" />
                  {applicationStatus.charAt(0).toUpperCase() + applicationStatus.slice(1)}
                </div>
              )}
            </div>

            {/* Job Tags */}
            <div className="flex items-center gap-2 mb-6">
              {job.jobType && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                  <Briefcase className="w-3 h-3 mr-1" />
                  {job.jobType}
                </span>
              )}
              {job.experienceLevel && (
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                  <Award className="w-3 h-3 mr-1" />
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
            </div>

            {/* Apply Button */}
            {!hasApplied ? (
              <Button
                onClick={onApplyClick}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 text-base font-semibold"
                disabled={job.status !== "open"}
              >
                {job.status === "open" ? "Apply Now" : "Position Closed"}
              </Button>
            ) : (
              <Button
                disabled
                className="bg-green-100 text-green-800 px-8 py-2.5 text-base font-semibold"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Applied
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
