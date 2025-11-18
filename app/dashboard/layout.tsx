"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { DashboardProvider, type User, type ProfileData } from "@/components/dashboard/dashboard-context";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
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
          if (response.status === 401) {
            localStorage.removeItem("internmatch_token");
            router.push("/login");
            return;
          }
          throw new Error("Failed to load user");
        }

        const data = await response.json();
        const userData = data.data;
        const profile = userData?.profile;

        // Role-based route protection
        const isStudentRoute = pathname.includes("/resume") ||
          pathname.includes("/skills") ||
          pathname.includes("/interview") ||
          (pathname.includes("/applications") && !pathname.includes("/candidates"));

        const isCompanyRoute = pathname.includes("/jobs/new") ||
          pathname.includes("/candidates") ||
          pathname.includes("/interviews") ||
          pathname.includes("/analytics");

        // Redirect if role doesn't match route
        if (userData?.role === "student" && isCompanyRoute) {
          router.push("/dashboard");
          return;
        }
        if (userData?.role === "company" && isStudentRoute) {
          router.push("/dashboard");
          return;
        }

        // Profile completion checks - only redirect if not already on complete page
        if (userData?.role === "student") {
          const isProfileIncomplete =
            !profile ||
            !profile.university ||
            !profile.major ||
            !profile.graduationYear;

          if (isProfileIncomplete && !pathname.includes("/complete")) {
            router.push("/dashboard/profile/complete");
            setLoading(false);
            return;
          }
        }

        if (userData?.role === "company") {
          const isCompanyProfileIncomplete =
            !profile ||
            !profile.companyName ||
            !profile.industry ||
            !profile.companySize ||
            !profile.website ||
            !(profile.headquarters || profile.location) ||
            !profile.description ||
            !profile.contactName ||
            !profile.contactEmail;

          if (isCompanyProfileIncomplete && !pathname.includes("/complete")) {
            router.push("/dashboard/profile/complete");
            setLoading(false);
            return;
          }
        }

        setUser(userData);
        setProfileData(profile);
        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check error:", error);
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, [router, pathname]);

  if (loading || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardProvider user={user} profileData={profileData}>
      <div className="flex min-h-screen bg-zinc-50">
        <DashboardSidebar user={user} profileData={profileData} />
        <div className="flex-1 flex flex-col">
          <DashboardHeader user={user} />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </DashboardProvider>
  );
}

