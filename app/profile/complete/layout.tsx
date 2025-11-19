"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DashboardProvider, type User, type ProfileData } from "@/components/dashboard/dashboard-context";

export default function CompleteProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Wait a bit longer to ensure token is stored after verification
        await new Promise(resolve => setTimeout(resolve, 300));
        
        const token = localStorage.getItem("internmatch_token");
        if (!token) {
          console.warn("No token found in localStorage");
          router.push("/login");
          return;
        }

        console.log("Checking auth with token:", token.substring(0, 20) + "...");

        const response = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log("Auth check response status:", response.status);

        if (!response.ok) {
          // Only redirect to login if it's a 401 (unauthorized)
          // For other errors, allow the page to load (might be a temporary issue)
          if (response.status === 401) {
            localStorage.removeItem("internmatch_token");
            router.push("/login");
            return;
          }
          // For other errors, log but don't redirect - let the page component handle it
          console.warn("Auth check failed but not unauthorized:", response.status);
          const errorText = await response.text().catch(() => "Unknown error");
          console.warn("Error response:", errorText);
          setLoading(false);
          return;
        }

        const data = await response.json();
        const userData = data.data;
        const profile = userData?.profile;

        // Set user data - even if profile is null (new users won't have profile yet)
        if (userData) {
          setUser(userData);
          setProfileData(profile || null);
        } else {
          // If no user data but response was OK, might be a response format issue
          // Log but don't redirect - let the page handle it
          console.warn("No user data returned from auth check, but response was OK");
          console.warn("Response data:", data);
          // Still set loading to false so page can render
        }
      } catch (error) {
        // Network errors or other issues - don't redirect immediately
        // The token might not be stored yet, or there might be a temporary network issue
        console.error("Auth check error:", error);
        console.error("Error details:", error instanceof Error ? error.message : String(error));
        // Don't redirect on network errors - might be temporary
        // The page component will handle showing appropriate UI
      } finally {
        setLoading(false);
      }
    };

    // Start auth check - delay is already handled inside checkAuth function
    checkAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <p className="text-zinc-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardProvider user={user} profileData={profileData}>
      <div className="min-h-screen bg-white flex items-center justify-center">
        {children}
      </div>
    </DashboardProvider>
  );
}

