"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { skills as skillsConstant } from "@/constants/skills";

interface SkillsProps {
  data: string[];
  updateData: (data: string[]) => void;
}

export function Skills({ data, updateData }: SkillsProps) {
  const [newSkill, setNewSkill] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter skills based on input
  const filteredSkills = newSkill.trim()
    ? skillsConstant
        .filter(
          (skill) =>
            skill.toLowerCase().includes(newSkill.toLowerCase().trim()) &&
            !data.includes(skill)
        )
        .sort((a, b) => {
          const inputLower = newSkill.toLowerCase().trim();
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
        .slice(0, 10) // Limit to 10 suggestions
    : [];

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
        setHighlightedIndex(-1);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const addSkill = (skillToAdd?: string) => {
    const trimmedSkill = skillToAdd || newSkill.trim();
    if (!trimmedSkill) return;

    // Use highlighted suggestion if available
    let finalSkill = trimmedSkill;
    if (
      highlightedIndex >= 0 &&
      filteredSkills[highlightedIndex] &&
      !skillToAdd
    ) {
      finalSkill = filteredSkills[highlightedIndex];
    } else if (
      filteredSkills.length > 0 &&
      filteredSkills[0].toLowerCase() === trimmedSkill.toLowerCase() &&
      !skillToAdd
    ) {
      finalSkill = filteredSkills[0];
    }

    if (finalSkill && !data.includes(finalSkill)) {
      updateData([...data, finalSkill]);
      setNewSkill("");
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  const _removeSkill = (skillToRemove: string) => {
    updateData(data.filter((skill) => skill !== skillToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (highlightedIndex >= 0 && filteredSkills[highlightedIndex]) {
        addSkill(filteredSkills[highlightedIndex]);
      } else {
        addSkill();
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setShowSuggestions(true);
      setHighlightedIndex((prev) =>
        prev < filteredSkills.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setHighlightedIndex(-1);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-zinc-900">Skills</h2>
        <p className="text-sm text-zinc-500 mt-1">
          List your technical and soft skills
        </p>
      </div>

      <div className="space-y-5">
        <div className="space-y-2" ref={wrapperRef}>
          <Label
            htmlFor="skills"
            className="text-sm font-semibold text-zinc-700"
          >
            Add Skills
          </Label>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                id="skills"
                placeholder="Start typing to see suggestions (e.g., React, Python, Project Management)"
                value={newSkill}
                onChange={(e) => {
                  setNewSkill(e.target.value);
                  setShowSuggestions(true);
                  setHighlightedIndex(-1);
                }}
                onFocus={() => {
                  if (newSkill.trim()) {
                    setShowSuggestions(true);
                  }
                }}
                onKeyDown={handleKeyDown}
                className="flex-1 pr-10"
              />
              {newSkill && (
                <button
                  onClick={() => {
                    setNewSkill("");
                    setShowSuggestions(false);
                    inputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Suggestions Dropdown */}
              {showSuggestions &&
                newSkill.trim() &&
                filteredSkills.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                    <ul className="py-1">
                      {filteredSkills.map((skill, index) => (
                        <li
                          key={skill}
                          onClick={() => addSkill(skill)}
                          className={`
                          px-4 py-2.5 cursor-pointer text-sm transition-colors
                          ${
                            index === highlightedIndex
                              ? "bg-purple-50 text-purple-900"
                              : "text-zinc-700 hover:bg-purple-50"
                          }
                        `}
                          onMouseEnter={() => setHighlightedIndex(index)}
                        >
                          <div className="flex items-center justify-between">
                            <span>{skill}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

              {/* No suggestions message */}
              {showSuggestions &&
                newSkill.trim() &&
                filteredSkills.length === 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-zinc-200 rounded-xl shadow-lg p-4">
                    <p className="text-sm text-zinc-500 text-center">
                      No matching skills found. Press Enter to add &quot;
                      {newSkill.trim()}&quot; as a custom skill.
                    </p>
                  </div>
                )}
            </div>
            <Button
              onClick={() => addSkill()}
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-lg shadow-purple-500/20"
            >
              Add
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
