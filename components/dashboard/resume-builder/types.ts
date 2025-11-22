export interface ResumeData {
  personalInfo: {
    fullName: string;
    title: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    website?: string;
  };
  summary: string;
  education: Array<{
    id: string;
    school: string;
    degree: string;
    start: string;
    end: string;
    details: string;
  }>;
  experience: Array<{
    id: string;
    company: string;
    role: string;
    start: string;
    end: string;
    bullets: string[];
  }>;
  skills: string[];
}

export const initialResumeData: ResumeData = {
  personalInfo: {
    fullName: "",
    title: "",
    email: "",
    phone: "",
    location: "",
  },
  summary: "",
  education: [],
  experience: [],
  skills: [],
};
