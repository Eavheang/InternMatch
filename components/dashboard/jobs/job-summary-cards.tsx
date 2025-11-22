import { type JobStatus, type JobPosting } from "./types";

type SummaryKey = "all" | "open" | "paused" | "closed" | "draft";

const summaryFilters: Array<{ key: SummaryKey; label: string }> = [
  { key: "all", label: "Total Jobs" },
  { key: "open", label: "Active" },
  { key: "paused", label: "Paused" },
  { key: "closed", label: "Closed" },
  { key: "draft", label: "Drafts" },
];

type JobSummaryCardsProps = {
  jobs: JobPosting[];
  activeFilter: SummaryKey;
  onFilterChange: (filter: SummaryKey) => void;
};

export function JobSummaryCards({
  jobs,
  activeFilter,
  onFilterChange,
}: JobSummaryCardsProps) {
  const statusCounts = jobs.reduce(
    (acc, job) => {
      acc[job.status] = (acc[job.status] || 0) + 1;
      return acc;
    },
    {} as Record<JobStatus, number>
  );

  return (
    <section className="grid gap-4 md:grid-cols-5">
      {summaryFilters.map((card) => {
        const value =
          card.key === "all"
            ? jobs.length
            : statusCounts[card.key as JobStatus] || 0;
        const active = activeFilter === card.key;
        return (
          <button
            key={card.key}
            onClick={() => onFilterChange(card.key)}
            className={`rounded-2xl border px-4 py-5 text-left transition ${
              active
                ? "border-indigo-500 bg-indigo-50 shadow-sm"
                : "border-zinc-200 bg-white hover:border-indigo-200"
            }`}
          >
            <p className="text-xs uppercase tracking-wide text-zinc-500">
              {card.label}
            </p>
            <p className="text-3xl font-semibold text-zinc-900 mt-2">{value}</p>
          </button>
        );
      })}
    </section>
  );
}
