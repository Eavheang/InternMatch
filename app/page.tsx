"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import GTALanding from "@/components/landing/gta-landing";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated and redirect to dashboard
    const token = localStorage.getItem("internmatch_token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  return <GTALanding />;
}
