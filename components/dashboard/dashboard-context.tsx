"use client";

import { createContext, useContext, ReactNode } from "react";

export type User = {
  id: string;
  email: string;
  role: "student" | "company";
  isVerified?: boolean;
};

export type ProfileData = {
  id?: string;
  firstName?: string;
  lastName?: string;
  university?: string;
  major?: string;
  graduationYear?: string | number;
  skills?: string[];
  projects?: unknown[];
  experiences?: unknown[];
  resumeUrl?: string;
  companyName?: string;
  industry?: string;
  companySize?: string;
  website?: string;
  headquarters?: string;
  location?: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
  [key: string]: unknown;
};

type DashboardContextType = {
  user: User | null;
  profileData: ProfileData | null;
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({
  children,
  user,
  profileData,
}: {
  children: ReactNode;
  user: User | null;
  profileData: ProfileData | null;
}) {
  return (
    <DashboardContext.Provider value={{ user, profileData }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    // Return default values instead of throwing to prevent errors during SSR/initial render
    return { user: null, profileData: null };
  }
  return context;
}
