export interface Project {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  client: string;
  year: string;
  category: string;
  role: string;
  team?: string;
  summary: string;
  overview: string;
  imageUrl: string;
  images?: string[];
  pdfUrl?: string;
  pdfTitle?: string;
  challenges?: string[];
  solutions?: string[];
  metrics: { label: string; value: string }[];
  stack: string[];
  accentColor?: string;
}

export interface SkillCategory {
  id: string;
  title: string;
  number: string;
  description: string;
  philosophy: string;
  skills: {
    name: string;
    level: string;
    detail: string;
    highlight?: boolean;
  }[];
}

export interface EducationMilestone {
  period: string;
  title: string;
  institution: string;
  location: string;
  details: string;
}
