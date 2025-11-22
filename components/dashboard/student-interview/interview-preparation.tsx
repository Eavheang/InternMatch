"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Target,
} from "lucide-react";

type Application = {
  application: {
    id: string;
    status: string;
    appliedAt: string;
    coverLetter?: string;
  };
  job: {
    id: string;
    jobTitle: string;
    jobDescription: string;
    requirements: string[];
  };
  company: {
    id: string;
    companyName: string;
    companyLogo?: string;
    industry?: string;
  };
};

interface InterviewPreparationProps {
  application: Application;
}

const statusColors = {
  applied: "bg-blue-100 text-blue-800 border-blue-200",
  shortlisted: "bg-yellow-100 text-yellow-800 border-yellow-200",
  interviewed: "bg-purple-100 text-purple-800 border-purple-200",
  hired: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export function InterviewPreparation({
  application,
}: InterviewPreparationProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "applied":
        return <Clock className="w-4 h-4" />;
      case "shortlisted":
        return <Target className="w-4 h-4" />;
      case "interviewed":
        return <CheckCircle2 className="w-4 h-4" />;
      default:
        return <Briefcase className="w-4 h-4" />;
    }
  };

  const getPreparationMessage = (status: string) => {
    switch (status) {
      case "applied":
        return "Get ready! Practice common interview questions and research the company.";
      case "shortlisted":
        return "Great news! You've been shortlisted. Time to prepare thoroughly for your interview.";
      case "interviewed":
        return "You've completed an interview. Use this to prepare for potential follow-up rounds.";
      default:
        return "Prepare for your upcoming interview opportunity.";
    }
  };

  return (
    <Card className="border-zinc-200">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2 p-4">
            <CardTitle className="text-lg text-zinc-900 flex items-center gap-2">
              Interview Preparation
            </CardTitle>
            <p className="text-sm text-zinc-600">
              {getPreparationMessage(application.application.status)}
            </p>
          </div>
          <Badge
            variant="outline"
            className={`${
              statusColors[
                application.application.status as keyof typeof statusColors
              ] || "bg-zinc-100 text-zinc-800 border-zinc-200"
            }`}
          >
            <div className="flex items-center gap-1">
              {getStatusIcon(application.application.status)}
              {application.application.status.charAt(0).toUpperCase() +
                application.application.status.slice(1)}
            </div>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {/* Job and Company Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-zinc-900 mb-2 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Position Details
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Role:</span>{" "}
                  {application.job.jobTitle}
                </p>
                <div className="flex items-center gap-2">
                  <Building2 className="w-3 h-3 text-zinc-400" />
                  <span className="text-sm text-zinc-600">
                    {application.company.companyName}
                  </span>
                </div>
                {application.company.industry && (
                  <p className="text-sm">
                    <span className="font-medium">Industry:</span>{" "}
                    {application.company.industry}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-zinc-900 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                Application Timeline
              </h3>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium">Applied:</span>{" "}
                  {formatDate(application.application.appliedAt)}
                </p>
                <p className="text-sm">
                  <span className="font-medium">Status:</span>{" "}
                  {application.application.status.charAt(0).toUpperCase() +
                    application.application.status.slice(1)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Job Requirements Preview */}
        {application.job.requirements &&
          application.job.requirements.length > 0 && (
            <div>
              <h3 className="font-semibold text-zinc-900 mb-3">
                Key Requirements to Discuss
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {application.job.requirements
                  .slice(0, 6)
                  .map((requirement, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-zinc-50 rounded-lg"
                    >
                      <CheckCircle2 className="w-3 h-3 text-green-600 flex-shrink-0" />
                      <span className="text-sm text-zinc-700">
                        {requirement}
                      </span>
                    </div>
                  ))}
              </div>
              {application.job.requirements.length > 6 && (
                <p className="text-xs text-zinc-500 mt-2">
                  +{application.job.requirements.length - 6} more requirements
                </p>
              )}
            </div>
          )}

        {/* Cover Letter Preview */}
        {application.application.coverLetter && (
          <div>
            <h3 className="font-semibold text-zinc-900 mb-3">
              Your Cover Letter
            </h3>
            <div className="p-4 bg-zinc-50 rounded-lg border">
              <p className="text-sm text-zinc-700 line-clamp-4">
                {application.application.coverLetter}
              </p>
            </div>
            <p className="text-xs text-zinc-500 mt-2">
              Review your cover letter to prepare talking points about your
              motivation and qualifications.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
