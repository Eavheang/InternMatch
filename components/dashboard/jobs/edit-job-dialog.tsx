"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SkillsInput } from "./skills-input";
import { type EditFormState, type JobStatus } from "./types";

type EditJobDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: EditFormState;
  onFormChange: (data: EditFormState) => void;
  onSave: () => void;
  isSaving: boolean;
};

export function EditJobDialog({
  open,
  onOpenChange,
  formData,
  onFormChange,
  isSaving,
  onSave,
}: EditJobDialogProps) {
  const updateField = <K extends keyof EditFormState>(
    field: K,
    value: EditFormState[K]
  ) => {
    onFormChange({ ...formData, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-black">
            Edit Job Posting
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Basic Information
            </h3>
            <div className="grid gap-4">
              <div>
                <Label className="text-sm font-semibold">Job Title *</Label>
                <Input
                  value={formData.jobTitle}
                  onChange={(e) => updateField("jobTitle", e.target.value)}
                  className="mt-1.5"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-semibold">Department</Label>
                  <Input
                    value={formData.department}
                    onChange={(e) => updateField("department", e.target.value)}
                    placeholder="e.g. Engineering"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Location</Label>
                  <Input
                    value={formData.location}
                    onChange={(e) => updateField("location", e.target.value)}
                    placeholder="e.g. San Francisco, CA"
                    className="mt-1.5"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label className="text-sm font-semibold">Program Type</Label>
                  <Input
                    value={formData.programType}
                    onChange={(e) => updateField("programType", e.target.value)}
                    placeholder="e.g. Summer 2025"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Duration</Label>
                  <Input
                    value={formData.duration}
                    onChange={(e) => updateField("duration", e.target.value)}
                    placeholder="e.g. 12 weeks"
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Salary / Stipend</Label>
                  <Input
                    value={formData.salaryRange}
                    onChange={(e) => updateField("salaryRange", e.target.value)}
                    placeholder="e.g. $8,000/month"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Job Description
            </h3>
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-semibold">Description *</Label>
                <Textarea
                  rows={5}
                  value={formData.jobDescription}
                  onChange={(e) =>
                    updateField("jobDescription", e.target.value)
                  }
                  placeholder="Describe the internship opportunity, team culture, and what makes this role exciting..."
                  className="mt-1.5 resize-none"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">Key Responsibilities</Label>
                <Textarea
                  rows={4}
                  value={formData.responsibilities}
                  onChange={(e) => updateField("responsibilities", e.target.value)}
                  placeholder="• Develop new features...&#10;• Collaborate with designers..."
                  className="mt-1.5 resize-none font-mono text-sm"
                />
              </div>
              <div>
                <Label className="text-sm font-semibold">Qualifications</Label>
                <Textarea
                  rows={4}
                  value={formData.qualifications}
                  onChange={(e) => updateField("qualifications", e.target.value)}
                  placeholder="• Currently pursuing a degree in...&#10;• Experience with..."
                  className="mt-1.5 resize-none font-mono text-sm"
                />
              </div>
            </div>
          </div>

          {/* Required Skills */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Required Skills
            </h3>
            <SkillsInput
              skills={formData.skills}
              onSkillsChange={(skills) => updateField("skills", skills)}
            />
          </div>

          {/* Benefits & Schedule */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Benefits & Schedule
            </h3>
            <div className="grid gap-4">
              <div>
                <Label className="text-sm font-semibold">Benefits & Perks</Label>
                <Textarea
                  rows={4}
                  value={formData.benefits}
                  onChange={(e) => updateField("benefits", e.target.value)}
                  placeholder="• Mentorship from senior engineers&#10;• Networking events..."
                  className="mt-1.5 resize-none font-mono text-sm"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-sm font-semibold">Start Date</Label>
                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateField("startDate", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
                <div>
                  <Label className="text-sm font-semibold">Application Deadline</Label>
                  <Input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => updateField("deadline", e.target.value)}
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-slate-900 border-b border-slate-200 pb-2">
              Publishing
            </h3>
            <div>
              <Label className="text-sm font-semibold">Status</Label>
              <select
                className="mt-1.5 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-black"
                value={formData.status}
                onChange={(e) =>
                  updateField("status", e.target.value as JobStatus)
                }
              >
                <option value="open">Active</option>
                <option value="closed">Closed</option>
                <option value="draft">Draft</option>
                <option value="paused">Paused</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={onSave} disabled={isSaving}>
              {isSaving && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

