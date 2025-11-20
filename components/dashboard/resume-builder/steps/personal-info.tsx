"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ResumeData } from "../types";

interface PersonalInfoProps {
  data: ResumeData["personalInfo"];
  updateData: (data: Partial<ResumeData["personalInfo"]>) => void;
  onAutoFill?: () => void;
}

export function PersonalInfo({
  data,
  updateData,
  onAutoFill: _onAutoFill,
}: PersonalInfoProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">
            Personal Information
          </h2>
          <p className="text-sm text-zinc-500 mt-1">
            Tell us about yourself to get started
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name *</Label>
          <Input
            id="fullName"
            placeholder="Your Full Name"
            value={data.fullName}
            onChange={(e) => updateData({ fullName: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Professional Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Software Engineer"
            value={data.title}
            onChange={(e) => updateData({ title: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={data.email}
              onChange={(e) => updateData({ email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              placeholder="Your phone number"
              value={data.phone}
              onChange={(e) => updateData({ phone: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              placeholder="e.g., New York, NY"
              value={data.location}
              onChange={(e) => updateData({ location: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="linkedin">LinkedIn</Label>
            <Input
              id="linkedin"
              placeholder="LinkedIn profile URL"
              value={data.linkedin || ""}
              onChange={(e) => updateData({ linkedin: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="github">GitHub</Label>
          <Input
            id="github"
            placeholder="GitHub profile URL"
            value={data.github || ""}
            onChange={(e) => updateData({ github: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            placeholder="Your personal website or portfolio"
            value={data.website || ""}
            onChange={(e) => updateData({ website: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}
