"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");

  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const token = localStorage.getItem("internmatch_token");

        if (!token) {
          router.push("/login");
          return;
        }

        // Verify token and check admin role
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          localStorage.removeItem("internmatch_token");
          router.push("/login");
          return;
        }

        const data = await response.json();
        const userData = data.data || data.user || data;

        // Check if user is admin
        if (userData?.role !== "admin") {
          // Redirect non-admin users to regular dashboard
          router.push("/dashboard");
          return;
        }

        setUserEmail(userData.email);
        setLoading(false);
      } catch (error) {
        console.error("[Admin Layout] Auth check error:", error);
        localStorage.removeItem("internmatch_token");
        router.push("/login");
      }
    };

    checkAdminAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-100">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent mx-auto mb-4" />
          <p className="text-zinc-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#29353C]">
      <AdminSidebar userEmail={userEmail} />
      <main className="flex-1 ml-72 min-h-screen bg-[#DFEBF6]">{children}</main>
    </div>
  );
}
