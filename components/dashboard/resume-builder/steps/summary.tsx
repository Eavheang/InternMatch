"use client";

import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface SummaryProps {
  data: string;
  updateData: (value: string) => void;
}

export function Summary({ data, updateData }: SummaryProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Professional Summary</h2>
        <p className="text-sm text-zinc-500 mt-1">Write a compelling summary that highlights your key strengths</p>
      </div>
      
      <div className="space-y-3">
        <Label htmlFor="summary" className="text-sm font-semibold text-zinc-700">
          Summary <span className="text-zinc-400 font-normal">({data.length} characters)</span>
        </Label>
        <Textarea
          id="summary"
          className="min-h-[240px] resize-none"
          placeholder="Briefly describe your professional background, key achievements, and career objectives. Make it concise and impactful to capture the reader's attention..."
          value={data}
          onChange={(e) => updateData(e.target.value)}
        />
        <p className="text-xs text-zinc-500">
          💡 Tip: Keep it between 50-200 words for best results
        </p>
      </div>
    </div>
  );
}

