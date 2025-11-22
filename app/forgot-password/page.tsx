"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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

type ForgotPasswordValues = {
  email: string;
};

type ResetPasswordValues = {
  code: string;
  newPassword: string;
  confirmPassword: string;
};

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<"email" | "reset">("email");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const emailForm = useForm<ForgotPasswordValues>({
    defaultValues: {
      email: "",
    },
  });

  const resetForm = useForm<ResetPasswordValues>({
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmitEmail = async (values: ForgotPasswordValues) => {
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: values.email,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset code");
      }

      setEmail(values.email);
      setSuccess("Check your email for a verification code");
      setStep("reset");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  const onSubmitReset = async (values: ResetPasswordValues) => {
    if (values.newPassword !== values.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code: values.code,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to reset password");
      }

      setSuccess("Password reset successfully! Redirecting to login...");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "email") {
    return (
      <AuthShell
        title="Forgot Password"
        subtitle="Enter your email to receive a verification code"
        helperText="Remember your password?"
        helperHref="/login"
        helperCta="Sign in"
      >
        <div className="space-y-6">
          <Form {...emailForm}>
            <form
              className="space-y-5"
              onSubmit={emailForm.handleSubmit(onSubmitEmail)}
            >
              <FormField
                control={emailForm.control}
                name="email"
                rules={{
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="you@example.com"
                        type="email"
                        {...field}
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
                <p className="text-sm font-medium text-emerald-500">
                  {success}
                </p>
              )}
              <Button
                type="submit"
                className="w-full rounded-2xl text-base"
                disabled={submitting}
              >
                {submitting ? "Sending..." : "Send Reset Code"}
              </Button>
            </form>
          </Form>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell
      title="Reset Password"
      subtitle="Enter the verification code sent to your email"
      helperText="Didn't receive a code?"
      helperHref="#"
      helperCta="Resend"
      onHelperClick={() => setStep("email")}
    >
      <div className="space-y-6">
        <Form {...resetForm}>
          <form
            className="space-y-5"
            onSubmit={resetForm.handleSubmit(onSubmitReset)}
          >
            <FormField
              control={resetForm.control}
              name="code"
              rules={{
                required: "Verification code is required",
                pattern: {
                  value: /^\d{6}$/,
                  message: "Code must be 6 digits",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="123456"
                      type="text"
                      maxLength={6}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={resetForm.control}
              name="newPassword"
              rules={{
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>New Password</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={resetForm.control}
              name="confirmPassword"
              rules={{
                required: "Please confirm your password",
              }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirm Password</FormLabel>
                  <FormControl>
                    <Input placeholder="••••••••" type="password" {...field} />
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
            <Button
              type="submit"
              className="w-full rounded-2xl text-base"
              disabled={submitting}
            >
              {submitting ? "Resetting..." : "Reset Password"}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <Link
            href="/login"
            className="text-sm text-indigo-600 hover:text-indigo-500"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </AuthShell>
  );
}
