import { Button } from "@/components/ui/button";
import { Loader2, UserCheck, XCircle, CheckCircle2, Award } from "lucide-react";
import type { ApplicationStatus } from "./types";

interface StatusUpdateCardProps {
  currentStatus: ApplicationStatus;
  onStatusUpdate: (status: ApplicationStatus) => void;
  isUpdating: boolean;
}

export function StatusUpdateCard({
  currentStatus,
  onStatusUpdate,
  isUpdating,
}: StatusUpdateCardProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 uppercase tracking-wider">
        <CheckCircle2 className="w-4 h-4 text-indigo-500" />
        Update Status
      </div>
      <div className="flex flex-col gap-3 pl-1">
        {currentStatus === "applied" && (
          <>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 hover:bg-purple-50 hover:border-purple-200 hover:text-purple-700"
              onClick={() => onStatusUpdate("shortlisted")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <UserCheck className="w-4 h-4" />
              )}
              Shortlist Candidate
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
              onClick={() => onStatusUpdate("rejected")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Reject Application
            </Button>
          </>
        )}
        {currentStatus === "shortlisted" && (
          <>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-700"
              onClick={() => onStatusUpdate("interviewed")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              Mark as Interviewed
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
              onClick={() => onStatusUpdate("hired")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Award className="w-4 h-4" />
              )}
              Hire Candidate
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
              onClick={() => onStatusUpdate("rejected")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Reject Application
            </Button>
          </>
        )}
        {currentStatus === "interviewed" && (
          <>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200"
              onClick={() => onStatusUpdate("hired")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Award className="w-4 h-4" />
              )}
              Hire Candidate
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start gap-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200"
              onClick={() => onStatusUpdate("rejected")}
              disabled={isUpdating}
            >
              {isUpdating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              Reject Application
            </Button>
          </>
        )}
        {(currentStatus === "hired" || currentStatus === "rejected") && (
          <div className="text-center py-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-100">
              <CheckCircle2 className="w-4 h-4 text-zinc-500" />
              <p className="text-sm text-zinc-600 font-medium">
                Application status is finalized
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
