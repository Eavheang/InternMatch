"use client";

import { useEffect, useState } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Search,
  Users,
  User as UserIcon,
  MapPin,
  Briefcase,
  X,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type Student = {
  id: string;
  firstName: string;
  lastName: string;
  university: string | null;
  major: string | null;
  graduationYear: number | null;
  location: string | null;
  careerInterest: string | null;
  gpa: number | null;
  isVerified: boolean;
  createdAt: string;
};

export default function StudentsPage() {
  const { user } = useDashboard();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.role === "company") {
      fetchStudents();
    }
  }, [user]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        toast.error("Please log in to view students");
        return;
      }

      const response = await fetch("/api/students", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch students");
      }

      const data = await response.json();
      const studentsData = data.data || [];
      setStudents(studentsData);
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Filter students based on name search only
  const filteredStudents = students.filter((student) => {
    return (
      searchTerm === "" ||
      `${student.firstName} ${student.lastName}`
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  });

  const clearSearch = () => {
    setSearchTerm("");
  };

  const hasActiveSearch = searchTerm !== "";

  if (user?.role !== "company") {
    return (
      <div className="p-8">
        <div className="text-center">
          <Users className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">
            Access Denied
          </h1>
          <p className="text-zinc-600">
            Student directory is only available for company accounts.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900">
            Student Directory
          </h1>
          <p className="text-zinc-600 mt-1">
            Browse and discover talented students for your internship programs
          </p>
        </div>
        <div className="text-sm text-zinc-500">
          {filteredStudents.length} of {students.length} students
        </div>
      </div>

      {/* Search */}
      <Card className="border-zinc-200/80 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            {/* Search Bar */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search students by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4"
              />
            </div>

            {/* Clear Search */}
            {hasActiveSearch && (
              <Button
                variant="ghost"
                onClick={clearSearch}
                className="flex items-center gap-2 text-zinc-600 hover:text-zinc-900"
              >
                <X className="h-4 w-4" />
                Clear
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
        </div>
      )}

      {/* Students Grid */}
      {!loading && (
        <>
          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-zinc-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-zinc-900 mb-2">
                {hasActiveSearch
                  ? "No students match your search"
                  : "No students found"}
              </h3>
              <p className="text-zinc-600 mb-4">
                {hasActiveSearch
                  ? "Try searching for a different name."
                  : "There are no students in the directory yet."}
              </p>
              {hasActiveSearch && (
                <Button onClick={clearSearch} variant="outline">
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStudents.map((student) => (
                <StudentCard key={student.id} student={student} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function StudentCard({ student }: { student: Student }) {
  return (
    <Card className="border-zinc-200/80 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50">
            <UserIcon className="h-6 w-6 text-indigo-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold text-zinc-900 truncate">
              {student.firstName} {student.lastName}
            </h3>
            {student.major && student.graduationYear && (
              <p className="text-sm text-zinc-600 truncate">
                {student.major} • Class of {student.graduationYear}
              </p>
            )}
            {student.university && (
              <p className="text-sm text-zinc-500 truncate">
                {student.university}
              </p>
            )}
            {student.gpa && (
              <p className="text-xs text-zinc-500 mt-1">
                GPA: {student.gpa.toFixed(1)}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {student.location && (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{student.location}</span>
            </div>
          )}
          {student.careerInterest && (
            <div className="flex items-center gap-2 text-sm text-zinc-600">
              <Briefcase className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{student.careerInterest}</span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-zinc-100">
          <Link
            href={`/dashboard/students/${student.id}`}
            className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 text-center block transition-colors"
          >
            View Profile
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
