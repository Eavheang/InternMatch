"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { type User, type ProfileData } from "./dashboard-context";

type DashboardSidebarProps = {
  user: User | null;
  profileData: ProfileData | null;
};

export function DashboardSidebar({ user, profileData }: DashboardSidebarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem("internmatch_token");
    router.push("/login");
  };

  const companyMenuItems = [
    { name: "Overview", href: "/dashboard", icon: HomeIcon },
    { name: "Post Job", href: "/dashboard/jobs/new", icon: PlusIcon },
    { name: "Manage Jobs", href: "/dashboard/jobs", icon: BriefcaseIcon },
    { name: "Candidates", href: "/dashboard/candidates", icon: UserIcon },
    { name: "Interview Tools", href: "/dashboard/interviews", icon: MessageIcon },
    { name: "Analytics", href: "/dashboard/analytics", icon: ChartIcon },
    { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
  ];

  const studentMenuItems = [
    { name: "Overview", href: "/dashboard", icon: HomeIcon },
    { name: "Profile", href: "/dashboard/profile", icon: UserIcon },
    { name: "Resume", href: "/dashboard/resume", icon: FileIcon },
    { name: "Applications", href: "/dashboard/applications", icon: BriefcaseIcon },
    { name: "Skills Analysis", href: "/dashboard/skills", icon: ChartIcon },
    { name: "Interview Prep", href: "/dashboard/interview", icon: MessageIcon },
    { name: "Settings", href: "/dashboard/settings", icon: SettingsIcon },
  ];

  const menuItems = user?.role === "company" ? companyMenuItems : studentMenuItems;

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname?.startsWith(href);
  };

  const userInitials = user?.role === "company"
    ? profileData?.companyName?.[0]?.toUpperCase() || "C"
    : profileData?.firstName && profileData?.lastName
    ? `${profileData.firstName[0]}${profileData.lastName[0]}`
    : user?.email?.[0]?.toUpperCase() || "U";

  const displayName = user?.role === "company"
    ? profileData?.companyName || user?.email?.split("@")[0] || "Company"
    : profileData?.firstName && profileData?.lastName
    ? `${profileData.firstName} ${profileData.lastName}`
    : user?.email?.split("@")[0] || "User";

  const displaySubtitle = user?.role === "company"
    ? profileData?.industry || "Technology"
    : profileData?.major || "Student";

  return (
    <div className="w-64 bg-white border-r border-zinc-200 flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* User Profile Section */}
      <div className="p-6 bg-indigo-600 text-white">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center text-lg font-semibold">
            {userInitials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">
              {displayName}
            </p>
            <p className="text-sm text-indigo-100 truncate">
              {displaySubtitle}
            </p>
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-purple-500 rounded">
              Pro {user?.role === "company" ? "Plan" : "Member"}
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-indigo-50 text-indigo-600"
                  : "text-zinc-700 hover:bg-zinc-50"
              }`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-zinc-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-zinc-700 hover:bg-zinc-50 transition-colors"
        >
          <LogoutIcon className="h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function UserIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
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

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function SettingsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 1v6m0 6v6m9-9h-6m-6 0H3" />
    </svg>
  );
}

function LogoutIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

