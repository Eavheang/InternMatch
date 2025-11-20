"use client";

import { useState, useMemo } from "react";
import {
  Sparkles,
  Plus,
  X,
  ArrowRight,
  Calendar,
  Briefcase,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { skills as availableSkills } from "@/constants/skills";

export function JobPostForm() {
  const router = useRouter();
  const { user } = useDashboard();

  // Form State
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [programType, setProgramType] = useState("");
  const [duration, setDuration] = useState("");
  const [salary, setSalary] = useState("");

  const [description, setDescription] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [qualifications, setQualifications] = useState("");

  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [skillSuggestions, setSkillSuggestions] = useState<string[]>([]);

  const [benefits, setBenefits] = useState("");
  const [startDate, setStartDate] = useState("");
  const [deadline, setDeadline] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Validation: Check if required fields are filled
  const isFormValid = useMemo(() => {
    const hasJobTitle = jobTitle.trim().length > 0;
    const hasDescription = description.trim().length > 0;
    const hasSkills = skills.length > 0;
    return hasJobTitle && hasDescription && hasSkills;
  }, [jobTitle, description, skills]);

  // Get missing required fields for tooltip/feedback
  const getMissingFields = () => {
    const missing: string[] = [];
    if (!jobTitle.trim()) missing.push("Job Title");
    if (!description.trim()) missing.push("Description");
    if (skills.length === 0) missing.push("Required Skills");
    return missing;
  };

  // Filter skills based on input
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
    
    // Check if skill exists in available skills
    const isValidSkill = availableSkills.some(
      (s) => s.toLowerCase() === value.toLowerCase()
    );
    
    if (!isValidSkill) {
      toast.error(`Please select a skill from the list. "${value}" is not available.`);
      return;
    }
    
    // Find the exact match from available skills (case-insensitive)
    const exactSkill = availableSkills.find(
      (s) => s.toLowerCase() === value.toLowerCase()
    ) || value;
    
    setSkills((prev) => [...prev, exactSkill]);
    setSkillInput("");
    setSkillSuggestions([]);
  };

  const removeSkill = (value: string) => {
    setSkills((prev) => prev.filter((skill) => skill !== value));
  };

  const handlePublish = async (status: "open" | "draft") => {
    if (!user?.id) {
      toast.error("You must be logged in to post a job");
      return;
    }

    if (!jobTitle || !description) {
      toast.error("Please fill in at least the Job Title and Description");
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("internmatch_token");
      const response = await fetch(`/api/company/${user.id}/job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          jobTitle,
          jobDescription: description,
          requirements: {
            qualifications: qualifications.split("\n").filter(Boolean),
            skills,
            responsibilities: responsibilities.split("\n").filter(Boolean),
            programType,
            duration,
            startDate,
            deadline,
          },
          benefits: benefits.split("\n").filter(Boolean),
          salaryRange: salary,
          location,
          jobType: "internship", // Defaulting to internship
          status,
          department, // Not in schema but could be part of description if needed, sending anyway
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create job posting");
      }

      toast.success(
        `Job ${status === "open" ? "published" : "saved as draft"} successfully!`
      );
      router.push("/dashboard/jobs");
    } catch (error) {
      console.error("Error posting job:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to post job"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
      <div className="p-8 space-y-6">
        {/* Header Section */}
        <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold text-indigo-600 uppercase tracking-wide">
              Create Job
            </p>
            <h1 className="text-3xl font-bold text-zinc-900 mt-1">
              Create Job Posting
            </h1>
            <p className="text-sm text-zinc-500">
              Craft a compelling job post to attract top student talent. Fill in the details below to get started.
            </p>
          </div>
        </header>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          {/* Left Column - Form Sections */}
          <div className="space-y-6">
            <SectionCard
              title="Basic Information"
              description="Core details about the internship position"
            >
              <div className="grid gap-6">
                <Field label="Job Title" required>
                  <Input
                    placeholder="e.g. Software Engineering Intern"
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                    className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </Field>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field label="Department">
                    <Input
                      placeholder="e.g. Engineering"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </Field>
                  <Field label="Location">
                    <Input
                      placeholder="e.g. San Francisco, CA"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </Field>
                </div>
                <div className="grid gap-6 sm:grid-cols-3">
                  <Field label="Program Type">
                    <Input
                      placeholder="e.g. Summer 2025"
                      value={programType}
                      onChange={(e) => setProgramType(e.target.value)}
                      className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </Field>
                  <Field label="Duration">
                    <Input
                      placeholder="e.g. 12 weeks"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                      className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </Field>
                  <Field label="Salary / Stipend">
                    <Input
                      placeholder="e.g. $8,000/month"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    />
                  </Field>
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Job Description"
              description="Describe the role, responsibilities, and requirements"
            >
              <div className="space-y-6">
                <Field label="Description" required>
                  <Textarea
                    placeholder="Describe the internship opportunity, team culture, and what makes this role exciting..."
                    rows={6}
                    className="resize-none bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </Field>
                <Field label="Key Responsibilities">
                  <Textarea
                    placeholder="• Develop new features and improvements&#10;• Collaborate with designers and product managers&#10;• Write clean, maintainable code&#10;• Participate in code reviews"
                    rows={5}
                    className="resize-none bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 font-mono text-sm"
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                  />
                </Field>
                <Field label="Qualifications">
                  <Textarea
                    placeholder="• Currently pursuing a degree in Computer Science or related field&#10;• Experience with JavaScript, React, or similar technologies&#10;• Strong problem-solving and communication skills&#10;• Passion for learning and growth"
                    rows={5}
                    className="resize-none bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 font-mono text-sm"
                    value={qualifications}
                    onChange={(e) => setQualifications(e.target.value)}
                  />
                </Field>
              </div>
            </SectionCard>

            <SectionCard
              title="Required Skills"
              description="Add skills from the list to improve AI matching and candidate discovery"
            >
              <div className="space-y-4">
                <Field label="Skills" required>
                  <div className="relative">
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
                            // Delay to allow click on suggestion
                            setTimeout(() => setSkillSuggestions([]), 200);
                          }}
                          className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
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
                        onClick={() => addSkill()} 
                        variant="outline"
                        className="px-6 h-11 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 shrink-0"
                      >
                        <Plus className="w-4 h-4 mr-2" /> Add
                      </Button>
                    </div>
                    <p className="text-xs text-slate-500 mt-2">
                      Select skills from the dropdown or type to search. Press Enter to add the first suggestion.
                    </p>
                  </div>
                </Field>

                <div className="min-h-[4rem] rounded-lg border-2 border-dashed border-slate-200 bg-slate-50/50 p-4 transition-colors hover:border-slate-300">
                  {skills.length > 0 ? (
                    <div className="flex flex-wrap gap-2.5">
                      {skills.map((skill) => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-sm font-medium bg-white text-slate-700 border border-slate-200 shadow-sm transition-all hover:border-blue-300 hover:shadow-md group"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill(skill)}
                            className="text-slate-400 hover:text-red-500 transition-colors ml-0.5 p-0.5 rounded hover:bg-red-50"
                            aria-label={`Remove ${skill}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-sm text-slate-400">
                      No skills added yet. Start typing to search and add skills.
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>

            <SectionCard
              title="Benefits & Perks"
              description="Highlight what makes this internship opportunity special"
            >
              <Field label="Benefits">
                <Textarea
                  placeholder="• Mentorship from senior engineers&#10;• Networking events and team outings&#10;• Free lunch and snacks&#10;• Flexible work hours&#10;• Potential for full-time conversion"
                  rows={5}
                  className="resize-none bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 font-mono text-sm"
                  value={benefits}
                  onChange={(e) => setBenefits(e.target.value)}
                />
              </Field>
            </SectionCard>
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-8 lg:self-start">
            {/* AI Matching Card */}
            <Card className="border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50/50 shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-500/10 to-indigo-500/10 px-5 py-4 border-b border-blue-100/50">
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-blue-500/10">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                  </div>
                  <h3 className="text-sm font-semibold text-blue-900">
                    AI-Powered Matching
                  </h3>
                </div>
              </div>
              <CardContent className="p-5">
                <p className="text-sm text-blue-900/80 mb-4 leading-relaxed">
                  Our intelligent matching system analyzes your job description to connect you with the most qualified candidates.
                </p>
                <ul className="space-y-2.5">
                  {[
                    "Smart candidate ranking",
                    "Skill gap analysis",
                    "Competitive insights",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2.5 text-sm text-blue-800 font-medium"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-sm shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* Publishing Schedule Card */}
            <Card className="border-slate-200 shadow-md bg-white">
              <CardHeader className="px-5 py-4 border-b border-slate-100 bg-slate-50/50">
                <CardTitle className="text-base font-semibold text-slate-900 flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100">
                    <Calendar className="w-4 h-4 text-slate-600" />
                  </div>
                  Publishing Schedule
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                <Field label="Start Date">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </Field>
                <Field label="Application Deadline">
                  <Input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="h-11 bg-white border-slate-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </Field>

                <div className="pt-3 space-y-3 border-t border-slate-100">
                  {!isFormValid && (
                    <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 border border-amber-200">
                      <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                      <div className="flex-1">
                        <p className="text-xs font-medium text-amber-900 mb-1">
                          Complete required fields to publish
                        </p>
                        <p className="text-xs text-amber-700">
                          Missing: {getMissingFields().join(", ")}
                        </p>
                      </div>
                    </div>
                  )}
                  <Button
                    className={`w-full h-12 font-medium transition-all ${
                      isFormValid
                        ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30"
                        : "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none"
                    }`}
                    onClick={() => handlePublish("open")}
                    disabled={isSubmitting || !isFormValid}
                    title={
                      !isFormValid
                        ? `Please fill in: ${getMissingFields().join(", ")}`
                        : "Publish job post"
                    }
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        Publish Job Post
                        {isFormValid && <ArrowRight className="w-4 h-4 ml-2" />}
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-center text-slate-500">
                    {isFormValid
                      ? "You can edit or unpublish this post anytime."
                      : "Fill in all required fields to enable publishing."}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Pro Tip Card */}
            <Card className="border-slate-200 bg-white shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start gap-3.5">
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 shrink-0">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900">Pro Tip</p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Detailed job descriptions with clear responsibilities and qualifications receive 3x more qualified applicants.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
  );
}

type FieldProps = {
  label: string;
  children: React.ReactNode;
  required?: boolean;
};

function Field({ label, children, required }: FieldProps) {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      {children}
    </div>
  );
}

type SectionCardProps = {
  title: string;
  description: string;
  children: React.ReactNode;
};

function SectionCard({ title, description, children }: SectionCardProps) {
  return (
    <Card className="border-slate-200 shadow-md hover:shadow-lg transition-all duration-200 bg-white overflow-hidden">
      <CardHeader className="px-6 py-5 border-b border-slate-100 bg-slate-50/30">
        <div>
          <CardTitle className="text-xl font-bold text-slate-900 mb-1.5">
            {title}
          </CardTitle>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </CardHeader>
      <CardContent className="p-6">{children}</CardContent>
    </Card>
  );
}
