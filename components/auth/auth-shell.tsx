"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type AuthShellProps = {
  title: string;
  subtitle: string;
  helperText: string;
  helperHref: string;
  helperCta: string;
  children: ReactNode;
  onHelperClick?: () => void;
};

export function AuthShell({
  title,
  subtitle,
  helperText,
  helperHref,
  helperCta,
  children,
  onHelperClick,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-50 via-white to-white px-4 py-12">
      <Card className="w-full max-w-md p-10">
        <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
          <BagIcon className="h-8 w-8" />
        </div>
        <CardHeader className="mb-8">
          <p className="text-sm font-medium uppercase tracking-[0.3em] text-indigo-500">
            InternMatch
          </p>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
        <CardFooter className="mt-10">
          {helperText}{" "}
          {onHelperClick ? (
            <button
              onClick={onHelperClick}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              {helperCta}
            </button>
          ) : (
            <Link href={helperHref} className="font-semibold text-indigo-600">
              {helperCta}
            </Link>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M7 7V6a5 5 0 0 1 10 0v1" />
      <rect width="18" height="13" x="3" y="7" rx="3" />
      <path d="M10 12h4" />
    </svg>
  );
}
