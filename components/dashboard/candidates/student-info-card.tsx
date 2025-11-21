import {
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Award,
  Briefcase,
  User,
} from "lucide-react";
import { InfoRow } from "./info-row";
import type { Application } from "./types";

interface StudentInfoCardProps {
  application: Application;
}

export function StudentInfoCard({ application }: StudentInfoCardProps) {
  const { student, user } = application;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 uppercase tracking-wider">
        <User className="w-4 h-4 text-indigo-500" />
        Student Information
      </div>

      <div className="grid grid-cols-1 gap-4 pl-1">
        <InfoRow
          icon={<Mail className="w-4 h-4" />}
          label="Email"
          value={user.email}
        />

        {student.phoneNumber && (
          <InfoRow
            icon={<Phone className="w-4 h-4" />}
            label="Phone"
            value={student.phoneNumber}
          />
        )}

        {student.location && (
          <InfoRow
            icon={<MapPin className="w-4 h-4" />}
            label="Location"
            value={student.location}
          />
        )}

        {student.university && (
          <InfoRow
            icon={<GraduationCap className="w-4 h-4" />}
            label="Education"
            value={`${student.university}${student.major ? ` • ${student.major}` : ""}${student.graduationYear ? ` • Class of ${student.graduationYear}` : ""}`}
          />
        )}

        {student.gpa && (
          <InfoRow
            icon={<Award className="w-4 h-4" />}
            label="GPA"
            value={student.gpa.toFixed(1)}
          />
        )}

        {student.careerInterest && (
          <InfoRow
            icon={<Briefcase className="w-4 h-4" />}
            label="Career Interest"
            value={student.careerInterest}
          />
        )}
      </div>

      {student.aboutMe && (
        <div className="pt-6 border-t border-zinc-200">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-indigo-500 rounded-full" />
            <p className="text-sm font-semibold text-zinc-700">About</p>
          </div>
          <p className="text-sm text-zinc-600 whitespace-pre-wrap leading-relaxed">
            {student.aboutMe}
          </p>
        </div>
      )}
    </div>
  );
}
