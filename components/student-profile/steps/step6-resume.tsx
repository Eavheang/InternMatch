"use client";

import { useState, useRef, ChangeEvent, DragEvent } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ResumeData = {
  resumeFile?: File | null;
  resumeUrl?: string | null;
};

type Step6ResumeProps = {
  data: ResumeData;
  onUpdate: (data: Partial<ResumeData>) => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function Step6Resume({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: Step6ResumeProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadError("Only PDF files are allowed");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must be less than 10MB");
      return;
    }

    setUploadError(null);
    setUploadSuccess(false);
    setUploading(true);

    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        setUploadError("Please log in to upload your resume");
        setUploading(false);
        return;
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/students/resume/upload", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({
          error: "Failed to upload resume",
        }));
        throw new Error(errorData.error || "Failed to upload resume");
      }

      const result = await response.json();
      if (result.success && result.resumeUrl) {
        onUpdate({
          resumeFile: file,
          resumeUrl: result.resumeUrl,
        });
        setUploadSuccess(true);
      } else {
        throw new Error("Upload failed: No URL returned");
      }
    } catch (error) {
      console.error("Resume upload error:", error);
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload resume"
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const handleSkip = () => {
    onNext();
  };

  const handleRemove = () => {
    onUpdate({ resumeFile: null, resumeUrl: null });
    setUploadSuccess(false);
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <DocumentIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Resume</h2>
          <p className="text-sm text-zinc-600">
            Upload your resume to complete your profile
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="mb-6">
        {!data.resumeUrl ? (
          <label
            className={cn(
              "flex min-h-[200px] flex-col items-center justify-center rounded-2xl border-2 border-dashed border-zinc-200 bg-zinc-50 text-center transition hover:border-indigo-300 hover:bg-indigo-50",
              uploading && "pointer-events-none opacity-50"
            )}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {uploading ? (
              <div className="flex flex-col items-center space-y-3">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                <p className="text-sm font-medium text-zinc-700">
                  Uploading resume...
                </p>
              </div>
            ) : (
              <>
                <UploadIcon className="mb-4 h-12 w-12 text-indigo-500" />
                <p className="mb-2 text-sm font-medium text-zinc-700">
                  Drag and drop your resume here
                </p>
                <p className="mb-4 text-xs text-zinc-500">
                  PDF format, up to 10MB
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-xl bg-white text-indigo-600 hover:bg-indigo-50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Browse Files
                </Button>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileInput}
              disabled={uploading}
            />
          </label>
        ) : (
          <div className="rounded-2xl border-2 border-indigo-200 bg-indigo-50 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600">
                  <DocumentIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-zinc-900">
                    {data.resumeFile?.name || "Resume.pdf"}
                  </p>
                  <p className="text-xs text-zinc-600">
                    {uploadSuccess ? "Uploaded successfully" : "Ready"}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRemove}
                className="rounded-xl"
              >
                Remove
              </Button>
            </div>
          </div>
        )}

        {uploadError && (
          <div className="mt-4 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">
            {uploadError}
          </div>
        )}

        {uploadSuccess && (
          <div className="mt-4 rounded-lg bg-green-50 p-3 text-sm text-green-700">
            Resume uploaded successfully!
          </div>
        )}
      </div>

      {/* Tip Box */}
      <div className="mb-6 rounded-lg bg-blue-50 p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">Tip:</span> You can skip this step and
          add your resume later from your dashboard.
        </p>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          className="rounded-2xl"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleSkip}
            className="rounded-2xl"
          >
            Skip
          </Button>
          <Button
            type="button"
            onClick={onNext}
            className="rounded-2xl"
            disabled={uploading}
          >
            Next
            <ArrowRightIcon className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

function DocumentIcon({ className }: { className?: string }) {
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
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
      <path d="M10 9H8" />
    </svg>
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
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function ArrowLeftIcon({ className }: { className?: string }) {
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
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
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
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}
