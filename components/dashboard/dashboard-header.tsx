"use client";

import { type User } from "./dashboard-context";

type DashboardHeaderProps = {
  user: User | null;
};

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <header className="border-b border-zinc-200 bg-white px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
            <BriefcaseIcon className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold text-zinc-900">InternMatch</span>
        </div>

        <div className="flex items-center gap-4">
          <button className="relative p-2 text-zinc-600 hover:text-zinc-900">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </button>
          <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-semibold">
            {user?.email?.[0]?.toUpperCase() || "U"}
          </div>
        </div>
      </div>
    </header>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}

function BellIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

