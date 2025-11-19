"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResumeData } from "../types";
import { Plus, Trash2, GraduationCap } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface EducationProps {
  data: ResumeData["education"];
  updateData: (data: ResumeData["education"]) => void;
}

export function Education({ data, updateData }: EducationProps) {
  const addEducation = () => {
    updateData([
      ...data,
      {
        id: uuidv4(),
        school: "",
        degree: "",
        start: "",
        end: "",
        details: "",
      },
    ]);
  };

  const removeEducation = (id: string) => {
    updateData(data.filter((edu) => edu.id !== id));
  };

  const updateEducationItem = (id: string, field: keyof ResumeData["education"][0], value: string) => {
    updateData(
      data.map((edu) => (edu.id === id ? { ...edu, [field]: value } : edu))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Education</h2>
          <p className="text-sm text-zinc-500 mt-1">Add your academic background</p>
        </div>
        <Button 
          onClick={addEducation} 
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" /> Add Education
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((edu, index) => (
          <div key={edu.id} className="p-6 border border-zinc-200 rounded-xl space-y-4 bg-gradient-to-br from-white to-zinc-50/50 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-700">{index + 1}</span>
                </div>
                <h3 className="font-semibold text-zinc-900">Education Entry #{index + 1}</h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                onClick={() => removeEducation(edu.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>School / University</Label>
                <Input
                  value={edu.school}
                  onChange={(e) => updateEducationItem(edu.id, "school", e.target.value)}
                  placeholder="e.g., Stanford University"
                />
              </div>

              <div className="space-y-2">
                <Label>Degree</Label>
                <Input
                  value={edu.degree}
                  onChange={(e) => updateEducationItem(edu.id, "degree", e.target.value)}
                  placeholder="e.g., B.S. Computer Science"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    value={edu.start}
                    onChange={(e) => updateEducationItem(edu.id, "start", e.target.value)}
                    placeholder="e.g., Sep 2020"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    value={edu.end}
                    onChange={(e) => updateEducationItem(edu.id, "end", e.target.value)}
                    placeholder="e.g., May 2024"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Additional Details</Label>
                <Textarea
                  value={edu.details}
                  onChange={(e) => updateEducationItem(edu.id, "details", e.target.value)}
                  placeholder="GPA, Honors, Relevant Coursework..."
                />
              </div>
            </div>
          </div>
        ))}
        
        {data.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50/50">
            <GraduationCap className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">No education added yet</p>
            <p className="text-sm text-zinc-400 mt-1">Click "Add Education" to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}

