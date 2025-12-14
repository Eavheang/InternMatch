"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CodeIcon,
  CopyIcon,
  LockClosedIcon,
  CheckIcon,
  InfoCircledIcon,
} from "@radix-ui/react-icons";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
  const [copiedSQL, setCopiedSQL] = useState(false);

  const copySQL = () => {
    navigator.clipboard.writeText(
      "UPDATE users SET role = 'admin' WHERE email = 'your-email@example.com';"
    );
    setCopiedSQL(true);
    setTimeout(() => setCopiedSQL(false), 2000);
  };

  const systemInfo = [
    { label: "Platform", value: "InternMatch", badge: null },
    { label: "Version", value: "1.0.0", badge: "stable" },
    { label: "Framework", value: "Next.js 16", badge: null },
    { label: "Database", value: "PostgreSQL", badge: "drizzle" },
    {
      label: "Environment",
      value: process.env.NODE_ENV || "development",
      badge: "env",
    },
  ];

  const adminSteps = [
    {
      number: 1,
      title: "Create User Account",
      description: "Sign up a new user account through the signup page",
      icon: "👤",
    },
    {
      number: 2,
      title: "Access Database",
      description: "Connect to your database using your preferred method",
      icon: "🗄️",
    },
    {
      number: 3,
      title: "Run SQL Command",
      description: "Execute the SQL command below to grant admin privileges",
      icon: "⚙️",
    },
  ];

  return (
    <div className="min-h-screen bg-[#DFEBF6] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-zinc-900">Settings</h1>
          </div>
        </div>

        {/* System Information Card */}
        <Card className="border-zinc-200 shadow-sm hover:shadow-md transition-shadow mt-8 p-6">
          <CardHeader className="pb-6 pt-0 px-0">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                <CodeIcon className="h-5 w-5 text-indigo-600" />
              </div>
              <CardTitle className="text-lg mb-0">System Information</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 px-0 pb-0">
            <div className="grid gap-4">
              {systemInfo.map((item, idx) => (
                <div key={item.label}>
                  <div className="flex items-center justify-between py-3 px-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-zinc-700">
                        {item.label}
                      </p>
                      <p className="text-xs text-zinc-500">System details</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <code className="px-3 py-1.5 rounded-lg bg-zinc-100 text-sm font-mono text-zinc-900">
                        {item.value}
                      </code>
                      {item.badge && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs capitalize font-medium",
                            item.badge === "env"
                              ? item.value === "production"
                                ? "border-green-200 bg-green-50 text-green-700"
                                : "border-amber-200 bg-amber-50 text-amber-700"
                              : item.badge === "stable"
                                ? "border-blue-200 bg-blue-50 text-blue-700"
                                : "border-zinc-200"
                          )}
                        >
                          {item.badge === "env" ? item.value : item.badge}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {idx < systemInfo.length - 1 && (
                    <Separator className="bg-zinc-100" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Create Admin Account Card */}
        <Card className="border-zinc-200 shadow-sm hover:shadow-md transition-shadow mt-8 p-6">
          <CardHeader className="pb-6 pt-0 px-0">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center shrink-0">
                <LockClosedIcon className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg mb-0">
                Create Admin Account
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 px-0 pb-0">
            {/* Steps */}
            <div className="space-y-4">
              {adminSteps.map((step, idx) => (
                <div key={step.number} className="relative">
                  <div className="flex gap-4 px-4">
                    <div className="relative flex flex-col items-center">
                      <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 font-semibold text-indigo-600">
                        <span>{step.icon}</span>
                      </div>
                      {idx < adminSteps.length - 1 && (
                        <div className="absolute top-10 bottom-0 left-1/2 transform -translate-x-1/2 w-0.5 bg-zinc-200"></div>
                      )}
                    </div>
                    <div className="pb-4 pt-1 flex-1">
                      <h4 className="font-semibold text-zinc-900">
                        {step.title}
                      </h4>
                      <p className="text-sm text-zinc-600 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator className="bg-zinc-200" />

            {/* SQL Command Section */}
            <div className="space-y-3 px-4 pb-4">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-900">
                <InfoCircledIcon className="h-4 w-4 text-indigo-600" />
                SQL Command
              </div>
              <div className="relative">
                <pre className="p-4 bg-zinc-900 text-zinc-100 rounded-lg text-sm font-mono overflow-x-auto border border-zinc-800">
                  <code>
                    {`UPDATE users SET role = 'admin'`}
                    {"\n"}
                    {`WHERE email = 'your-email@example.com';`}
                  </code>
                </pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className={cn(
                    "absolute top-3 right-3 h-9 px-2 gap-2 transition-all",
                    copiedSQL
                      ? "bg-green-100 text-green-700 hover:bg-green-200"
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                  onClick={copySQL}
                >
                  {copiedSQL ? (
                    <>
                      <CheckIcon className="h-4 w-4" />
                      <span className="text-xs font-medium">Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="h-4 w-4" />
                      <span className="text-xs font-medium">Copy</span>
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200 mx-2">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Note:</span> Replace
                <code className="mx-1 px-2 py-0.5 bg-blue-100 rounded text-xs font-mono">
                  your-email@example.com
                </code>
                with your actual email address before executing the command.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
