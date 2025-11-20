import { RefObject } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Download, Loader2 } from "lucide-react";

interface UploadedResumeCardProps {
  resumeUrl?: string;
  isUploading: boolean;
  onUploadClick: () => void;
  onFileChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

export function UploadedResumeCard({
  resumeUrl,
  isUploading,
  onUploadClick,
  onFileChange,
  fileInputRef,
}: UploadedResumeCardProps) {
  return (
    <Card className="p-6 border-2 border-zinc-200 hover:border-purple-300 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-xl font-semibold text-zinc-900 mb-1">
            Uploaded Resume
          </h2>
          <p className="text-sm text-zinc-600 mb-4">
            {resumeUrl
              ? "Your resume is ready to view and download"
              : "No resume uploaded yet"}
          </p>
          {resumeUrl ? (
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={onUploadClick}
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload New Resume
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                className="flex-1 gap-2"
                onClick={() => {
                  const link = document.createElement("a");
                  link.href = resumeUrl;
                  link.target = "_blank";
                  link.rel = "noopener noreferrer";
                  link.click();
                }}
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <Button
                onClick={onUploadClick}
                disabled={isUploading}
                className="w-full gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    Upload Resume
                  </>
                )}
              </Button>
              <p className="text-xs text-zinc-500 text-center">
                PDF format only, max 10MB
              </p>
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            onChange={onFileChange}
            className="hidden"
          />
        </div>
      </div>
    </Card>
  );
}

