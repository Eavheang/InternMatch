export type JobStatus = "open" | "closed" | "draft" | "paused";

export type JobPosting = {
  id: string;
  jobTitle: string;
  jobDescription: string;
  status: JobStatus;
  requirements?: {
    qualifications?: string[];
    skills?: string[];
    responsibilities?: string[];
    programType?: string;
    duration?: string;
    startDate?: string;
    deadline?: string;
  } | null;
  benefits?: string[] | null;
  salaryRange?: string | null;
  location?: string | null;
  jobType?: string | null;
  experienceLevel?: string | null;
  createdAt?: string;
  updatedAt?: string;
  applicationCount?: number | null;
};

export type EditFormState = {
  jobTitle: string;
  department: string;
  location: string;
  programType: string;
  duration: string;
  salaryRange: string;
  jobDescription: string;
  responsibilities: string;
  qualifications: string;
  skills: string[];
  benefits: string;
  startDate: string;
  deadline: string;
  status: JobStatus;
};

export const statusMeta: Record<
  JobStatus,
  { label: string; className: string; dot: string }
> = {
  open: {
    label: "Active",
    className: "bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  closed: {
    label: "Closed",
    className: "bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  draft: {
    label: "Draft",
    className: "bg-zinc-100 text-zinc-600",
    dot: "bg-zinc-500",
  },
  paused: {
    label: "Paused",
    className: "bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
};
