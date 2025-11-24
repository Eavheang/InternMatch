"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Briefcase, Users, Sparkles, Target, FileText, Zap, TrendingUp, Shield, Clock, Star } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Particles from "@/components/ui/particles";

export default function Home() {
  const router = useRouter();
  const containerRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({});

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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
          }
        });
      },
      { threshold: 0.1 }
    );

    const elements = document.querySelectorAll("[data-animate]");
    elements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main
      ref={containerRef}
      className="flex min-h-screen flex-col bg-white text-gray-900 overflow-x-hidden relative"
    >
      {/* Antigravity-style Particles - Full Page Coverage */}
      <div className="fixed inset-0 z-0 pointer-events-none" style={{ height: '100%', minHeight: '100vh' }}>
        <div className="absolute inset-0 w-full" style={{ minHeight: '100%' }}>
          <Particles
            className="absolute inset-0 w-full h-full"
            quantity={400}
            staticity={30}
            ease={30}
            color="#4285f4"
            size={1.2}
            refresh
          />
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Briefcase className="h-4 w-4 text-white" />
          </div>
          <span className="text-xl font-semibold text-gray-900">InternMatch</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={() => scrollToSection("pricing")}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Pricing
          </button>
          <button
            onClick={() => router.push("/login")}
            className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all hover:scale-105"
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20 pb-32">
        <div className="z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto">
          <div
            data-animate
            id="hero-title"
            className={`mb-6 transition-all duration-1000 ${
              isVisible["hero-title"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h1 className="mb-6 text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-gray-900 leading-tight">
              Experience liftoff
              <br />
              <span className="text-gray-600">with the next-generation</span>
              <br />
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                internship platform
              </span>
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI-powered tools that connect talented students with innovative companies.
              Transform your career journey or streamline your recruitment process.
            </p>
          </div>

          <div
            data-animate
            id="hero-buttons"
            className={`flex flex-col sm:flex-row items-center gap-4 mt-8 transition-all duration-1000 delay-300 ${
              isVisible["hero-buttons"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <button
              onClick={() => router.push("/login")}
              className="group flex items-center gap-2 px-8 py-4 text-base font-medium text-white bg-gray-900 rounded-full hover:bg-gray-800 transition-all hover:scale-105 shadow-lg hover:shadow-xl"
            >
              <span className="flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </span>
            </button>
            <button
              onClick={() => scrollToSection("features")}
              className="px-8 py-4 text-base font-medium text-gray-700 hover:text-gray-900 transition-colors border border-gray-300 rounded-full hover:border-gray-400"
            >
              Learn More
            </button>
          </div>
        </div>
      </section>

      {/* Features Section - Why Students */}
      <section
        id="features"
        className="relative py-24 px-4 bg-gradient-to-b from-white to-gray-50"
      >
        <div className="max-w-7xl mx-auto">
          <div
            data-animate
            id="students-section"
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["students-section"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-full mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-600">For Students</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Launch Your Career with AI-Powered Tools
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to find the perfect internship and land your dream role.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Target,
                title: "Smart Role Suggestions",
                description: "AI analyzes your profile and suggests perfect internship matches tailored to your skills and interests.",
                color: "from-blue-500 to-blue-600",
              },
              {
                icon: FileText,
                title: "ATS-Optimized Resumes",
                description: "Get your resume analyzed and optimized to pass Applicant Tracking Systems with flying colors.",
                color: "from-purple-500 to-purple-600",
              },
              {
                icon: Sparkles,
                title: "Interview Preparation",
                description: "Practice with AI-generated interview questions and get personalized feedback to ace your interviews.",
                color: "from-pink-500 to-pink-600",
              },
              {
                icon: Zap,
                title: "Resume Builder",
                description: "Create professional, ATS-friendly resumes in minutes with our intelligent resume builder.",
                color: "from-orange-500 to-orange-600",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                data-animate
                id={`student-feature-${index}`}
                className={`p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-500 hover:-translate-y-2 ${
                  isVisible[`student-feature-${index}`] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 100}ms` }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Why Companies */}
      <section className="relative py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div
            data-animate
            id="companies-section"
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["companies-section"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 rounded-full mb-4">
              <Briefcase className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-600">For Companies</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Streamline Your Recruitment Process
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              AI-powered tools to find the best candidates faster and make smarter hiring decisions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: TrendingUp,
                title: "AI Job Prediction",
                description: "Generate optimized job descriptions and predict candidate success rates using advanced AI algorithms.",
                color: "from-green-500 to-green-600",
              },
              {
                icon: Users,
                title: "Alternative Role Matching",
                description: "Discover perfect candidates for roles they didn't apply for. Never miss a great match.",
                color: "from-teal-500 to-teal-600",
              },
              {
                icon: Shield,
                title: "Smart Interview Questions",
                description: "Generate relevant, role-specific interview questions to assess candidates effectively.",
                color: "from-indigo-500 to-indigo-600",
              },
            ].map((feature, index) => (
              <div
                key={feature.title}
                data-animate
                id={`company-feature-${index}`}
                className={`p-8 bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-2 ${
                  isVisible[`company-feature-${index}`] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                }`}
                style={{ transitionDelay: `${index * 150}ms` }}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section
        id="pricing"
        className="relative py-24 px-4 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-7xl mx-auto">
          <div
            data-animate
            id="pricing-header"
            className={`text-center mb-16 transition-all duration-1000 ${
              isVisible["pricing-header"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Choose the plan that fits your needs. Start free, upgrade anytime.
            </p>
          </div>

          {/* Student Pricing */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Student Plans</h3>
              <p className="text-gray-600">Perfect for students looking to launch their careers</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
              {[
                {
                  name: "Free",
                  price: "Free",
                  description: "Essential tools to get started",
                  features: [
                    "Role suggestion: 1 month",
                    "Interview preps: 5 times/month",
                    "ATS Analyze: 1 month",
                    "Resume: 1/month",
                  ],
                  highlight: false,
                },
                {
                  name: "Basic",
                  price: "$5",
                  description: "More power for active job seekers",
                  features: [
                    "Role suggestion: 3 times/month",
                    "Interview preps: 15 times/month",
                    "ATS Analyze: 5 months",
                    "Resume: 5/month",
                  ],
                  highlight: true,
                },
                {
                  name: "Pro",
                  price: "$15",
                  description: "Maximum potential for serious candidates",
                  features: [
                    "Role suggestion: 5 times/month",
                    "Interview preps: 45 times/month",
                    "ATS Analyze: 15 months",
                    "Resume: 15/month",
                  ],
                  highlight: false,
                },
              ].map((plan, index) => (
                <div
                  key={plan.name}
                  data-animate
                  id={`student-plan-${index}`}
                  className={`relative flex flex-col p-8 bg-white rounded-2xl shadow-sm border-2 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 h-full ${
                    plan.highlight
                      ? "border-blue-500 ring-2 ring-blue-200 scale-105"
                      : "border-gray-200"
                  } ${
                    isVisible[`student-plan-${index}`] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-blue-500 text-white text-xs font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  {!plan.highlight && <div className="h-6"></div>}
                  <div className="mb-6">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.price !== "Free" && (
                        <span className="text-gray-600 ml-2">/month</span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                        <CheckCircle2 className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => router.push("/login")}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all mt-auto ${
                      plan.highlight
                        ? "bg-blue-500 text-white hover:bg-blue-600"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {plan.price === "Free" ? "Get Started" : "Subscribe"}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Company Pricing */}
          <div>
            <div className="text-center mb-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-2">Company Plans</h3>
              <p className="text-gray-600">Scale your recruitment with our flexible plans</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-stretch">
              {[
                {
                  name: "Free",
                  price: "Free",
                  description: "Basic tools for small teams",
                  features: [
                    "Generate job prediction: 5 times/month",
                    "Alternative role: 5 times",
                    "Interview questions: 5 to prepare",
                  ],
                  highlight: false,
                },
                {
                  name: "Growth",
                  price: "$15",
                  description: "Enhanced tools for growing companies",
                  features: [
                    "Generate job prediction: 10 times/month",
                    "Alternative role: 10 times",
                    "Interview questions: 10 to prepare",
                  ],
                  highlight: true,
                },
                {
                  name: "Enterprise",
                  price: "$25",
                  description: "Full access for large organizations",
                  features: [
                    "Generate job prediction: 20 times/month",
                    "Alternative role: 20 times",
                    "Interview questions: 20 to prepare",
                  ],
                  highlight: false,
                },
              ].map((plan, index) => (
                <div
                  key={plan.name}
                  data-animate
                  id={`company-plan-${index}`}
                  className={`relative flex flex-col p-8 bg-white rounded-2xl shadow-sm border-2 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 h-full ${
                    plan.highlight
                      ? "border-green-500 ring-2 ring-green-200 scale-105"
                      : "border-gray-200"
                  } ${
                    isVisible[`company-plan-${index}`] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
                  }`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  {plan.highlight && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
                      Recommended
                    </div>
                  )}
                  {!plan.highlight && <div className="h-6"></div>}
                  <div className="mb-6">
                    <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                    <p className="text-sm text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.price !== "Free" && (
                        <span className="text-gray-600 ml-2">/month</span>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-gray-600">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => router.push("/login")}
                    className={`w-full py-3 px-4 rounded-lg font-medium transition-all mt-auto ${
                      plan.highlight
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-100 text-gray-900 hover:bg-gray-200"
                    }`}
                  >
                    {plan.price === "Free" ? "Get Started" : "Subscribe"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 px-4 bg-gradient-to-br from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <div
            data-animate
            id="cta-section"
            className={`transition-all duration-1000 ${
              isVisible["cta-section"] ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
            }`}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Career Journey?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of students and companies already using InternMatch to achieve their goals.
            </p>
            <button
              onClick={() => router.push("/login")}
              className="group inline-flex items-center gap-2 px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-full hover:bg-gray-50 transition-all hover:scale-105 shadow-xl"
            >
              <span>Start Free Today</span>
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative py-12 px-4 bg-gray-900 text-gray-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 rounded-md flex items-center justify-center">
              <Briefcase className="h-3 w-3 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">InternMatch</span>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} InternMatch Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </main>
  );
}
