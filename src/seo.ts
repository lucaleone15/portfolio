import { Language } from './types';
import { USER_INFO } from './data/portfolioData';
import type { CaseBlock } from './data/caseStudies/types';
import { CONTENT } from './content/load';
import { projectSeo, toCaseStudy, toProject, toSite, visibleProjects } from './content/localize';
import { SITE_PAGES } from './content/sitePages';
import { fillTemplate } from './content/derived';
import { personalShareImage, projectShareImage, SHARE_SIZE } from './content/og';
import { homePath, pathFor, privacyPath, projectPath, Route, SECTION_IDS, SectionId, sectionPath } from './router';

/**
 * Per-page <head> metadata and structured data. Used by the build-time
 * prerender (scripts/prerender.mjs) and kept in sync client-side by useDocumentHead.
 */

export const SITE_URL = 'https://luca-leone.ch';
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PORTRAIT_URL = `${SITE_URL}/photo.jpeg`;
/** Every page but the projects: the personal share image of that language (src/content/og.ts) */
const ogImageUrl = (lang: Language) => `${SITE_URL}${personalShareImage(CONTENT.site, lang)}`;

const abs = (path: string) => `${SITE_URL}${path}`;

const projectsFor = (lang: Language) => visibleProjects(CONTENT, lang).map((p) => toProject(p, lang));
const getCaseStudy = (slug: string, lang: Language) => (CONTENT.projects[slug] ? toCaseStudy(CONTENT.projects[slug], lang) : null);

export interface HeadData {
  lang: Language;
  title: string;
  description: string;
  canonical: string;
  /** The page's own URL when it differs from the canonical one (home sections) */
  url?: string;
  alternates: { hreflang: string; href: string }[];
  ogType: 'profile' | 'article';
  image: string;
  imageAlt: string;
  jsonLd: object | null;
  /** Kept out of search results (404, privacy policy): robots noindex, left out of the sitemap */
  noindex?: boolean;
}

export function getAllRoutes(): Route[] {
  const langs: Language[] = ['fr', 'en'];
  return langs.flatMap((lang) => [
    { name: 'home', lang } as Route,
    ...SECTION_IDS.map((section) => ({ name: 'home', lang, section }) as Route),
    ...visibleProjects(CONTENT, lang).map((p) => ({ name: 'project', lang, slug: p.id }) as Route),
    { name: 'privacy', lang } as Route,
    { name: 'stand', lang } as Route,
    { name: 'podium', lang } as Route,
  ]);
}

function alternatesFor(route: Route) {
  const fr = abs(pathFor({ ...route, lang: 'fr' } as Route));
  const en = abs(pathFor({ ...route, lang: 'en' } as Route));
  // A project not written in English yet has no English page
  if (route.name === 'project' && !visibleProjects(CONTENT, 'en').some((p) => p.id === route.slug)) {
    return [
      { hreflang: 'fr', href: fr },
      { hreflang: 'x-default', href: fr },
    ];
  }
  return [
    { hreflang: 'fr', href: fr },
    { hreflang: 'en', href: en },
    { hreflang: 'x-default', href: fr },
  ];
}

/**
 * Page titles and meta descriptions (content/site.json → seo, and each project's seo), written against Google's display limits: titles ≤ 60
 * characters and ≤ 580 px (Arial 20 px, what fits before truncation), descriptions 120–160
 * characters and ≤ 920 px (two lines of Arial 14 px). Each one is unique, describes its page
 * in plain words, puts the key information first (mobile cuts sooner) and ends titles with the name.
 */
/** A fixed page's title and description, with {N} / {names} filled from the projects on the site */
const pageSeo = (page: (typeof SITE_PAGES)[number], lang: Language) => {
  const { title, description } = toSite(CONTENT.site, lang).seo[page];
  return { title: fillTemplate(title, CONTENT, lang), description: fillTemplate(description, CONTENT, lang) };
};

export const META: Record<string, Record<Language, { title: string; description: string }>> = {
  ...Object.fromEntries(SITE_PAGES.map((page) => [page, { fr: pageSeo(page, 'fr'), en: pageSeo(page, 'en') }])),
  ...Object.fromEntries(Object.values(CONTENT.projects).map((p) => [p.id, { fr: projectSeo(p, 'fr'), en: projectSeo(p, 'en') }])),
};

const HOME_COPY = {
  fr: {
    title: META.home.fr.title,
    description: META.home.fr.description,
    imageAlt: 'Portrait de Luca Leone, étudiant en ingénierie des médias à la HEIG-VD',
    ogAlt: 'Luca Leone. — Portfolio, ingénierie des médias, HEIG-VD',
    projectsList: 'Projets de Luca Leone',
    home: 'Accueil',
    projects: 'Projets',
  },
  en: {
    title: META.home.en.title,
    description: META.home.en.description,
    imageAlt: 'Portrait of Luca Leone, Media Engineering student at HEIG-VD',
    ogAlt: 'Luca Leone. — Portfolio, Media Engineering, HEIG-VD',
    projectsList: 'Projects by Luca Leone',
    home: 'Home',
    projects: 'Projects',
  },
};

const IN_LANGUAGE: Record<Language, string> = { fr: 'fr-CH', en: 'en' };

function personNode() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: USER_INFO.name,
    alternateName: ['Luca Leone HEIG-VD', 'Luca Leone ingénierie des médias'],
    givenName: 'Luca',
    familyName: 'Leone',
    jobTitle: 'Étudiant en ingénierie des médias & Community Manager',
    description:
      'Étudiant en dernière année de Bachelor en ingénierie des médias à la HEIG-VD (Yverdon-les-Bains), spécialisé en communication numérique, design UI/UX, développement web et production photo/vidéo.',
    email: `mailto:${USER_INFO.email}`,
    telephone: USER_INFO.phone.replace(/\s/g, ''),
    url: `${SITE_URL}/`,
    image: { '@type': 'ImageObject', '@id': `${SITE_URL}/#portrait`, url: PORTRAIT_URL, caption: 'Portrait de Luca Leone' },
    mainEntityOfPage: { '@id': `${SITE_URL}/#profile-page` },
    sameAs: ['https://www.linkedin.com/in/leone-luca'],
    alumniOf: {
      '@type': 'EducationalOrganization',
      '@id': `${SITE_URL}/#heig-vd`,
      name: "HEIG-VD - Haute École d'Ingénierie et de Gestion du Canton de Vaud",
      url: 'https://heig-vd.ch/',
      sameAs: ['https://heig-vd.ch'],
      address: { '@type': 'PostalAddress', addressLocality: 'Yverdon-les-Bains', addressRegion: 'Vaud', addressCountry: 'CH' },
    },
    worksFor: {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#karting-vuiteboeuf`,
      name: 'Karting de Vuiteboeuf',
      address: { '@type': 'PostalAddress', addressLocality: 'Vuiteboeuf', addressRegion: 'Vaud', addressCountry: 'CH' },
    },
    homeLocation: {
      '@type': 'Place',
      name: 'Orbe, Canton de Vaud, Suisse',
      address: { '@type': 'PostalAddress', addressLocality: 'Orbe', addressRegion: 'Vaud', addressCountry: 'CH' },
      geo: { '@type': 'GeoCoordinates', latitude: 46.7247, longitude: 6.5325 },
    },
    knowsAbout: [
      'Ingénierie des médias',
      'Communication numérique',
      'Marketing digital',
      'UI/UX Design',
      'Développement web',
      'Gestion des réseaux sociaux',
      'Production photo et vidéo',
      'Stratégie de contenu',
    ],
    knowsLanguage: ['fr', 'en', 'it'],
  };
}

function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': WEBSITE_ID,
    url: `${SITE_URL}/`,
    name: 'Luca Leone – Portfolio',
    alternateName: 'Portfolio de Luca Leone',
    inLanguage: ['fr-CH', 'en'],
    author: { '@id': PERSON_ID },
    publisher: { '@id': PERSON_ID },
  };
}

function homeHead(lang: Language): HeadData {
  const copy = HOME_COPY[lang];
  const url = abs(homePath(lang));
  const projects = projectsFor(lang);

  return {
    lang,
    title: copy.title,
    description: copy.description,
    canonical: url,
    alternates: alternatesFor({ name: 'home', lang }),
    ogType: 'profile',
    image: ogImageUrl(lang),
    imageAlt: copy.ogAlt,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        personNode(),
        websiteNode(),
        {
          '@type': 'ProfilePage',
          '@id': `${url}#profile-page`,
          url,
          name: copy.title,
          description: copy.description,
          inLanguage: IN_LANGUAGE[lang],
          isPartOf: { '@id': WEBSITE_ID },
          mainEntity: { '@id': PERSON_ID },
          primaryImageOfPage: { '@id': `${SITE_URL}/#portrait` },
          hasPart: { '@id': `${url}#projects` },
        },
        {
          '@type': 'ItemList',
          '@id': `${url}#projects`,
          name: copy.projectsList,
          numberOfItems: projects.length,
          itemListElement: projects.map((p, i) => ({
            '@type': 'ListItem',
            position: i + 1,
            url: abs(projectPath(lang, p.id)),
            name: p.name,
          })),
        },
      ],
    },
  };
}

const SECTION_COPY: Record<Language, Record<SectionId, { title: string; description: string }>> = {
  fr: { projets: META.projets.fr, 'a-propos': META['a-propos'].fr, contact: META.contact.fr },
  en: { projets: META.projets.en, 'a-propos': META['a-propos'].en, contact: META.contact.en },
};

/**
 * /projets, /a-propos, /contact: the home page landing on a section. Own title and
 * description (browser tab, link previews), but the canonical stays the home page, so
 * search engines don't see four copies of the same content (and they're not in the sitemap).
 */
function sectionHead(lang: Language, section: SectionId): HeadData {
  const home = homeHead(lang);
  const copy = SECTION_COPY[lang][section];
  return { ...home, ...copy, url: abs(sectionPath(lang, section)), alternates: [] };
}

function blockImages(block: CaseBlock): string[] {
  switch (block.type) {
    case 'steps':
      return block.steps.map((s) => s.image.src);
    case 'compare':
      return [block.before.src, block.after.src];
    case 'pair':
    case 'strip':
    case 'gallery':
      return block.items.map((i) => i.src);
    case 'image':
      return [block.image.src];
    case 'video':
      return [block.poster];
    default:
      return [];
  }
}

/**
 * Every image a project page shows, as site paths: the cover first, then the case study's
 * images in reading order.
 */
export function projectImagePaths(lang: Language, slug: string): string[] {
  const project = projectsFor(lang).find((p) => p.id === slug);
  if (!project) return [];
  const study = getCaseStudy(slug, lang);
  const paths = [
    study?.hero?.src ?? project.imageUrl,
    ...(study?.sections ?? []).flatMap((section) =>
      section.content.flatMap((item) => (typeof item === 'string' ? [] : blockImages(item))),
    ),
  ];
  return [...new Set(paths)];
}

function projectHead(lang: Language, slug: string): HeadData | null {
  const project = projectsFor(lang).find((p) => p.id === slug);
  if (!project) return null;

  const copy = HOME_COPY[lang];
  const url = abs(projectPath(lang, slug));
  const images = projectImagePaths(lang, slug).map(abs);
  const meta = META[slug]?.[lang];
  const title = meta?.title ?? `${project.name} – ${project.subtitle} | Luca Leone`;
  const description = meta?.description ?? project.summary;

  return {
    lang,
    title,
    description,
    canonical: url,
    alternates: alternatesFor({ name: 'project', lang, slug }),
    ogType: 'article',
    // The project's own share card (scripts/share-images.mjs), 1200×630
    image: CONTENT.projects[slug] ? abs(projectShareImage(CONTENT.projects[slug], lang, CONTENT.site)) : images[0],
    imageAlt: `${project.name} – ${project.subtitle}`,
    jsonLd: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'WebPage',
          '@id': `${url}#webpage`,
          url,
          name: title,
          description,
          inLanguage: IN_LANGUAGE[lang],
          isPartOf: { '@id': WEBSITE_ID },
          about: { '@id': `${url}#work` },
          mainEntity: { '@id': `${url}#work` },
          breadcrumb: { '@id': `${url}#breadcrumb` },
          primaryImageOfPage: { '@type': 'ImageObject', url: images[0] },
        },
        {
          '@type': 'CreativeWork',
          '@id': `${url}#work`,
          url,
          name: project.name,
          headline: project.subtitle,
          description,
          abstract: project.overview,
          genre: project.category,
          image: images,
          dateCreated: project.year,
          inLanguage: IN_LANGUAGE[lang],
          keywords: project.stack.join(', '),
          author: { '@id': PERSON_ID },
          creator: { '@id': PERSON_ID },
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${url}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: copy.home, item: abs(homePath(lang)) },
            { '@type': 'ListItem', position: 2, name: copy.projects, item: abs(sectionPath(lang, 'projets')) },
            { '@type': 'ListItem', position: 3, name: project.name, item: url },
          ],
        },
        { '@type': 'Person', '@id': PERSON_ID, name: USER_INFO.name, url: `${SITE_URL}/` },
        { '@type': 'WebSite', '@id': WEBSITE_ID, url: `${SITE_URL}/`, name: 'Luca Leone – Portfolio' },
      ],
    },
  };
}

function privacyHead(lang: Language): HeadData {
  const url = abs(privacyPath(lang));
  const { title, description } = META.privacy[lang];
  return {
    lang,
    title,
    description,
    canonical: url,
    alternates: alternatesFor({ name: 'privacy', lang }),
    ogType: 'profile',
    image: ogImageUrl(lang),
    imageAlt: 'Luca Leone',
    // Useful to visitors, not a page anyone should land on from a search
    noindex: true,
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      '@id': `${url}#webpage`,
      url,
      name: title,
      description,
      inLanguage: IN_LANGUAGE[lang],
      isPartOf: { '@id': WEBSITE_ID },
    },
  };
}

const HIDDEN_META: Record<'stand' | 'podium', Record<Language, { title: string; description: string }>> = {
  stand: {
    fr: { title: 'Au stand · Les coulisses du portfolio | Luca Leone', description: 'Les coulisses du portfolio de Luca Leone : la stack, les chiffres du site, ce que ce chargement a coûté, et les secrets cachés dans les pages.' },
    en: { title: 'In the pits · Behind Luca Leone’s portfolio', description: 'Behind the scenes of Luca Leone’s portfolio: the stack, the site in numbers, what this page load cost, and the secrets hidden in its pages.' },
  },
  podium: {
    fr: { title: 'Podium · Les meilleurs départs | Luca Leone', description: 'Le classement des meilleurs temps de réaction au départ « Lights out » caché dans le portfolio de Luca Leone. Saurez-vous faire mieux ?' },
    en: { title: 'Podium · The best starts | Luca Leone', description: 'The leaderboard of the best reaction times at the “Lights out” start hidden in Luca Leone’s portfolio. Can you beat them?' },
  },
};

/** Hidden pages (easter eggs): reachable by link, kept out of search results */
function hiddenHead(lang: Language, name: 'stand' | 'podium'): HeadData {
  const url = abs(pathFor({ name, lang }));
  return {
    lang,
    ...HIDDEN_META[name][lang],
    canonical: url,
    alternates: alternatesFor({ name, lang }),
    ogType: 'profile',
    image: ogImageUrl(lang),
    imageAlt: 'Luca Leone',
    jsonLd: null,
    noindex: true,
  };
}

function notFoundHead(lang: Language): HeadData {
  return {
    lang,
    title: META.notfound[lang].title,
    description: META.notfound[lang].description,
    canonical: abs(homePath(lang)),
    alternates: [],
    ogType: 'profile',
    image: ogImageUrl(lang),
    imageAlt: 'Luca Leone',
    jsonLd: null,
    noindex: true,
  };
}

export function getHeadData(route: Route): HeadData {
  if (route.name === 'project') {
    return projectHead(route.lang, route.slug) ?? notFoundHead(route.lang);
  }
  if (route.name === 'notFound') return notFoundHead(route.lang);
  if (route.name === 'privacy') return privacyHead(route.lang);
  if (route.name === 'stand' || route.name === 'podium') return hiddenHead(route.lang, route.name);
  if (route.section) return sectionHead(route.lang, route.section);
  return homeHead(route.lang);
}

const escapeAttr = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

export function renderHeadTags(head: HeadData): string {
  const ogLocale = head.lang === 'fr' ? 'fr_CH' : 'en_US';
  const ogLocaleAlt = head.lang === 'fr' ? 'en_US' : 'fr_CH';
  // "</script>" inside JSON would close the tag early
  const jsonLd = JSON.stringify(head.jsonLd, null, 2).replace(/</g, '\\u003c');

  // 404: no canonical, alternates or social tags
  if (head.noindex && !head.alternates.length) {
    return [
      `<title>${escapeAttr(head.title)}</title>`,
      `<meta name="description" content="${escapeAttr(head.description)}" />`,
      `<meta name="robots" content="noindex, follow" />`,
    ]
      .map((line) => `    ${line}`)
      .join('\n');
  }

  return [
    `<title>${escapeAttr(head.title)}</title>`,
    `<meta name="description" content="${escapeAttr(head.description)}" />`,
    ...(head.noindex ? [`<meta name="robots" content="noindex, follow" />`] : []),
    `<link rel="canonical" href="${head.canonical}" />`,
    ...head.alternates.map((a) => `<link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`),
    `<meta property="og:type" content="${head.ogType}" />`,
    `<meta property="og:url" content="${head.url ?? head.canonical}" />`,
    `<meta property="og:site_name" content="Luca Leone – Portfolio" />`,
    `<meta property="og:title" content="${escapeAttr(head.title)}" />`,
    `<meta property="og:description" content="${escapeAttr(head.description)}" />`,
    `<meta property="og:locale" content="${ogLocale}" />`,
    `<meta property="og:locale:alternate" content="${ogLocaleAlt}" />`,
    `<meta property="og:image" content="${head.image}" />`,
    ...(head.image.includes('/og/')
      ? [`<meta property="og:image:width" content="${SHARE_SIZE.width}" />`, `<meta property="og:image:height" content="${SHARE_SIZE.height}" />`]
      : []),
    `<meta property="og:image:alt" content="${escapeAttr(head.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(head.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(head.description)}" />`,
    `<meta name="twitter:image" content="${head.image}" />`,
    ...(head.jsonLd ? [`<script type="application/ld+json">\n${jsonLd}\n</script>`] : []),
  ]
    .map((line) => `    ${line}`)
    .join('\n');
}

/**
 * sitemap.xml: indexable canonical pages only (the section URLs point to the home page, the
 * privacy policy is noindex), each with its
 * FR/EN alternates and the images it shows (Google Images), plus the CV. `lastmod` comes
 * from the caller (scripts/prerender.mjs: date of the page's last commit), so it only moves
 * when the page really changes; Google ignores a lastmod that changes on every build.
 */
export function renderSitemap(lastmod: { page: (route: Route) => string; cv: string }): string {
  const imageTags = (paths: string[]) => paths.map((p) => `    <image:image><image:loc>${abs(p)}</image:loc></image:image>`);

  const pages = getAllRoutes()
    .filter((route) => !(route.name === 'home' && route.section) && !getHeadData(route).noindex)
    .map((route) => {
      const head = getHeadData(route);
      const links = head.alternates.map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`);
      const images =
        route.name === 'project'
          ? projectImagePaths(route.lang, route.slug)
          : route.name === 'home'
            ? projectsFor(route.lang).map((p) => p.imageUrl)
            : [];
      return [
        '  <url>',
        `    <loc>${head.canonical}</loc>`,
        `    <lastmod>${lastmod.page(route)}</lastmod>`,
        ...links,
        ...imageTags(images),
        '  </url>',
      ].join('\n');
    });

  const cv = `  <url>\n    <loc>${abs(USER_INFO.cv)}</loc>\n    <lastmod>${lastmod.cv}</lastmod>\n  </url>`;

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...pages,
    cv,
    '</urlset>',
    '',
  ].join('\n');
}
