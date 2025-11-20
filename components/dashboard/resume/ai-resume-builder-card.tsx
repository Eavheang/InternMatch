import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

interface AiResumeBuilderCardProps {
  onBuildResume: () => void;
}

export function AiResumeBuilderCard({
  onBuildResume,
}: AiResumeBuilderCardProps) {
  return (
    <Card className="p-6 border-2 border-purple-200 hover:border-purple-400 transition-colors bg-gradient-to-br from-purple-50/50 to-white">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-zinc-900 mb-1">
            Build Resume with AI
          </h2>
          <p className="text-sm text-zinc-600 mb-4">
            Create a professional resume using our AI-powered builder. Get
            personalized suggestions and optimize for ATS systems.
          </p>
          <Button
            onClick={onBuildResume}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white gap-2 shadow-lg shadow-purple-500/20"
          >
            <Sparkles className="w-4 h-4" />
            Start Building
          </Button>
        </div>
      </div>
    </Card>
  );
}
