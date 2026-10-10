export type Language = 'fr' | 'en';

/** A project's logo, transparent, in a light-theme and a dark-theme version */
export interface ProjectLogo {
  src: string;
  srcDark: string;
  width: number;
  height: number;
  /** Height in px on a project card: the logo fitted in a 150 × 40 px frame, so compact and wide
      logos take the same room */
  display: number;
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
