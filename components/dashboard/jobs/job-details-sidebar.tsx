import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobInfoRow } from "./job-info-row";
import {
  Briefcase,
  CalendarDays,
  Clock3,
  Users,
} from "lucide-react";

type JobDetail = {
  requirements?: {
    programType?: string;
    startDate?: string;
    deadline?: string;
  } | null;
  applicationCount?: number | null;
  createdAt?: string;
};

interface JobDetailsSidebarProps {
  job: JobDetail;
  formatDate: (dateString: string) => string;
}

export function JobDetailsSidebar({ job, formatDate }: JobDetailsSidebarProps) {
  return (
    <Card>
      <CardHeader className="pb-4 p-6">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 uppercase tracking-wider">
          <Briefcase className="w-4 h-4 text-indigo-500" />
          Job Details
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        {job.requirements?.programType && (
          <JobInfoRow
            icon={<Briefcase className="w-4 h-4" />}
            label="Program Type"
            value={job.requirements.programType}
          />
        )}

        {job.requirements?.startDate && (
          <JobInfoRow
            icon={<CalendarDays className="w-4 h-4" />}
            label="Start Date"
            value={formatDate(job.requirements.startDate)}
          />
        )}

        {job.requirements?.deadline && (
          <JobInfoRow
            icon={<Clock3 className="w-4 h-4" />}
            label="Application Deadline"
            value={formatDate(job.requirements.deadline)}
          />
        )}

        {job.applicationCount !== null && (
          <JobInfoRow
            icon={<Users className="w-4 h-4" />}
            label="Applications"
            value={`${job.applicationCount} applicants`}
          />
        )}

        <JobInfoRow
          icon={<CalendarDays className="w-4 h-4" />}
          label="Posted"
          value={job.createdAt ? formatDate(job.createdAt) : "Recently"}
        />
      </CardContent>
    </Card>
  );
}
