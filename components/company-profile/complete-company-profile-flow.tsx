"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CompanyProfileData } from "./types";
import { CompanyStep1Info } from "./steps/step1-company-info";
import { CompanyStep2Location } from "./steps/step2-location-info";
import { CompanyStep3About } from "./steps/step3-about-company";
import { CompanyStep4Contact } from "./steps/step4-contact-details";

const TOTAL_STEPS = 4;

const STEP_METADATA = [
  {
    title: "Company Information",
    description: "Basic details about your organization",
    Icon: BuildingIcon,
  },
  {
    title: "Location Information",
    description: "Where is your company located?",
    Icon: LocationIcon,
  },
  {
    title: "About Your Company",
    description: "Help students understand your culture",
    Icon: PeopleIcon,
  },
  {
    title: "Contact & Internship Details",
    description: "Final steps to complete your profile",
    Icon: BriefcaseIcon,
  },
];

const defaultData: CompanyProfileData = {
  companyName: "",
  industry: "",
  companySize: "",
  website: "",
  companyLogo: "",
  headquarters: "",
  otherLocations: [],
  companyDescription: "",
  companyCulture: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
  hasInternshipProgram: false,
};

type CompanyProfileRecord = Partial<
  Omit<CompanyProfileData, "otherLocations"> & {
    otherLocations?: string | string[] | null;
  }
> & {
  location?: string | null;
};

export function CompleteCompanyProfileFlow() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<CompanyProfileData>(defaultData);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("internmatch_token");
        if (!token) {
          // Layout already handles this, but just in case
          return;
        }

        const response = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Only proceed if response is OK - don't redirect on errors (layout handles that)
        if (!response.ok) {
          // Only redirect on 401 (unauthorized) - other errors are handled by layout
          if (response.status === 401) {
            localStorage.removeItem("internmatch_token");
            router.push("/login");
            return;
          }
          // For other errors, just log and return - layout will handle redirect if needed
          console.warn("Failed to load company profile:", response.status);
          return;
        }

        const data = await response.json();
        const user = data.data;
        const profile = user?.profile;

        if (user?.role !== "company") {
          router.push("/dashboard");
          return;
        }

        if (isProfileComplete(profile)) {
          router.push("/dashboard");
          return;
        }

        if (profile) {
          setFormData({
            companyName: profile.companyName || "",
            industry: profile.industry || "",
            companySize: profile.companySize || "",
            website: profile.website || "",
            companyLogo: profile.companyLogo || "",
            headquarters: profile.headquarters || profile.location || "",
            otherLocations: normalizeOtherLocations(profile.otherLocations),
            companyDescription: profile.description || "",
            companyCulture: profile.companyCulture || "",
            contactName: profile.contactName || "",
            contactEmail: profile.contactEmail || "",
            contactPhone: profile.contactPhone || "",
            hasInternshipProgram: profile.hasInternshipProgram ?? false,
          });
        }
      } catch (err) {
        console.error("Error loading company profile:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Something went wrong. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const updateFormData = (values: Partial<CompanyProfileData>) => {
    setFormData((prev) => ({ ...prev, ...values }));
  };

  const handleNext = () => {
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const payload = {
        companyName: formData.companyName,
        industry: formData.industry,
        companySize: formData.companySize,
        website: formData.website,
        companyLogo: formData.companyLogo,
        headquarters: formData.headquarters,
        otherLocations: formData.otherLocations.join("\n"),
        description: formData.companyDescription,
        companyCulture: formData.companyCulture,
        contactName: formData.contactName,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        hasInternshipProgram: formData.hasInternshipProgram,
      };

      const response = await fetch("/api/auth/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save company profile.");
      }

      await response.json();

      // No new token needed - existing token remains valid since token payload doesn't change
      // Profile data is stored in database, not in token
      console.log(
        "Company profile completed successfully, redirecting to dashboard"
      );
      setTimeout(() => {
        router.push("/dashboard");
      }, 100);
    } catch (err) {
      console.error("Error saving company profile:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to save company profile. Please try again.";

      // Only redirect to login if it's an authentication error
      if (
        err instanceof Error &&
        (errorMessage.includes("401") || errorMessage.includes("unauthorized"))
      ) {
        localStorage.removeItem("internmatch_token");
        alert("Your session has expired. Please log in again.");
        router.push("/login");
      } else {
        // Show error but stay on page so user can try again
        setError(errorMessage);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const progress = useMemo(
    () => (currentStep / TOTAL_STEPS) * 100,
    [currentStep]
  );

  const currentStepMeta = STEP_METADATA[currentStep - 1];
  const ActiveIcon = currentStepMeta.Icon;

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <p className="text-sm text-zinc-500">Loading your company profile...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl px-4 py-12">
      <div className="mx-auto flex flex-col gap-6">
        <div className="rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-500">
                Set Up Your Company Profile
              </p>
              <h1 className="mt-2 text-3xl font-bold text-zinc-900">
                Let&apos;s get your account ready to find top talent
              </h1>
            </div>
            <span className="inline-flex items-center rounded-full bg-indigo-50 px-4 py-1 text-sm font-semibold text-indigo-600">
              Step {currentStep} of {TOTAL_STEPS}
            </span>
          </div>
          <div className="mt-6 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <ActiveIcon className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-zinc-900">
                {currentStepMeta.title}
              </h2>
              <p className="text-sm text-zinc-600">
                {currentStepMeta.description}
              </p>
            </div>
          </div>
          <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          {error && (
            <p className="mt-4 text-sm font-medium text-rose-500">{error}</p>
          )}
        </div>

        {currentStep === 1 && (
          <CompanyStep1Info
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
          />
        )}
        {currentStep === 2 && (
          <CompanyStep2Location
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        {currentStep === 3 && (
          <CompanyStep3About
            data={formData}
            onUpdate={updateFormData}
            onNext={handleNext}
            onPrevious={handlePrevious}
          />
        )}
        {currentStep === 4 && (
          <CompanyStep4Contact
            data={formData}
            onUpdate={updateFormData}
            onPrevious={handlePrevious}
            onSubmit={handleSubmit}
            isSubmitting={submitting}
          />
        )}
      </div>
    </div>
  );
}

function normalizeOtherLocations(
  value: CompanyProfileRecord["otherLocations"]
) {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value.map((item) => item.trim()).filter(Boolean);
  }
  return value
    .split("\n")
    .map((item: string) => item.trim())
    .filter(Boolean);
}

function isProfileComplete(profile: CompanyProfileRecord | null | undefined) {
  if (!profile) return false;
  return (
    !!profile.companyName &&
    !!profile.industry &&
    !!profile.companySize &&
    !!profile.website &&
    !!(profile.headquarters || profile.location) &&
    !!profile.companyDescription &&
    !!profile.contactName &&
    !!profile.contactEmail
  );
}

function BuildingIcon({ className }: { className?: string }) {
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
      <path d="M3 21h18" />
      <path d="M9 8h1" />
      <path d="M9 12h1" />
      <path d="M9 16h1" />
      <path d="M14 8h1" />
      <path d="M14 12h1" />
      <path d="M14 16h1" />
      <path d="M7 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16" />
    </svg>
  );
}

function LocationIcon({ className }: { className?: string }) {
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
      <path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" />
      <path d="M12 2C8 2 5 5 5 9c0 5 7 13 7 13s7-8 7-13c0-4-3-7-7-7z" />
    </svg>
  );
}

function PeopleIcon({ className }: { className?: string }) {
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
      <path d="M9 17a3.5 3.5 0 0 1-7 0" />
      <path d="M22 17a3.5 3.5 0 0 1-7 0" />
      <path d="M14 7a2 2 0 0 1 4 0" />
      <path d="M2 7a2 2 0 0 1 4 0" />
      <path d="M18 22v-5a2 2 0 0 0-2-2h-8a2 2 0 0 0-2 2v5" />
      <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
    </svg>
  );
}

function BriefcaseIcon({ className }: { className?: string }) {
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
      <path d="M3 7h18" />
      <path d="M10 12h4" />
      <path d="M12 7V5a2 2 0 0 0-2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M5 7h14a2 2 0 0 1 2 2v7a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a2 2 0 0 1 2-2" />
    </svg>
  );
}
