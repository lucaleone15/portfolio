export type Language = 'fr' | 'en';

/** A project's logo chip: the logo on its brand background, fixed height, width following the logo */
export interface ProjectLogo {
  src: string;
  width: number;
  height: number;
}

export interface Project {
  id: string;
  kind: 'pro' | 'school-client' | 'school';
  name: string;
  number: string;
  title: string;
  subtitle: string;
  client: string;
  year: string;
  category: string;
  role: string;
  team?: string;
  hook?: string;
  badge?: string;
  summary: string;
  overview: string;
  imageUrl: string;
  images?: string[];
  challenges?: string[];
  solutions?: string[];
  metrics: { label: string; value: string }[];
  stack: string[];
  accentColor?: string;
  accentColorDark?: string;
  logo?: ProjectLogo;
}
