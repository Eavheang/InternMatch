"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  DashboardProvider,
  type User,
  type ProfileData,
} from "@/components/dashboard/dashboard-context";

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
        console.log("[Dashboard Layout] Checking auth, token exists:", !!token);
        if (!token) {
          console.log(
            "[Dashboard Layout] No token found, redirecting to login"
          );
          router.push("/login");
          return;
        }

        console.log("[Dashboard Layout] Fetching user data with token");
        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log(
          "[Dashboard Layout] Auth response status:",
          response.status
        );
        if (!response.ok) {
          if (response.status === 401) {
            console.log(
              "[Dashboard Layout] 401 Unauthorized, redirecting to login"
            );
            localStorage.removeItem("internmatch_token");
            router.push("/login");
            return;
          }
          // For other errors, log and retry once, or redirect to login if no token
          console.warn(
            "[Dashboard Layout] Failed to load user data:",
            response.status
          );
          const existingToken = localStorage.getItem("internmatch_token");
          if (!existingToken) {
            console.log(
              "[Dashboard Layout] Token removed, redirecting to login"
            );
            router.push("/login");
            return;
          }
          // If we have a token but got an error, it might be temporary - throw to retry
          throw new Error(`Failed to load user: ${response.status}`);
        }

        const data = await response.json();
        console.log("[Dashboard Layout] Response data structure:", {
          hasData: !!data.data,
          hasUser: !!data.user,
          keys: Object.keys(data),
        });
        const userData = data.data || data.user || data;

        // Ensure userData exists and has required properties
        if (!userData || !userData.role) {
          console.error(
            "[Dashboard Layout] Invalid user data structure:",
            userData
          );
          throw new Error("Invalid user data received from API");
        }

        const profile = userData?.profile;
        console.log("[Dashboard Layout] User data:", {
          role: userData?.role,
          hasProfile: !!profile,
          profileKeys: profile ? Object.keys(profile) : [],
        });

        // Role-based route protection
        const isStudentRoute =
          pathname.includes("/resume") ||
          pathname.includes("/skills") ||
          pathname.includes("/role-suggestions") ||
          (pathname.includes("/interview") && !pathname.includes("/interviews")) || // /interview (singular) but not /interviews (plural)
          (pathname.includes("/applications") &&
            !pathname.includes("/candidates"));

        const isCompanyRoute =
          pathname.includes("/jobs/new") ||
          pathname.includes("/candidates") ||
          pathname.includes("/interviews"); // /interviews (plural) for company

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
            router.push("/profile/complete");
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
            router.push("/profile/complete");
            setLoading(false);
            return;
          }
        }

        setUser(userData);
        setProfileData(profile);
        setIsAuthorized(true);
        console.log(
          "[Dashboard Layout] Auth check successful, user authorized"
        );
      } catch (error) {
        console.error("[Dashboard Layout] Auth check error:", error);
        // Only redirect to login if it's an authentication error
        // For network errors or other issues, don't redirect immediately
        if (error instanceof Error && error.message.includes("401")) {
          console.log(
            "[Dashboard Layout] 401 error detected, redirecting to login"
          );
          localStorage.removeItem("internmatch_token");
          router.push("/login");
        } else {
          // For other errors, log but don't redirect - might be temporary
          console.warn(
            "[Dashboard Layout] Non-auth error, allowing page to load"
          );
          setLoading(false);
        }
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
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </DashboardProvider>
  );
}
