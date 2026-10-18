// One-shot proof that content/*.json says exactly what the old TypeScript data said.
// Deleted with the old data files at the end of the migration (plan, task 3).
import type { Language } from '../../src/types';
import { CONTENT } from '../../src/content/load';
import { projectSeo, toCaseStudy, toProject, toSite, visibleProjects } from '../../src/content/localize';
import { getCaseStudy } from '../../src/data/caseStudies';
import {
  EDUCATION_TIMELINE,
  EDUCATION_TIMELINE_EN,
  EXPERIENCE_TIMELINE,
  EXPERIENCE_TIMELINE_EN,
  LANGUAGES,
  PROJECTS_EN,
  PROJECTS_FR,
  UNIFIED_PROJECTS,
  USER_INFO,
} from '../../src/data/portfolioData';
import { META } from '../../src/seo';
import { OUTCOMES } from '../../src/components/Hero';
import { SKILLS_DATA } from '../../src/components/SkillsSection';
import { translations } from '../../src/context/LanguageContext';

const LANGS: Language[] = ['fr', 'en'];
const PASSIONS = { fr: ['Automobile', 'Sport', 'Voyage', 'Technologies'], en: ['Automotive', 'Sports', 'Travel', 'Technology'] };

describe.each(LANGS)('%s', (lang) => {
  test('projects keep their order', () => {
    expect(visibleProjects(CONTENT, lang).map((p) => p.id)).toEqual(UNIFIED_PROJECTS.map((p) => p.id));
  });

  test.each(UNIFIED_PROJECTS.map((p) => p.id))('project %s: card, SEO and case study', (id) => {
    const stored = CONTENT.projects[id];
    expect(toProject(stored, lang)).toEqual((lang === 'fr' ? PROJECTS_FR : PROJECTS_EN).find((p) => p.id === id));
    expect(projectSeo(stored, lang)).toEqual(META[id][lang]);
    expect(toCaseStudy(stored, lang)).toEqual(getCaseStudy(id, lang));
  });

  test('site: contact, hero, about, skills, page SEO', () => {
    const site = toSite(CONTENT.site, lang);
    expect(site.contact).toEqual(USER_INFO);
    expect(site.hero.outcomes).toEqual(OUTCOMES[lang]);
    expect(site.about.bio).toBe((translations[lang] as Record<string, string>)['about.bio']);
    expect(site.about.languages).toEqual(LANGUAGES[lang]);
    expect(site.about.passions).toEqual(PASSIONS[lang]);
    expect(site.about.education).toEqual(lang === 'fr' ? EDUCATION_TIMELINE : EDUCATION_TIMELINE_EN);
    expect(site.about.experience).toEqual(lang === 'fr' ? EXPERIENCE_TIMELINE : EXPERIENCE_TIMELINE_EN);
    expect(site.skills).toEqual(
      SKILLS_DATA.map((s) => ({
        id: s.id,
        number: s.number,
        title: lang === 'fr' ? s.titleFr : s.titleEn,
        desc: lang === 'fr' ? s.descFr : s.descEn,
        tools: lang === 'fr' ? s.tools : s.toolsEn,
      })),
    );
    for (const page of ['home', 'projets', 'a-propos', 'contact', 'privacy', 'notfound']) expect(site.seo[page as 'home']).toEqual(META[page][lang]);
  });
});
