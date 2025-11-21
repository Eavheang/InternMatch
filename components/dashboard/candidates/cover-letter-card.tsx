import { FileText } from "lucide-react";
import type { Application } from "./types";

interface CoverLetterCardProps {
  coverLetter: string;
}

export function CoverLetterCard({ coverLetter }: CoverLetterCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 uppercase tracking-wider">
        <FileText className="w-4 h-4 text-indigo-500" />
        Cover Letter
      </div>
      <div className="bg-zinc-50/80 rounded-xl p-5 border border-zinc-200/60">
        <p className="text-sm text-zinc-700 whitespace-pre-wrap leading-relaxed">
          {coverLetter}
        </p>
      </div>
    </div>
  );
}
