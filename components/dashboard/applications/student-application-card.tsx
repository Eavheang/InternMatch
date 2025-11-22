import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import {
  MapPin,
  DollarSign,
  Briefcase,
  Building2,
  Clock3,
  Calendar,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  XCircle,
  User,
  Award,
} from "lucide-react";

type ApplicationStatus = "applied" | "shortlisted" | "rejected" | "interviewed" | "hired";

type StudentApplicationCardProps = {
  application: {
    application: {
      id: string;
      status: ApplicationStatus;
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
};

export function StudentApplicationCard({ application }: StudentApplicationCardProps) {
  const { application: app, job, company } = application;

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

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case "applied":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "shortlisted":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "interviewed":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "hired":
        return "bg-green-100 text-green-800 border-green-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-zinc-100 text-zinc-800 border-zinc-200";
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case "applied":
        return <Clock3 className="w-4 h-4" />;
      case "shortlisted":
        return <CheckCircle2 className="w-4 h-4" />;
      case "interviewed":
        return <User className="w-4 h-4" />;
      case "hired":
        return <Award className="w-4 h-4" />;
      case "rejected":
        return <XCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getJobTypeColor = (jobType: string | null) => {
    switch (jobType) {
      case 'internship':
        return 'bg-blue-100 text-blue-800';
      case 'full-time':
        return 'bg-green-100 text-green-800';
      case 'part-time':
        return 'bg-yellow-100 text-yellow-800';
      case 'contract':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-zinc-100 text-zinc-800';
    }
  };

  const getExperienceLevelColor = (level: string | null) => {
    switch (level) {
      case 'entry':
        return 'bg-emerald-100 text-emerald-800';
      case 'mid':
        return 'bg-orange-100 text-orange-800';
      case 'senior':
        return 'bg-red-100 text-red-800';
      case 'executive':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-zinc-100 text-zinc-800';
    }
  };

  return (
    <Card className="border-zinc-200/80 shadow-sm hover:shadow-md transition-all duration-200">
      <CardContent className="p-6">
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

          {/* Application Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg font-semibold text-zinc-900 truncate">
                  {job.jobTitle}
                </h3>
                <p className="text-sm font-medium text-zinc-600 truncate">
                  {company.companyName}
                </p>
              </div>
              
              {/* Application Status */}
              <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(app.status)}`}>
                {getStatusIcon(app.status)}
                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
              </div>
            </div>

            {/* Job Meta Info */}
            <div className="flex items-center gap-3 mb-3 text-sm text-zinc-500">
              {job.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {job.location}
                </span>
              )}
              {company.industry && (
                <span className="flex items-center gap-1">
                  <Building2 className="w-4 h-4" />
                  {company.industry}
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
              {job.jobDescription}
            </p>

            {/* Tags and Application Info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {job.jobType && (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getJobTypeColor(job.jobType)}`}>
                    {job.jobType}
                  </span>
                )}
                {job.experienceLevel && (
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getExperienceLevelColor(job.experienceLevel)}`}>
                    {job.experienceLevel} Level
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  Applied {formatDate(app.appliedAt)}
                </span>
                <Link
                  href={`/dashboard/jobs/${job.id}`}
                  className="inline-flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium"
                >
                  View Job
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {/* Cover Letter Preview */}
            {app.coverLetter && (
              <div className="mt-4 p-3 bg-zinc-50 rounded-lg border">
                <p className="text-xs font-medium text-zinc-700 mb-1">Cover Letter:</p>
                <p className="text-sm text-zinc-600 line-clamp-2">
                  {app.coverLetter}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
