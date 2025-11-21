type JobMetaProps = {
  label: string;
  value?: string | null;
};

export function JobMeta({ label, value }: JobMetaProps) {
  return (
    <div className="rounded-xl border border-zinc-100 bg-zinc-50/60 p-3">
      <p className="text-xs uppercase tracking-wide text-zinc-400">{label}</p>
      <p className="text-sm font-medium text-zinc-800 mt-1">{value || "—"}</p>
    </div>
  );
}
