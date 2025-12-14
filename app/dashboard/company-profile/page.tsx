"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  EnvelopeClosedIcon,
  MobileIcon,
  GlobeIcon,
} from "@radix-ui/react-icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Building2, MapPin, Phone, Upload, Loader2 } from "lucide-react";

export default function CompanyProfilePage() {
  const { user, profileData } = useDashboard();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Company Info
  const [companyName, setCompanyName] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [website, setWebsite] = useState("");
  const [description, setDescription] = useState("");
  const [companyCulture, setCompanyCulture] = useState("");

  // Location Info
  const [location, setLocation] = useState("");
  const [headquarters, setHeadquarters] = useState("");
  const [otherLocations, setOtherLocations] = useState("");

  // Contact Info
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");

  // Program Info
  const [hasInternshipProgram, setHasInternshipProgram] = useState(false);

  // Company Logo
  const [companyLogo, setCompanyLogo] = useState("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (profileData) {
      setCompanyName(
        typeof profileData.companyName === "string"
          ? profileData.companyName
          : ""
      );
      setIndustry(
        typeof profileData.industry === "string" ? profileData.industry : ""
      );
      setCompanySize(
        typeof profileData.companySize === "string"
          ? profileData.companySize
          : ""
      );
      setWebsite(
        typeof profileData.website === "string" ? profileData.website : ""
      );
      setCompanyLogo(
        typeof profileData.companyLogo === "string"
          ? profileData.companyLogo
          : ""
      );
      setDescription(
        typeof profileData.description === "string"
          ? profileData.description
          : ""
      );
      setCompanyCulture(
        typeof profileData.companyCulture === "string"
          ? profileData.companyCulture
          : ""
      );

      setLocation(
        typeof profileData.location === "string" ? profileData.location : ""
      );
      setHeadquarters(
        typeof profileData.headquarters === "string"
          ? profileData.headquarters
          : ""
      );
      setOtherLocations(
        typeof profileData.otherLocations === "string"
          ? profileData.otherLocations
          : ""
      );

      setContactName(
        typeof profileData.contactName === "string"
          ? profileData.contactName
          : ""
      );
      setContactEmail(
        typeof profileData.contactEmail === "string"
          ? profileData.contactEmail
          : user?.email || ""
      );
      setContactPhone(
        typeof profileData.contactPhone === "string"
          ? profileData.contactPhone
          : ""
      );

      setHasInternshipProgram(Boolean(profileData.hasInternshipProgram));
    }
  }, [profileData, user]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch("/api/company/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          companyName,
          industry,
          companySize,
          website,
          companyLogo,
          description,
          companyCulture,
          location,
          headquarters,
          otherLocations,
          contactName,
          contactEmail,
          contactPhone,
          hasInternshipProgram,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile");
      }

      setShowSuccessDialog(true);
      // Refresh the page to get updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update profile"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      toast.error("Only JPG, PNG, and WebP images are allowed");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be less than 5MB");
      return;
    }

    setIsUploadingLogo(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        toast.error("Authentication required");
        return;
      }

      const response = await fetch("/api/company/logo", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to upload logo");
      }

      setCompanyLogo(data.logoUrl);
      toast.success("Logo uploaded successfully!");
    } catch (error) {
      console.error("Logo upload error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to upload logo"
      );
    } finally {
      setIsUploadingLogo(false);
      // Reset file input
      if (logoInputRef.current) {
        logoInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            Company Profile
          </h1>
          <p className="text-zinc-500 mt-1">
            Manage your company information and settings
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="bg-indigo-600 hover:bg-indigo-700 transition-all shadow-sm"
        >
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Company Information */}
      <Card className="overflow-hidden border-zinc-200 shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="h-32 w-32 rounded-full bg-zinc-100 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-zinc-400 relative overflow-hidden">
                {companyLogo ? (
                  <Image
                    src={companyLogo}
                    alt="Company logo"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : companyName ? (
                  <span>
                    {companyName
                      .split(" ")
                      .map((word) => word[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
                  </span>
                ) : (
                  <Building2 className="h-12 w-12 text-zinc-300" />
                )}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <div className="space-y-2.5">
                <Label
                  htmlFor="companyName"
                  className="text-zinc-600 font-medium"
                >
                  Company Name *
                </Label>
                <Input
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-white border-zinc-300 focus-visible:ring-indigo-500 h-11"
                  placeholder="Enter company name"
                  required
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="industry" className="text-zinc-600 font-medium">
                  Industry
                </Label>
                <select
                  id="industry"
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full h-11 px-3 py-2 bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                >
                  <option value="">Select Industry</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Consulting">Consulting</option>
                  <option value="Media">Media</option>
                  <option value="Non-profit">Non-profit</option>
                  <option value="Government">Government</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Details */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg font-semibold text-zinc-900">
            Company Details
          </CardTitle>
          <p className="text-sm text-zinc-500">
            Basic information about your company
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Label htmlFor="companySize" className="text-zinc-600">
              Company Size
            </Label>
            <select
              id="companySize"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="w-full h-11 px-3 py-2 bg-white border border-zinc-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select Size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="website" className="text-zinc-600">
              Website
            </Label>
            <div className="relative">
              <GlobeIcon className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
              <Input
                id="website"
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="pl-10 border-zinc-300 focus-visible:ring-indigo-500 h-11"
                placeholder="https://www.company.com"
              />
            </div>
          </div>
          <div className="space-y-2.5 sm:col-span-2">
            <Label className="text-zinc-600">
              Company Logo
            </Label>
            <div className="flex items-center gap-6">
              {/* Logo Preview */}
              <div className="h-24 w-24 rounded-lg border-2 border-dashed border-zinc-300 bg-zinc-50 flex items-center justify-center overflow-hidden relative">
                {companyLogo ? (
                  <Image
                    src={companyLogo}
                    alt="Company logo"
                    fill
                    className="object-contain p-2"
                    unoptimized
                  />
                ) : (
                  <Building2 className="h-8 w-8 text-zinc-300" />
                )}
              </div>
              {/* Upload Controls */}
              <div className="flex flex-col gap-2">
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="h-10"
                  onClick={() => logoInputRef.current?.click()}
                  disabled={isUploadingLogo}
                >
                  {isUploadingLogo ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      {companyLogo ? "Change Logo" : "Upload Logo"}
                    </>
                  )}
                </Button>
                <p className="text-xs text-zinc-500">
                  JPG, PNG, or WebP. Max 5MB.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location Information */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-600" />
            Location Information
          </CardTitle>
          <p className="text-sm text-zinc-500">
            Where is your company located?
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Label htmlFor="headquarters" className="text-zinc-600">
              Headquarters
            </Label>
            <Input
              id="headquarters"
              value={headquarters}
              onChange={(e) => setHeadquarters(e.target.value)}
              className="border-zinc-300 focus-visible:ring-indigo-500 h-11"
              placeholder="Main office location"
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="location" className="text-zinc-600">
              Primary Location
            </Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="border-zinc-300 focus-visible:ring-indigo-500 h-11"
              placeholder="City, State/Country"
            />
          </div>
          <div className="sm:col-span-2 space-y-2.5">
            <Label htmlFor="otherLocations" className="text-zinc-600">
              Other Locations
            </Label>
            <Input
              id="otherLocations"
              value={otherLocations}
              onChange={(e) => setOtherLocations(e.target.value)}
              className="border-zinc-300 focus-visible:ring-indigo-500 h-11"
              placeholder="Additional office locations (comma-separated)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg font-semibold text-zinc-900 flex items-center gap-2">
            <Phone className="w-5 h-5 text-indigo-600" />
            Contact Information
          </CardTitle>
          <p className="text-sm text-zinc-500">How can candidates reach you?</p>
        </CardHeader>
        <CardContent className="px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Label htmlFor="contactName" className="text-zinc-600">
              Contact Person Name
            </Label>
            <Input
              id="contactName"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="border-zinc-300 focus-visible:ring-indigo-500 h-11"
              placeholder="HR Manager or recruiter name"
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="contactEmail" className="text-zinc-600">
              Contact Email
            </Label>
            <div className="relative">
              <EnvelopeClosedIcon className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
              <Input
                id="contactEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="pl-10 border-zinc-300 focus-visible:ring-indigo-500 h-11"
                placeholder="hr@company.com"
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="contactPhone" className="text-zinc-600">
              Contact Phone
            </Label>
            <div className="relative">
              <MobileIcon className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
              <Input
                id="contactPhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="pl-10 border-zinc-300 focus-visible:ring-indigo-500 h-11"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Description */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg font-semibold text-zinc-900">
            Company Description
          </CardTitle>
          <p className="text-sm text-zinc-500">
            Tell candidates about your company
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-6">
          <div className="space-y-2.5">
            <Label htmlFor="description" className="text-zinc-600">
              About Your Company
            </Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[120px] w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              placeholder="Describe your company, mission, and values..."
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="companyCulture" className="text-zinc-600">
              Company Culture
            </Label>
            <textarea
              id="companyCulture"
              value={companyCulture}
              onChange={(e) => setCompanyCulture(e.target.value)}
              className="flex min-h-[100px] w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
              placeholder="Describe your company culture, work environment, and team dynamics..."
            />
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              Your company profile has been updated successfully.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setShowSuccessDialog(false)}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
