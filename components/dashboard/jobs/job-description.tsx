import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobDescriptionProps {
  description: string;
}

export function JobDescription({ description }: JobDescriptionProps) {
  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="text-xl">Job Description</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="prose prose-zinc max-w-none">
          <p className="text-zinc-700 leading-relaxed whitespace-pre-wrap">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
