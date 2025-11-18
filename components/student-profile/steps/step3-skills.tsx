"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { skills as availableSkills } from "@/constants/skills";

type SkillsData = {
  skills: string[];
};

type Step3SkillsProps = {
  data: SkillsData;
  onUpdate: (data: Partial<SkillsData>) => void;
  onNext: () => void;
  onPrevious: () => void;
};

export function Step3Skills({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: Step3SkillsProps) {
  const [skillInput, setSkillInput] = useState("");
  const [skills, setSkills] = useState<string[]>(data.skills || []);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync local state with parent data when it changes
  useEffect(() => {
    if (data.skills && JSON.stringify(data.skills) !== JSON.stringify(skills)) {
      setSkills(data.skills);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.skills]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        inputRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Helper function to check if a skill already exists (case-insensitive)
  const skillExists = (skill: string, skillList: string[]): boolean => {
    return skillList.some(
      (s) => s.toLowerCase().trim() === skill.toLowerCase().trim()
    );
  };

  // Filter and sort skills - prioritize exact matches, then starts with, then contains
  const filteredSkills = availableSkills
    .filter(
      (skill) =>
        skill.toLowerCase().includes(skillInput.toLowerCase().trim()) &&
        !skillExists(skill, skills)
    )
    .sort((a, b) => {
      const inputLower = skillInput.toLowerCase().trim();
      const aLower = a.toLowerCase();
      const bLower = b.toLowerCase();

      // Exact match first
      if (aLower === inputLower) return -1;
      if (bLower === inputLower) return 1;

      // Starts with second
      if (aLower.startsWith(inputLower) && !bLower.startsWith(inputLower))
        return -1;
      if (bLower.startsWith(inputLower) && !aLower.startsWith(inputLower))
        return 1;

      // Then alphabetically
      return aLower.localeCompare(bLower);
    })
    .slice(0, 10); // Limit to 10 suggestions

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim();
    if (!trimmedSkill) return;

    // If there's a highlighted suggestion or exact match, use that
    let skillToAdd = trimmedSkill;
    if (highlightedIndex >= 0 && filteredSkills[highlightedIndex]) {
      skillToAdd = filteredSkills[highlightedIndex];
    } else if (filteredSkills.length > 0) {
      // Check if input matches first suggestion exactly (case-insensitive)
      const firstMatch = filteredSkills[0];
      if (
        firstMatch.toLowerCase() === trimmedSkill.toLowerCase() ||
        firstMatch.toLowerCase().startsWith(trimmedSkill.toLowerCase())
      ) {
        skillToAdd = firstMatch;
      }
    }

    if (!skillExists(skillToAdd, skills)) {
      const newSkills = [...skills, skillToAdd];
      setSkills(newSkills);
      onUpdate({ skills: newSkills });
      setSkillInput("");
      setHighlightedIndex(-1);
      setShowSuggestions(false);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    const newSkills = skills.filter((s) => s !== skillToRemove);
    setSkills(newSkills);
    onUpdate({ skills: newSkills });
  };

  const handleSkillSelect = (skill: string) => {
    if (!skillExists(skill, skills)) {
      const newSkills = [...skills, skill];
      setSkills(newSkills);
      onUpdate({ skills: newSkills });
      setSkillInput("");
      setHighlightedIndex(-1);
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSkillInput(value);
    setShowSuggestions(value.trim().length > 0);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (showSuggestions && filteredSkills.length > 0) {
        setHighlightedIndex((prev) =>
          prev < filteredSkills.length - 1 ? prev + 1 : prev
        );
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const handleNext = () => {
    onUpdate({ skills });
    onNext();
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <TargetIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Skills</h2>
          <p className="text-sm text-zinc-600">What are you good at?</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="relative">
          <div className="flex gap-2">
            <Input
              ref={inputRef}
              placeholder="Type to search skills (e.g., Python, JavaScript, React...)"
              value={skillInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={() => {
                if (skillInput.trim().length > 0) {
                  setShowSuggestions(true);
                }
              }}
              className="flex-1"
            />
            <Button
              type="button"
              onClick={handleAddSkill}
              className="rounded-2xl bg-indigo-600"
              disabled={!skillInput.trim()}
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>

          {/* Skill Suggestions */}
          {showSuggestions && skillInput.trim() && filteredSkills.length > 0 && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 mt-2 w-full max-h-48 overflow-y-auto rounded-lg border border-zinc-200 bg-white shadow-lg"
            >
              {filteredSkills.map((skill, index) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleSkillSelect(skill)}
                  className={`w-full px-4 py-2 text-left text-sm text-zinc-900 transition-colors ${
                    index === highlightedIndex
                      ? "bg-indigo-50 text-indigo-700"
                      : "hover:bg-zinc-50"
                  }`}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  {skill}
                </button>
              ))}
            </div>
          )}

          {/* Show message if no suggestions found */}
          {showSuggestions &&
            skillInput.trim() &&
            filteredSkills.length === 0 && (
              <div className="absolute z-10 mt-2 w-full rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-lg">
                No matching skills found. You can still add &quot;{skillInput.trim()}&quot; as a custom skill.
              </div>
            )}
        </div>

        {/* Selected Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <div
                key={skill}
                className="flex items-center gap-2 rounded-lg bg-indigo-100 px-3 py-1.5 text-sm text-indigo-700"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="text-indigo-500 hover:text-indigo-700"
                >
                  <XIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex justify-between pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onPrevious}
          className="rounded-2xl"
        >
          <ArrowLeftIcon className="mr-2 h-4 w-4" />
          Previous
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="rounded-2xl bg-indigo-600"
        >
          Next
          <ArrowRightIcon className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function TargetIcon({ className }: { className?: string }) {
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
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
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
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

function XIcon({ className }: { className?: string }) {
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
      <path d="M18 6L6 18" />
      <path d="M6 6l12 12" />
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

