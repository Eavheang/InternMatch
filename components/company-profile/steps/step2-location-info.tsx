"use client";

import { useMemo } from "react";
import { CompanyStepProps } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function CompanyStep2Location({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: CompanyStepProps) {
  const otherLocationsText = useMemo(
    () => (data.otherLocations.length ? data.otherLocations.join("\n") : ""),
    [data.otherLocations]
  );

  const handleLocationsChange = (value: string) => {
    const entries = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    onUpdate({ otherLocations: entries });
  };

  const canProceed = data.headquarters.trim().length > 0;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="grid gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">
            Headquarters *
          </label>
          <Input
            placeholder="San Francisco, CA"
            value={data.headquarters}
            onChange={(event) => onUpdate({ headquarters: event.target.value })}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">
            Other Locations (Optional)
          </label>
          <textarea
            placeholder="Enter one location per line"
            value={otherLocationsText}
            onChange={(event) => handleLocationsChange(event.target.value)}
            rows={5}
            className="w-full rounded-2xl border border-zinc-200 bg-transparent px-4 py-3 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
          <p className="text-xs text-zinc-500">
            Example: New York, NY ↵ Austin, TX ↵ Remote
          </p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Button
          type="button"
          variant="outline"
          className="rounded-2xl px-6"
          onClick={onPrevious}
        >
          <ChevronLeftIcon className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          type="button"
          disabled={!canProceed}
          className="rounded-2xl px-8 text-base"
          onClick={onNext}
        >
          Next
          <ChevronRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function ChevronLeftIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
