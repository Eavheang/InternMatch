import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send } from "lucide-react";

interface ApplicationFormProps {
  jobTitle: string;
  coverLetter: string;
  setCoverLetter: (value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function ApplicationForm({
  jobTitle,
  coverLetter,
  setCoverLetter,
  onSubmit,
  onCancel,
  isSubmitting,
}: ApplicationFormProps) {
  return (
    <Card className="border-indigo-200 shadow-lg">
      <CardHeader className="pb-4 p-6">
        <CardTitle className="text-xl text-indigo-900">
          Apply for {jobTitle}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-700 mb-2">
            Cover Letter (Optional)
          </label>
          <Textarea
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Tell us why you're interested in this position and what makes you a great fit..."
            rows={6}
            className="w-full"
          />
        </div>
        <div className="flex gap-3">
          <Button
            onClick={onSubmit}
            disabled={isSubmitting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Application
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
