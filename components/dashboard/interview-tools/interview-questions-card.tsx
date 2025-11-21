"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  MessageSquare,
  Brain,
  FileText,
} from "lucide-react";

type InterviewQuestions = {
  id: string;
  questions: Array<{
    question: string;
    intent: string;
    difficulty: string;
    relatedTo?: string;
  }>;
  createdAt: string;
};

interface InterviewQuestionsCardProps {
  applicationStatus: string;
  studentName: string;
  questions: InterviewQuestions | null;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function InterviewQuestionsCard({
  applicationStatus,
  studentName,
  questions,
  isGenerating,
  onGenerate,
}: InterviewQuestionsCardProps) {
  return (
    <Card className="border-zinc-200 shadow-sm bg-white overflow-hidden">
      <div className="p-6 border-b border-zinc-100 flex items-center justify-between bg-white">
        <div className="flex-1"></div>
        <div className="flex items-center justify-center gap-3 flex-1">
          <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="text-center">
            <h3 className="font-bold text-zinc-900">Interview Questions</h3>
            <p className="text-xs text-zinc-500 mt-0.5">AI-generated questions based on candidate profile</p>
          </div>
        </div>
        <div className="flex-1 flex justify-end">
          {applicationStatus === "shortlisted" && !questions && (
            <Button
              size="sm"
              onClick={onGenerate}
              disabled={isGenerating}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3 h-3 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                "Generate Questions"
              )}
            </Button>
          )}
        </div>
      </div>
      
      <CardContent className="p-0 bg-zinc-50/30">
        {!questions ? (
          <div className="text-center py-16 px-4 border-b border-zinc-100">
            <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageSquare className="w-5 h-5 text-zinc-400" />
            </div>
            <h4 className="text-zinc-900 font-medium mb-1">No Questions Generated</h4>
            <p className="text-sm text-zinc-500 max-w-md mx-auto">
              {applicationStatus === "shortlisted" 
                ? `Generate tailored interview questions based on ${studentName}'s profile.`
                : "Shortlist this candidate to unlock AI-generated interview questions."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {questions.questions.map((q, idx) => (
              <div key={idx} className="p-6 bg-white hover:bg-zinc-50/50 transition-colors">
                <div className="flex items-start gap-4">
                  <span className="flex-none flex items-center justify-center w-6 h-6 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold mt-0.5">
                    {idx + 1}
                  </span>
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <p className="font-medium text-zinc-900 text-base">{q.question}</p>
                      <Badge variant="outline" className={`capitalize shrink-0 font-normal ${
                        q.difficulty === 'easy' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        q.difficulty === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                        'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {q.difficulty}
                      </Badge>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-xs text-zinc-500 bg-zinc-50 p-3 rounded-lg border border-zinc-100">
                      <span className="flex items-center gap-1.5">
                        <Brain className="w-3.5 h-3.5 text-zinc-400" />
                        <span className="font-medium text-zinc-700">Intent:</span> {q.intent}
                      </span>
                      {q.relatedTo && (
                        <>
                          <span className="hidden sm:inline text-zinc-300">|</span>
                          <span className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-zinc-400" />
                            <span className="font-medium text-zinc-700">Context:</span> {q.relatedTo}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
