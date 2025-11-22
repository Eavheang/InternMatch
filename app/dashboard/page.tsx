"use client";

import { useState, useEffect } from "react";
import { StudentDashboard } from "@/components/dashboard/student-dashboard";
import { CompanyDashboard } from "@/components/dashboard/company-dashboard";
import { useDashboard } from "@/components/dashboard/dashboard-context";

export default function DashboardPage() {
  const [mounted, setMounted] = useState(false);
  const { user, profileData } = useDashboard();

  useEffect(() => {
    // This is necessary for hydration - setState in useEffect is acceptable here
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  // Show loading while mounting to avoid hydration issues
  if (!mounted) {
    return (
      <div className="p-8">
        <div className="text-center">
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on role
  if (user?.role === "company") {
    return <CompanyDashboard user={user} profileData={profileData} />;
  }

  // Default to student dashboard
  return <StudentDashboard user={user} profileData={profileData} />;
}
