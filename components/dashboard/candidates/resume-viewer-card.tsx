import { Button } from "@/components/ui/button";
import { FileText, Download, AlertCircle } from "lucide-react";

interface ResumeViewerCardProps {
  resumeUrl: string | null;
}

export function ResumeViewerCard({ resumeUrl }: ResumeViewerCardProps) {
  return (
    <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/50">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 uppercase tracking-wider">
          <FileText className="w-4 h-4 text-indigo-500" />
          Resume
        </div>
      </div>
      
      <div className="p-8">
        {resumeUrl ? (
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-indigo-50 border border-indigo-100">
              <FileText className="w-8 h-8 text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">Candidate Resume Available</h3>
              <p className="text-sm text-zinc-500 mt-1 max-w-xs mx-auto">
                Review the candidate's qualifications and experience by downloading their resume.
              </p>
            </div>
            <Button 
              onClick={() => window.open(resumeUrl, "_blank")}
              className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-200"
            >
              <Download className="w-4 h-4" />
              Download Resume
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center text-center space-y-4">
            <div className="p-4 rounded-full bg-zinc-100 border border-zinc-200">
              <AlertCircle className="w-8 h-8 text-zinc-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-zinc-900">No Resume Uploaded</h3>
              <p className="text-sm text-zinc-500 mt-1">
                The candidate hasn't uploaded a resume yet.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
