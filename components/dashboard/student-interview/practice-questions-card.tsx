"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Brain, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";

type PracticeQuestions = {
  id: string;
  questions: Array<{
    question: string;
    category: string;
    difficulty: string;
    tips: string[];
    sampleAnswer?: string;
  }>;
  createdAt: string;
};

interface PracticeQuestionsCardProps {
  jobTitle: string;
  companyName: string;
  questions: PracticeQuestions | null;
  isGenerating: boolean;
  onGenerate: () => void;
  onRegenerate?: () => void;
}

const difficultyColors = {
  easy: "bg-green-100 text-green-800 border-green-200",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
  hard: "bg-red-100 text-red-800 border-red-200",
};

const categoryColors = {
  behavioral: "bg-blue-100 text-blue-800 border-blue-200",
  technical: "bg-purple-100 text-purple-800 border-purple-200",
  situational: "bg-indigo-100 text-indigo-800 border-indigo-200",
  company: "bg-orange-100 text-orange-800 border-orange-200",
  general: "bg-zinc-100 text-zinc-800 border-zinc-200",
};

export function PracticeQuestionsCard({
  jobTitle,
  companyName,
  questions,
  isGenerating,
  onGenerate,
  onRegenerate,
}: PracticeQuestionsCardProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(new Set());

  const toggleQuestion = (index: number) => {
    const newExpanded = new Set(expandedQuestions);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedQuestions(newExpanded);
  };

  return (
    <Card className="border-zinc-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 p-4">
            <CardTitle className="text-lg text-zinc-900 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-indigo-600" />
              Practice Interview Questions
            </CardTitle>
            <p className="text-sm text-zinc-600">
              AI-generated questions tailored for {jobTitle} at {companyName}
            </p>
          </div>
          <Button
            onClick={onGenerate}
            disabled={isGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                {questions ? "Regenerate Questions" : "Generate Questions"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {!questions && !isGenerating && (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
            <p className="text-zinc-500 mb-4">
              Generate personalized interview questions based on this job posting
            </p>
            <Button
              onClick={onGenerate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Brain className="w-4 h-4 mr-2" />
              Generate Practice Questions
            </Button>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto mb-4 text-indigo-600 animate-spin" />
            <p className="text-zinc-600">
              Analyzing job requirements and generating personalized questions...
            </p>
          </div>
        )}

        {questions && (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-zinc-600">
                {questions.questions.length} questions generated
              </p>
              <div className="flex items-center gap-3">
                <p className="text-xs text-zinc-500">
                  Generated on {new Date(questions.createdAt).toLocaleDateString()}
                </p>
                {onRegenerate && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={onRegenerate}
                    disabled={isGenerating}
                    className="text-xs"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      "Regenerate"
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {questions.questions.map((q, index) => (
                <div
                  key={index}
                  className="border border-zinc-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            categoryColors[q.category.toLowerCase() as keyof typeof categoryColors] ||
                            categoryColors.general
                          }`}
                        >
                          {q.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            difficultyColors[q.difficulty.toLowerCase() as keyof typeof difficultyColors] ||
                            difficultyColors.medium
                          }`}
                        >
                          {q.difficulty}
                        </Badge>
                      </div>
                      <h4 className="font-medium text-zinc-900 leading-relaxed">
                        {q.question}
                      </h4>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleQuestion(index)}
                      className="ml-2 text-zinc-500 hover:text-zinc-700"
                    >
                      {expandedQuestions.has(index) ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </Button>
                  </div>

                  {expandedQuestions.has(index) && (
                    <div className="space-y-4 pt-4 border-t border-zinc-100">
                      {/* Tips */}
                      {q.tips && q.tips.length > 0 && (
                        <div>
                          <h5 className="font-medium text-zinc-900 mb-2 flex items-center gap-2">
                            <Lightbulb className="w-4 h-4 text-yellow-600" />
                            Tips for Answering
                          </h5>
                          <ul className="space-y-1">
                            {q.tips.map((tip, tipIndex) => (
                              <li key={tipIndex} className="text-sm text-zinc-600 flex items-start gap-2">
                                <span className="w-1 h-1 bg-zinc-400 rounded-full mt-2 flex-shrink-0" />
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Sample Answer */}
                      {q.sampleAnswer && (
                        <div>
                          <h5 className="font-medium text-zinc-900 mb-2">Sample Answer Framework</h5>
                          <div className="p-3 bg-zinc-50 rounded-lg border">
                            <p className="text-sm text-zinc-700">{q.sampleAnswer}</p>
                          </div>
                          <p className="text-xs text-zinc-500 mt-2">
                            Use this as a framework and personalize with your own experiences.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h4 className="font-medium text-blue-900 mb-2">Practice Tips</h4>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Practice answering out loud, not just in your head</li>
                <li>• Use the STAR method (Situation, Task, Action, Result) for behavioral questions</li>
                <li>• Prepare specific examples from your experience for each question</li>
                <li>• Time yourself to ensure concise, focused answers</li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
