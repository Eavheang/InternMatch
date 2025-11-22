"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Loader2,
  Lightbulb,
  Brain,
  Users,
  Code,
  MessageCircle,
  Building2,
  CheckCircle2,
  Clock,
  Target,
} from "lucide-react";

type InterviewTips = {
  general: string[];
  technical: string[];
  behavioral: string[];
  companySpecific: string[];
};

interface InterviewTipsCardProps {
  jobTitle: string;
  companyName: string;
  industry?: string;
  tips: InterviewTips | null;
  isGenerating: boolean;
  onGenerate: () => void;
}

export function InterviewTipsCard({
  jobTitle,
  companyName,
  industry,
  tips,
  isGenerating,
  onGenerate,
}: InterviewTipsCardProps) {
  const tipCategories = [
    {
      key: "general" as keyof InterviewTips,
      title: "General Interview Tips",
      icon: Target,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
    },
    {
      key: "behavioral" as keyof InterviewTips,
      title: "Behavioral Questions",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
    {
      key: "technical" as keyof InterviewTips,
      title: "Technical Preparation",
      icon: Code,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      key: "companySpecific" as keyof InterviewTips,
      title: `${companyName} Specific`,
      icon: Building2,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
  ];

  return (
    <Card className="border-zinc-200">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="space-y-2 p-4">
            <CardTitle className="text-lg text-zinc-900 flex items-center gap-2">
              <Lightbulb className="w-5 h-5 text-indigo-600" />
              Interview Tips & Strategy
            </CardTitle>
            <p className="text-sm text-zinc-600">
              Personalized advice for your {jobTitle} interview at {companyName}
              {industry && ` in ${industry}`}
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
                {tips ? "Regenerate Tips" : "Generate Tips"}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {!tips && !isGenerating && (
          <div className="text-center py-8">
            <Lightbulb className="w-12 h-12 mx-auto mb-4 text-zinc-300" />
            <p className="text-zinc-500 mb-4">
              Get personalized interview tips and strategies for this specific
              role and company
            </p>
            <Button
              onClick={onGenerate}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <Brain className="w-4 h-4 mr-2" />
              Generate Interview Tips
            </Button>
          </div>
        )}

        {isGenerating && (
          <div className="text-center py-8">
            <Loader2 className="w-8 h-8 mx-auto mb-4 text-indigo-600 animate-spin" />
            <p className="text-zinc-600">
              Analyzing company culture and role requirements to generate
              personalized tips...
            </p>
          </div>
        )}

        {tips && (
          <div className="space-y-6">
            {tipCategories.map((category) => {
              const categoryTips = tips[category.key];
              if (!categoryTips || categoryTips.length === 0) return null;

              const Icon = category.icon;

              return (
                <div
                  key={category.key}
                  className={`p-4 rounded-lg border ${category.bgColor} ${category.borderColor}`}
                >
                  <h4
                    className={`font-semibold mb-3 flex items-center gap-2 ${category.color}`}
                  >
                    <Icon className="w-4 h-4" />
                    {category.title}
                  </h4>
                  <ul className="space-y-2">
                    {categoryTips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <CheckCircle2
                          className={`w-4 h-4 mt-0.5 flex-shrink-0 ${category.color}`}
                        />
                        <span className="text-sm text-zinc-700 leading-relaxed">
                          {tip}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}

            {/* Interview Timeline */}
            <div className="mt-6 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Interview Day Timeline
              </h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-indigo-900">
                      Before the Interview (1-2 hours)
                    </p>
                    <p className="text-sm text-indigo-800">
                      Review your notes, practice key answers, and prepare
                      questions to ask
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-indigo-900">
                      Arrival (15 minutes early)
                    </p>
                    <p className="text-sm text-indigo-800">
                      Arrive early, check in, and use the time to calm nerves
                      and review
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-indigo-900">
                      During the Interview
                    </p>
                    <p className="text-sm text-indigo-800">
                      Listen actively, provide specific examples, and ask
                      thoughtful questions
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-semibold">
                    4
                  </div>
                  <div>
                    <p className="font-medium text-indigo-900">
                      After the Interview
                    </p>
                    <p className="text-sm text-indigo-800">
                      Send a thank-you email within 24 hours, reiterating your
                      interest
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Questions to Ask */}
            <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-3 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Good Questions to Ask
              </h4>
              <ul className="space-y-2 text-sm text-yellow-800">
                <li>
                  • &quot;What does a typical day look like in this role?&quot;
                </li>
                <li>
                  • &quot;What are the biggest challenges facing the team right
                  now?&quot;
                </li>
                <li>
                  • &quot;How do you measure success in this position?&quot;
                </li>
                <li>
                  • &quot;What opportunities are there for professional
                  development?&quot;
                </li>
                <li>
                  • &quot;What do you enjoy most about working at {companyName}
                  ?&quot;
                </li>
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
