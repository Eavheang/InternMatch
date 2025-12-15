"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  HomeIcon,
  BarChartIcon,
  PersonIcon,
  FileTextIcon,
  GearIcon,
  ExitIcon,
  LaptopIcon,
  ChevronRightIcon,
} from "@radix-ui/react-icons";

interface AdminSidebarProps {
  userEmail?: string;
}

export function AdminSidebar({ userEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("internmatch_token");
    router.push("/login");
  };

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard/admin") return pathname === "/dashboard/admin";
    return pathname.startsWith(href);
  };

  const navItems = [
    {
      label: "Overview",
      href: "/dashboard/admin",
      icon: HomeIcon,
      description: "Dashboard home",
    },
    {
      label: "Analytics",
      href: "/dashboard/admin/analytics",
      icon: BarChartIcon,
      description: "Platform insights",
    },
    {
      label: "Users",
      href: "/dashboard/admin/users",
      icon: PersonIcon,
      description: "Manage users",
    },
    {
      label: "Audit Log",
      href: "/dashboard/admin/audit",
      icon: FileTextIcon,
      description: "Activity history",
    },
    {
      label: "Settings",
      href: "/dashboard/admin/settings",
      icon: GearIcon,
      description: "Configuration",
    },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-72 flex flex-col bg-linear-to-b from-[#29353C] via-[#44576D] to-[#29353C] border-r border-[#768A96]/30 shadow-2xl">
      {/* Header Section */}
      <div className="p-6 border-b border-[#768A96]/30 bg-linear-to-r from-[#44576D] to-[#768A96]">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-linear-to-br from-[#AAC7D8] to-[#768A96] flex items-center justify-center shadow-lg shadow-[#AAC7D8]/30">
            <LaptopIcon className="h-6 w-6 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-sm font-bold text-white">Admin Panel</p>
            </div>
            <p className="text-xs text-[#DFEBF6] truncate mt-1">
              {userEmail || "admin@example.com"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={cn(
                  "group flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 cursor-pointer",
                  active
                    ? "bg-linear-to-r from-[#768A96] to-[#AAC7D8] text-white shadow-lg shadow-[#AAC7D8]/20"
                    : "text-[#E6E6E6] hover:text-white hover:bg-[#44576D]/50"
                )}
              >
                <div
                  className={cn(
                    "h-9 w-9 rounded-lg flex items-center justify-center transition-all shrink-0",
                    active
                      ? "bg-white/20 text-white shadow-lg shadow-[#AAC7D8]/30"
                      : "bg-[#44576D] text-[#AAC7D8] group-hover:bg-[#768A96] group-hover:text-[#E6E6E6]"
                  )}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={cn(
                      "text-sm font-semibold",
                      active ? "text-white" : "text-[#DFEBF6]"
                    )}
                  >
                    {item.label}
                  </p>
                  <p className="text-xs text-[#AAC7D8]/70 truncate">
                    {item.description}
                  </p>
                </div>
                {active && (
                  <ChevronRightIcon className="h-4 w-4 text-white shrink-0" />
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-4 border-t border-[#768A96]/30 space-y-3 bg-linear-to-t from-[#29353C] to-[#44576D]">
        {/* Quick Stats */}
        <div className="p-3 rounded-lg bg-[#44576D]/40 border border-[#768A96]/50 backdrop-blur">
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#AAC7D8]">System Status</span>
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shadow-lg shadow-emerald-500/50"></span>
              <span className="text-emerald-400 font-semibold">Online</span>
            </span>
          </div>
        </div>

        {/* Logout Button */}
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 h-10 px-4 text-[#DFEBF6] hover:text-red-400 hover:bg-red-950/30 transition-all duration-200 border border-transparent hover:border-red-900/50"
        >
          <div className="h-8 w-8 rounded-lg bg-[#44576D] flex items-center justify-center group-hover:bg-red-900/50 transition-colors">
            <ExitIcon className="h-4 w-4" />
          </div>
          <span className="text-sm font-medium">Sign Out</span>
        </Button>
      </div>
    </aside>
  );
}
