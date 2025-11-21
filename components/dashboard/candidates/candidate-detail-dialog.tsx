"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { StudentInfoCard } from "./student-info-card";
import { ApplicationDetailsCard } from "./application-details-card";
import { CoverLetterCard } from "./cover-letter-card";
import { StatusUpdateCard } from "./status-update-card";
import { ResumeViewerCard } from "./resume-viewer-card";
import { statusConfig } from "./types";
import type { Application, ApplicationStatus } from "./types";
import { RoleSuggestions } from "@/components/dashboard/role-suggestions";
import { X, Target } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface CandidateDetailDialogProps {
  application: Application;
  onStatusUpdate: (id: string, status: ApplicationStatus) => void;
  isUpdating: boolean;
  onClose: () => void;
}

export function CandidateDetailDialog({
  application,
  onStatusUpdate,
  isUpdating,
  onClose,
}: CandidateDetailDialogProps) {
  const [showRoleSuggestions, setShowRoleSuggestions] = useState(false);
  const status = statusConfig[application.application.status];
  const StatusIcon = status.icon;

  const handleStatusUpdate = (newStatus: ApplicationStatus) => {
    onStatusUpdate(application.application.id, newStatus);
  };

  // Get initials for avatar
  const initials = `${application.student.firstName[0] || ""}${
    application.student.lastName[0] || ""
  }`.toUpperCase();

  return (
    <DialogContent className="max-w-5xl w-full max-h-[95vh] h-[95vh] overflow-hidden flex flex-col p-0 gap-0 border-none shadow-2xl bg-zinc-50">
      {/* Header Section */}
      <div className="bg-white border-b border-zinc-200 z-10 relative">
        <DialogHeader className="px-6 py-5 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-5">
              {/* Avatar */}
              <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-sm ring-1 ring-black/5">
                <span className="text-xl font-bold tracking-tight">
                  {initials}
                </span>
              </div>

              {/* Name & Title */}
              <div className="space-y-1">
                <DialogTitle className="text-2xl font-bold text-zinc-900 tracking-tight">
                  {application.student.firstName} {application.student.lastName}
                </DialogTitle>
                <div className="flex items-center gap-3 text-sm">
                  <p className="text-zinc-500 font-medium">Applied for</p>
                  <span className="inline-flex items-center gap-1.5 font-medium text-zinc-900 bg-zinc-50 px-2.5 py-0.5 rounded-md border border-zinc-200">
                    {application.job.jobTitle}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span
                className={`hidden sm:inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium shadow-sm ring-1 ring-inset ${status.bg} ${status.text} ring-black/5`}
              >
                <StatusIcon className="w-3.5 h-3.5" />
                {status.label}
              </span>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full h-9 w-9 hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </DialogHeader>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          
          {/* Left Column: Profile & Application Info (2/3 width) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Status for Mobile */}
            <div className="sm:hidden">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium w-full justify-center shadow-sm ring-1 ring-inset ${status.bg} ${status.text} ring-black/5`}
              >
                <StatusIcon className="w-4 h-4" />
                {status.label}
              </span>
            </div>

            <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
              <StudentInfoCard application={application} />
            </section>

            <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
              <ApplicationDetailsCard application={application} />
            </section>

            {application.application.coverLetter && (
              <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
                <CoverLetterCard coverLetter={application.application.coverLetter} />
              </section>
            )}
          </div>

          {/* Right Column: Actions & Resume (1/3 width) */}
          <div className="lg:col-span-1 space-y-6">
            <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
              <StatusUpdateCard
                currentStatus={application.application.status}
                onStatusUpdate={handleStatusUpdate}
                isUpdating={isUpdating}
              />
            </section>

            <section className="bg-white rounded-xl border border-zinc-200 p-6 shadow-sm">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-600" />
                  Alternative Roles
                </h3>
                <p className="text-sm text-zinc-600">
                  AI-powered analysis of alternative career paths for this candidate
                </p>
                <Button
                  variant="outline"
                  onClick={() => setShowRoleSuggestions(true)}
                  className="w-full gap-2"
                >
                  <Target className="w-4 h-4" />
                  Analyze Role Fit
                </Button>
              </div>
            </section>

            <ResumeViewerCard resumeUrl={application.student.resumeUrl} />
          </div>

        </div>
      </div>

      {/* Role Suggestions Modal */}
      {showRoleSuggestions && (
        <Dialog open={showRoleSuggestions} onOpenChange={setShowRoleSuggestions}>
          <DialogContent className="max-w-7xl w-full max-h-[95vh] h-[95vh] overflow-hidden flex flex-col p-0 gap-0">
            <div className="flex-1 overflow-y-auto p-6">
              <RoleSuggestions
                studentId={application.student.id}
                onClose={() => setShowRoleSuggestions(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </DialogContent>
  );
}
