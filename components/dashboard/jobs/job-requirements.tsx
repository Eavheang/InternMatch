import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";

type Requirements = {
  qualifications?: string[];
  skills?: string[];
  responsibilities?: string[];
};

interface JobRequirementsProps {
  requirements: Requirements;
}

export function JobRequirements({ requirements }: JobRequirementsProps) {
  const hasAnyRequirements = 
    (requirements.qualifications && requirements.qualifications.length > 0) ||
    (requirements.skills && requirements.skills.length > 0) ||
    (requirements.responsibilities && requirements.responsibilities.length > 0);

  if (!hasAnyRequirements) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Requirements</CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        {requirements.qualifications && requirements.qualifications.length > 0 && (
          <div>
            <h4 className="font-semibold text-zinc-900 mb-3">Qualifications</h4>
            <ul className="space-y-2">
              {requirements.qualifications.map((qual, index) => (
                <li key={index} className="flex items-start gap-2 text-zinc-700">
                  <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  {qual}
                </li>
              ))}
            </ul>
          </div>
        )}

        {requirements.skills && requirements.skills.length > 0 && (
          <div>
            <h4 className="font-semibold text-zinc-900 mb-3">Required Skills</h4>
            <div className="flex flex-wrap gap-2">
              {requirements.skills.map((skill, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {requirements.responsibilities && requirements.responsibilities.length > 0 && (
          <div>
            <h4 className="font-semibold text-zinc-900 mb-3">Responsibilities</h4>
            <ul className="space-y-2">
              {requirements.responsibilities.map((resp, index) => (
                <li key={index} className="flex items-start gap-2 text-zinc-700">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                  {resp}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
