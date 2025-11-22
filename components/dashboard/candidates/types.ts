export type ApplicationStatus =
  | "applied"
  | "shortlisted"
  | "rejected"
  | "interviewed"
  | "hired";

export type Application = {
  application: {
    id: string;
    status: ApplicationStatus;
    coverLetter: string | null;
    aiGeneratedQuestions: Record<string, unknown> | null;
    appliedAt: string;
    updatedAt: string;
  };
  student: {
    id: string;
    firstName: string;
    lastName: string;
    gmail: string | null;
    phoneNumber: string | null;
    location: string | null;
    university: string | null;
    major: string | null;
    graduationYear: number | null;
    gpa: number | null;
    resumeUrl: string | null;
    careerInterest: string | null;
    aboutMe: string | null;
    createdAt: string;
  };
  user: {
    email: string;
    isVerified: boolean;
  };
  job: {
    id: string;
    jobTitle: string;
    jobDescription: string;
    status: string;
    location: string | null;
    jobType: string | null;
    experienceLevel: string | null;
    createdAt: string;
  };
};

import { Clock, UserCheck, XCircle, CheckCircle2, Award } from "lucide-react";

export const statusConfig: Record<
  ApplicationStatus,
  {
    label: string;
    bg: string;
    text: string;
    icon: React.ComponentType<{ className?: string }>;
  }
> = {
  applied: {
    label: "Applied",
    bg: "bg-blue-100/80",
    text: "text-blue-700",
    icon: Clock,
  },
  shortlisted: {
    label: "Shortlisted",
    bg: "bg-purple-100/80",
    text: "text-purple-700",
    icon: UserCheck,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-100/80",
    text: "text-rose-700",
    icon: XCircle,
  },
  interviewed: {
    label: "Interviewed",
    bg: "bg-indigo-100/80",
    text: "text-indigo-700",
    icon: CheckCircle2,
  },
  hired: {
    label: "Hired",
    bg: "bg-emerald-100/80",
    text: "text-emerald-700",
    icon: Award,
  },
};
