import { Suspense } from "react";
import { Verify2FACard } from "@/components/auth/verify-2fa-card";

function LoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-linear-to-br from-indigo-50 via-white to-white px-4 py-12">
      <div className="w-full max-w-md p-10 text-center">
        <p className="text-sm text-zinc-500">Loading...</p>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Verify2FACard />
    </Suspense>
  );
}
