"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  ArrowLeft,
  User,
  GraduationCap,
  MapPin,
  Award,
  Briefcase,
  Code,
  ExternalLink,
  Mail,
  Globe,
  Github,
  Linkedin,
  Star,
  Phone,
} from "lucide-react";
import { toast } from "sonner";

type StudentProfile = {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phoneNumber: string | null;
  university: string | null;
  major: string | null;
  graduationYear: number | null;
  gpa: number | null;
  location: string | null;
  careerInterest: string | null;
  aboutMe: string | null;
  resumeUrl: string | null;
  socialLinks: {
    linkedin: string | null;
    github: string | null;
    website: string | null;
  };
  skills: string[];
  projects: Array<{
    id: string;
    projectName: string;
    projectDescription: string | null;
  }>;
  experiences: Array<{
    id: string;
    experienceTitle: string;
    experienceDescription: string | null;
  }>;
  isVerified: boolean;
  profileCreatedAt: string;
};

export default function StudentProfilePage() {
  const router = useRouter();
  const params = useParams();
  const studentId = params.id as string;
  const { user } = useDashboard();

  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id || user.role !== "company" || !studentId) return;
    fetchStudentProfile();
  }, [user, studentId]);

  const fetchStudentProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/students/${studentId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to load student profile");
      }

      setProfile(data.data);
    } catch (error) {
      console.error("Failed to load student profile:", error);
      toast.error("Failed to load student profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== "company") {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Student Profile</h1>
        <p className="text-zinc-500">
          Student profiles are only available for company accounts.
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="p-8">
        <div className="text-center">
          <User className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Student Not Found
          </h1>
          <p className="text-zinc-600 mb-6">
            The student profile you&apos;re looking for doesn&apos;t exist or
            isn&apos;t available.
          </p>
          <Button onClick={() => router.back()} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-4xl mx-auto">
      {/* Header with Back Button */}
      <header className="flex items-center gap-4 mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
      </header>

      {/* Profile Header */}
      <Card className="border-zinc-200/80 shadow-sm">
        <CardContent className="p-8">
          <div className="flex items-start gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-50">
              <User className="h-10 w-10 text-indigo-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-zinc-900">
                    {profile.firstName} {profile.lastName}
                  </h1>
                  {profile.major && profile.university && (
                    <p className="text-lg text-zinc-600 mt-1">
                      {profile.major} • {profile.university}
                    </p>
                  )}
                  {profile.location && (
                    <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </p>
                  )}
                </div>
                {profile.isVerified && (
                  <div className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                    <Star className="h-4 w-4" />
                    Verified
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="mt-4 space-y-2">
                {profile.email && (
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{profile.email}</span>
                  </div>
                )}
                {profile.phoneNumber && (
                  <div className="flex items-center gap-2 text-zinc-600">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{profile.phoneNumber}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4 mt-3">
                {profile.socialLinks.linkedin && (
                  <a
                    href={profile.socialLinks.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {profile.socialLinks.github && (
                  <a
                    href={profile.socialLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-zinc-700 hover:text-zinc-900 text-sm"
                  >
                    <Github className="h-4 w-4" />
                    GitHub
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
                {profile.socialLinks.website && (
                  <a
                    href={profile.socialLinks.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 text-sm"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* All content in rows */}
      <div className="space-y-6">
        {/* About Me Section */}
        {profile.aboutMe && (
          <Card className="border-zinc-200/80 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-zinc-900">About Me</h2>
              </div>
              <p className="text-zinc-700 leading-relaxed text-base">
                {profile.aboutMe}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Skills & Expertise */}
        {profile.skills.length > 0 && (
          <Card className="border-zinc-200/80 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <Code className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-zinc-900">
                  Skills & Expertise
                </h2>
              </div>
              <div className="flex flex-wrap gap-3">
                {profile.skills.map((skill, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 hover:bg-indigo-100 transition-colors"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Academic Information Row */}
        <Card className="border-zinc-200/80 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-center gap-2 mb-6">
              <GraduationCap className="h-6 w-6 text-indigo-600" />
              <h2 className="text-2xl font-bold text-zinc-900">
                Academic Information
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {profile.university && (
                <div>
                  <p className="text-sm font-medium text-zinc-500 mb-2">
                    University
                  </p>
                  <p className="text-zinc-900 font-medium">
                    {profile.university}
                  </p>
                </div>
              )}
              {profile.major && (
                <div>
                  <p className="text-sm font-medium text-zinc-500 mb-2">
                    Major
                  </p>
                  <p className="text-zinc-900 font-medium">{profile.major}</p>
                </div>
              )}
              {profile.graduationYear && (
                <div>
                  <p className="text-sm font-medium text-zinc-500 mb-2">
                    Graduation Year
                  </p>
                  <p className="text-zinc-900 font-medium">
                    {profile.graduationYear}
                  </p>
                </div>
              )}
              {profile.gpa && (
                <div>
                  <p className="text-sm font-medium text-zinc-500 mb-2">GPA</p>
                  <p className="text-zinc-900 font-medium flex items-center gap-2">
                    {profile.gpa.toFixed(1)}
                    <Award className="h-4 w-4 text-amber-500" />
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Career Interest Row */}
        {profile.careerInterest && (
          <Card className="border-zinc-200/80 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-zinc-900">
                  Career Interest
                </h2>
              </div>
              <p className="text-zinc-700 leading-relaxed text-base">
                {profile.careerInterest}
              </p>
            </CardContent>
          </Card>
        )}

        {/* Projects Row */}
        {profile.projects.length > 0 && (
          <Card className="border-zinc-200/80 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="h-6 w-6 text-indigo-600" />
                <h2 className="text-2xl font-bold text-zinc-900">Projects</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.projects.map((project) => (
                  <div
                    key={project.id}
                    className="border-l-4 border-indigo-200 pl-4"
                  >
                    <h3 className="font-semibold text-zinc-900 text-base mb-2">
                      {project.projectName}
                    </h3>
                    {project.projectDescription && (
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        {project.projectDescription}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Experience Row */}
        {profile.experiences.length > 0 && (
          <Card className="border-zinc-200/80 shadow-sm">
            <CardContent className="p-8">
              <div className="flex items-center gap-2 mb-6">
                <Briefcase className="h-6 w-6 text-emerald-600" />
                <h2 className="text-2xl font-bold text-zinc-900">Experience</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {profile.experiences.map((experience) => (
                  <div
                    key={experience.id}
                    className="border-l-4 border-emerald-200 pl-4"
                  >
                    <h3 className="font-semibold text-zinc-900 text-base mb-2">
                      {experience.experienceTitle}
                    </h3>
                    {experience.experienceDescription && (
                      <p className="text-sm text-zinc-600 leading-relaxed">
                        {experience.experienceDescription}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty State for Projects/Experience */}
        {profile.projects.length === 0 && profile.experiences.length === 0 && (
          <Card className="border-zinc-200/80 shadow-sm">
            <CardContent className="p-8 text-center">
              <Briefcase className="h-12 w-12 text-zinc-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                No Projects or Experience Listed
              </h3>
              <p className="text-zinc-600">
                This student hasn&apos;t added any projects or work experience
                yet.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
