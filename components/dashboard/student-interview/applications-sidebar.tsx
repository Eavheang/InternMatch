"use client";

import { useState } from "react";
import { Search, Briefcase, Calendar, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

type Application = {
  application: {
    id: string;
    status: string;
    appliedAt: string;
    coverLetter?: string;
  };
  job: {
    id: string;
    jobTitle: string;
    jobDescription: string;
    requirements: string[];
  };
  company: {
    id: string;
    companyName: string;
    companyLogo?: string;
    industry?: string;
  };
};

interface ApplicationsSidebarProps {
  applications: Application[];
  selectedApplicationId: string | null;
  onSelectApplication: (applicationId: string) => void;
}

const statusColors = {
  applied: "bg-blue-100 text-blue-800 border-blue-200",
  shortlisted: "bg-yellow-100 text-yellow-800 border-yellow-200",
  interviewed: "bg-purple-100 text-purple-800 border-purple-200",
  hired: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

export function ApplicationsSidebar({
  applications,
  selectedApplicationId,
  onSelectApplication,
}: ApplicationsSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredApplications = applications.filter((app) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      app.job.jobTitle.toLowerCase().includes(searchLower) ||
      app.company.companyName.toLowerCase().includes(searchLower) ||
      (app.company.industry &&
        app.company.industry.toLowerCase().includes(searchLower))
    );
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <aside className="w-80 bg-white border-r border-zinc-200 flex flex-col h-full">
      <div className="p-6 border-b border-zinc-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <Input
            type="text"
            placeholder="Search applications..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-50 border-zinc-200 focus:bg-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {filteredApplications.length === 0 ? (
          <div className="p-6 text-center text-zinc-500">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm">
              {searchQuery
                ? "No applications match your search"
                : "No applications found"}
            </p>
          </div>
        ) : (
          <div className="space-y-1 p-3">
            {filteredApplications.map((app) => (
              <div
                key={app.application.id}
                onClick={() => onSelectApplication(app.application.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 hover:shadow-sm ${
                  selectedApplicationId === app.application.id
                    ? "bg-indigo-50 border-indigo-200 shadow-sm"
                    : "bg-white border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div className="space-y-3">
                  {/* Job Title and Company */}
                  <div>
                    <h3 className="font-semibold text-zinc-900 text-sm leading-tight">
                      {app.job.jobTitle}
                    </h3>
                    <div className="flex items-center gap-1 mt-1">
                      <Building2 className="w-3 h-3 text-zinc-400" />
                      <span className="text-xs text-zinc-600">
                        {app.company.companyName}
                      </span>
                    </div>
                  </div>

                  {/* Status and Date */}
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        statusColors[
                          app.application.status as keyof typeof statusColors
                        ] || "bg-zinc-100 text-zinc-800 border-zinc-200"
                      }`}
                    >
                      {app.application.status.charAt(0).toUpperCase() +
                        app.application.status.slice(1)}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-zinc-500">
                      <Calendar className="w-3 h-3" />
                      {formatDate(app.application.appliedAt)}
                    </div>
                  </div>

                  {/* Industry */}
                  {app.company.industry && (
                    <div className="text-xs text-zinc-500">
                      {app.company.industry}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
