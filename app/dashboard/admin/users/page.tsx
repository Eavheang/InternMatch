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
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PersonIcon,
  CheckCircledIcon,
  CrossCircledIcon,
  ReloadIcon,
  EnvelopeClosedIcon,
  CalendarIcon,
  IdCardIcon,
  GearIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from "@radix-ui/react-icons";
import type { UserListItem } from "@/lib/analytics-types";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    students: 0,
    companies: 0,
    admins: 0,
    verified: 0,
  });

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("internmatch_token");

      const params = new URLSearchParams();
      params.set("page", page.toString());
      params.set("limit", "10");
      if (search) params.set("search", search);
      if (roleFilter !== "all") params.set("role", roleFilter);

      const response = await fetch(`/api/admin/users?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const data = await response.json();
      setUsers(data.data.users || []);
      setTotalPages(data.data.totalPages || 1);
      setTotal(data.data.total || 0);

      // Calculate stats from response if available
      if (data.data.stats) {
        setStats(data.data.stats);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [page, roleFilter, search]);

  // Fetch user statistics
  const fetchStats = useCallback(async () => {
    try {
      const token = localStorage.getItem("internmatch_token");
      // Try to get stats from analytics endpoint
      const response = await fetch("/api/admin/analytics", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.data) {
          // Get admin count from users endpoint
          const usersResponse = await fetch("/api/admin/users?limit=1000", {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          let adminCount = 0;
          let verifiedCount = 0;
          if (usersResponse.ok) {
            const usersData = await usersResponse.json();
            const allUsers = usersData.data.users || [];
            adminCount = allUsers.filter(
              (u: UserListItem) => u.role === "admin"
            ).length;
            verifiedCount = allUsers.filter(
              (u: UserListItem) => u.isVerified
            ).length;
          }

          setStats({
            total: data.data.totalUsers || 0,
            students: data.data.totalStudents || 0,
            companies: data.data.totalCompanies || 0,
            admins: adminCount,
            verified: verifiedCount,
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch stats:", err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const handleSearch = () => {
    setPage(1);
    fetchUsers();
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const token = localStorage.getItem("internmatch_token");
      const response = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error("Failed to update role");
      }

      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error("Failed to change role:", err);
    }
  };

  const handleVerificationToggle = async (
    userId: string,
    isVerified: boolean
  ) => {
    try {
      const token = localStorage.getItem("internmatch_token");
      const response = await fetch(`/api/admin/users/${userId}/verify`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ isVerified: !isVerified }),
      });

      if (!response.ok) {
        throw new Error("Failed to update verification");
      }

      fetchUsers();
      fetchStats();
    } catch (err) {
      console.error("Failed to toggle verification:", err);
    }
  };

  const getRoleBadgeVariant = (
    role: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (role) {
      case "admin":
        return "destructive";
      case "company":
        return "default";
      case "student":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <GearIcon className="h-4 w-4" />;
      case "company":
        return <IdCardIcon className="h-4 w-4" />;
      default:
        return <PersonIcon className="h-4 w-4" />;
    }
  };

  const getUserDisplayName = (user: UserListItem): string => {
    if (user.profile?.firstName || user.profile?.lastName) {
      return `${user.profile?.firstName || ""} ${user.profile?.lastName || ""}`.trim();
    }
    if (user.profile?.companyName) {
      return user.profile.companyName;
    }
    return user.email.split("@")[0];
  };

  const getUserInitials = (user: UserListItem): string => {
    const name = getUserDisplayName(user);
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const getRoleColor = (role: string): string => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-600";
      case "company":
        return "bg-indigo-100 text-indigo-600";
      case "student":
        return "bg-emerald-100 text-emerald-600";
      default:
        return "bg-zinc-100 text-zinc-600";
    }
  };

  return (
    <div className="min-h-screen bg-[#DFEBF6] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-8 px-4 py-4">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h1 className="text-3xl font-bold text-[#29353C]">User Management</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              fetchUsers();
              fetchStats();
            }}
            className="gap-2 w-fit h-9 border-[#AAC7D8]/30 text-[#44576D] hover:bg-[#AAC7D8]/10"
          >
            <ReloadIcon className="h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
          <Card
            variant="admin"
            className={`cursor-pointer border-[#AAC7D8]/30 hover:border-[#AAC7D8]/50 hover:shadow-md transition-all ${roleFilter === "all" ? "ring-2 ring-[#44576D] border-transparent" : ""}`}
            onClick={() => setRoleFilter("all")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#768A96] uppercase tracking-wide">
                    Total Users
                  </p>
                  <p className="text-2xl font-bold text-[#29353C] mt-1">
                    {stats.total.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-[#AAC7D8]/20 flex items-center justify-center">
                  <PersonIcon className="h-5 w-5 text-[#44576D]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="admin"
            className={`cursor-pointer border-[#AAC7D8]/30 hover:border-[#AAC7D8]/50 hover:shadow-md transition-all ${roleFilter === "student" ? "ring-2 ring-emerald-500 border-transparent" : ""}`}
            onClick={() => setRoleFilter("student")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#768A96] uppercase tracking-wide">
                    Students
                  </p>
                  <p className="text-2xl font-bold text-emerald-600 mt-1">
                    {stats.students.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <PersonIcon className="h-5 w-5 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="admin"
            className={`cursor-pointer border-[#AAC7D8]/30 hover:border-[#AAC7D8]/50 hover:shadow-md transition-all ${roleFilter === "company" ? "ring-2 ring-indigo-500 border-transparent" : ""}`}
            onClick={() => setRoleFilter("company")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#768A96] uppercase tracking-wide">
                    Companies
                  </p>
                  <p className="text-2xl font-bold text-indigo-600 mt-1">
                    {stats.companies.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                  <IdCardIcon className="h-5 w-5 text-indigo-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="admin"
            className={`cursor-pointer border-[#AAC7D8]/30 hover:border-[#AAC7D8]/50 hover:shadow-md transition-all ${roleFilter === "admin" ? "ring-2 ring-red-500 border-transparent" : ""}`}
            onClick={() => setRoleFilter("admin")}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#768A96] uppercase tracking-wide">
                    Admins
                  </p>
                  <p className="text-2xl font-bold text-red-600 mt-1">
                    {stats.admins.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <GearIcon className="h-5 w-5 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            variant="admin"
            className="border-[#AAC7D8]/30 hover:border-[#AAC7D8]/50 hover:shadow-md transition-all"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-[#768A96] uppercase tracking-wide">
                    Verified
                  </p>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {stats.verified.toLocaleString()}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircledIcon className="h-5 w-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Users List */}
        <Card variant="admin" className="p-6">
          <CardHeader className="pb-4 px-0 pt-0">
            <div className="space-y-4">
              <CardTitle className="flex items-center gap-2 text-[#29353C]">
                <PersonIcon className="h-5 w-5" />
                Users
              </CardTitle>
              
              {/* Search and Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#AAC7D8]" />
                  <Input
                    placeholder="Search by name or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pl-10 h-9 border-[#AAC7D8]/30 focus:ring-[#44576D]"
                  />
                </div>
                <Button
                  onClick={handleSearch}
                  size="sm"
                  className="h-9 bg-[#44576D] hover:bg-[#768A96] text-white"
                >
                  Search
                </Button>
                <select
                  value={roleFilter}
                  onChange={(e) => {
                    setRoleFilter(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 px-3 border border-[#AAC7D8]/30 rounded-md text-sm bg-white text-[#29353C] focus:outline-none focus:ring-2 focus:ring-[#44576D]"
                >
                  <option value="all">All Roles</option>
                  <option value="student">Students</option>
                  <option value="company">Companies</option>
                  <option value="admin">Admins</option>
                </select>
                {roleFilter !== "all" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setRoleFilter("all")}
                    className="text-[#768A96] h-9 hover:bg-[#AAC7D8]/10"
                  >
                    Clear filter
                  </Button>
                )}
              </div>

              <CardDescription className="text-sm text-[#768A96]">
                Showing {users.length} of {total.toLocaleString()} users
                {roleFilter !== "all" && ` (filtered by ${roleFilter})`}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-0 pb-0">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
                <p className="text-sm text-zinc-500">Loading users...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <CrossCircledIcon className="h-12 w-12 text-red-400 mx-auto mb-3" />
                <p className="text-red-600 font-medium">{error}</p>
                <Button variant="outline" onClick={fetchUsers} className="mt-4">
                  Try Again
                </Button>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-12">
                <PersonIcon className="h-12 w-12 text-[#AAC7D8]/30 mx-auto mb-3" />
                <p className="text-[#768A96] font-medium">No users found</p>
                <p className="text-sm text-[#AAC7D8]/60 mt-1">
                  {search
                    ? "Try a different search term"
                    : "No users match the current filter"}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="border border-[#AAC7D8]/30 rounded-lg overflow-hidden hover:border-[#AAC7D8]/50 transition-colors"
                  >
                    {/* User Row */}
                    <div
                      className="flex items-center gap-4 p-4 cursor-pointer hover:bg-[#AAC7D8]/5"
                      onClick={() =>
                        setExpandedUserId(
                          expandedUserId === user.id ? null : user.id
                        )
                      }
                    >
                      {/* Avatar */}
                      <div
                        className={`h-12 w-12 rounded-full flex items-center justify-center font-semibold ${getRoleColor(user.role)}`}
                      >
                        {getUserInitials(user)}
                      </div>

                      {/* User Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-zinc-900 truncate">
                            {getUserDisplayName(user)}
                          </span>
                          {user.isVerified && (
                            <CheckCircledIcon className="h-4 w-4 text-green-500 shrink-0" />
                          )}
                        </div>
                        <p className="text-sm text-zinc-500 truncate">
                          {user.email}
                        </p>
                      </div>

                      {/* Role Badge */}
                      <Badge
                        variant={getRoleBadgeVariant(user.role)}
                        className="shrink-0"
                      >
                        {getRoleIcon(user.role)}
                        <span className="ml-1 capitalize">{user.role}</span>
                      </Badge>

                      {/* Plan Badge */}
                      <Badge variant="outline" className="shrink-0 capitalize">
                        {user.plan || "free"}
                      </Badge>

                      {/* Join Date */}
                      <div className="text-sm text-zinc-500 hidden md:block shrink-0">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>

                      {/* Expand Icon */}
                      <div className="text-zinc-400">
                        {expandedUserId === user.id ? (
                          <ChevronUpIcon className="h-5 w-5" />
                        ) : (
                          <ChevronDownIcon className="h-5 w-5" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {expandedUserId === user.id && (
                      <div className="border-t border-zinc-200 bg-zinc-50 p-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {/* User Details */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-zinc-700 text-sm">
                              User Details
                            </h4>
                            <div className="space-y-2 text-sm">
                              <div className="flex items-center gap-2 text-zinc-600">
                                <EnvelopeClosedIcon className="h-4 w-4" />
                                <span className="truncate">{user.email}</span>
                              </div>
                              <div className="flex items-center gap-2 text-zinc-600">
                                <CalendarIcon className="h-4 w-4" />
                                <span>
                                  Joined{" "}
                                  {new Date(user.createdAt).toLocaleDateString(
                                    "en-US",
                                    {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    }
                                  )}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-zinc-600">
                                <IdCardIcon className="h-4 w-4" />
                                <span className="font-mono text-xs bg-zinc-200 px-2 py-0.5 rounded">
                                  {user.id.substring(0, 8)}...
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Verification Status */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-zinc-700 text-sm">
                              Verification
                            </h4>
                            <div className="flex items-center gap-3">
                              <div
                                className={`flex items-center gap-2 px-3 py-2 rounded-lg ${
                                  user.isVerified
                                    ? "bg-green-100 text-green-700"
                                    : "bg-amber-100 text-amber-700"
                                }`}
                              >
                                {user.isVerified ? (
                                  <>
                                    <CheckCircledIcon className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                      Verified
                                    </span>
                                  </>
                                ) : (
                                  <>
                                    <CrossCircledIcon className="h-4 w-4" />
                                    <span className="text-sm font-medium">
                                      Unverified
                                    </span>
                                  </>
                                )}
                              </div>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerificationToggle(
                                    user.id,
                                    user.isVerified
                                  );
                                }}
                              >
                                {user.isVerified ? "Revoke" : "Verify"}
                              </Button>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="space-y-3">
                            <h4 className="font-medium text-zinc-700 text-sm">
                              Change Role
                            </h4>
                            <div className="flex items-center gap-2">
                              <select
                                value={user.role}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  handleRoleChange(user.id, e.target.value);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="flex-1 px-3 py-2 text-sm border border-zinc-200 rounded-md bg-white"
                              >
                                <option value="student">Student</option>
                                <option value="company">Company</option>
                                <option value="admin">Admin</option>
                              </select>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedUser(user);
                              }}
                            >
                              View Full Profile
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between mt-6 pt-4 border-t border-zinc-200 gap-4">
                <p className="text-sm text-zinc-600">
                  Showing page {page} of {totalPages} ({total.toLocaleString()}{" "}
                  total users)
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

        {/* User Detail Dialog */}
        <Dialog
          open={!!selectedUser}
          onOpenChange={() => setSelectedUser(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>User Profile</DialogTitle>
              <DialogDescription>
                Detailed information about this user
              </DialogDescription>
            </DialogHeader>
            {selectedUser && (
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div
                    className={`h-16 w-16 rounded-full flex items-center justify-center text-xl font-bold ${getRoleColor(selectedUser.role)}`}
                  >
                    {getUserInitials(selectedUser)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">
                      {getUserDisplayName(selectedUser)}
                    </h3>
                    <p className="text-zinc-500">{selectedUser.email}</p>
                  </div>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-zinc-500">Role</p>
                    <Badge
                      variant={getRoleBadgeVariant(selectedUser.role)}
                      className="mt-1 capitalize"
                    >
                      {selectedUser.role}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-zinc-500">Plan</p>
                    <Badge variant="outline" className="mt-1 capitalize">
                      {selectedUser.plan || "free"}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-zinc-500">Verified</p>
                    <div className="flex items-center gap-1 mt-1">
                      {selectedUser.isVerified ? (
                        <>
                          <CheckCircledIcon className="h-4 w-4 text-green-500" />
                          <span className="text-green-600">Yes</span>
                        </>
                      ) : (
                        <>
                          <CrossCircledIcon className="h-4 w-4 text-zinc-400" />
                          <span className="text-zinc-500">No</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div>
                    <p className="text-zinc-500">Joined</p>
                    <p className="mt-1 text-zinc-900">
                      {new Date(selectedUser.createdAt).toLocaleDateString(
                        "en-US",
                        {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </p>
                  </div>
                </div>

                <Separator />

                <div>
                  <p className="text-zinc-500 text-sm mb-2">User ID</p>
                  <code className="block w-full p-2 bg-zinc-100 rounded text-xs break-all">
                    {selectedUser.id}
                  </code>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
