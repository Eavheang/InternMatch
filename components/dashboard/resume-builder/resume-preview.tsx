"use client";

import { ResumeData } from "./types";
import { cn } from "@/lib/utils";

interface ResumePreviewProps {
  data: ResumeData;
  scale?: number;
}

export function ResumePreview({ data, scale = 1 }: ResumePreviewProps) {
  return (
    <div 
      className="resume-preview-container bg-white shadow-2xl mx-auto origin-top border border-zinc-200"
      style={{ 
        width: "210mm", 
        minHeight: "297mm", 
        padding: "20mm",
        transform: `scale(${scale})`
      }}
    >
      {/* Header */}
      <div className="mb-8 pb-6 border-b-2 border-zinc-300">
        <h1 className="text-4xl font-bold text-zinc-900 mb-2 tracking-tight">
          {data.personalInfo.fullName || "Your Name Here"}
        </h1>
        {data.personalInfo.title && (
          <p className="text-lg text-zinc-700 font-medium mb-3">{data.personalInfo.title}</p>
        )}
        <div className="text-sm text-zinc-600 space-y-1">
          {(data.personalInfo.location || data.personalInfo.phone || data.personalInfo.email) && (
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {data.personalInfo.location && <span>{data.personalInfo.location}</span>}
              {data.personalInfo.phone && <span>{data.personalInfo.phone}</span>}
              {data.personalInfo.email && <span className="text-blue-600">{data.personalInfo.email}</span>}
            </div>
          )}
          {(data.personalInfo.linkedin || data.personalInfo.github || data.personalInfo.website) && (
            <div className="flex flex-wrap gap-x-3 gap-y-1 text-blue-600">
              {data.personalInfo.linkedin && <span>{data.personalInfo.linkedin}</span>}
              {data.personalInfo.github && <span>{data.personalInfo.github}</span>}
              {data.personalInfo.website && <span>{data.personalInfo.website}</span>}
            </div>
          )}
        </div>
      </div>

      {/* Summary */}
      {data.summary && (
        <div className="mb-7">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b-2 border-zinc-400 mb-3 pb-1.5">
            Professional Summary
          </h2>
          <p className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap">
            {data.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {data.experience.length > 0 && (
        <div className="mb-7">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b-2 border-zinc-400 mb-4 pb-1.5">
            Work Experience
          </h2>
          <div className="space-y-5">
            {data.experience.map((exp) => (
              <div key={exp.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-base font-bold text-zinc-900">
                    {exp.role || "Job Title"}
                  </h3>
                  <span className="text-sm text-zinc-600 font-medium">
                    {exp.start} - {exp.end}
                  </span>
                </div>
                <div className="text-sm text-zinc-700 font-semibold mb-2">
                  {exp.company || "Company Name"}
                </div>
                <ul className="list-none text-sm text-zinc-700 space-y-1.5 ml-1">
                  {exp.bullets.filter(b => b).map((bullet, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-purple-600 mt-1.5">•</span>
                      <span className="flex-1 leading-relaxed">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {data.education.length > 0 && (
        <div className="mb-7">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b-2 border-zinc-400 mb-4 pb-1.5">
            Education
          </h2>
          <div className="space-y-4">
            {data.education.map((edu) => (
              <div key={edu.id}>
                <div className="flex justify-between items-baseline mb-1">
                  <h3 className="text-base font-bold text-zinc-900">
                    {edu.school || "University Name"}
                  </h3>
                  <span className="text-sm text-zinc-600 font-medium">
                    {edu.start} - {edu.end}
                  </span>
                </div>
                <div className="text-sm text-zinc-700 font-semibold">
                  {edu.degree || "Degree"}
                </div>
                {edu.details && (
                  <p className="text-sm text-zinc-600 mt-1.5 leading-relaxed">
                    {edu.details}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {data.skills.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-bold text-zinc-900 uppercase tracking-wider border-b-2 border-zinc-400 mb-3 pb-1.5">
            Skills
          </h2>
          <p className="text-sm text-zinc-700 leading-relaxed">
            {data.skills.join(" • ")}
          </p>
        </div>
      )}
    </div>
  );
}

