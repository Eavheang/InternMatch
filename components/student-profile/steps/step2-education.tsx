"use client";

import { useForm } from "react-hook-form";
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

type EducationData = {
  university: string;
  major: string;
  graduationYear: string;
  gpa: string;
  location: string;
};

type Step2EducationProps = {
  data: EducationData;
  onUpdate: (data: Partial<EducationData>) => void;
  onNext: () => void;
};

export function Step2Education({
  data,
  onUpdate,
  onNext,
}: Step2EducationProps) {
  const form = useForm<EducationData>({
    defaultValues: {
      university: data.university || "",
      major: data.major || "",
      graduationYear: data.graduationYear || "",
      gpa: data.gpa || "",
      location: data.location || "",
    },
  });

  const onSubmit = (values: EducationData) => {
    onUpdate(values);
    onNext();
  };

  return (
    <div className="rounded-2xl bg-white p-8 shadow-sm">
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
          <GraduationIcon className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-zinc-900">Education</h2>
          <p className="text-sm text-zinc-600">Your academic background</p>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="university"
            rules={{ required: "University is required" }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>University *</FormLabel>
                <FormControl>
                  <Input placeholder="State University" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="major"
              rules={{ required: "Major is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Major *</FormLabel>
                  <FormControl>
                    <Input placeholder="Computer Science" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="graduationYear"
              rules={{ required: "Graduation year is required" }}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Graduation Year *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="2026"
                      type="number"
                      min="2000"
                      max="2100"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="gpa"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GPA (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="3.8"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4.0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g. San Francisco, CA"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex justify-end pt-4">
            <Button type="submit" className="rounded-2xl">
              Next
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function GraduationIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M5 12h14" />
      <path d="M12 5l7 7-7 7" />
    </svg>
  );
}
