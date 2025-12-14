"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar";
import {
  DashboardProvider,
  type User,
  type ProfileData,
  type UserPlan,
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
  const [userPlan, setUserPlan] = useState<UserPlan | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const planFetchedRef = useRef(false);

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
          // Handle authentication/authorization errors - redirect to login
          if (
            response.status === 401 ||
            response.status === 403 ||
            response.status === 404
          ) {
            console.log(
              `[Dashboard Layout] ${response.status} error, redirecting to login`
            );
            localStorage.removeItem("internmatch_token");
            router.push("/login");
            return;
          }
          // For other errors (5xx), log and redirect to login as well
          console.warn(
            "[Dashboard Layout] Failed to load user data:",
            response.status
          );
          localStorage.removeItem("internmatch_token");
          router.push("/login");
          return;
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

        // Admin role - redirect to admin dashboard
        if (userData?.role === "admin") {
          if (!pathname.startsWith("/dashboard/admin")) {
            router.push("/dashboard/admin");
            return;
          }
          // Admin is on admin routes - allow access
          setUser(userData);
          setProfileData(profile);
          setIsAuthorized(true);
          setLoading(false);
          return;
        }

        // Non-admin users trying to access admin routes - redirect to main dashboard
        if (pathname.startsWith("/dashboard/admin")) {
          router.push("/dashboard");
          return;
        }

        // Role-based route protection
        const isStudentRoute =
          pathname.includes("/resume") ||
          pathname.includes("/skills") ||
          pathname.includes("/role-suggestions") ||
          (pathname.includes("/interview") &&
            !pathname.includes("/interviews")) || // /interview (singular) but not /interviews (plural)
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

        // Fetch user plan (only once per session)
        if (!planFetchedRef.current) {
          planFetchedRef.current = true;
          try {
            const planResponse = await fetch("/api/user/plan", {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (planResponse.ok) {
              const planData = await planResponse.json();
              setUserPlan(planData);
            } else {
              // Set default free plan on error
              setUserPlan({ plan: "free", transaction: null });
            }
          } catch (planError) {
            console.error("[Dashboard Layout] Error fetching plan:", planError);
            // Set default free plan on error
            setUserPlan({ plan: "free", transaction: null });
          }
        }
      } catch (error) {
        console.error("[Dashboard Layout] Auth check error:", error);
        // Redirect to login on any error - if auth fails, user should re-authenticate
        console.log(
          "[Dashboard Layout] Error during auth check, redirecting to login"
        );
        localStorage.removeItem("internmatch_token");
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]); // Only depend on pathname, not router

  if (loading || !isAuthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-50">
        <div className="text-center">
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Admin users on admin routes - render children only (admin layout handles its own sidebar)
  if (user?.role === "admin" && pathname.startsWith("/dashboard/admin")) {
    return (
      <DashboardProvider user={user} profileData={profileData} userPlan={userPlan}>
        {children}
      </DashboardProvider>
    );
  }

  return (
    <DashboardProvider user={user} profileData={profileData} userPlan={userPlan}>
      <div className="flex min-h-screen bg-zinc-50">
        <DashboardSidebar user={user} profileData={profileData} userPlan={userPlan} />
        <div className="flex-1 flex flex-col">
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </DashboardProvider>
  );
}
