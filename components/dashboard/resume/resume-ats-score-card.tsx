import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Search, AlertTriangle, CheckCircle2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";

export interface ResumeAnalysis {
  id: string;
  atsScore: number | null;
  keywordMatch: number | null;
  readability: number | null;
  length: number | null;
  suggestions: Array<{ field: string; advice: string }> | null;
  analyzedAt: Date | string;
}

interface ResumeAtsScoreCardProps {
  resumeUrl?: string;
  analysis: ResumeAnalysis | null;
  isLoadingAnalysis: boolean;
  isAnalyzing: boolean;
  onAnalyzeResume: () => void;
}

export function ResumeAtsScoreCard({
  resumeUrl,
  analysis,
  isLoadingAnalysis,
  isAnalyzing,
  onAnalyzeResume,
}: ResumeAtsScoreCardProps) {
  if (!resumeUrl) {
    return null;
  }

  return (
    <Card className="mt-6 p-6 border-2 border-purple-200 bg-gradient-to-br from-purple-50/50 to-white">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-2xl font-bold text-zinc-900">Resume ATS Score</h2>
          <Button
            onClick={onAnalyzeResume}
            disabled={isAnalyzing || isLoadingAnalysis}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white gap-2"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                {analysis ? "Re-Analyze Resume" : "Analyze Resume"}
              </>
            )}
          </Button>
        </div>
        <p className="text-sm text-zinc-600">
          Get your resume analyzed for ATS compatibility and receive
          personalized improvement suggestions.
        </p>
      </div>

      {isLoadingAnalysis ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
        </div>
      ) : analysis && analysis.atsScore !== null ? (
        <div className="space-y-6">
          <ScoreOverview analysis={analysis} />
          <MetricsGrid analysis={analysis} />
          <Suggestions analysis={analysis} />
        </div>
      ) : (
        <EmptyState />
      )}
    </Card>
  );
}

function ScoreOverview({ analysis }: { analysis: ResumeAnalysis }) {
  return (
    <div className="bg-gradient-to-br from-purple-50 via-white to-purple-50/30 border border-purple-200/50 rounded-2xl p-8 text-center">
      <div className="relative w-32 h-32 mx-auto mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={[
                { value: analysis.atsScore ?? 0 },
                { value: 100 - (analysis.atsScore ?? 0) },
              ]}
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={65}
              startAngle={90}
              endAngle={-270}
              dataKey="value"
            >
              <Cell
                fill={
                  analysis.atsScore !== null && analysis.atsScore >= 70
                    ? "#22c55e"
                    : "#ef4444"
                }
              />
              <Cell fill="#e5e7eb" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "text-3xl font-bold",
              analysis.atsScore !== null && analysis.atsScore >= 70
                ? "text-green-600"
                : "text-red-600"
            )}
          >
            {analysis.atsScore}
          </span>
          <span className="text-xs text-zinc-500 font-medium uppercase mt-1">
            ATS Score
          </span>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-2">
        {analysis.atsScore !== null && analysis.atsScore >= 90
          ? "Excellent"
          : analysis.atsScore !== null && analysis.atsScore >= 70
            ? "Good"
            : analysis.atsScore !== null && analysis.atsScore >= 50
              ? "Needs Improvement"
              : "Poor"}
      </h3>
      {analysis.analyzedAt && (
        <p className="text-sm text-zinc-600">
          Analyzed on {new Date(analysis.analyzedAt).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function MetricsGrid({ analysis }: { analysis: ResumeAnalysis }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <MetricCard label="Keywords" value={analysis.keywordMatch || 0} />
      <MetricCard label="Readability" value={analysis.readability || 0} />
      <MetricCard label="Length" value={analysis.length || 0} isLength />
    </div>
  );
}

function Suggestions({ analysis }: { analysis: ResumeAnalysis }) {
  if (analysis.suggestions && analysis.suggestions.length > 0) {
    return (
      <div className="bg-white border rounded-xl p-6">
        <h4 className="font-semibold flex items-center gap-2 mb-4 text-zinc-900">
          <span className="text-yellow-500">💡</span> Suggestions for
          Improvement
        </h4>
        <ul className="space-y-3">
          {analysis.suggestions.map((suggestion, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-zinc-600 text-sm"
            >
              <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-medium text-zinc-800">
                  {suggestion.field}:
                </span>{" "}
                {suggestion.advice}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <div className="bg-white border rounded-xl p-6">
      <div className="flex items-center gap-2 text-green-600 text-sm">
        <CheckCircle2 className="w-4 h-4" />
        Great job! No critical issues found.
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-24 h-24 mx-auto mb-4 rounded-full border-8 border-zinc-200 flex items-center justify-center bg-white">
        <span className="text-3xl font-bold text-zinc-300">?</span>
      </div>
      <h3 className="text-lg font-semibold text-zinc-900 mb-2">
        Not Analyzed Yet
      </h3>
      <p className="text-sm text-zinc-600 mb-6">
        Click <span className="font-medium">Analyze Resume</span> to get your ATS score and personalized
        improvement suggestions.
      </p>
    </div>
  );
}

function MetricCard({
  label,
  value,
  isLength = false,
}: {
  label: string;
  value: number;
  isLength?: boolean;
}) {
  return (
    <div className="bg-white border rounded-xl p-4 space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-medium text-zinc-700">{label}</span>
        <span
          className={cn(
            "font-bold",
            isLength
              ? "text-zinc-900"
              : value >= 80
                ? "text-green-600"
                : value >= 50
                  ? "text-yellow-600"
                  : "text-red-600"
          )}
        >
          {isLength ? `${value} words` : `${value}%`}
        </span>
      </div>
      {!isLength && <Progress value={value} className="h-2" />}
    </div>
  );
}
