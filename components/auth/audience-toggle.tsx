"use client";

import { cn } from "@/lib/utils";

export type Audience = "student" | "company";

const labels: Record<Audience, string> = {
  student: "Student",
  company: "Company",
};

export function AudienceToggle({
  value,
  onChange,
}: {
  value: Audience;
  onChange: (value: Audience) => void;
}) {
  return (
    <div className="relative flex rounded-full bg-zinc-100 p-1 text-sm font-semibold">
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-1 bottom-1 w-[calc(50%-0.35rem)] rounded-full bg-white shadow-lg transition-transform duration-300 ease-out will-change-transform"
        )}
        style={{
          left: "0.25rem",
          transform:
            value === "student"
              ? "translateX(0)"
              : "translateX(calc(100% + 0.35rem))",
        }}
      />
      {(Object.keys(labels) as Audience[]).map((item) => {
        const isActive = value === item;
        return (
          <button
            type="button"
            key={item}
            onClick={() => onChange(item)}
            className={cn(
              "relative z-10 flex flex-1 items-center justify-center rounded-full py-2 text-sm transition-colors duration-200",
              isActive ? "text-indigo-600" : "text-zinc-500"
            )}
            aria-pressed={isActive}
          >
            {labels[item]}
          </button>
        );
      })}
    </div>
  );
}
