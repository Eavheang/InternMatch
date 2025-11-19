export type CompanyProfileData = {
  companyName: string;
  industry: string;
  companySize: string;
  website: string;
  companyLogo: string;
  headquarters: string;
  otherLocations: string[];
  companyDescription: string;
  companyCulture: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  hasInternshipProgram: boolean;
};

export type CompanyStepProps = {
  data: CompanyProfileData;
  onUpdate: (values: Partial<CompanyProfileData>) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  onSubmit?: () => void;
  isSubmitting?: boolean;
};
