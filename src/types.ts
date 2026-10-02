export type Language = 'fr' | 'en';

export interface Project {
  id: string;
  name: string;
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
  accentColorDark?: string;
}
