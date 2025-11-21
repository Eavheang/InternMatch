"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Target,
  TrendingUp,
  Lightbulb,
  CheckCircle2,
} from "lucide-react";

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

interface RoleSuggestionsCardProps {
  studentName: string;
  roleSuggestions: RoleSuggestionsData | null;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function RoleSuggestionsCard({
  studentName,
  roleSuggestions,
  isGenerating,
  onGenerate,
}: RoleSuggestionsCardProps) {
  return (
    <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
      <div className="bg-zinc-50/50 py-4 px-6 border-b border-zinc-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-indigo-500" />
          <h3 className="font-semibold text-sm text-zinc-900">Alternative Role Suggestions</h3>
        </div>
        {!roleSuggestions && (
          <Button
            size="sm"
            onClick={onGenerate}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Target className="w-3 h-3 mr-2" />
                Analyze Roles
              </>
            )}
          </Button>
        )}
      </div>
      <CardContent className="p-0">
        {!roleSuggestions ? (
          <div className="text-center py-12 px-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-5 h-5 text-indigo-500" />
            </div>
            <h4 className="text-zinc-900 font-medium mb-1">Role Analysis Available</h4>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              Generate comprehensive alternative career role suggestions based on {studentName}'s complete profile analysis.
            </p>
          </div>
        ) : (
          <div className="space-y-4 p-6">
            {/* Top 3 Role Suggestions */}
            <div className="grid gap-4 md:grid-cols-3">
              {roleSuggestions.suggestions.slice(0, 3).map((suggestion, idx) => (
                <div key={idx} className="p-4 bg-zinc-50 rounded-lg border border-zinc-200 hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-zinc-400">#{idx + 1}</span>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs font-semibold ${
                        suggestion.percentage >= 15 ? "bg-emerald-100 text-emerald-800" :
                        suggestion.percentage >= 10 ? "bg-blue-100 text-blue-800" :
                        "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {suggestion.percentage}%
                    </Badge>
                  </div>
                  <h5 className="font-semibold text-zinc-900 text-sm mb-2 line-clamp-1" title={suggestion.role}>
                    {suggestion.role}
                  </h5>
                  <p className="text-xs text-zinc-600 line-clamp-3 leading-relaxed mb-3">
                    {suggestion.reasoning}
                  </p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-medium text-zinc-700 mb-1">Matched Skills:</p>
                      <div className="flex flex-wrap gap-1">
                        {suggestion.matchedSkills.slice(0, 3).map((skill, skillIdx) => (
                          <Badge key={skillIdx} variant="outline" className="text-[10px] bg-emerald-50 text-emerald-700 border-emerald-200">
                            {skill}
                          </Badge>
                        ))}
                        {suggestion.matchedSkills.length > 3 && (
                          <span className="text-[10px] text-zinc-500">+{suggestion.matchedSkills.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Additional Suggestions */}
            {roleSuggestions.suggestions.length > 3 && (
              <div>
                <h4 className="text-sm font-medium text-zinc-900 mb-3 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-zinc-500" />
                  Additional Career Paths
                </h4>
                <div className="grid gap-2 md:grid-cols-2">
                  {roleSuggestions.suggestions.slice(3, 8).map((suggestion, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-zinc-100">
                      <div className="flex-1 min-w-0">
                        <h6 className="font-medium text-zinc-900 text-sm truncate">{suggestion.role}</h6>
                        <p className="text-xs text-zinc-500 truncate">{suggestion.reasoning}</p>
                      </div>
                      <Badge variant="outline" className="ml-2 text-xs">
                        {suggestion.percentage}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Profile Insights */}
            <div className="grid gap-4 md:grid-cols-2 pt-4 border-t border-zinc-100">
              <div>
                <h4 className="text-sm font-medium text-zinc-900 mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Profile Strengths
                </h4>
                <div className="space-y-1">
                  {roleSuggestions.profileStrengths.slice(0, 3).map((strength, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-emerald-700">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                      <span>{strength}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-zinc-900 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-blue-500" />
                  Skill Development
                </h4>
                <div className="space-y-1">
                  {roleSuggestions.recommendedSkillDevelopment.slice(0, 3).map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-blue-700">
                      <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                      <span>{skill}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="text-xs text-zinc-400 text-center pt-2 border-t border-zinc-100">
              Analysis generated on {new Date(roleSuggestions.analysisDate).toLocaleDateString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
