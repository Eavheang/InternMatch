"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { skills as availableSkills } from "@/constants/skills";

type SkillsInputProps = {
  skills: string[];
  onSkillsChange: (skills: string[]) => void;
};

export function SkillsInput({ skills, onSkillsChange }: SkillsInputProps) {
  const [skillInput, setSkillInput] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);

  const filterSkills = (input: string) => {
    if (!input.trim()) {
      setSkillSuggestions([]);
      return;
    }
    const filtered = availableSkills
      .filter(
        (skill) =>
          skill.toLowerCase().includes(input.toLowerCase()) &&
          !skills.includes(skill)
      )
      .slice(0, 8);
    setSkillSuggestions(filtered);
  };

  const handleSkillInputChange = (value: string) => {
    setSkillInput(value);
    filterSkills(value);
  };

  const addSkill = (skill?: string) => {
    const value = (skill || skillInput.trim()).trim();
    if (!value || skills.includes(value)) {
      setSkillInput("");
      setSkillSuggestions([]);
      return;
    }

    const isValidSkill = availableSkills.some(
      (s) => s.toLowerCase() === value.toLowerCase()
    );

    if (!isValidSkill) {
      toast.error(
        `Please select a skill from the list. "${value}" is not available.`
      );
      return;
    }

    const exactSkill =
      availableSkills.find((s) => s.toLowerCase() === value.toLowerCase()) ||
      value;

    onSkillsChange([...skills, exactSkill]);
    setSkillInput("");
    setSkillSuggestions([]);
  };

  const removeSkill = (value: string) => {
    onSkillsChange(skills.filter((skill) => skill !== value));
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Type to search skills (e.g. JavaScript, React, Python)"
            value={skillInput}
            onChange={(e) => handleSkillInputChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && skillSuggestions.length > 0) {
                e.preventDefault();
                addSkill(skillSuggestions[0]);
              } else if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
              if (e.key === "Escape") {
                setSkillSuggestions([]);
              }
            }}
            onBlur={() => {
              setTimeout(() => setSkillSuggestions([]), 200);
            }}
          />
          {skillSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {skillSuggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => addSkill(suggestion)}
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 hover:text-blue-700 transition-colors border-b border-slate-100 last:border-b-0"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button
          type="button"
          onClick={() => addSkill()}
          variant="outline"
          className="shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" /> Add
        </Button>
      </div>
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-2 p-3 rounded-lg border border-slate-200 bg-slate-50">
          {skills.map((skill) => (
            <span
              key={skill}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-white text-slate-700 border border-slate-200 shadow-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(skill)}
                className="text-slate-400 hover:text-red-500 transition-colors"
                aria-label={`Remove ${skill}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
