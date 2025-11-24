"use client";

import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useEffect, useRef } from "react";
import Particles from "@/components/ui/particles";

export default function Home() {
  const router = useRouter();
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const { clientX, clientY } = e;
      containerRef.current.style.setProperty("--mouse-x", `${clientX}px`);
      containerRef.current.style.setProperty("--mouse-y", `${clientY}px`);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <main 
      ref={containerRef}
      className="flex min-h-screen flex-col items-center justify-center bg-white text-gray-900 overflow-hidden relative"
    >
      {/* Antigravity-style Particles - Blue glowing dots with lively animation */}
      <div className="absolute inset-0 z-0">
        <Particles
          className="absolute inset-0"
          quantity={400}
          staticity={30}
          ease={30}
          color="#4285f4"
          size={1.2}
          refresh
        />
      </div>

      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md"></div>
          <span className="text-xl font-medium text-gray-900">InternMatch</span>
        </div>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-colors"
        >
          Download
        </button>
      </nav>

      {/* Main Content */}
      <div className="z-10 flex flex-col items-center text-center px-4 max-w-4xl mx-auto">
        {/* Logo/Brand */}
        <div className="mb-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg"></div>
          <span className="text-2xl font-semibold text-gray-900">InternMatch</span>
        </div>

        {/* Hero Title */}
        <h1 className="mb-6 text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
          Experience liftoff
          <br />
          <span className="text-gray-600">with the next-generation</span>
          <br />
          <span className="text-gray-900">internship platform</span>
        </h1>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
          <button
            onClick={() => router.push("/login")}
            className="group flex items-center gap-2 px-6 py-3 text-base font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all hover:scale-105 shadow-lg"
          >
            <span className="flex items-center gap-2">
              Get Started
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </span>
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 text-base font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Explore use cases
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-8 text-gray-500 text-xs">
        © {new Date().getFullYear()} InternMatch Inc.
      </div>
    </main>
  );
}
