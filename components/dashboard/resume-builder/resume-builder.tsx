"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ResumeData, initialResumeData } from "./types";
import { toast } from "sonner";
import { PersonalInfo } from "./steps/personal-info";
import { Summary } from "./steps/summary";
import { Education } from "./steps/education";
import { Experience } from "./steps/experience";
import { Skills } from "./steps/skills";
import { ATSScore } from "./steps/ats-score";
import { ResumePreview } from "./resume-preview";
import {
  User,
  FileText,
  GraduationCap,
  Briefcase,
  Wrench,
  Activity,
  ChevronLeft,
  ChevronRight,
  Save,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

const steps = [
  {
    id: "personal",
    title: "Personal Information",
    icon: User,
    component: PersonalInfo,
  },
  {
    id: "summary",
    title: "Professional Summary",
    icon: FileText,
    component: Summary,
  },
  {
    id: "education",
    title: "Education",
    icon: GraduationCap,
    component: Education,
  },
  {
    id: "experience",
    title: "Work Experience",
    icon: Briefcase,
    component: Experience,
  },
  { id: "skills", title: "Skills", icon: Wrench, component: Skills },
  { id: "ats", title: "ATS Score", icon: Activity, component: ATSScore },
];

const STORAGE_KEY = "internmatch_resume_draft";

export function ResumeBuilder() {
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [resumeData, setResumeData] = useState<ResumeData>(initialResumeData);
  const [previewScale, setPreviewScale] = useState(0.9);
  const [_aiDialogOpen, setAiDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Load saved data from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved) as ResumeData;
        setResumeData(parsed);
      }
    } catch (error) {
      console.error("Failed to load saved resume:", error);
    }
  }, []);

  // Auto-save to localStorage whenever resumeData changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
      } catch (error) {
        console.error("Failed to auto-save resume:", error);
      }
    }, 500); // Debounce: save 500ms after last change

    return () => clearTimeout(timeoutId);
  }, [resumeData]);

  const CurrentStepComponent = steps[activeStep].component;

  const updatePersonalData = (data: Partial<ResumeData["personalInfo"]>) => {
    setResumeData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, ...data },
    }));
  };

  const updateSummary = (summary: string) => {
    setResumeData((prev) => ({ ...prev, summary }));
  };

  const updateEducation = (education: ResumeData["education"]) => {
    setResumeData((prev) => ({ ...prev, education }));
  };

  const updateExperience = (experience: ResumeData["experience"]) => {
    setResumeData((prev) => ({ ...prev, experience }));
  };

  const updateSkills = (skills: string[]) => {
    setResumeData((prev) => ({ ...prev, skills }));
  };

  const handleNext = () => {
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    }
  };

  const handlePrevious = () => {
    if (activeStep > 0) {
      setActiveStep(activeStep - 1);
    }
  };

  const handleAutoFill = () => {
    setAiDialogOpen(true);
  };

  const handleResumeGenerated = (data: ResumeData) => {
    setResumeData((prev) => ({
      ...prev,
      ...data,
      personalInfo: {
        ...prev.personalInfo,
        ...data.personalInfo,
        // Preserve existing contact info if AI returns empty strings but user had typed something
        email: data.personalInfo.email || prev.personalInfo.email,
        phone: data.personalInfo.phone || prev.personalInfo.phone,
        fullName: data.personalInfo.fullName || prev.personalInfo.fullName,
      },
    }));
  };

  const handleUpdateResume = (newData: ResumeData) => {
    handleResumeGenerated(newData);
  };

  const handleSaveProgress = () => {
    setIsSaving(true);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(resumeData));
      toast.success(
        "Progress saved! Your resume will be restored when you return."
      );
    } catch (error) {
      console.error("Failed to save progress:", error);
      toast.error("Failed to save progress. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleClearAll = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setResumeData(initialResumeData);
      toast.success("Resume cleared!");
    } catch (error) {
      console.error("Failed to clear resume:", error);
      toast.error("Failed to clear resume.");
    }
  };

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-gradient-to-br from-zinc-50 via-white to-purple-50/30 overflow-hidden">
      {/* Sidebar */}
      <div className="w-72 bg-white/80 backdrop-blur-sm border-r border-zinc-200/50 shadow-sm flex flex-col">
        <div className="p-6 border-b border-zinc-200/50">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push("/dashboard/resume")}
            className="mb-3 -ml-2 text-zinc-600 hover:text-zinc-900 gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Resume
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-purple-800 bg-clip-text text-transparent">
                Resume Builder
              </h1>
              <p className="text-xs text-zinc-500 mt-0.5">
                Step {activeStep + 1} of {steps.length}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-1.5">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index < activeStep;
              const isActive = activeStep === index;
              return (
                <li key={step.id}>
                  <button
                    onClick={() => setActiveStep(index)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group",
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg shadow-purple-500/30"
                        : isCompleted
                          ? "bg-purple-50/50 text-purple-700 hover:bg-purple-100/70 border border-purple-200/50"
                          : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900"
                    )}
                  >
                    <span
                      className={cn(
                        "flex items-center justify-center w-7 h-7 rounded-lg text-xs font-semibold transition-all",
                        isActive
                          ? "bg-white/20 text-white border-0"
                          : isCompleted
                            ? "bg-purple-100 border-purple-300 text-purple-700"
                            : "border-2 border-zinc-300 bg-white text-zinc-500 group-hover:border-zinc-400"
                      )}
                    >
                      {isCompleted ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2.5}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      ) : (
                        index + 1
                      )}
                    </span>
                    <Icon
                      className={cn(
                        "w-4 h-4 transition-colors",
                        isActive
                          ? "text-white"
                          : "text-zinc-500 group-hover:text-zinc-700"
                      )}
                    />
                    <span className="flex-1 text-left">{step.title}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-zinc-200/50 space-y-2 bg-zinc-50/50">
          <Button
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white gap-2 shadow-lg shadow-green-500/20 transition-all"
            onClick={handleSaveProgress}
            disabled={isSaving}
          >
            <Save className="w-4 h-4" />{" "}
            {isSaving ? "Saving..." : "Save Progress"}
          </Button>
          <Button
            variant="outline"
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 gap-2 border-red-200 hover:border-red-300 transition-all"
            onClick={handleClearAll}
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex min-w-0">
        {/* Form Area */}
        <div className="flex-1 overflow-y-auto p-8 border-r border-zinc-200/50 bg-white/50">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-zinc-200/50 p-8 mb-6">
              <CurrentStepComponent
                // @ts-expect-error - dynamic props handling
                data={
                  activeStep === 0
                    ? resumeData.personalInfo
                    : activeStep === 1
                      ? resumeData.summary
                      : activeStep === 2
                        ? resumeData.education
                        : activeStep === 3
                          ? resumeData.experience
                          : activeStep === 4
                            ? resumeData.skills
                            : undefined
                }
                resumeData={activeStep === 5 ? resumeData : initialResumeData}
                // @ts-expect-error - Dynamic prop assignment based on activeStep
                updateData={
                  activeStep === 0
                    ? updatePersonalData
                    : activeStep === 1
                      ? updateSummary
                      : activeStep === 2
                        ? updateEducation
                        : activeStep === 3
                          ? updateExperience
                          : activeStep === 4
                            ? updateSkills
                            : undefined
                }
                onUpdateResume={
                  activeStep === 5 ? handleUpdateResume : undefined
                }
                onAutoFill={activeStep === 0 ? handleAutoFill : undefined}
              />
            </div>

            <div className="flex justify-between items-center mt-6 pt-6 border-t border-zinc-200/50">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={activeStep === 0}
                className="gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>

              {/* Progress Bar */}
              <div className="flex-1 mx-6">
                <div className="h-2 bg-zinc-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-700 transition-all duration-300 rounded-full"
                    style={{
                      width: `${((activeStep + 1) / steps.length) * 100}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-zinc-500 text-center mt-1">
                  {Math.round(((activeStep + 1) / steps.length) * 100)}%
                  Complete
                </p>
              </div>

              <Button
                onClick={handleNext}
                disabled={activeStep === steps.length - 1}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white gap-2 shadow-lg shadow-purple-500/20"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="w-[50%] bg-gradient-to-br from-zinc-50 to-zinc-100/50 flex flex-col border-l border-zinc-200/50">
          <div className="h-16 border-b border-zinc-200/50 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 shadow-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-semibold text-zinc-700">
                Live Preview
              </span>
            </div>
            <div className="flex items-center gap-3 bg-zinc-100 rounded-lg p-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  setPreviewScale(Math.max(0.5, previewScale - 0.1))
                }
              >
                <Minus className="w-3.5 h-3.5" />
              </Button>
              <span className="text-xs font-medium text-zinc-700 w-10 text-center">
                {Math.round(previewScale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() =>
                  setPreviewScale(Math.min(1.5, previewScale + 0.1))
                }
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>

          <div className="flex-1 overflow-auto p-8 flex justify-center bg-gradient-to-b from-transparent to-zinc-100/30">
            <div className="transition-transform duration-300">
              <ResumePreview data={resumeData} scale={previewScale} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
