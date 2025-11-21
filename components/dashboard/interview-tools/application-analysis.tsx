"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Sparkles,
  Briefcase,
  CheckCircle2,
  AlertCircle,
  Brain,
  GraduationCap,
} from "lucide-react";

type Application = {
  application: {
    id: string;
    status: string;
    appliedAt: string;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    university: string | null;
    major: string | null;
  };
  job: {
    id: string;
    jobTitle: string;
  };
};

type AIReview = {
  id: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  alternatives: Array<{
    jobId: string;
    jobTitle: string;
    reason: string;
    matchScore: number;
  }>;
  summary: string;
  analyzedAt: string;
};

interface ApplicationAnalysisProps {
  application: Application;
  review: AIReview | null;
  isAnalyzing: boolean;
  onAnalyze: () => void;
}

export function ApplicationAnalysis({
  application,
  review,
  isAnalyzing,
  onAnalyze,
}: ApplicationAnalysisProps) {
  if (!review) {
    return (
      <div className="space-y-6">
        {/* Student Header Card */}
        <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
            <div className="absolute -bottom-10 left-8">
              <div className="h-20 w-20 rounded-xl bg-white p-1 shadow-md">
                <div className="h-full w-full rounded-lg bg-zinc-100 flex items-center justify-center text-2xl font-bold text-zinc-400">
                  {application.student.firstName[0]}
                  {application.student.lastName[0]}
                </div>
              </div>
            </div>
          </div>
          <CardContent className="pt-12 pb-6 px-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-zinc-900">
                  {application.student.firstName} {application.student.lastName}
                </h2>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-zinc-500">
                  <div className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-100">
                    <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                    <span className="font-medium text-zinc-700">
                      {application.job.jobTitle}
                    </span>
                  </div>
                  {application.student.university && (
                    <div className="flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-zinc-400" />
                      <span>{application.student.university}</span>
                      {application.student.major && (
                        <span className="text-zinc-400">
                          • {application.student.major}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <Button
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                  className="bg-zinc-900 hover:bg-zinc-800 shadow-sm text-white"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Run AI Analysis
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Empty State for Analysis */}
        <div className="text-center py-16 px-4">
          <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 mb-2">
            Ready to Analyze
          </h3>
          <p className="text-zinc-500 max-w-md mx-auto mb-6">
            Use AI to evaluate {application.student.firstName}&apos;s profile
            against the job requirements, find skill gaps, and generate
            interview questions.
          </p>
          <Button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            size="lg"
            className="bg-indigo-600 hover:bg-indigo-700 shadow-md"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Analyzing Application...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 mr-2" />
                Analyze Application
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Header Card */}
      <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="h-20 w-20 rounded-xl bg-white p-1 shadow-md">
              <div className="h-full w-full rounded-lg bg-zinc-100 flex items-center justify-center text-2xl font-bold text-zinc-400">
                {application.student.firstName[0]}
                {application.student.lastName[0]}
              </div>
            </div>
          </div>
        </div>
        <CardContent className="pt-12 pb-6 px-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-zinc-900">
                {application.student.firstName} {application.student.lastName}
              </h2>
              <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-zinc-500">
                <div className="flex items-center gap-1.5 bg-zinc-50 px-2.5 py-1 rounded-md border border-zinc-100">
                  <Briefcase className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-medium text-zinc-700">
                    {application.job.jobTitle}
                  </span>
                </div>
                {application.student.university && (
                  <div className="flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-zinc-400" />
                    <span>{application.student.university}</span>
                    {application.student.major && (
                      <span className="text-zinc-400">
                        • {application.student.major}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3 pt-2">
              <Badge
                variant="secondary"
                className="bg-emerald-50 text-emerald-700 border-emerald-100 px-3 py-1.5 text-sm font-normal"
              >
                <CheckCircle2 className="w-4 h-4 mr-1.5" />
                Analysis Complete
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Match Score Card */}
          <Card className="border-zinc-200 shadow-sm bg-white lg:col-span-1 flex flex-col">
            <CardHeader className="pb-2 pt-6 px-6">
              <CardTitle className="text-sm font-medium text-zinc-500 uppercase tracking-wider text-center">
                Match Score
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center pb-8">
              <div className="relative flex items-center justify-center">
                <svg className="transform -rotate-90 w-32 h-32">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    className="text-zinc-100"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="transparent"
                    strokeDasharray={351.86}
                    strokeDashoffset={
                      351.86 - (351.86 * review.matchScore) / 100
                    }
                    className={`transition-all duration-1000 ease-out ${
                      review.matchScore >= 70
                        ? "text-emerald-500"
                        : review.matchScore >= 50
                          ? "text-amber-500"
                          : "text-rose-500"
                    }`}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-3xl font-bold text-zinc-900">
                    {review.matchScore}%
                  </span>
                </div>
              </div>
              <p className="text-xs text-zinc-500 mt-4 text-center px-4">
                Based on skills, experience, and job requirements match.
              </p>
            </CardContent>
          </Card>

          {/* Summary Card */}
          <Card className="border-zinc-200 shadow-sm bg-white lg:col-span-2 flex flex-col">
            <CardHeader className="pb-4 pt-6 px-6 border-b border-zinc-50">
              <div className="flex items-center justify-center gap-2">
                <Brain className="w-4 h-4 text-indigo-500" />
                <CardTitle className="text-sm font-medium text-zinc-900">
                  AI Executive Summary
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-1 pt-6 p-6">
              <p className="text-sm text-zinc-600 leading-relaxed">
                {review.summary}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Skills Analysis */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-zinc-200 shadow-sm bg-white">
            <CardHeader className="pb-4 pt-6 px-6 border-b border-zinc-50">
              <CardTitle className="text-sm font-medium text-zinc-900 flex items-center justify-center gap-2">
                <div className="p-1.5 rounded-md bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                Matched Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 p-6">
              {review.matchedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {review.matchedSkills.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="secondary"
                      className="bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 px-2.5 py-1"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-400 italic">
                  No direct skill matches found.
                </p>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-200 shadow-sm bg-white">
            <CardHeader className="pb-4 pt-6 px-6 border-b border-zinc-50">
              <CardTitle className="text-sm font-medium text-zinc-900 flex items-center justify-center gap-2">
                <div className="p-1.5 rounded-md bg-amber-50 text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                </div>
                Missing Skills
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 p-6">
              {review.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {review.missingSkills.map((skill, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-amber-700 border-amber-200 bg-amber-50/30 px-2.5 py-1"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-zinc-400 italic">
                  No key skills missing.
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
