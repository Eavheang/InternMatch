"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  TrendingUp,
  Target,
  Lightbulb,
  RefreshCw,
  User,
  GraduationCap,
  Calendar,
  Award,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

type RoleSuggestion = {
  role: string;
  percentage: number;
  reasoning: string;
  matchedSkills: string[];
  requiredSkills: string[];
};

type RoleSuggestionsData = {
  suggestions: RoleSuggestion[];
  totalPercentage: number;
  analysisDate: string;
  profileStrengths: string[];
  recommendedSkillDevelopment: string[];
};

type RoleSuggestionsProps = {
  studentId?: string;
  resumeId?: string;
  onClose?: () => void;
};

export function RoleSuggestions({
  studentId,
  resumeId,
  onClose,
}: RoleSuggestionsProps) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<RoleSuggestionsData | null>(null);
  const [studentInfo, setStudentInfo] = useState<{
    name: string;
    major?: string;
    university?: string;
    graduationYear?: number;
  } | null>(null);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const generateSuggestions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch("/api/ai/role-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId,
          resumeId,
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Failed to generate role suggestions");
      }

      setData(result.data);
      setStudentInfo(result.studentInfo);
      toast.success("Role suggestions generated successfully!");
    } catch (error) {
      console.error("Failed to generate role suggestions:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to generate suggestions"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateSuggestions();
  }, [studentId, resumeId, generateSuggestions]);

  const getPercentageColor = (percentage: number) => {
    if (percentage >= 15) return "bg-emerald-500";
    if (percentage >= 10) return "bg-blue-500";
    if (percentage >= 5) return "bg-purple-500";
    return "bg-zinc-400";
  };

  const getPercentageBadgeColor = (percentage: number) => {
    if (percentage >= 15) return "bg-emerald-100 text-emerald-800";
    if (percentage >= 10) return "bg-blue-100 text-blue-800";
    if (percentage >= 5) return "bg-purple-100 text-purple-800";
    return "bg-zinc-100 text-zinc-600";
  };

  if (loading && !data) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="p-8">
          <div className="flex items-center justify-center space-x-3">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            <p className="text-lg text-zinc-600">
              Analyzing profile and generating role suggestions...
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
            <Target className="w-6 h-6 text-indigo-600" />
            Alternative Role Suggestions
          </h2>
          {studentInfo && (
            <div className="flex items-center gap-4 mt-2 text-sm text-zinc-600">
              <div className="flex items-center gap-1">
                <User className="w-4 h-4" />
                <span className="font-medium">{studentInfo.name}</span>
              </div>
              {studentInfo.major && (
                <div className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  <span>{studentInfo.major}</span>
                </div>
              )}
              {studentInfo.university && (
                <div className="flex items-center gap-1">
                  <Award className="w-4 h-4" />
                  <span>{studentInfo.university}</span>
                </div>
              )}
              {studentInfo.graduationYear && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{studentInfo.graduationYear}</span>
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={generateSuggestions}
            disabled={loading}
            className="gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
            Refresh Analysis
          </Button>
          {onClose && (
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">
                      Top Match
                    </p>
                    <p className="text-lg font-bold text-zinc-900">
                      {data.suggestions[0]?.role}
                    </p>
                    <p className="text-sm text-emerald-600 font-semibold">
                      {data.suggestions[0]?.percentage}% fit
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">
                      Total Roles Analyzed
                    </p>
                    <p className="text-lg font-bold text-zinc-900">
                      {data.suggestions.length}
                    </p>
                    <p className="text-sm text-blue-600 font-semibold">
                      Career paths
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Lightbulb className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-zinc-500">
                      Skills to Develop
                    </p>
                    <p className="text-lg font-bold text-zinc-900">
                      {data.recommendedSkillDevelopment.length}
                    </p>
                    <p className="text-sm text-purple-600 font-semibold">
                      Recommendations
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Role Suggestions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-indigo-600" />
                Career Role Recommendations
              </CardTitle>
              <p className="text-sm text-zinc-500">
                Based on your skills, experience, and educational background
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              {data.suggestions.map((suggestion, index) => (
                <div
                  key={suggestion.role}
                  className="border border-zinc-200 rounded-xl p-4 hover:shadow-sm transition-shadow"
                >
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() =>
                      setExpandedRole(
                        expandedRole === suggestion.role
                          ? null
                          : suggestion.role
                      )
                    }
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-zinc-400">
                          #{index + 1}
                        </span>
                        <div>
                          <h3 className="text-lg font-semibold text-zinc-900">
                            {suggestion.role}
                          </h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              className={`${getPercentageBadgeColor(
                                suggestion.percentage
                              )} font-semibold`}
                            >
                              {suggestion.percentage}% Match
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                              <span>
                                {suggestion.matchedSkills.length} matched skills
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Percentage Bar */}
                      <div className="w-32 bg-zinc-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getPercentageColor(
                            suggestion.percentage
                          )}`}
                          style={{ width: `${suggestion.percentage}%` }}
                        />
                      </div>
                      <ChevronRight
                        className={`w-5 h-5 text-zinc-400 transition-transform ${
                          expandedRole === suggestion.role ? "rotate-90" : ""
                        }`}
                      />
                    </div>
                  </div>

                  {expandedRole === suggestion.role && (
                    <div className="mt-4 pt-4 border-t border-zinc-100 space-y-4">
                      <div>
                        <h4 className="font-semibold text-zinc-900 mb-2">
                          Why this role fits you:
                        </h4>
                        <p className="text-sm text-zinc-600 leading-relaxed">
                          {suggestion.reasoning}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold text-zinc-900 mb-2">
                            Your Matching Skills:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.matchedSkills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="secondary"
                                className="text-xs bg-emerald-100 text-emerald-800"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div>
                          <h4 className="font-semibold text-zinc-900 mb-2">
                            Skills to Develop:
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {suggestion.requiredSkills.map((skill) => (
                              <Badge
                                key={skill}
                                variant="outline"
                                className="text-xs border-orange-200 text-orange-700"
                              >
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Profile Strengths & Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Award className="w-5 h-5 text-emerald-600" />
                  Your Profile Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.profileStrengths.map((strength, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-emerald-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      <span className="text-sm text-emerald-800">
                        {strength}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="w-5 h-5 text-blue-600" />
                  Recommended Skill Development
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {data.recommendedSkillDevelopment.map((skill, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg"
                    >
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm text-blue-800">{skill}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Info */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span>
                  Analysis generated on{" "}
                  {new Date(data.analysisDate).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
                <span>Total coverage: {data.totalPercentage}%</span>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
