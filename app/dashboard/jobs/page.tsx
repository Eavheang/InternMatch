"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { type User } from "@/components/dashboard/dashboard-context";

export default function JobsPage() {
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
      <div className="p-8">
        <p className="text-zinc-600">Loading...</p>
      </div>
    );
  }

  // Render based on role
  if (user?.role === "company") {
    return (
      <div className="p-8">
        <h1 className="text-3xl font-bold mb-6">Manage Jobs</h1>
        <p className="text-zinc-600">Job management page coming soon...</p>
      </div>
    );
  }

  // Default to student view (browse jobs)
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Browse Jobs</h1>
      <p className="text-zinc-600">Job listings page coming soon...</p>
    </div>
  );
}
