"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useDashboard } from "@/components/dashboard/dashboard-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  PlusIcon,
  Cross2Icon,
  EnvelopeClosedIcon,
  MobileIcon,
  GlobeIcon,
  GitHubLogoIcon,
  LinkedInLogoIcon,
  PersonIcon,
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
import { skills as skillsList } from "@/constants/skills";
import { careers as careerList } from "@/constants/career";

// Searchable Dropdown Component
function SearchableMultiSelect({
  items,
  selectedItems,
  onAddItem,
  onRemoveItem,
  placeholder,
}: {
  items: string[];
  selectedItems: string[];
  onAddItem: (item: string) => void;
  onRemoveItem: (item: string) => void;
  placeholder: string;
}) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const filteredItems = useMemo(() => {
    if (query.trim() === "") {
      return [];
    }
    const lowerQuery = query.toLowerCase();
    return items
      .filter(
        (item) =>
          item.toLowerCase().includes(lowerQuery) &&
          !selectedItems.includes(item)
      )
      .slice(0, 10); // Limit to 10 suggestions
  }, [query, items, selectedItems]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleSelect = (item: string) => {
    onAddItem(item);
    setQuery("");
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && query.trim()) {
      e.preventDefault();
      // Allow adding custom items not in list if desired, or select first match
      // Here we allow custom items
      if (!selectedItems.includes(query.trim())) {
        onAddItem(query.trim());
        setQuery("");
        setIsOpen(false);
      }
    }
  };

  return (
    <div className="space-y-4" ref={wrapperRef}>
      <div className="flex flex-wrap gap-2 min-h-[40px]">
        {selectedItems.length === 0 && (
          <p className="text-sm text-zinc-400 italic py-2">
            No items added yet.
          </p>
        )}
        {selectedItems.map((item) => (
          <div
            key={item}
            className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-3 py-1.5 rounded-full text-sm font-medium flex items-center gap-2 transition-all hover:bg-indigo-100"
          >
            {item}
            <button
              onClick={() => onRemoveItem(item)}
              className="text-indigo-400 hover:text-indigo-700"
            >
              <Cross2Icon className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>

      <div className="relative w-full">
        <Input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="border-zinc-300 focus-visible:ring-indigo-500 h-11 w-full"
        />

        {isOpen && query.trim() !== "" && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-zinc-200 rounded-md shadow-lg max-h-60 overflow-auto">
            {filteredItems.length > 0 ? (
              <ul>
                {filteredItems.map((item) => (
                  <li
                    key={item}
                    onClick={() => handleSelect(item)}
                    className="px-4 py-2 hover:bg-indigo-50 cursor-pointer text-sm text-zinc-700 flex items-center justify-between group"
                  >
                    {item}
                    <PlusIcon className="h-4 w-4 text-indigo-400 opacity-0 group-hover:opacity-100" />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-2 text-sm text-zinc-500 italic">
                Press Enter to add &quot;{query}&quot;
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function StudentProfilePage() {
  const { user, profileData } = useDashboard();
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  // Personal Info
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  // Contact Info
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  // Education
  const [university, setUniversity] = useState("");
  const [degree, setDegree] = useState("");
  const [major, setMajor] = useState("");
  const [gpa, setGpa] = useState("");
  const [gradYear, setGradYear] = useState("");

  // Skills
  const [skills, setSkills] = useState<string[]>([]);

  // Career Interests
  const [interests, setInterests] = useState<string[]>([]);

  // Social Links
  const [linkedin, setLinkedin] = useState("");
  const [github, setGithub] = useState("");
  const [portfolio, setPortfolio] = useState("");

  // About Me
  const [aboutMe, setAboutMe] = useState("");

  useEffect(() => {
    if (profileData) {
      setFirstName(profileData.firstName || "");
      setLastName(profileData.lastName || "");
      setEmail(user?.email || "");
      setPhone((profileData.phoneNumber as string) || "");
      setLocation(profileData.location || "");

      setUniversity(profileData.university || "");
      setMajor(profileData.major || "");
      setGradYear(profileData.graduationYear?.toString() || "");
      setGpa((profileData.gpa as number | string | null)?.toString() || "");
      setDegree((profileData.degree as string) || "");

      if (Array.isArray(profileData.skills)) {
        setSkills(profileData.skills);
      }

      if (profileData.careerInterest) {
        const interestStr = profileData.careerInterest as string;
        if (interestStr.includes(",")) {
          setInterests(interestStr.split(",").map((s) => s.trim()));
        } else if (interestStr) {
          setInterests([interestStr]);
        }
      }

      setAboutMe((profileData.aboutMe as string) || "");

      if (profileData.socialLinks) {
        const social = profileData.socialLinks as {
          linkedin?: string;
          github?: string;
          website?: string;
        };
        setLinkedin(social.linkedin || "");
        setGithub(social.github || "");
        setPortfolio(social.website || "");
      }
    }
  }, [profileData, user]);

  const handleAddSkill = (skill: string) => {
    if (skill.trim() && !skills.includes(skill.trim())) {
      setSkills([...skills, skill.trim()]);
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((skill) => skill !== skillToRemove));
  };

  const handleAddInterest = (interest: string) => {
    if (interest.trim() && !interests.includes(interest.trim())) {
      setInterests([...interests, interest.trim()]);
    }
  };

  const handleRemoveInterest = (interestToRemove: string) => {
    setInterests(interests.filter((interest) => interest !== interestToRemove));
  };

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("internmatch_token");
      if (!token) {
        alert("You must be logged in to save changes.");
        return;
      }

      const payload = {
        firstName,
        lastName,
        phoneNumber: phone,
        location,
        university,
        degree,
        major,
        graduationYear: parseInt(gradYear) || null,
        gpa: parseFloat(gpa) || null,
        aboutMe,
        skills,
        careerInterest: interests.join(", "),
        socialLinks: {
          linkedin,
          github,
          website: portfolio,
        },
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
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save profile");
      }

      const _data = await response.json();

      setShowSuccessDialog(true);

      // Optional: Reload to update context if needed
      // window.location.reload();
    } catch (error) {
      console.error("Error saving profile:", error);
      alert(error instanceof Error ? error.message : "Failed to save changes.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-8 space-y-8 pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
            My Profile
          </h1>
          <p className="text-zinc-500 mt-1">
            Manage your personal information and preferences
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

      {/* Personal Info */}
      <Card className="overflow-hidden border-zinc-200 shadow-sm">
        <CardContent className="p-8">
          <div className="flex flex-col sm:flex-row items-start gap-8">
            <div className="flex flex-col items-center gap-4 shrink-0">
              <div className="h-32 w-32 rounded-full bg-zinc-100 border-4 border-white shadow-md flex items-center justify-center text-3xl font-bold text-zinc-400 relative overflow-hidden">
                {firstName && lastName ? (
                  <span>
                    {firstName[0]}
                    {lastName[0]}
                  </span>
                ) : (
                  <PersonIcon className="h-12 w-12 text-zinc-300" />
                )}
              </div>
            </div>

            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
              <div className="space-y-2.5">
                <Label
                  htmlFor="firstName"
                  className="text-zinc-600 font-medium"
                >
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="bg-white border-zinc-300 focus-visible:ring-indigo-500 h-11"
                />
              </div>
              <div className="space-y-2.5">
                <Label htmlFor="lastName" className="text-zinc-600 font-medium">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="bg-white border-zinc-300 focus-visible:ring-indigo-500 h-11"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg font-semibold text-zinc-900">
            Contact Information
          </CardTitle>
          <p className="text-sm text-zinc-500">How can employers reach you?</p>
        </CardHeader>
        <CardContent className="px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Label htmlFor="email" className="text-zinc-600">
              Email
            </Label>
            <div className="relative">
              <EnvelopeClosedIcon className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
              <Input
                id="email"
                value={email}
                disabled
                className="pl-10 bg-zinc-50/50 border-zinc-200 text-zinc-500 h-11"
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="phone" className="text-zinc-600">
              Phone
            </Label>
            <div className="relative">
              <MobileIcon className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
              <Input
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="pl-10 border-zinc-300 focus-visible:ring-indigo-500 h-11"
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>
          <div className="sm:col-span-2 space-y-2.5">
            <Label htmlFor="location" className="text-zinc-600">
              Location
            </Label>
            <div className="relative">
              <GlobeIcon className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="pl-10 border-zinc-300 focus-visible:ring-indigo-500 h-11"
                placeholder="e.g. San Francisco, CA"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Education */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg font-semibold text-zinc-900">
            Education
          </CardTitle>
          <p className="text-sm text-zinc-500">Your academic background</p>
        </CardHeader>
        <CardContent className="px-8 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2.5 sm:col-span-2">
            <Label htmlFor="university" className="text-zinc-600">
              University
            </Label>
            <Input
              id="university"
              value={university}
              onChange={(e) => setUniversity(e.target.value)}
              className="border-zinc-300 focus-visible:ring-indigo-500 h-11"
              placeholder="e.g. Stanford University"
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="degree" className="text-zinc-600">
              Degree
            </Label>
            <Input
              id="degree"
              value={degree}
              onChange={(e) => setDegree(e.target.value)}
              className="border-zinc-300 focus-visible:ring-indigo-500 h-11"
              placeholder="e.g. Bachelor of Science"
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="major" className="text-zinc-600">
              Major
            </Label>
            <Input
              id="major"
              value={major}
              onChange={(e) => setMajor(e.target.value)}
              className="border-zinc-300 focus-visible:ring-indigo-500 h-11"
              placeholder="e.g. Computer Science"
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="gpa" className="text-zinc-600">
              GPA
            </Label>
            <Input
              id="gpa"
              value={gpa}
              onChange={(e) => setGpa(e.target.value)}
              className="border-zinc-300 focus-visible:ring-indigo-500 h-11"
              placeholder="e.g. 3.8"
            />
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="gradYear" className="text-zinc-600">
              Graduation Year
            </Label>
            <Input
              id="gradYear"
              value={gradYear}
              onChange={(e) => setGradYear(e.target.value)}
              className="border-zinc-300 focus-visible:ring-indigo-500 h-11"
              placeholder="e.g. 2025"
            />
          </div>
        </CardContent>
      </Card>

      {/* Skills */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg font-semibold text-zinc-900">
            Skills
          </CardTitle>
          <p className="text-sm text-zinc-500">
            Add your technical and soft skills
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <SearchableMultiSelect
            items={skillsList}
            selectedItems={skills}
            onAddItem={handleAddSkill}
            onRemoveItem={handleRemoveSkill}
            placeholder="Type a skill (e.g. React, Python)..."
          />
        </CardContent>
      </Card>

      {/* Career Interests */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg font-semibold text-zinc-900">
            Career Interests
          </CardTitle>
          <p className="text-sm text-zinc-500">
            What areas are you interested in?
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <SearchableMultiSelect
            items={careerList}
            selectedItems={interests}
            onAddItem={handleAddInterest}
            onRemoveItem={handleRemoveInterest}
            placeholder="Type a career interest (e.g. Web Developer)..."
          />
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg font-semibold text-zinc-900">
            Social Links
          </CardTitle>
          <p className="text-sm text-zinc-500">
            Connect your professional profiles
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8 space-y-4">
          <div className="space-y-2.5">
            <Label htmlFor="linkedin" className="text-zinc-600">
              LinkedIn
            </Label>
            <div className="relative">
              <LinkedInLogoIcon className="absolute left-3 top-3.5 h-4 w-4 text-[#0077b5]" />
              <Input
                id="linkedin"
                value={linkedin}
                onChange={(e) => setLinkedin(e.target.value)}
                className="pl-10 border-zinc-300 focus-visible:ring-indigo-500 h-11"
                placeholder="linkedin.com/in/yourprofile"
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="github" className="text-zinc-600">
              GitHub
            </Label>
            <div className="relative">
              <GitHubLogoIcon className="absolute left-3 top-3.5 h-4 w-4 text-zinc-900" />
              <Input
                id="github"
                value={github}
                onChange={(e) => setGithub(e.target.value)}
                className="pl-10 border-zinc-300 focus-visible:ring-indigo-500 h-11"
                placeholder="github.com/yourusername"
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="portfolio" className="text-zinc-600">
              Portfolio Website
            </Label>
            <div className="relative">
              <GlobeIcon className="absolute left-3 top-3.5 h-4 w-4 text-zinc-400" />
              <Input
                id="portfolio"
                value={portfolio}
                onChange={(e) => setPortfolio(e.target.value)}
                className="pl-10 border-zinc-300 focus-visible:ring-indigo-500 h-11"
                placeholder="yourportfolio.com"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* About Me */}
      <Card className="border-zinc-200 shadow-sm">
        <CardHeader className="px-8 pt-8 pb-4">
          <CardTitle className="text-lg font-semibold text-zinc-900">
            About Me
          </CardTitle>
          <p className="text-sm text-zinc-500">
            Write a brief introduction about yourself
          </p>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          <textarea
            className="flex min-h-[150px] w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-sm ring-offset-white placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 resize-y"
            placeholder="Passionate computer science student with a strong interest in software engineering and AI..."
            value={aboutMe}
            onChange={(e) => setAboutMe(e.target.value)}
          />
        </CardContent>
      </Card>

      <AlertDialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Success</AlertDialogTitle>
            <AlertDialogDescription>
              Your profile has been updated successfully.
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
