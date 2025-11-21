"use client";

interface InterviewToolsHeaderProps {
  candidateCount: number;
}

export function InterviewToolsHeader({ candidateCount }: InterviewToolsHeaderProps) {
  return (
    <div className="p-8 space-y-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
              AI-Powered
            </p>
            <h1 className="text-3xl font-bold text-zinc-900 mt-1">
              Interview Tools
            </h1>
          </div>
          <div className="text-sm text-zinc-500">
            {candidateCount} Candidates found
          </div>
        </div>
      </header>
    </div>
  );
}
