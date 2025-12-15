"use client";

import { useEffect, useState, useCallback } from "react";
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
  ReloadIcon,
  BarChartIcon,
  PersonIcon,
  ActivityLogIcon,
  LightningBoltIcon,
  ArrowUpIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

interface FeatureUsage {
  feature: string;
  totalUsage: number;
  uniqueUsers: number;
  usageByPlan: Record<string, number>;
  trend: number;
  avgUsagePerUser: number;
  adoptionRate: number;
  growthRate: number;
}

interface UserGrowth {
  period: string;
  newStudents: number;
  newCompanies: number;
  totalNew: number;
  cumulativeTotal: number;
}

interface Revenue {
  period: string;
  totalRevenue: number;
  newSubscriptions: number;
  cancellations: number;
  subscriptionsByPlan: Record<string, number>;
  mrr: number;
}

interface PlatformActivity {
  period: string;
  jobsCreated: number;
  applicationsSubmitted: number;
  aiFeatureUsage: number;
}

type TabType = "feature" | "growth" | "revenue" | "activity";

// Skeleton component for loading state
function CardSkeleton() {
  return (
    <Card variant="admin" className="bg-white/80 border border-[#AAC7D8]/30">
      <CardHeader>
        <div className="h-5 w-40 bg-[#AAC7D8]/20 rounded animate-pulse" />
        <div className="h-4 w-64 bg-[#AAC7D8]/10 rounded animate-pulse mt-2" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 bg-[#AAC7D8]/10 rounded-lg animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-[#AAC7D8]/10 rounded animate-pulse" />
                <div className="h-3 w-24 bg-[#AAC7D8]/5 rounded animate-pulse" />
              </div>
              <div className="h-8 w-16 bg-[#AAC7D8]/10 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("feature");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [featureUsage, setFeatureUsage] = useState<FeatureUsage[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowth[]>([]);
  const [revenue, setRevenue] = useState<Revenue[]>([]);
  const [platformActivity, setPlatformActivity] = useState<PlatformActivity[]>(
    []
  );
  const [error, setError] = useState<string | null>(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem("internmatch_token");
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }, []);

  const fetchAnalytics = useCallback(
    async (type: string, showRefresh = false) => {
      if (showRefresh) setRefreshing(true);
      setLoading(true);
      setError(null);

      try {
        const res = await fetch(`/api/admin/analytics?type=${type}`, {
          headers: getAuthHeaders(),
        });

        if (!res.ok) {
          const errorMessage =
            res.status === 403
              ? "Access denied. Admin privileges required."
              : res.status === 401
                ? "Please log in to view analytics."
                : "Failed to fetch analytics data";
          setError(errorMessage);
          return;
        }

        const response = await res.json();
        const data = response.data || [];

        switch (type) {
          case "feature-usage":
            setFeatureUsage(Array.isArray(data) ? data : []);
            break;
          case "user-growth":
            setUserGrowth(Array.isArray(data) ? data : []);
            break;
          case "revenue":
            setRevenue(Array.isArray(data) ? data : []);
            break;
          case "platform-activity":
            setPlatformActivity(Array.isArray(data) ? data : []);
            break;
        }
      } catch {
        setError("Failed to load analytics data");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [getAuthHeaders]
  );

  useEffect(() => {
    const typeMap: Record<TabType, string> = {
      feature: "feature-usage",
      growth: "user-growth",
      revenue: "revenue",
      activity: "platform-activity",
    };
    fetchAnalytics(typeMap[activeTab]);
  }, [activeTab, fetchAnalytics]);

  const tabs = [
    {
      id: "feature" as TabType,
      label: "Feature Usage",
      icon: LightningBoltIcon,
    },
    { id: "growth" as TabType, label: "User Growth", icon: PersonIcon },
    { id: "revenue" as TabType, label: "Revenue", icon: BarChartIcon },
    { id: "activity" as TabType, label: "Activity", icon: ActivityLogIcon },
  ];

  const getFeatureIcon = (feature: string) => {
    if (feature.toLowerCase().includes("resume")) return "📄";
    if (feature.toLowerCase().includes("interview")) return "🎤";
    if (feature.toLowerCase().includes("ats")) return "🎯";
    if (feature.toLowerCase().includes("review")) return "⭐";
    return "✨";
  };

  const handleRefresh = () => {
    const typeMap: Record<TabType, string> = {
      feature: "feature-usage",
      growth: "user-growth",
      revenue: "revenue",
      activity: "platform-activity",
    };
    fetchAnalytics(typeMap[activeTab], true);
  };

  return (
    <div className="min-h-screen bg-[#DFEBF6] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-3xl font-bold text-[#29353C]">Analytics</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
            className="gap-2 w-fit h-9 border-[#AAC7D8]/30 text-[#44576D] hover:bg-[#AAC7D8]/10"
          >
            <ReloadIcon
              className={cn("h-4 w-4", refreshing && "animate-spin")}
            />
            Refresh
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </CardContent>
          </Card>
        )}

        {/* Tabs Navigation */}
        <div className="flex flex-wrap gap-2 border-b border-zinc-200">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all border-b-2 -mb-px",
                  activeTab === tab.id
                    ? "border-b-indigo-500 text-zinc-900"
                    : "border-b-transparent text-zinc-600 hover:text-zinc-900"
                )}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {loading ? (
          <CardSkeleton />
        ) : (
          <div className="space-y-6">
            {/* Feature Usage Tab */}
            {activeTab === "feature" && (
              <Card className="p-6">
                <CardHeader className="pb-4 px-0 pt-0">
                  <div className="space-y-4">
                    <CardTitle className="flex items-center gap-2">
                      <LightningBoltIcon className="h-5 w-5" />
                      AI Feature Usage
                    </CardTitle>
                    <CardDescription>
                      Usage statistics for AI-powered features
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 px-0 pb-0">
                  {featureUsage.length === 0 ? (
                    <p className="text-zinc-500 text-center py-8">
                      No feature usage data available
                    </p>
                  ) : (
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {featureUsage.map((feature) => (
                        <div
                          key={feature.feature}
                          className="p-4 rounded-lg border border-zinc-200 bg-white hover:border-indigo-200 hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-2xl">
                              {getFeatureIcon(feature.feature)}
                            </span>
                            <h4 className="font-semibold text-zinc-900 truncate">
                              {feature.feature}
                            </h4>
                          </div>
                          <div className="space-y-3">
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                              <span className="text-xs text-zinc-600">Total Uses</span>
                              <span className="text-lg font-bold text-zinc-900">
                                {(feature.totalUsage ?? 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                              <span className="text-xs text-zinc-600">Active Users</span>
                              <span className="text-lg font-bold text-zinc-900">
                                {(feature.uniqueUsers ?? 0).toLocaleString()}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                              <span className="text-xs text-zinc-600">Avg per User</span>
                              <span className="text-lg font-bold text-zinc-900">
                                {(feature.avgUsagePerUser ?? 0).toFixed(1)}
                              </span>
                            </div>
                            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
                              <span className="text-xs text-zinc-600">Adoption</span>
                              <span className="text-lg font-bold text-zinc-900">
                                {(feature.adoptionRate ?? 0).toFixed(1)}%
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-zinc-600">Growth</span>
                              <span className={`text-lg font-bold ${(feature.growthRate ?? 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {(feature.growthRate ?? 0) > 0 ? "+" : ""}
                                {(feature.growthRate ?? 0).toFixed(1)}%
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* User Growth Tab */}
            {activeTab === "growth" && (
              <Card className="p-6">
                <CardHeader className="pb-4 px-0 pt-0">
                  <div className="space-y-4">
                    <CardTitle className="flex items-center gap-2">
                      <PersonIcon className="h-5 w-5" />
                      User Growth (Last 12 Months)
                    </CardTitle>
                    <CardDescription>
                      New student and company registrations
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 px-0 pb-0">
                  {userGrowth.length === 0 ? (
                    <p className="text-zinc-500 text-center py-8">
                      No growth data available
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-zinc-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">
                              Date
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-700">
                              Students
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-700">
                              Companies
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-700">
                              Total
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-700">
                              Cumulative
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {userGrowth
                            .slice(-10)
                            .reverse()
                            .map((item, idx) => (
                              <tr
                                key={item.period}
                                className={cn(
                                  "border-b border-zinc-100 hover:bg-zinc-50 transition-colors",
                                  idx === 0 && "bg-zinc-50"
                                )}
                              >
                                <td className="py-3 px-4 text-sm font-medium text-zinc-900">
                                  {item.period}
                                  {idx === 0 && (
                                    <Badge className="ml-2 text-xs bg-zinc-200 text-zinc-700">
                                      Latest
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-zinc-700">
                                  <span className="inline-flex items-center gap-1">
                                    {item.newStudents > 0 && (
                                      <ArrowUpIcon className="h-3 w-3 text-zinc-500" />
                                    )}
                                    {item.newStudents}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-right text-zinc-700">
                                  <span className="inline-flex items-center gap-1">
                                    {item.newCompanies > 0 && (
                                      <ArrowUpIcon className="h-3 w-3 text-zinc-500" />
                                    )}
                                    {item.newCompanies}
                                  </span>
                                </td>
                                <td className="py-3 px-4 text-sm text-right font-semibold text-zinc-900">
                                  {item.totalNew}
                                </td>
                                <td className="py-3 px-4 text-sm text-right">
                                  <Badge
                                    variant="outline"
                                    className="font-mono"
                                  >
                                    {(
                                      item.cumulativeTotal ?? 0
                                    ).toLocaleString()}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Revenue Tab */}
            {activeTab === "revenue" && (
              <Card className="p-6">
                <CardHeader className="pb-4 px-0 pt-0">
                  <div className="space-y-4">
                    <CardTitle className="flex items-center gap-2">
                      <BarChartIcon className="h-5 w-5" />
                      Revenue (Last 6 Months)
                    </CardTitle>
                    <CardDescription>
                      Monthly revenue and subscription data
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 px-0 pb-0">
                  {revenue.length === 0 ? (
                    <p className="text-zinc-500 text-center py-8">
                      No revenue data available
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {[...revenue].reverse().map((item, idx) => (
                        <div
                          key={item.period}
                          className={cn(
                            "p-4 rounded-lg border transition-all hover:shadow-md hover:border-indigo-200",
                            idx === 0
                              ? "border-zinc-200 bg-zinc-50"
                              : "border-zinc-200 bg-white"
                          )}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                            <div className="flex items-center gap-3">
                              <span className="font-semibold text-zinc-900">
                                {item.period}
                              </span>
                              {idx === 0 && (
                                <Badge className="bg-zinc-200 text-zinc-700 border-0">
                                  Current
                                </Badge>
                              )}
                            </div>
                            <span className="text-2xl font-bold text-zinc-900">
                              $
                              {(item.totalRevenue ?? 0).toLocaleString(
                                undefined,
                                {
                                  minimumFractionDigits: 2,
                                }
                              )}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            <div className="p-3 bg-zinc-50 rounded">
                              <p className="text-xs text-zinc-600 mb-1">
                                New Subs
                              </p>
                              <p className="text-lg font-semibold text-zinc-900">
                                {item.newSubscriptions ?? 0}
                              </p>
                            </div>
                            <div className="p-3 bg-zinc-50 rounded">
                              <p className="text-xs text-zinc-600 mb-1">
                                Cancelled
                              </p>
                              <p className="text-lg font-semibold text-zinc-900">
                                {item.cancellations ?? 0}
                              </p>
                            </div>
                            <div className="p-3 bg-zinc-50 rounded">
                              <p className="text-xs text-zinc-600 mb-1">MRR</p>
                              <p className="text-lg font-semibold text-zinc-900">
                                $
                                {(item.mrr ?? 0).toLocaleString(undefined, {
                                  minimumFractionDigits: 0,
                                })}
                              </p>
                            </div>
                            <div className="p-3 bg-zinc-50 rounded">
                              <p className="text-xs text-zinc-600 mb-1">
                                Net Change
                              </p>
                              <p className={`text-lg font-semibold ${((item.newSubscriptions ?? 0) - (item.cancellations ?? 0)) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                {((item.newSubscriptions ?? 0) - (item.cancellations ?? 0)) > 0 ? '+' : ''}
                                {(item.newSubscriptions ?? 0) - (item.cancellations ?? 0)}
                              </p>
                            </div>
                          </div>
                          {Object.keys(item.subscriptionsByPlan).length > 0 && (
                            <div className="mt-4 pt-4 border-t border-zinc-100">
                              <p className="text-xs text-zinc-600 font-medium mb-2">
                                Breakdown by Plan
                              </p>
                              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {Object.entries(item.subscriptionsByPlan).map(
                                  ([plan, count]) => (
                                    <div
                                      key={plan}
                                      className="flex items-center justify-between text-sm"
                                    >
                                      <span className="text-zinc-600 capitalize">
                                        {plan}:
                                      </span>
                                      <span className="font-semibold text-zinc-900">
                                        {count}
                                      </span>
                                    </div>
                                  )
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Platform Activity Tab */}
            {activeTab === "activity" && (
              <Card className="p-6">
                <CardHeader className="pb-4 px-0 pt-0">
                  <div className="space-y-4">
                    <CardTitle className="flex items-center gap-2">
                      <ActivityLogIcon className="h-5 w-5" />
                      Platform Activity (Last 30 Days)
                    </CardTitle>
                    <CardDescription>
                      Daily activity metrics across the platform
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6 px-0 pb-0">
                  {platformActivity.length === 0 ? (
                    <p className="text-zinc-500 text-center py-8">
                      No activity data available
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-zinc-200">
                            <th className="text-left py-3 px-4 text-sm font-semibold text-zinc-700">
                              Date
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-700">
                              Jobs Created
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-700">
                              Applications
                            </th>
                            <th className="text-right py-3 px-4 text-sm font-semibold text-zinc-700">
                              AI Usage
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {platformActivity
                            .slice(-10)
                            .reverse()
                            .map((item, idx) => (
                              <tr
                                key={item.period}
                                className={cn(
                                  "border-b border-zinc-100 hover:bg-zinc-50 transition-colors",
                                  idx === 0 && "bg-purple-50/50"
                                )}
                              >
                                <td className="py-3 px-4 text-sm font-medium text-zinc-900">
                                  {item.period}
                                  {idx === 0 && (
                                    <Badge className="ml-2 text-xs bg-purple-100 text-purple-700">
                                      Latest
                                    </Badge>
                                  )}
                                </td>
                                <td className="py-3 px-4 text-sm text-right">
                                  <Badge
                                    variant="outline"
                                    className="bg-green-50 text-green-700 border-green-200"
                                  >
                                    {item.jobsCreated ?? 0}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-sm text-right">
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {item.applicationsSubmitted ?? 0}
                                  </Badge>
                                </td>
                                <td className="py-3 px-4 text-sm text-right">
                                  <Badge
                                    variant="outline"
                                    className="bg-amber-50 text-amber-700 border-amber-200"
                                  >
                                    {item.aiFeatureUsage ?? 0}
                                  </Badge>
                                </td>
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
