import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award } from "lucide-react";

interface JobBenefitsProps {
  benefits: string[];
}

export function JobBenefits({ benefits }: JobBenefitsProps) {
  if (!benefits || benefits.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Benefits & Perks</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <ul className="space-y-2">
          {benefits.map((benefit, index) => (
            <li key={index} className="flex items-start gap-2 text-zinc-700">
              <Award className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
              {benefit}
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
