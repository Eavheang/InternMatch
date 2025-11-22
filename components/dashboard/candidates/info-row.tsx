import { ReactNode } from "react";

interface InfoRowProps {
  icon: ReactNode;
  label: string;
  value: string;
}

export function InfoRow({ icon, label, value }: InfoRowProps) {
  return (
    <div className="flex items-start gap-3 group">
      <div className="text-indigo-500 mt-0.5 transition-colors group-hover:text-indigo-600">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
          {label}
        </p>
        <p className="text-sm text-zinc-900 break-words leading-relaxed">
          {value}
        </p>
      </div>
    </div>
  );
}
