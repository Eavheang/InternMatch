"use client";

import { CompanyStepProps } from "../types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";

export function CompanyStep4Contact({
  data,
  onUpdate,
  onPrevious,
  onSubmit,
  isSubmitting,
}: CompanyStepProps) {
  const canSubmit =
    data.contactName.trim().length > 1 &&
    data.contactEmail.includes("@") &&
    data.companyDescription.trim().length > 0;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="grid gap-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              Contact Name *
            </label>
            <Input
              placeholder="Jane Doe"
              value={data.contactName}
              onChange={(event) =>
                onUpdate({ contactName: event.target.value })
              }
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              Contact Email *
            </label>
            <Input
              placeholder="jane@company.com"
              type="email"
              value={data.contactEmail}
              onChange={(event) =>
                onUpdate({ contactEmail: event.target.value })
              }
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">
            Contact Phone (Optional)
          </label>
          <Input
            placeholder="+1 (555) 123-4567"
            value={data.contactPhone}
            onChange={(event) => onUpdate({ contactPhone: event.target.value })}
          />
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <Checkbox
            id="hasInternshipProgram"
            checked={data.hasInternshipProgram}
            onCheckedChange={(checked) =>
              onUpdate({ hasInternshipProgram: checked === true })
            }
          />
          <label
            htmlFor="hasInternshipProgram"
            className="text-sm font-medium text-zinc-700"
          >
            We have an existing internship program
          </label>
        </div>
        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-600">
          <p className="font-semibold">Next Steps</p>
          <p className="mt-1 text-blue-600">
            After completing setup, you can start posting internship
            opportunities and reviewing candidates.
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
          disabled={!canSubmit || isSubmitting}
          className="rounded-2xl px-8 text-base"
          onClick={onSubmit}
        >
          {isSubmitting ? "Completing..." : "Complete Setup"}
          <CheckIcon className="ml-2 h-4 w-4" />
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

function CheckIcon({ className }: { className?: string }) {
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
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
