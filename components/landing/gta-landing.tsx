"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useMemo } from "react";

export default function GTALanding() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  // Generate particle positions once to avoid hydration mismatch
  const particles = useMemo(
    () =>
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        width: Math.random() * 4 + 1,
        height: Math.random() * 4 + 1,
        top: Math.random() * 100,
        left: Math.random() * 100,
        animationDuration: Math.random() * 3 + 2,
        animationDelay: Math.random() * 2,
      })),
    []
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-purple-900 via-pink-900 to-orange-900">
      {/* Animated background overlay */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTAtNHYyaDJ2LTJoLTJ6bTItMTZ2Mmgydi0yaC0yem0wLTR2Mmgydi0yaC0yem0tMiA0djJoMnYtMmgtMnptMC00djJoMnYtMmgtMnptLTQgNHYyaDJ2LTJoLTJ6bS00IDB2Mmgydi0yaC0yem0tNCA0djJoMnYtMmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>

      {/* Neon grid lines effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-cyan-500/10 to-transparent pointer-events-none"></div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8">
        {/* Logo/Title */}
        <div className="text-center mb-8 animate-fade-in">
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-tighter mb-4">
            <span className="bg-gradient-to-r from-cyan-400 via-pink-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(236,72,153,0.5)]">
              INTERNMATCH
            </span>
          </h1>
          <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white/90 tracking-wide drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
            YOUR NEXT ADVENTURE STARTS HERE
          </p>
        </div>

        {/* Tagline */}
        <div className="max-w-3xl mx-auto text-center mb-12 animate-slide-up">
          <p className="text-lg sm:text-xl text-white/80 font-medium mb-8 leading-relaxed">
            Find your dream internship in a world of endless opportunities.
            Connect with top companies and unlock your potential.
          </p>
        </div>

        {/* CTA Buttons */}
        <div
          className="flex flex-col sm:flex-row gap-6 mb-16 animate-slide-up"
          style={{ animationDelay: "0.2s" }}
        >
          <button
            onClick={() => router.push("/sign-up")}
            className="group relative px-8 py-4 bg-gradient-to-r from-pink-500 to-orange-500 text-white font-bold text-lg rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(236,72,153,0.8)]"
          >
            <span className="relative z-10">GET STARTED</span>
            <div className="absolute inset-0 bg-gradient-to-r from-pink-600 to-orange-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
          <button
            onClick={() => router.push("/login")}
            className="group relative px-8 py-4 bg-transparent border-2 border-cyan-400 text-cyan-400 font-bold text-lg rounded-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(34,211,238,0.6)] hover:bg-cyan-400/10"
          >
            <span className="relative z-10">SIGN IN</span>
          </button>
        </div>

        {/* Features */}
        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto animate-slide-up"
          style={{ animationDelay: "0.4s" }}
        >
          <div className="bg-black/40 backdrop-blur-sm border border-pink-500/30 rounded-lg p-6 hover:border-pink-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(236,72,153,0.3)]">
            <div className="text-4xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-white mb-2">Find Matches</h3>
            <p className="text-white/70">
              Connect with companies that align with your skills and
              aspirations.
            </p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-6 hover:border-cyan-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]">
            <div className="text-4xl mb-4">💼</div>
            <h3 className="text-xl font-bold text-white mb-2">
              Build Your Profile
            </h3>
            <p className="text-white/70">
              Showcase your achievements and stand out from the crowd.
            </p>
          </div>
          <div className="bg-black/40 backdrop-blur-sm border border-orange-500/30 rounded-lg p-6 hover:border-orange-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)]">
            <div className="text-4xl mb-4">🚀</div>
            <h3 className="text-xl font-bold text-white mb-2">Launch Career</h3>
            <p className="text-white/70">
              Start your journey to professional success today.
            </p>
          </div>
        </div>

        {/* Footer text */}
        <div
          className="mt-16 text-center animate-fade-in"
          style={{ animationDelay: "0.6s" }}
        >
          <p className="text-white/50 text-sm">
            Join thousands of students and companies already on InternMatch
          </p>
        </div>
      </div>

      {/* Animated particles/stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute rounded-full bg-white/30"
            style={{
              width: `${particle.width}px`,
              height: `${particle.height}px`,
              top: `${particle.top}%`,
              left: `${particle.left}%`,
              animation: `twinkle ${particle.animationDuration}s ease-in-out infinite`,
              animationDelay: `${particle.animationDelay}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
