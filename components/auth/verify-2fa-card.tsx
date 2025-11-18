"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

type Verify2FAValues = {
  email: string;
  verificationCode: string;
};

export function Verify2FACard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState<string | null>(null);

  const emailParam = searchParams.get("email") || "";

  const form = useForm<Verify2FAValues>({
    defaultValues: {
      email: emailParam,
      verificationCode: "",
    },
  });

  useEffect(() => {
    // Update email if searchParams change
    const newEmailParam = searchParams.get("email");
    if (newEmailParam && newEmailParam !== form.getValues("email")) {
      form.setValue("email", newEmailParam);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onSubmit = async (values: Verify2FAValues) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
          verificationCode: values.verificationCode,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to verify code");
      }

      setSuccess("Email verified successfully!");

      // Store token if provided
      if (data.token) {
        localStorage.setItem("internmatch_token", data.token);
      }

      // Redirect based on user role
      setTimeout(() => {
        if (data.user?.role === "company") {
          router.push("/company-profile");
        } else {
          router.push("/complete-profile");
        }
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResendCode = async () => {
    const email = form.getValues("email");
    if (!email) {
      setError("Please enter your email address first");
      return;
    }

    setResending(true);
    setError(null);
    setResendSuccess(null);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Unable to resend verification code");
      }

      setResendSuccess("Verification code has been resent to your email!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell
      title="Verify Your Email"
      subtitle="Enter the verification code sent to your email address"
      helperText="Didn't receive a code?"
      helperHref="/sign-up"
      helperCta="Sign up again"
    >
      <div className="space-y-6">
        <Form {...form}>
          <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="email"
              rules={{ required: "Email is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="you@company.com"
                      type="email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="verificationCode"
              rules={{ required: "Verification code is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter 6-character code"
                      type="text"
                      maxLength={6}
                      {...field}
                      onChange={(e) => {
                        // Allow letters and numbers, convert to uppercase
                        const value = e.target.value
                          .replace(/[^A-Za-z0-9]/g, "")
                          .toUpperCase();
                        field.onChange(value);
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {error && (
              <p className="text-sm font-medium text-rose-500">{error}</p>
            )}
            {success && (
              <p className="text-sm font-medium text-emerald-500">{success}</p>
            )}
            {resendSuccess && (
              <p className="text-sm font-medium text-emerald-500">
                {resendSuccess}
              </p>
            )}
            <div className="space-y-3">
              <Button
                type="submit"
                className="w-full rounded-2xl text-base"
                disabled={submitting || resending}
              >
                {submitting ? "Verifying..." : "Verify Email"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResendCode}
                className="w-full rounded-2xl text-base"
                disabled={submitting || resending}
              >
                {resending ? "Sending..." : "Resend Verification Code"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </AuthShell>
  );
}
