import type { Language } from '../../types';
import type { CaseStudy } from './types';
import { hug } from './hug';
import { karting } from './karting';
import { oceansight } from './oceansight';
import { drivegear } from './drivegear';
import { etoileBlanche } from './etoileBlanche';
import { f1Pitwall } from './f1Pitwall';

export * from './types';

/** One case study per project id, in French and English (see types.ts for the writing rules) */
const CASE_STUDIES: Record<string, Partial<Record<Language, CaseStudy>>> = {
  hug,
  'karting-vuiteboeuf': karting,
  oceansight,
  drivegear,
  'etoile-blanche': etoileBlanche,
  'f1-pitwall': f1Pitwall,
};

export function getCaseStudy(projectId: string, lang: Language): CaseStudy | null {
  return CASE_STUDIES[projectId]?.[lang] ?? null;
}
