"use client";

import { CompleteProfileFlow } from "@/components/student-profile/complete-profile-flow";
import { CompleteCompanyProfileFlow } from "@/components/company-profile/complete-company-profile-flow";
import { useDashboard } from "@/components/dashboard/dashboard-context";

export default function CompleteProfilePage() {
  // Use user data from the layout context (already loaded by layout)
  const { user } = useDashboard();

  // Show loading state if user is not yet loaded
  // But don't redirect - let the layout handle auth redirects
  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-zinc-600">Loading your profile...</p>
        </div>
      </div>
    );
  }

  // Render appropriate profile completion flow based on role
  if (user.role === "company") {
    return <CompleteCompanyProfileFlow />;
  }

  // Default to student profile flow
  return <CompleteProfileFlow />;
}

