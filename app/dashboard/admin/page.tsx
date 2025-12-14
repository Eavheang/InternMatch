"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  PersonIcon,
  BarChartIcon,
  FileTextIcon,
  RocketIcon,
  ArrowRightIcon,
  ReloadIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  LightningBoltIcon,
  LayersIcon,
  ActivityLogIcon,
  CalendarIcon,
} from "@radix-ui/react-icons";

interface AnalyticsData {
  totalUsers: number;
  totalStudents: number;
  totalCompanies: number;
  totalJobs: number;
  totalApplications: number;
  activeSubscriptions: number;
  verifiedUsers: number;
  totalRevenue: number;
  dailyActiveUsers: number;
  monthlyActiveUsers: number;
  studentsTrend: number;
  companiesTrend: number;
  jobsTrend: number;
  applicationsTrend: number;
  subscriptionsTrend: number;
  verifiedUsersTrend: number;
}

// Skeleton component for loading states
function StatCardSkeleton() {
  return (
    <Card variant="admin" className="relative overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="h-4 w-24 bg-[#AAC7D8]/30 rounded animate-pulse"></div>
            <div className="h-8 w-16 bg-[#AAC7D8]/20 rounded animate-pulse"></div>
            <div className="h-3 w-32 bg-[#AAC7D8]/10 rounded animate-pulse"></div>
          </div>
          <div className="h-12 w-12 bg-[#AAC7D8]/20 rounded-xl animate-pulse"></div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminOverviewPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAnalytics = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const token = localStorage.getItem("internmatch_token");
      const res = await fetch("/api/admin/analytics?type=overview", {
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error("Failed to fetch analytics");
      const response = await res.json();
      setAnalytics(response.data || response);
      setError(null);
    } catch {
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const stats = analytics
    ? [
        {
          label: "Total Students",
          value: analytics.totalStudents ?? 0,
          icon: PersonIcon,
          color: "blue",
          trend: `${analytics.studentsTrend !== undefined ? (analytics.studentsTrend > 0 ? "+" : "") : "+"}${analytics.studentsTrend !== undefined ? analytics.studentsTrend.toFixed(1) : "0"}%`,
          trendUp: (analytics.studentsTrend ?? 0) >= 0,
          description: "Registered student accounts",
        },
        {
          label: "Total Companies",
          value: analytics.totalCompanies ?? 0,
          icon: LayersIcon,
          color: "purple",
          trend: `${analytics.companiesTrend !== undefined ? (analytics.companiesTrend > 0 ? "+" : "") : "+"}${analytics.companiesTrend !== undefined ? analytics.companiesTrend.toFixed(1) : "0"}%`,
          trendUp: (analytics.companiesTrend ?? 0) >= 0,
          description: "Verified company profiles",
        },
        {
          label: "Active Jobs",
          value: analytics.totalJobs ?? 0,
          icon: RocketIcon,
          color: "green",
          trend: `${analytics.jobsTrend !== undefined ? (analytics.jobsTrend > 0 ? "+" : "") : "+"}${analytics.jobsTrend !== undefined ? analytics.jobsTrend.toFixed(1) : "0"}%`,
          trendUp: (analytics.jobsTrend ?? 0) >= 0,
          description: "Open job listings",
        },
        {
          label: "Applications",
          value: analytics.totalApplications ?? 0,
          icon: FileTextIcon,
          color: "orange",
          trend: `${analytics.applicationsTrend !== undefined ? (analytics.applicationsTrend > 0 ? "+" : "") : "+"}${analytics.applicationsTrend !== undefined ? analytics.applicationsTrend.toFixed(1) : "0"}%`,
          trendUp: (analytics.applicationsTrend ?? 0) >= 0,
          description: "Total submissions",
        },
        {
          label: "Subscriptions",
          value: analytics.activeSubscriptions ?? 0,
          icon: LightningBoltIcon,
          color: "pink",
          trend: `${analytics.subscriptionsTrend !== undefined ? (analytics.subscriptionsTrend > 0 ? "+" : "") : "+"}${analytics.subscriptionsTrend !== undefined ? analytics.subscriptionsTrend.toFixed(1) : "0"}%`,
          trendUp: (analytics.subscriptionsTrend ?? 0) >= 0,
          description: "Active premium plans",
        },
        {
          label: "Verified Users",
          value: analytics.verifiedUsers ?? 0,
          icon: CheckCircledIcon,
          color: "emerald",
          trend: `${analytics.verifiedUsersTrend !== undefined ? (analytics.verifiedUsersTrend > 0 ? "+" : "") : "+"}${analytics.verifiedUsersTrend !== undefined ? analytics.verifiedUsersTrend.toFixed(1) : "0"}%`,
          trendUp: (analytics.verifiedUsersTrend ?? 0) >= 0,
          description: "Email verified accounts",
        },
      ]
    : [];

  const colorClasses: Record<
    string,
    { bg: string; icon: string; badge: string }
  > = {
    blue: {
      bg: "bg-[#DFEBF6]",
      icon: "text-[#44576D]",
      badge: "bg-[#AAC7D8] text-[#29353C]",
    },
    purple: {
      bg: "bg-[#DFEBF6]",
      icon: "text-[#768A96]",
      badge: "bg-[#AAC7D8] text-[#29353C]",
    },
    green: {
      bg: "bg-[#DFEBF6]",
      icon: "text-[#768A96]",
      badge: "bg-[#AAC7D8] text-[#29353C]",
    },
    orange: {
      bg: "bg-[#DFEBF6]",
      icon: "text-[#768A96]",
      badge: "bg-[#AAC7D8] text-[#29353C]",
    },
    pink: {
      bg: "bg-[#DFEBF6]",
      icon: "text-[#768A96]",
      badge: "bg-[#AAC7D8] text-[#29353C]",
    },
    emerald: {
      bg: "bg-[#DFEBF6]",
      icon: "text-[#768A96]",
      badge: "bg-[#AAC7D8] text-[#29353C]",
    },
  };

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage all users",
      href: "/dashboard/admin/users",
      icon: PersonIcon,
      color: "blue",
    },
    {
      title: "View Analytics",
      description: "Detailed platform insights",
      href: "/dashboard/admin/analytics",
      icon: BarChartIcon,
      color: "green",
    },
    {
      title: "Audit Log",
      description: "Review admin activities",
      href: "/dashboard/admin/audit",
      icon: ActivityLogIcon,
      color: "purple",
    },
  ];

  return (
    <div className="min-h-screen bg-[#DFEBF6] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#29353C]">
              Dashboard Overview
            </h1>
            <p className="text-[#768A96] mt-1">
              Welcome back! Here&apos;s what&apos;s happening on your platform.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Badge
              variant="outline"
              className="h-8 px-3 gap-2 text-[#44576D] border-[#AAC7D8]/30"
            >
              <CalendarIcon className="h-3.5 w-3.5" />
              {new Date().toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchAnalytics(true)}
              disabled={refreshing}
            >
              <ReloadIcon
                className={`h-4 w-4 mr-2 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </Button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <Card variant="admin" className="border-red-200/30 bg-red-50/50">
            <CardContent className="p-4 flex items-center gap-3">
              <CrossCircledIcon className="h-5 w-5 text-red-600" />
              <p className="text-red-700 text-sm">{error}</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchAnalytics(true)}
                className="ml-auto"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            stats.map((stat) => {
              const colors = colorClasses[stat.color];
              const Icon = stat.icon;
              return (
                <Card
                  variant="admin"
                  key={stat.label}
                  className="relative overflow-hidden border-[#AAC7D8]/30 hover:border-[#AAC7D8]/50 hover:shadow-md transition-all"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-[#768A96]">
                          {stat.label}
                        </p>
                        <p className="text-3xl font-bold text-[#29353C]">
                          {stat.value.toLocaleString()}
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <Badge
                            className={`${colors.badge} text-xs font-medium`}
                          >
                            {stat.trendUp ? "↑" : "↓"} {stat.trend}
                          </Badge>
                          <span className="text-xs text-[#AAC7D8]/70">
                            {stat.description}
                          </span>
                        </div>
                      </div>
                      <div
                        className={`h-12 w-12 rounded-xl ${colors.bg} flex items-center justify-center`}
                      >
                        <Icon className={`h-6 w-6 ${colors.icon}`} />
                      </div>
                    </div>
                  </CardContent>
                  <div
                    className={`absolute bottom-0 left-0 right-0 h-1 ${colors.bg}`}
                  ></div>
                </Card>
              );
            })
          )}
        </div>

        {/* Revenue Highlight */}
        {!loading && analytics && (
          <Card
            variant="admin"
            className="bg-[#44576D] text-white border-0 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.08%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30"></div>
            <CardContent className="p-8 relative z-10">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm font-medium text-white/70 mb-2">
                    Platform Performance
                  </p>
                  <h3 className="text-3xl font-bold mb-2">
                    {(
                      (analytics.totalStudents ?? 0) +
                      (analytics.totalCompanies ?? 0)
                    ).toLocaleString()}{" "}
                    Total Users
                  </h3>
                  <p className="text-white/80 text-sm">
                    Your platform is growing steadily with{" "}
                    <span className="font-semibold">
                      {analytics.totalJobs ?? 0} active jobs
                    </span>{" "}
                    and{" "}
                    <span className="font-semibold">
                      {analytics.totalApplications ?? 0} applications
                    </span>{" "}
                    submitted.
                  </p>
                </div>
                <div className="flex gap-3">
                  <Link href="/dashboard/admin/analytics">
                    <Button
                      variant="secondary"
                      className="bg-white/20 hover:bg-white/30 text-white border-0"
                    >
                      View Detailed Analytics
                      <ArrowRightIcon className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-[#29353C] mb-4">
            Quick Actions
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const colors = colorClasses[action.color];
              const Icon = action.icon;
              return (
                <Card
                  variant="admin"
                  key={action.href}
                  className="group border-[#AAC7D8]/30 hover:border-[#AAC7D8]/50 hover:shadow-md transition-all"
                >
                  <CardContent className="p-6">
                    <Link href={action.href} className="block">
                      <div className="flex items-center gap-4">
                        <div
                          className={`h-12 w-12 rounded-xl ${colors.bg} flex items-center justify-center group-hover:scale-110 transition-transform`}
                        >
                          <Icon className={`h-6 w-6 ${colors.icon}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-[#29353C] group-hover:text-[#44576D] transition-colors">
                            {action.title}
                          </h3>
                          <p className="text-sm text-[#768A96]">
                            {action.description}
                          </p>
                        </div>
                        <ArrowRightIcon className="h-5 w-5 text-[#AAC7D8] group-hover:text-[#44576D] group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* System Status */}
        <Card variant="admin">
          <CardHeader>
            <CardTitle className="text-lg text-[#29353C]">
              System Status
            </CardTitle>
            <CardDescription className="text-[#768A96]">
              Current platform health and services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 px-4 py-6">
              {[
                { name: "API Services", status: "operational" },
                { name: "Database", status: "operational" },
                { name: "Authentication", status: "operational" },
                { name: "File Storage", status: "operational" },
              ].map((service) => (
                <div
                  key={service.name}
                  className="flex items-center gap-3 p-3 rounded-lg bg-[#DFEBF6]/50"
                >
                  <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-[#29353C]">
                      {service.name}
                    </p>
                    <p className="text-xs text-emerald-600 capitalize">
                      {service.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
