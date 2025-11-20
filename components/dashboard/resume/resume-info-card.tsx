import { Card } from "@/components/ui/card";

export function ResumeInfoCard() {
  return (
    <Card className="mt-6 p-6 bg-blue-50/50 border-blue-200">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5">
          <svg
            className="w-3 h-3 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="font-semibold text-blue-900 mb-1">
            About Your Resumes
          </h3>
          <p className="text-sm text-blue-800">
            You can maintain both an uploaded resume and an AI-built version.
            Use the uploaded resume for quick submissions while the AI builder
            helps you craft tailored, optimized versions for specific roles.
          </p>
        </div>
      </div>
    </Card>
  );
}
