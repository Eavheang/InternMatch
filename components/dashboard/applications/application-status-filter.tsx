import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  CheckCircle2,
  Clock3,
  User,
  Award,
  XCircle,
  List,
} from "lucide-react";

type ApplicationStatus = "all" | "applied" | "shortlisted" | "rejected" | "interviewed" | "hired";

interface ApplicationStatusFilterProps {
  activeStatus: ApplicationStatus;
  onStatusChange: (status: ApplicationStatus) => void;
  statistics: {
    total: number;
    applied: number;
    shortlisted: number;
    interviewed: number;
    hired: number;
    rejected: number;
  };
}

export function ApplicationStatusFilter({
  activeStatus,
  onStatusChange,
  statistics,
}: ApplicationStatusFilterProps) {
  const statusOptions = [
    {
      key: "all" as ApplicationStatus,
      label: "All Applications",
      count: statistics.total,
      icon: List,
      color: "text-zinc-600",
      activeColor: "bg-zinc-100 text-zinc-900 border-zinc-200",
    },
    {
      key: "applied" as ApplicationStatus,
      label: "Applied",
      count: statistics.applied,
      icon: Clock3,
      color: "text-blue-600",
      activeColor: "bg-blue-100 text-blue-900 border-blue-200",
    },
    {
      key: "shortlisted" as ApplicationStatus,
      label: "Shortlisted",
      count: statistics.shortlisted,
      icon: CheckCircle2,
      color: "text-yellow-600",
      activeColor: "bg-yellow-100 text-yellow-900 border-yellow-200",
    },
    {
      key: "interviewed" as ApplicationStatus,
      label: "Interviewed",
      count: statistics.interviewed,
      icon: User,
      color: "text-purple-600",
      activeColor: "bg-purple-100 text-purple-900 border-purple-200",
    },
    {
      key: "hired" as ApplicationStatus,
      label: "Hired",
      count: statistics.hired,
      icon: Award,
      color: "text-green-600",
      activeColor: "bg-green-100 text-green-900 border-green-200",
    },
    {
      key: "rejected" as ApplicationStatus,
      label: "Rejected",
      count: statistics.rejected,
      icon: XCircle,
      color: "text-red-600",
      activeColor: "bg-red-100 text-red-900 border-red-200",
    },
  ];

  return (
    <Card className="border-zinc-200/80 shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((option) => {
            const Icon = option.icon;
            const isActive = activeStatus === option.key;
            
            return (
              <Button
                key={option.key}
                variant={isActive ? "default" : "ghost"}
                size="sm"
                onClick={() => onStatusChange(option.key)}
                className={`flex items-center gap-2 h-10 ${
                  isActive
                    ? option.activeColor
                    : `hover:bg-zinc-100 ${option.color}`
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{option.label}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                  isActive
                    ? "bg-white/20"
                    : "bg-zinc-100 text-zinc-700"
                }`}>
                  {option.count}
                </span>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
