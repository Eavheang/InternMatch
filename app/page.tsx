"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("internmatch_token");
    if (token) {
      router.push("/dashboard");
    }
  }, [router]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-zinc-50 to-zinc-100">
      <header className="max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-md bg-amber-400 flex items-center justify-center font-bold text-white">IM</div>
          <h1 className="text-xl font-semibold">InternMatch</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-zinc-700 hover:text-zinc-900">Log in</Link>
          <Link href="/sign-up" className="rounded-md bg-amber-500 px-4 py-2 text-sm text-white hover:bg-amber-600">Get started</Link>
        </nav>
      </header>

      <section className="max-w-6xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1">
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-zinc-900">Find great internships. Faster.</h2>
          <p className="mt-6 text-zinc-600 max-w-xl">InternMatch connects students with internships that match their skills and career goals — for companies, it makes sourcing talented candidates simple and efficient.</p>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link href="/sign-up" className="inline-flex items-center justify-center rounded-md bg-amber-500 px-6 py-3 text-white font-medium shadow hover:bg-amber-600">Create account</Link>
            <Link href="/role-suggestions" className="inline-flex items-center justify-center rounded-md border border-zinc-200 px-6 py-3 text-zinc-800 hover:bg-zinc-50">Explore roles</Link>
          </div>
        </div>

        <div className="flex-1">
          <div className="w-full rounded-2xl bg-gradient-to-tr from-amber-50 to-white p-8 shadow-md">
            <svg viewBox="0 0 600 400" className="w-full h-64" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="20" y="20" width="560" height="360" rx="16" fill="#fff" stroke="#F3F4F6" />
              <circle cx="120" cy="120" r="36" fill="#FDE68A" />
              <rect x="180" y="100" width="320" height="24" rx="6" fill="#F3F4F6" />
              <rect x="180" y="140" width="260" height="18" rx="6" fill="#F3F4F6" />
              <rect x="180" y="174" width="200" height="18" rx="6" fill="#F3F4F6" />
            </svg>
          </div>
        </div>
      </section>

      <section className="bg-white border-t border-zinc-100">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h3 className="text-2xl font-semibold text-zinc-900">Why teams and students choose InternMatch</h3>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 rounded-lg bg-zinc-50">
              <h4 className="font-semibold">Smart matches</h4>
              <p className="mt-2 text-sm text-zinc-600">Match candidates to roles using skills and preferences.</p>
            </div>
            <div className="p-6 rounded-lg bg-zinc-50">
              <h4 className="font-semibold">Fast hiring</h4>
              <p className="mt-2 text-sm text-zinc-600">Streamline interviews and offers to move quickly.</p>
            </div>
            <div className="p-6 rounded-lg bg-zinc-50">
              <h4 className="font-semibold">Student tools</h4>
              <p className="mt-2 text-sm text-zinc-600">Build resumes, prep for interviews, and track applications.</p>
            </div>
            <div className="p-6 rounded-lg bg-zinc-50">
              <h4 className="font-semibold">Trusted by teams</h4>
              <p className="mt-2 text-sm text-zinc-600">Used by companies to discover and hire early talent.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-6 py-8 text-sm text-zinc-600">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>© {new Date().getFullYear()} InternMatch</div>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/terms" className="hover:underline">Terms</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
