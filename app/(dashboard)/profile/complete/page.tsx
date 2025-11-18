"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CompleteProfileFlow } from "@/components/student-profile/complete-profile-flow";
import { CompleteCompanyProfileFlow } from "@/components/company-profile/complete-company-profile-flow";
import { type User } from "@/components/dashboard/dashboard-context";

export default function CompleteProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("internmatch_token");
        if (!token) {
          router.push("/login");
          return;
        }

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          router.push("/login");
          return;
        }

        const data = await response.json();
        setUser(data.data);
      } catch (error) {
        console.error("Error loading user:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Render appropriate profile completion flow based on role
  if (user?.role === "company") {
    return <CompleteCompanyProfileFlow />;
  }

  // Default to student profile flow
  return <CompleteProfileFlow />;
}

