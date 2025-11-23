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

export type UserPlan = {
  plan: string; // "free", "basic", "pro", "growth", "enterprise"
  isExpired?: boolean;
  isActive?: boolean;
  expiresAt?: Date | string | null;
  nextBillingDate?: Date | string | null;
  autoRenew?: boolean;
  transaction?: {
    id: string;
    tranId: string;
    plan: string | null;
    amount: number;
    status: string;
    transactionDate: Date | null;
    expiresAt?: Date | string | null;
    nextBillingDate?: Date | string | null;
    autoRenew?: boolean;
    metadata?: {
      datetime?: string;
      [key: string]: unknown;
    } | null;
  } | null;
};

type DashboardContextType = {
  user: User | null;
  profileData: ProfileData | null;
  userPlan: UserPlan | null;
};

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

export function DashboardProvider({
  children,
  user,
  profileData,
  userPlan,
}: {
  children: ReactNode;
  user: User | null;
  profileData: ProfileData | null;
  userPlan?: UserPlan | null;
}) {
  return (
    <DashboardContext.Provider value={{ user, profileData, userPlan: userPlan || null }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    // Return default values instead of throwing to prevent errors during SSR/initial render
    return { user: null, profileData: null, userPlan: null };
  }
  return context;
}
