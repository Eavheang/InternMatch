"use client";

import { RoleSuggestions } from "@/components/dashboard/role-suggestions";
import { useDashboard } from "@/components/dashboard/dashboard-context";

export default function RoleSuggestionsPage() {
  const { user } = useDashboard();

  if (user?.role !== "student") {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-4">Role Suggestions</h1>
        <p className="text-zinc-500">
          Role suggestions are only available for student accounts.
        </p>
      </div>
    );
  }

  return (
    <div className="p-8">
      <RoleSuggestions />
    </div>
  );
}
