"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PersonIcon,
  ClockIcon,
  ReloadIcon,
  MagnifyingGlassIcon,
  ActivityLogIcon,
  ExclamationTriangleIcon,
  CheckCircledIcon,
  EyeOpenIcon,
  Pencil2Icon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  GlobeIcon,
  CalendarIcon,
} from "@radix-ui/react-icons";

interface AuditLogEntry {
  id: string;
  adminId: string;
  actionType: string;
  targetType: string | null;
  targetId: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

type ActionCategory = "all" | "view" | "update" | "delete" | "create";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState<ActionCategory>("all");
  const [stats, setStats] = useState({
    total: 0,
    views: 0,
    updates: 0,
    deletes: 0,
    creates: 0,
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("internmatch_token");

      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });

      if (actionFilter !== "all") {
        params.set("actionType", actionFilter);
      }

      const response = await fetch(`/api/admin/audit?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const data = await response.json();
      const allLogs = data.data.logs || [];

      // Apply search filter client-side
      let filteredLogs = allLogs;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        filteredLogs = allLogs.filter(
          (log: AuditLogEntry) =>
            log.actionType.toLowerCase().includes(term) ||
            log.targetType?.toLowerCase().includes(term) ||
            log.adminId.toLowerCase().includes(term)
        );
      }

      setLogs(filteredLogs);
      setTotalPages(data.data.totalPages || 1);
      setTotal(data.data.total || 0);

      // Calculate stats
      const views = allLogs.filter((l: AuditLogEntry) =>
        l.actionType.includes("view")
      ).length;
      const updates = allLogs.filter(
        (l: AuditLogEntry) =>
          l.actionType.includes("update") || l.actionType.includes("change")
      ).length;
      const deletes = allLogs.filter(
        (l: AuditLogEntry) =>
          l.actionType.includes("delete") || l.actionType.includes("deactivate")
      ).length;
      const creates = allLogs.filter((l: AuditLogEntry) =>
        l.actionType.includes("create")
      ).length;

      setStats({
        total: data.data.total || 0,
        views,
        updates,
        deletes,
        creates,
      });
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load audit logs"
      );
    } finally {
      setLoading(false);
    }
  }, [page, actionFilter, searchTerm]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const getActionBadgeVariant = (
    actionType: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    if (actionType.includes("deactivate") || actionType.includes("delete")) {
      return "destructive";
    }
    if (actionType.includes("update") || actionType.includes("change")) {
      return "outline";
    }
    if (actionType.includes("view")) {
      return "secondary";
    }
    return "default";
  };

  const getActionIcon = (actionType: string) => {
    if (actionType.includes("deactivate") || actionType.includes("delete")) {
      return <TrashIcon className="h-4 w-4" />;
    }
    if (actionType.includes("update") || actionType.includes("change")) {
      return <Pencil2Icon className="h-4 w-4" />;
    }
    if (actionType.includes("view")) {
      return <EyeOpenIcon className="h-4 w-4" />;
    }
    if (actionType.includes("create")) {
      return <CheckCircledIcon className="h-4 w-4" />;
    }
    return <ActivityLogIcon className="h-4 w-4" />;
  };

  const getActionColor = (actionType: string): string => {
    if (actionType.includes("deactivate") || actionType.includes("delete")) {
      return "bg-red-100 text-red-600";
    }
    if (actionType.includes("update") || actionType.includes("change")) {
      return "bg-amber-100 text-amber-600";
    }
    if (actionType.includes("view")) {
      return "bg-blue-100 text-blue-600";
    }
    if (actionType.includes("create")) {
      return "bg-green-100 text-green-600";
    }
    return "bg-indigo-100 text-indigo-600";
  };

  const formatActionType = (actionType: string): string => {
    return actionType
      .replace(/_/g, " ")
      .replace(/([A-Z])/g, " $1")
      .trim()
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const getTimeAgo = (date: string): string => {
    const now = new Date();
    const past = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

    if (diffInSeconds < 60) return "Just now";
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400)
      return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800)
      return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return past.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-[#DFEBF6] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-3xl font-bold text-zinc-900">Audit Log</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            className="gap-2 w-fit h-9"
          >
            <ReloadIcon className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <Card
            className={`cursor-pointer border-zinc-200 hover:border-indigo-200 hover:shadow-md transition-all ${actionFilter === "all" ? "ring-2 ring-indigo-500 border-transparent" : ""}`}
            onClick={() => setActionFilter("all")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    Total Actions
                  </p>
                  <p className="text-2xl font-bold text-zinc-900 mt-1">
                    {stats.total.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <ActivityLogIcon className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer border-zinc-200 hover:border-indigo-200 hover:shadow-md transition-all ${actionFilter === "view" ? "ring-2 ring-blue-500 border-transparent" : ""}`}
            onClick={() => setActionFilter("view")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    Views
                  </p>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {stats.views.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <EyeOpenIcon className="h-5 w-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer border-zinc-200 hover:border-indigo-200 hover:shadow-md transition-all ${actionFilter === "update" ? "ring-2 ring-amber-500 border-transparent" : ""}`}
            onClick={() => setActionFilter("update")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    Updates
                  </p>
                  <p className="text-2xl font-bold text-amber-600 mt-1">
                    {stats.updates.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                  <Pencil2Icon className="h-5 w-5 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer border-zinc-200 hover:border-indigo-200 hover:shadow-md transition-all ${actionFilter === "create" ? "ring-2 ring-green-500 border-transparent" : ""}`}
            onClick={() => setActionFilter("create")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    Creates
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {stats.creates.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircledIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer border-zinc-200 hover:border-indigo-200 hover:shadow-md transition-all ${actionFilter === "delete" ? "ring-2 ring-red-500 border-transparent" : ""}`}
            onClick={() => setActionFilter("delete")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
                    Deletes
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {stats.deletes.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <TrashIcon className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Audit Log Timeline */}
        <Card className="p-6">
          <CardHeader className="pb-4 px-0 pt-0">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <ClockIcon className="h-5 w-5" />
                  Activity Timeline
                </CardTitle>
              </div>
              
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                  <Input
                    placeholder="Search by action type, target, or admin ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 h-9"
                  />
                </div>
                <select
                  value={actionFilter}
                  onChange={(e) => {
                    setActionFilter(e.target.value as ActionCategory);
                    setPage(1);
                  }}
                  className="h-9 px-3 border border-zinc-200 rounded-md text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="all">All Actions</option>
                  <option value="view">View Actions</option>
                  <option value="update">Update Actions</option>
                  <option value="create">Create Actions</option>
                  <option value="delete">Delete Actions</option>
                </select>
                {actionFilter !== "all" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActionFilter("all")}
                    className="text-zinc-500 h-9"
                  >
                    Clear filter
                  </Button>
                )}
              </div>

              <CardDescription>
                Showing {logs.length} of {total.toLocaleString()} actions
                {actionFilter !== "all" && ` (filtered by ${actionFilter})`}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                <p className="text-sm text-zinc-500">Loading audit logs...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-600 font-medium">{error}</p>
                <Button variant="outline" onClick={fetchLogs} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : logs.length === 0 ? (
              <div className="text-center py-12">
                <ActivityLogIcon className="h-12 w-12 text-zinc-300 mx-auto mb-3" />
                <p className="text-zinc-500 font-medium">No audit logs found</p>
                <p className="text-sm text-zinc-400 mt-1">
                  {searchTerm
                    ? "Try a different search term"
                    : "No actions match the current filter"}
                </p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-zinc-200" />

                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="relative">
                      {/* Timeline dot */}
                      <div
                        className={`absolute left-4 w-5 h-5 rounded-full border-2 border-white ${getActionColor(log.actionType)} flex items-center justify-center`}
                      >
                        {getActionIcon(log.actionType)}
                      </div>

                      {/* Log entry card */}
                      <div
                        className="ml-14 border border-zinc-200 rounded-lg overflow-hidden hover:border-zinc-300 transition-colors cursor-pointer"
                        onClick={() =>
                          setExpandedLogId(
                            expandedLogId === log.id ? null : log.id
                          )
                        }
                      >
                        <div className="flex items-center gap-4 p-4 hover:bg-zinc-50">
                          {/* Action icon */}
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${getActionColor(log.actionType)}`}
                          >
                            {getActionIcon(log.actionType)}
                          </div>

                          {/* Action info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge
                                variant={getActionBadgeVariant(log.actionType)}
                              >
                                {formatActionType(log.actionType)}
                              </Badge>
                              {log.targetType && (
                                <span className="text-sm text-zinc-500">
                                  on{" "}
                                  <span className="font-medium text-zinc-700">
                                    {log.targetType}
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1 text-sm text-zinc-500">
                              <PersonIcon className="h-3 w-3" />
                              <span className="font-mono text-xs">
                                {log.adminId.substring(0, 8)}...
                              </span>
                            </div>
                          </div>

                          {/* Time */}
                          <div className="text-right shrink-0">
                            <p className="text-sm font-medium text-zinc-600">
                              {getTimeAgo(log.createdAt)}
                            </p>
                            <p className="text-xs text-zinc-400">
                              {new Date(log.createdAt).toLocaleTimeString()}
                            </p>
                          </div>

                          {/* Expand indicator */}
                          <div className="text-zinc-400">
                            {expandedLogId === log.id ? (
                              <ChevronUpIcon className="h-5 w-5" />
                            ) : (
                              <ChevronDownIcon className="h-5 w-5" />
                            )}
                          </div>
                        </div>

                        {/* Expanded details */}
                        {expandedLogId === log.id && (
                          <div className="border-t border-zinc-200 bg-zinc-50 p-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {/* IDs */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-zinc-700 text-sm">
                                  Identifiers
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div>
                                    <span className="text-zinc-500">
                                      Admin ID:
                                    </span>
                                    <code className="ml-2 px-2 py-0.5 bg-zinc-200 rounded text-xs font-mono">
                                      {log.adminId}
                                    </code>
                                  </div>
                                  {log.targetId && (
                                    <div>
                                      <span className="text-zinc-500">
                                        Target ID:
                                      </span>
                                      <code className="ml-2 px-2 py-0.5 bg-zinc-200 rounded text-xs font-mono">
                                        {log.targetId}
                                      </code>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Timestamp & IP */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-zinc-700 text-sm">
                                  Metadata
                                </h4>
                                <div className="space-y-2 text-sm">
                                  <div className="flex items-center gap-2 text-zinc-600">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span>
                                      {new Date(
                                        log.createdAt
                                      ).toLocaleDateString("en-US", {
                                        year: "numeric",
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </span>
                                  </div>
                                  {log.ipAddress && (
                                    <div className="flex items-center gap-2 text-zinc-600">
                                      <GlobeIcon className="h-4 w-4" />
                                      <span>IP: {log.ipAddress}</span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Details */}
                              <div className="space-y-3">
                                <h4 className="font-medium text-zinc-700 text-sm">
                                  Details
                                </h4>
                                {log.details &&
                                Object.keys(log.details).length > 0 ? (
                                  <ScrollArea className="h-24">
                                    <pre className="text-xs text-zinc-600 bg-zinc-100 p-2 rounded overflow-x-auto">
                                      {JSON.stringify(log.details, null, 2)}
                                    </pre>
                                  </ScrollArea>
                                ) : (
                                  <p className="text-sm text-zinc-400 italic">
                                    No additional details
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-zinc-200 gap-4">
                <p className="text-sm text-zinc-600">
                  Showing page {page} of {totalPages} ({total.toLocaleString()}{" "}
                  total actions)
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(1)}
                    disabled={page === 1}
                  >
                    First
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeftIcon className="h-4 w-4 mr-1" />
                    Prev
                  </Button>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (page <= 3) {
                        pageNum = i + 1;
                      } else if (page >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = page - 2 + i;
                      }
                      return (
                        <Button
                          key={pageNum}
                          variant={page === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => setPage(pageNum)}
                          className="w-8 h-8 p-0"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    Next
                    <ChevronRightIcon className="h-4 w-4 ml-1" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(totalPages)}
                    disabled={page === totalPages}
                  >
                    Last
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
