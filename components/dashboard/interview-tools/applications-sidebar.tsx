"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Users, Trash2, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationDialog } from "./delete-confirmation-dialog";

type Application = {
  application: {
    id: string;
    status: string;
    appliedAt: string;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    university: string | null;
    major: string | null;
  };
  job: {
    id: string;
    jobTitle: string;
  };
};

type AIReview = {
  id: string;
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  alternatives: Array<{
    jobId: string;
    jobTitle: string;
    reason: string;
    matchScore: number;
  }>;
  summary: string;
  analyzedAt: string;
};

const statusStyles: Record<string, string> = {
  applied: "bg-blue-50 text-blue-700 border-blue-200",
  shortlisted: "bg-purple-50 text-purple-700 border-purple-200",
  interviewed: "bg-indigo-50 text-indigo-700 border-indigo-200",
  hired: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-rose-50 text-rose-700 border-rose-200",
};

interface ApplicationsSidebarProps {
  applications: Application[];
  selectedApplicationId: string | null;
  onSelectApplication: (applicationId: string) => void;
  reviews: Record<string, AIReview>;
  onDeleteInterviewData?: (applicationId: string) => Promise<void>;
}

export function ApplicationsSidebar({
  applications,
  selectedApplicationId,
  onSelectApplication,
  reviews,
  onDeleteInterviewData,
}: ApplicationsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [candidateToDelete, setCandidateToDelete] = useState<{
    applicationId: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredApplications = applications.filter((app) => {
    // Exclude hired and rejected candidates from Interview Tools
    if (
      app.application.status === "hired" ||
      app.application.status === "rejected"
    ) {
      return false;
    }

    const searchLower = searchQuery.toLowerCase();
    return (
      app.student.firstName.toLowerCase().includes(searchLower) ||
      app.student.lastName.toLowerCase().includes(searchLower) ||
      app.job.jobTitle.toLowerCase().includes(searchLower)
    );
  });

  const handleDeleteClick = (app: Application, e: React.MouseEvent) => {
    e.stopPropagation();
    setCandidateToDelete({
      applicationId: app.application.id,
      name: `${app.student.firstName} ${app.student.lastName}`,
    });
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!candidateToDelete || !onDeleteInterviewData) return;

    setIsDeleting(true);
    try {
      await onDeleteInterviewData(candidateToDelete.applicationId);
      setDeleteDialogOpen(false);
      setCandidateToDelete(null);
    } catch (error) {
      console.error("Failed to delete interview data:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setCandidateToDelete(null);
  };

  return (
    <aside className="w-80 lg:w-96 border-r border-zinc-200 bg-white flex flex-col sticky top-0 h-screen overflow-hidden">
      <div className="p-4 border-b border-zinc-100">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            placeholder="Search candidates..."
            className="pl-9 bg-zinc-50 border-zinc-200 focus:bg-white transition-colors"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto">
        {filteredApplications.length === 0 ? (
          <div className="p-8 text-center text-zinc-500">
            <Users className="w-12 h-12 mx-auto mb-3 text-zinc-300" />
            <p>No candidates found</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-50">
            {filteredApplications.map((app) => (
              <div
                key={app.application.id}
                className={`relative group ${
                  selectedApplicationId === app.application.id
                    ? "bg-indigo-50/60"
                    : ""
                }`}
              >
                {selectedApplicationId === app.application.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-600 z-10" />
                )}

                {/* Main clickable area */}
                <div
                  onClick={() => onSelectApplication(app.application.id)}
                  className="w-full text-left p-4 hover:bg-zinc-50 transition-all relative cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-1.5">
                    <h3
                      className={`font-semibold truncate pr-2 text-sm ${
                        selectedApplicationId === app.application.id
                          ? "text-indigo-900"
                          : "text-zinc-900"
                      }`}
                    >
                      {app.student.firstName} {app.student.lastName}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] text-zinc-400 whitespace-nowrap">
                        {new Date(app.application.appliedAt).toLocaleDateString(
                          undefined,
                          {
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-500 truncate mb-2.5 font-medium">
                    {app.job.jobTitle}
                  </p>

                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`text-[10px] px-1.5 py-0 h-5 font-medium border capitalize ${
                        statusStyles[app.application.status] ||
                        "bg-zinc-50 text-zinc-600 border-zinc-200"
                      }`}
                    >
                      {app.application.status}
                    </Badge>

                    {reviews[app.application.id] && (
                      <div
                        className={`text-[10px] font-bold ${
                          reviews[app.application.id].matchScore >= 70
                            ? "text-emerald-600"
                            : reviews[app.application.id].matchScore >= 50
                              ? "text-amber-600"
                              : "text-rose-600"
                        }`}
                      >
                        {reviews[app.application.id].matchScore}% Match
                      </div>
                    )}
                  </div>
                </div>

                {/* Delete button - positioned absolutely to avoid nesting */}
                {(reviews[app.application.id] ||
                  app.application.status === "interviewed") &&
                  onDeleteInterviewData && (
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreVertical className="h-3 w-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem
                            onClick={(e: React.MouseEvent) =>
                              handleDeleteClick(app, e)
                            }
                            className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete Interview Data
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        candidateName={candidateToDelete?.name || ""}
      />
    </aside>
  );
}
