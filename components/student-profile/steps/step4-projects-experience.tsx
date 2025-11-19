"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";

type Project = {
  projectName: string;
  projectDescription: string;
  technologiesUsed: string;
};

type Experience = {
  company: string;
  role: string;
  duration: string;
  description: string;
};

type ProjectsExperienceData = {
  projects: Project[];
  experiences: Experience[];
};

type Step4ProjectsExperienceProps = {
  data: ProjectsExperienceData;
  onUpdate: (data: Partial<ProjectsExperienceData>) => void;
  onNext: () => void;
  onPrevious: () => void;
};

type ProjectFormData = {
  projectName: string;
  projectDescription: string;
  technologiesUsed: string;
};

type ExperienceFormData = {
  company: string;
  role: string;
  startDate: string;
  endDate: string;
  isPresent: boolean;
  description: string;
};

export function Step4ProjectsExperience({
  data,
  onUpdate,
  onNext,
  onPrevious,
}: Step4ProjectsExperienceProps) {
  const [projects, setProjects] = useState<Project[]>(data.projects || []);
  const [experiences, setExperiences] = useState<Experience[]>(
    data.experiences || []
  );
  const [showProjectDialog, setShowProjectDialog] = useState(false);
  const [showExperienceDialog, setShowExperienceDialog] = useState(false);

  // Sync local state with parent data when it changes
  useEffect(() => {
    setProjects(data.projects || []);
    setExperiences(data.experiences || []);
  }, [data.projects, data.experiences]);

  const projectForm = useForm<ProjectFormData>({
    defaultValues: {
      projectName: "",
      projectDescription: "",
      technologiesUsed: "",
    },
  });

  const experienceForm = useForm<ExperienceFormData>({
    defaultValues: {
      company: "",
      role: "",
      startDate: "",
      endDate: "",
      isPresent: false,
      description: "",
    },
  });

  // Watch isPresent to clear endDate when checked and trigger validation
  const isPresent = experienceForm.watch("isPresent");
  useEffect(() => {
    if (isPresent) {
      experienceForm.setValue("endDate", "");
      experienceForm.clearErrors("endDate");
    } else {
      experienceForm.trigger("endDate");
    }
  }, [isPresent, experienceForm]);

  const handleAddProject = (values: ProjectFormData) => {
    // Validate that project name is filled
    if (!values.projectName || values.projectName.trim() === "") {
      setShowProjectDialog(true);
      return;
    }

    const newProject: Project = {
      projectName: values.projectName.trim(),
      projectDescription: values.projectDescription.trim(),
      technologiesUsed: values.technologiesUsed.trim(),
    };
    const newProjects = [...projects, newProject];
    setProjects(newProjects);
    onUpdate({ projects: newProjects });
    projectForm.reset();
  };

  const handleAddExperience = (values: ExperienceFormData) => {
    // Validate required fields
    if (!values.company || values.company.trim() === "") {
      setShowExperienceDialog(true);
      return;
    }

    if (!values.role || values.role.trim() === "") {
      setShowExperienceDialog(true);
      return;
    }

    if (!values.startDate) {
      setShowExperienceDialog(true);
      return;
    }

    if (!values.isPresent && (!values.endDate || values.endDate.trim() === "")) {
      setShowExperienceDialog(true);
      return;
    }

    // Format dates to "MMM YYYY" format
    const formatDate = (dateString: string) => {
      if (!dateString) return "";
      const date = new Date(dateString);
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      return `${months[date.getMonth()]} ${date.getFullYear()}`;
    };

    const startDateFormatted = formatDate(values.startDate);
    const endDateFormatted = values.isPresent
      ? "Present"
      : formatDate(values.endDate);
    const duration = `${startDateFormatted} - ${endDateFormatted}`;

    const newExperience: Experience = {
      company: values.company.trim(),
      role: values.role.trim(),
      duration: duration,
      description: values.description.trim(),
    };
    const newExperiences = [...experiences, newExperience];
    setExperiences(newExperiences);
    onUpdate({ experiences: newExperiences });
    experienceForm.reset();
  };

  const handleRemoveProject = (index: number) => {
    const newProjects = projects.filter((_, i) => i !== index);
    setProjects(newProjects);
    onUpdate({ projects: newProjects });
  };

  const handleRemoveExperience = (index: number) => {
    const newExperiences = experiences.filter((_, i) => i !== index);
    setExperiences(newExperiences);
    onUpdate({ experiences: newExperiences });
  };

  const handleNext = () => {
    console.log("Step4 handleNext - Projects:", projects);
    console.log("Step4 handleNext - Experiences:", experiences);
    // Ensure we update parent state before navigating
    onUpdate({ projects, experiences });
    // Small delay to ensure state update propagates before navigation
    setTimeout(() => {
      onNext();
    }, 0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <BriefcaseIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">
            Projects & Experience
          </h2>
          <p className="text-sm text-zinc-600">Showcase your work</p>
        </div>
      </div>

      {/* Projects Section */}
      <div className="rounded-2xl bg-indigo-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900">
          Projects (Optional)
        </h3>
        <Form {...projectForm}>
          <form
            onSubmit={projectForm.handleSubmit(handleAddProject)}
            className="space-y-4"
          >
            <FormField
              control={projectForm.control}
              name="projectName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={projectForm.control}
              name="projectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
                      placeholder="Describe your project..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={projectForm.control}
              name="technologiesUsed"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technologies Used (comma separated)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="React, Node.js, MongoDB..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="rounded-2xl bg-indigo-600 text-white"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Project
            </Button>
          </form>
        </Form>

        {/* Project List */}
        {projects.length > 0 && (
          <div className="mt-6 space-y-3">
            {projects.map((project, index) => (
              <div
                key={index}
                className="rounded-lg border border-indigo-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-zinc-900">
                      {project.projectName}
                    </h4>
                    <p className="mt-1 text-sm text-zinc-600">
                      {project.projectDescription}
                    </p>
                    {project.technologiesUsed && (
                      <p className="mt-2 text-xs text-indigo-600">
                        {project.technologiesUsed}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveProject(index)}
                    className="ml-4 text-zinc-400 hover:text-zinc-600"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Experience Section */}
      <div className="rounded-2xl bg-indigo-50 p-6">
        <h3 className="mb-4 text-lg font-semibold text-zinc-900">
          Experience (Optional)
        </h3>
        <Form {...experienceForm}>
          <form
            onSubmit={experienceForm.handleSubmit(handleAddExperience)}
            className="space-y-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={experienceForm.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      <Input placeholder="Company name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={experienceForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <FormControl>
                      <Input placeholder="Your role" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={experienceForm.control}
                name="startDate"
                rules={{ required: "Start date is required" }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="month"
                        className="text-zinc-900"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={experienceForm.control}
                name="endDate"
                rules={{
                  validate: (value) => {
                    const isPresentValue =
                      experienceForm.getValues("isPresent");
                    if (!isPresentValue && !value) {
                      return "End date is required";
                    }
                    return true;
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date *</FormLabel>
                    <FormControl>
                      <Input
                        type="month"
                        className="text-zinc-900"
                        disabled={isPresent}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={experienceForm.control}
              name="isPresent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="cursor-pointer">
                      I currently work here
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <FormField
              control={experienceForm.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <textarea
                      className="flex min-h-[80px] w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-200"
                      placeholder="Describe your experience..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              className="rounded-2xl bg-indigo-600 text-white"
            >
              <PlusIcon className="mr-2 h-4 w-4" />
              Add Experience
            </Button>
          </form>
        </Form>

        {/* Experience List */}
        {experiences.length > 0 && (
          <div className="mt-6 space-y-3">
            {experiences.map((experience, index) => (
              <div
                key={index}
                className="rounded-lg border border-indigo-200 bg-white p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-zinc-900">
                      {experience.role} at {experience.company}
                    </h4>
                    <p className="mt-1 text-sm text-indigo-600">
                      {experience.duration}
                    </p>
                    <p className="mt-2 text-sm text-zinc-600">
                      {experience.description}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveExperience(index)}
                    className="ml-4 text-zinc-400 hover:text-zinc-600"
                  >
                    <XIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-4">
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

      {/* Project Validation Dialog */}
      <AlertDialog open={showProjectDialog} onOpenChange={setShowProjectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Missing Information</AlertDialogTitle>
            <AlertDialogDescription>
              Please fill in the project title before adding a project. The project title is required.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowProjectDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Experience Validation Dialog */}
      <AlertDialog open={showExperienceDialog} onOpenChange={setShowExperienceDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Missing Information</AlertDialogTitle>
            <AlertDialogDescription>
              Please fill in all required fields (Company, Role, Start Date, and End Date if not currently working) before adding an experience.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowExperienceDialog(false)}>
              OK
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
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
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
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
