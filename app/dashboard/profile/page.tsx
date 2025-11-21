"use client";

import { useEffect } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user } = useDashboard();
  const router = useRouter();

  useEffect(() => {
    if (user?.role === "company") {
      router.replace("/dashboard/company-profile");
    } else if (user?.role === "student") {
      router.replace("/dashboard/student-profile");
    }
  }, [user, router]);

  // Show loading while redirecting
  return (
    <div className="p-8">
      <div className="text-center">
        <p className="text-zinc-600">Loading profile...</p>
      </div>
    </div>
  );
}