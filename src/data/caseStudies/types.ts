
/**
 * Case studies told as a scroll story (CaseStudy.tsx). One entry per project and language;
 * a project without an entry for the current language keeps the classic project page.
 *
 * Writing rules: prose in the first person ("j'ai" for my work, "nous" for the team), no
 * invented figures — every number below comes from the project's own documents (brief,
 * report, user-test notes). Anything still missing is written [À COMPLÉTER].
 */

export interface CaseImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
  /** Inside a fixed frame: crop to fill (default) or show whole */
  fit?: 'cover' | 'contain';
}

export interface CaseFigure {
  /** Numeric part, counted up when it scrolls into view */
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface CaseStep {
  text: string;
  image: CaseImage;
}

export type CaseBlock =
  | { type: 'figures'; items: CaseFigure[]; source?: string }
  | { type: 'steps'; steps: CaseStep[]; frame?: 'screen' | 'plain' | 'mockup' }
  | { type: 'compare'; before: CaseImage; after: CaseImage; beforeLabel: string; afterLabel: string; caption: string }
  | { type: 'pair'; items: [CaseImage, CaseImage]; caption: string }
  | { type: 'strip'; items: CaseImage[] }
  | { type: 'gallery'; items: CaseImage[]; cols?: 1 | 2 | 3 | 4 | 5; boxed?: boolean; narrow?: boolean; caption?: string }
  | { type: 'image'; image: CaseImage; href?: string }
  | { type: 'quote'; text: string; source: string }
  | { type: 'video'; src: string; poster: string; width: number; height: number; caption: string }
  | { type: 'architecture'; nodes: { title: string; sub: string; note: string; highlight?: boolean }[]; links: string[]; caption: string }
  | { type: 'team'; members: { name: string; role: string; me?: boolean }[] };

/** Prose paragraphs and blocks, in reading order */
export type CaseContent = (string | CaseBlock)[];

export interface CaseSection {
  id: string;
  /** Short label for the side table of contents */
  nav: string;
  title: string;
  /** 'accent': full-width band in the project colour, to set a section apart */
  tone?: 'accent';
  content: CaseContent;
}

export interface CaseStudy {
  /** Label over the title: discipline · subject (the context is in `meta`, the client in the logo) */
  kicker: string;
  title: string;
  hook: string;
  intro: string;
  meta: { label: string; value: string }[];
  /** Main visual at the top of the case study (defaults to the project's card image) */
  hero?: CaseImage;
  /** Public links shown under the intro (live site, social accounts…) */
  links?: { label: string; href: string }[];
  brief: { label: string; text: string }[];
  sections: CaseSection[];
  credits: { name: string; role: string }[];
  creditsNote?: string;
}

/** Image helper bound to one project's folder in public/images/case/ */
export const imagesIn =
  (folder: string) =>
  (name: string, width: number, height: number, alt: string, caption?: string): CaseImage => ({
    src: `/images/case/${folder}/${name}.webp`,
    width,
    height,
    alt,
    caption,
  });
