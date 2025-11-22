import { Search, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type JobSearchBarProps = {
  search: string;
  onSearchChange: (value: string) => void;
};

export function JobSearchBar({ search, onSearchChange }: JobSearchBarProps) {
  return (
    <section className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="relative flex-1">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Search jobs..."
          className="pl-9"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <Button variant="outline" className="self-start gap-2 text-zinc-600">
        <SlidersHorizontal className="w-4 h-4" />
        Filters
      </Button>
    </section>
  );
}
