"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { CompanyStepProps } from "../types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const COMPANY_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "501-1000",
  "1000+",
];

export function CompanyStep1Info({ data, onUpdate, onNext }: CompanyStepProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleLogoUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Logo must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdate({ companyLogo: reader.result?.toString() || "" });
      setUploadError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Logo must be smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      onUpdate({ companyLogo: reader.result?.toString() || "" });
      setUploadError(null);
    };
    reader.readAsDataURL(file);
  };

  const canProceed =
    data.companyName.trim().length > 2 &&
    data.industry.trim().length > 0 &&
    data.companySize.trim().length > 0 &&
    data.website.trim().length > 0;

  return (
    <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
      <div className="grid gap-6">
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">
            Company Name *
          </label>
          <Input
            placeholder="TechCorp Inc."
            value={data.companyName}
            onChange={(event) => onUpdate({ companyName: event.target.value })}
          />
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              Industry *
            </label>
            <Input
              placeholder="Technology, Finance, Healthcare..."
              value={data.industry}
              onChange={(event) => onUpdate({ industry: event.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-700">
              Company Size *
            </label>
            <select
              value={data.companySize}
              onChange={(event) =>
                onUpdate({ companySize: event.target.value })
              }
              className="h-11 w-full rounded-2xl border border-zinc-200 bg-transparent px-4 text-sm text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
            >
              <option value="">Select a range</option>
              {COMPANY_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-zinc-700">Website</label>
          <Input
            placeholder="https://www.yourcompany.com"
            type="url"
            value={data.website}
            onChange={(event) => onUpdate({ website: event.target.value })}
          />
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-zinc-700">
                Company Logo (Optional)
              </label>
              <p className="text-xs text-zinc-500">PNG, JPG up to 5MB</p>
            </div>
            {data.companyLogo && (
              <button
                type="button"
                onClick={() => onUpdate({ companyLogo: "" })}
                className="text-sm font-medium text-rose-500 hover:text-rose-600"
              >
                Remove
              </button>
            )}
          </div>
          <label
            className={cn(
              "flex min-h-[180px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 text-center transition hover:border-indigo-300 hover:bg-indigo-50",
              data.companyLogo && "border-solid"
            )}
            onDragOver={(event) => event.preventDefault()}
            onDrop={handleDrop}
          >
            {data.companyLogo ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="h-24 w-24 overflow-hidden rounded-full border border-zinc-200 bg-white">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={data.companyLogo}
                    alt="Company logo preview"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-sm text-zinc-600">
                  Logo uploaded successfully
                </p>
              </div>
            ) : (
              <>
                <UploadIcon className="mb-4 h-10 w-10 text-indigo-500" />
                <p className="text-sm font-medium text-zinc-700">
                  Drag and drop your logo here
                </p>
                <p className="text-xs text-zinc-500">PNG, JPG up to 5MB</p>
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-4 rounded-xl bg-white text-indigo-600 hover:bg-indigo-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg"
              className="hidden"
              onChange={handleLogoUpload}
            />
          </label>
          {uploadError && (
            <p className="text-sm font-medium text-rose-500">{uploadError}</p>
          )}
        </div>
      </div>
      <div className="mt-8 flex items-center justify-end gap-3">
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

function UploadIcon({ className }: { className?: string }) {
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
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
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
