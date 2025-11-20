"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResumeData } from "../types";
import { Plus, Trash2, Sparkles, Briefcase } from "lucide-react";
import { v4 as uuidv4 } from "uuid";

interface ExperienceProps {
  data: ResumeData["experience"];
  updateData: (data: ResumeData["experience"]) => void;
}

export function Experience({ data, updateData }: ExperienceProps) {
  const addExperience = () => {
    updateData([
      ...data,
      {
        id: uuidv4(),
        company: "",
        role: "",
        start: "",
        end: "",
        bullets: [""],
      },
    ]);
  };

  const removeExperience = (id: string) => {
    updateData(data.filter((exp) => exp.id !== id));
  };

  const updateExperienceItem = (
    id: string,
    field: keyof ResumeData["experience"][0],
    value: string | boolean
  ) => {
    updateData(
      data.map((exp) => (exp.id === id ? { ...exp, [field]: value } : exp))
    );
  };

  const addBullet = (expId: string) => {
    const exp = data.find((e) => e.id === expId);
    if (exp) {
      updateExperienceItem(expId, "bullets", [...exp.bullets, ""]);
    }
  };

  const updateBullet = (expId: string, index: number, value: string) => {
    const exp = data.find((e) => e.id === expId);
    if (exp) {
      const newBullets = [...exp.bullets];
      newBullets[index] = value;
      updateExperienceItem(expId, "bullets", newBullets);
    }
  };

  const removeBullet = (expId: string, index: number) => {
    const exp = data.find((e) => e.id === expId);
    if (exp) {
      const newBullets = exp.bullets.filter((_, i) => i !== index);
      updateExperienceItem(expId, "bullets", newBullets);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-zinc-900">Work Experience</h2>
          <p className="text-sm text-zinc-500 mt-1">
            Showcase your professional journey
          </p>
        </div>
        <Button
          onClick={addExperience}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white gap-2 shadow-lg shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" /> Add Experience
        </Button>
      </div>

      <div className="space-y-4">
        {data.map((exp, index) => (
          <div
            key={exp.id}
            className="p-6 border border-zinc-200 rounded-xl space-y-4 bg-gradient-to-br from-white to-zinc-50/50 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center">
                  <span className="text-sm font-bold text-purple-700">
                    {index + 1}
                  </span>
                </div>
                <h3 className="font-semibold text-zinc-900">
                  Experience #{index + 1}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg"
                onClick={() => removeExperience(exp.id)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Company Name</Label>
                <Input
                  value={exp.company}
                  onChange={(e) =>
                    updateExperienceItem(exp.id, "company", e.target.value)
                  }
                  placeholder="e.g., Google"
                />
              </div>

              <div className="space-y-2">
                <Label>Job Title</Label>
                <Input
                  value={exp.role}
                  onChange={(e) =>
                    updateExperienceItem(exp.id, "role", e.target.value)
                  }
                  placeholder="e.g., Software Engineering Intern"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    value={exp.start}
                    onChange={(e) =>
                      updateExperienceItem(exp.id, "start", e.target.value)
                    }
                    placeholder="e.g., Jun 2023"
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    value={exp.end}
                    onChange={(e) =>
                      updateExperienceItem(exp.id, "end", e.target.value)
                    }
                    placeholder="e.g., Aug 2023"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <Label className="text-sm font-semibold text-zinc-700">
                    Key Achievements / Responsibilities
                  </Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      /* TODO: Implement AI Bullet generation */
                      console.log("AI Generate Bullets");
                    }}
                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 gap-1.5 text-xs rounded-lg"
                  >
                    <Sparkles className="w-3.5 h-3.5" /> Improve with AI
                  </Button>
                </div>

                <div className="space-y-2.5">
                  {exp.bullets.map((bullet, bIndex) => (
                    <div key={bIndex} className="flex gap-2 items-start">
                      <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-3 shrink-0" />
                      <Textarea
                        value={bullet}
                        onChange={(e) =>
                          updateBullet(exp.id, bIndex, e.target.value)
                        }
                        placeholder="Describe what you did and achieved (e.g., Increased performance by 30% through optimization)..."
                        className="min-h-[70px] flex-1 resize-none"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0 rounded-lg mt-1"
                        onClick={() => removeBullet(exp.id, bIndex)}
                        disabled={exp.bullets.length === 1}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addBullet(exp.id)}
                    className="w-full mt-2 border-dashed border-zinc-300 hover:border-purple-400 hover:bg-purple-50/50 rounded-lg"
                  >
                    <Plus className="w-4 h-4 mr-2" /> Add Bullet Point
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}

        {data.length === 0 && (
          <div className="text-center p-12 border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50/50">
            <Briefcase className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
            <p className="text-zinc-500 font-medium">
              No work experience added yet
            </p>
            <p className="text-sm text-zinc-400 mt-1">
              Click &quot;Add Experience&quot; to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
