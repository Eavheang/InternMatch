import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JobInfoRow } from "./job-info-row";
import {
  Users,
  MapPin,
  Globe,
  Mail,
  Building2,
} from "lucide-react";

type Company = {
  id: string;
  companyName: string;
  industry?: string;
  companySize?: string;
  website?: string;
  companyLocation?: string;
  description?: string;
  contactName?: string;
  contactEmail?: string;
};

interface CompanyInfoCardProps {
  company: Company;
}

export function CompanyInfoCard({ company }: CompanyInfoCardProps) {
  return (
    <Card>
      <CardHeader className="pb-4 p-6">
        <div className="flex items-center gap-2 text-sm font-bold text-zinc-900 uppercase tracking-wider">
          <Building2 className="w-4 h-4 text-indigo-500" />
          {company.companyName}
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {company.description && (
          <div className="pb-4 border-b border-zinc-200">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-1 h-5 bg-indigo-500 rounded-full" />
              <p className="text-sm font-semibold text-zinc-700">About</p>
            </div>
            <p className="text-sm text-zinc-600 leading-relaxed">
              {company.description}
            </p>
          </div>
        )}

        <div className="space-y-4 pl-1">
          {company.companySize && (
            <JobInfoRow
              icon={<Users className="w-4 h-4" />}
              label="Company Size"
              value={`${company.companySize} employees`}
            />
          )}

          {company.companyLocation && (
            <JobInfoRow
              icon={<MapPin className="w-4 h-4" />}
              label="Location"
              value={company.companyLocation}
            />
          )}

          {company.website && (
            <div className="flex items-start gap-3 group">
              <div className="text-indigo-500 mt-0.5 transition-colors group-hover:text-indigo-600">
                <Globe className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                  Website
                </p>
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline break-words"
                >
                  {company.website}
                </a>
              </div>
            </div>
          )}

          {company.contactEmail && (
            <div className="flex items-start gap-3 group">
              <div className="text-indigo-500 mt-0.5 transition-colors group-hover:text-indigo-600">
                <Mail className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1">
                  Contact
                </p>
                <a
                  href={`mailto:${company.contactEmail}`}
                  className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline break-words"
                >
                  {company.contactName || company.contactEmail}
                </a>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
