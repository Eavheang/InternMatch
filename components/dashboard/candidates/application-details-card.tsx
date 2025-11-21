import { Briefcase, Calendar, Clock } from "lucide-react";
import { InfoRow } from "./info-row";
import type { Application } from "./types";

interface ApplicationDetailsCardProps {
  application: Application;
}

export function ApplicationDetailsCard({ application }: ApplicationDetailsCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 uppercase tracking-wider">
        <Calendar className="w-4 h-4 text-indigo-500" />
        Application Details
      </div>
      <div className="space-y-4 pl-1">
        <InfoRow
          icon={<Briefcase className="w-4 h-4" />}
          label="Job Title"
          value={application.job.jobTitle}
        />
        <InfoRow
          icon={<Calendar className="w-4 h-4" />}
          label="Applied On"
          value={formatDate(application.application.appliedAt)}
        />
        <InfoRow
          icon={<Clock className="w-4 h-4" />}
          label="Last Updated"
          value={formatDate(application.application.updatedAt)}
        />
      </div>
    </div>
  );
}
