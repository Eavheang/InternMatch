"use client";

import { Button } from "@/components/ui/button";

type ProfileData = {
  university: string;
  major: string;
  graduationYear: string;
  gpa: string;
  skills: string[];
  projects: Array<{
    projectName: string;
    projectDescription: string;
    technologiesUsed: string;
  }>;
  experiences: Array<{
    company: string;
    role: string;
    duration: string;
    description: string;
  }>;
};

type Step5ReviewProps = {
  data: ProfileData;
  onPrevious: () => void;
  onSubmit: () => void;
};

export function Step5Review({
  data,
  onPrevious,
  onSubmit,
}: Step5ReviewProps) {
  // Debug: Log data received
  console.log("Step5 Review - Received data:", data);
  console.log("Step5 Review - Projects:", data.projects);
  console.log("Step5 Review - Experiences:", data.experiences);

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-zinc-900">Review Your Profile</h2>
        <p className="mt-2 text-zinc-600">
          Please review your information before submitting
        </p>
      </div>

      <div className="space-y-6">
        {/* Education Section */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">Education</h3>
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium text-zinc-700">University:</span>{" "}
              <span className="text-zinc-600">{data.university || "Not provided"}</span>
            </div>
            <div>
              <span className="font-medium text-zinc-700">Major:</span>{" "}
              <span className="text-zinc-600">{data.major || "Not provided"}</span>
            </div>
            <div>
              <span className="font-medium text-zinc-700">Graduation Year:</span>{" "}
              <span className="text-zinc-600">{data.graduationYear || "Not provided"}</span>
            </div>
            {data.gpa && (
              <div>
                <span className="font-medium text-zinc-700">GPA:</span>{" "}
                <span className="text-zinc-600">{data.gpa}</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills Section */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">Skills</h3>
          {data.skills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {data.skills.map((skill, index) => (
                <span
                  key={index}
                  className="rounded-lg bg-indigo-100 px-3 py-1 text-sm text-indigo-700"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-500">No skills added</p>
          )}
        </div>

        {/* Projects Section */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">Projects</h3>
          {data.projects.length > 0 ? (
            <div className="space-y-4">
              {data.projects.map((project, index) => (
                <div key={index} className="border-l-2 border-indigo-200 pl-4">
                  <h4 className="font-semibold text-zinc-900">{project.projectName}</h4>
                  <p className="mt-1 text-sm text-zinc-600">{project.projectDescription}</p>
                  {project.technologiesUsed && (
                    <p className="mt-2 text-xs text-indigo-600">
                      {project.technologiesUsed}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-900">No projects added</p>
          )}
        </div>

        {/* Experience Section */}
        <div className="rounded-lg border border-zinc-200 bg-white p-6">
          <h3 className="mb-4 text-lg font-semibold text-zinc-900">Experience</h3>
          {data.experiences.length > 0 ? (
            <div className="space-y-4">
              {data.experiences.map((experience, index) => (
                <div key={index} className="border-l-2 border-indigo-200 pl-4">
                  <h4 className="font-semibold text-zinc-900">
                    {experience.role} at {experience.company}
                  </h4>
                  <p className="mt-1 text-sm text-indigo-600">{experience.duration}</p>
                  <p className="mt-2 text-sm text-zinc-600">{experience.description}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-zinc-900">No experience added</p>
          )}
        </div>
      </div>

      {/* Navigation */}
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
          onClick={onSubmit}
          className="rounded-2xl bg-indigo-600"
        >
          Complete Profile
        </Button>
      </div>
    </div>
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

