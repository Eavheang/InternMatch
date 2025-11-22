import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";

interface StudentJobFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
}

export function StudentJobFilters({
  search,
  onSearchChange,
}: StudentJobFiltersProps) {
  return (
    <Card className="border-zinc-200/80 shadow-sm">
      <CardContent className="p-6">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-400 w-4 h-4" />
          <Input
            placeholder="Search jobs by title, company, or keywords..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 h-12 text-base"
          />
        </div>
      </CardContent>
    </Card>
  );
}
