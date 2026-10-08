import { Language } from './types';
import { PROJECTS_EN, PROJECTS_FR, UNIFIED_PROJECTS, USER_INFO } from './data/portfolioData';
import { getCaseStudy, type CaseBlock } from './data/caseStudies';
import { homePath, pathFor, privacyPath, projectPath, Route, SECTION_IDS, SectionId, sectionPath } from './router';

/**
 * Per-page <head> metadata and structured data. Used by the build-time
 * prerender (scripts/prerender.mjs) and kept in sync client-side by useDocumentHead.
 */

export const SITE_URL = 'https://luca-leone.ch';
const PERSON_ID = `${SITE_URL}/#person`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PORTRAIT_URL = `${SITE_URL}/photo.jpeg`;
/** Social preview (1200×630): wordmark on the site's gradient background */
const OG_IMAGE_URL = `${SITE_URL}/og-image.jpg`;

const abs = (path: string) => `${SITE_URL}${path}`;

const projectsFor = (lang: Language) => (lang === 'fr' ? PROJECTS_FR : PROJECTS_EN);

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
  /** 404 page: keep it out of search results */
  noindex?: boolean;
}

export function getAllRoutes(): Route[] {
  const langs: Language[] = ['fr', 'en'];
  return langs.flatMap((lang) => [
    { name: 'home', lang } as Route,
    ...SECTION_IDS.map((section) => ({ name: 'home', lang, section }) as Route),
    ...UNIFIED_PROJECTS.map((p) => ({ name: 'project', lang, slug: p.id }) as Route),
    { name: 'privacy', lang } as Route,
  ]);
}

function alternatesFor(route: Route) {
  const fr = abs(pathFor({ ...route, lang: 'fr' } as Route));
  const en = abs(pathFor({ ...route, lang: 'en' } as Route));
  return [
    { hreflang: 'fr', href: fr },
    { hreflang: 'en', href: en },
    { hreflang: 'x-default', href: fr },
  ];
}

/**
 * Page titles and meta descriptions, checked against Google's display limits: titles ≤ 60
 * characters and ≤ 580 px (Arial 20 px, what fits before truncation), descriptions 120–160
 * characters and ≤ 920 px (two lines of Arial 14 px). Each one is unique, describes its page
 * in plain words, puts the key information first (mobile cuts sooner) and ends titles with the name.
 */
export const META: Record<string, Record<Language, { title: string; description: string }>> = {
  "home": {
    fr: { title: "Luca Leone · Portfolio en ingénierie des médias, HEIG-VD", description: "Portfolio de Luca Leone, étudiant en ingénierie des médias à la HEIG-VD : communication digitale, UX/UI et développement web." },
    en: { title: "Luca Leone · Media Engineering portfolio, HEIG-VD", description: "Portfolio of Luca Leone, Media Engineering student at HEIG-VD in Switzerland: digital communication, UX/UI design and web development." },
  },
  "projets": {
    fr: { title: "Projets · Communication, UX/UI et web | Luca Leone", description: "Six projets de Luca Leone : plateforme web pour les HUG, réseaux du Karting de Vuiteboeuf, app OceanSight, boutique DriveGear et plus." },
    en: { title: "Projects · Communication, UX/UI and web | Luca Leone", description: "Six projects by Luca Leone: a web platform for the HUG, Karting de Vuiteboeuf’s social media, the OceanSight app and more." },
  },
  "a-propos": {
    fr: { title: "À propos de Luca Leone · Étudiant en ingénierie des médias", description: "Luca Leone, étudiant en ingénierie des médias à la HEIG-VD et community manager au Karting de Vuiteboeuf : parcours et langues." },
    en: { title: "About Luca Leone · Media Engineering student, HEIG-VD", description: "Luca Leone, Media Engineering student at HEIG-VD and community manager at Karting de Vuiteboeuf: education, experience, languages." },
  },
  "contact": {
    fr: { title: "Contacter Luca Leone · Travail de Bachelor, stage, projet", description: "Écrivez à Luca Leone pour un travail de Bachelor, un stage, un emploi ou un projet en communication digitale, UX/UI ou web." },
    en: { title: "Contact Luca Leone · Bachelor thesis, internship, project", description: "Write to Luca Leone about a Bachelor thesis, an internship, a job or a project in digital communication, UX/UI or web development." },
  },
  "privacy": {
    fr: { title: "Politique de confidentialité · Portfolio de Luca Leone", description: "Les données traitées par le portfolio de Luca Leone et vos droits : aucun cookie, aucun suivi publicitaire, hébergé en Suisse." },
    en: { title: "Privacy policy · Luca Leone’s portfolio, Media Engineering", description: "What data Luca Leone’s portfolio processes, and your rights: no cookies, no advertising tracking, hosted in Switzerland." },
  },
  "notfound": {
    fr: { title: "Page introuvable · Portfolio de Luca Leone, HEIG-VD", description: "Cette page n’existe pas ou plus. Découvrez les projets de Luca Leone en communication digitale, UX/UI et développement web." },
    en: { title: "Page not found · Luca Leone’s portfolio, HEIG-VD", description: "This page doesn’t exist anymore. Browse Luca Leone’s projects in digital communication, UX/UI design and web development." },
  },
  "hug": {
    fr: { title: "HUG : plateforme web pour le don du sang | Luca Leone", description: "Pour les HUG, une enquête en ligne qui vérifie l’éligibilité au don du sang avant l’inscription. Laravel et Vue, noté 6/6." },
    en: { title: "HUG: a blood donation web platform | Luca Leone", description: "For the Geneva University Hospitals, an online survey that checks blood donation eligibility before booking. Graded 6/6." },
  },
  "karting-vuiteboeuf": {
    fr: { title: "Karting de Vuiteboeuf : réseaux sociaux | Luca Leone", description: "Community manager du Karting de Vuiteboeuf : stratégie, photo et vidéo sur Instagram et TikTok. 329’000 vues depuis mai." },
    en: { title: "Karting de Vuiteboeuf: social media | Luca Leone", description: "Community manager at Karting de Vuiteboeuf: strategy, photo and video on Instagram, TikTok and Facebook. 329,000 views since May." },
  },
  "oceansight": {
    fr: { title: "OceanSight : app contre les déchets marins | Luca Leone", description: "OceanSight, app mobile pour signaler les déchets marins et rejoindre une mission de nettoyage. Recherche UX, prototype Figma." },
    en: { title: "OceanSight: a marine waste reporting app | Luca Leone", description: "OceanSight, a mobile app to report marine waste and join a clean-up mission. UX research, Figma prototype and user tests, graded 6/6." },
  },
  "etoile-blanche": {
    fr: { title: "L’Étoile Blanche : com’ d’un restaurant | Luca Leone", description: "Nouvelle communication pour L’Étoile Blanche à Lausanne : quatre cartes, affichage pour l’afterwork, anecdotes et réseaux sociaux." },
    en: { title: "L’Étoile Blanche: restaurant communication | Luca Leone", description: "A new communication for L’Étoile Blanche in Lausanne: four menus, an after-work poster campaign, anecdote cards and social media." },
  },
  "drivegear": {
    fr: { title: "DriveGear : boutique e-commerce automobile | Luca Leone", description: "DriveGear, boutique en ligne pour passionnés d’automobile, créée seul de A à Z : marque, WooCommerce, SEO et réseaux. Noté 5.9/6." },
    en: { title: "DriveGear: an automotive e-commerce store | Luca Leone", description: "DriveGear, an online store for car enthusiasts built solo from A to Z: brand, WooCommerce, SEO and social. Graded 5.9/6." },
  },
  "f1-pitwall": {
    fr: { title: "F1 PitWall : app second écran pour la F1 | Luca Leone", description: "F1 PitWall, concept d’app qui place les fans de F1 sur le muret des stands : télémétrie, circuit en direct et prédictions par IA." },
    en: { title: "F1 PitWall: a second-screen app for F1 | Luca Leone", description: "F1 PitWall, an app concept that puts Formula 1 fans on the pit wall: telemetry, a live track map and AI race predictions." },
  },
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
    image: OG_IMAGE_URL,
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
 * images in reading order (or the project's own gallery when it has no case study).
 */
export function projectImagePaths(lang: Language, slug: string): string[] {
  const project = projectsFor(lang).find((p) => p.id === slug);
  if (!project) return [];
  const study = getCaseStudy(slug, lang);
  const paths = study
    ? [
        study.hero?.src ?? project.imageUrl,
        ...study.sections.flatMap((section) =>
          section.content.flatMap((item) => (typeof item === 'string' ? [] : blockImages(item))),
        ),
      ]
    : project.images?.length
      ? project.images
      : [project.imageUrl];
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
    image: images[0],
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
    image: OG_IMAGE_URL,
    imageAlt: 'Luca Leone',
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

function notFoundHead(lang: Language): HeadData {
  return {
    lang,
    title: META.notfound[lang].title,
    description: META.notfound[lang].description,
    canonical: abs(homePath(lang)),
    alternates: [],
    ogType: 'profile',
    image: OG_IMAGE_URL,
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

  if (head.noindex) {
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
    ...(head.image === OG_IMAGE_URL
      ? [`<meta property="og:image:width" content="1200" />`, `<meta property="og:image:height" content="630" />`]
      : []),
    `<meta property="og:image:alt" content="${escapeAttr(head.imageAlt)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${escapeAttr(head.title)}" />`,
    `<meta name="twitter:description" content="${escapeAttr(head.description)}" />`,
    `<meta name="twitter:image" content="${head.image}" />`,
    `<script type="application/ld+json">\n${jsonLd}\n</script>`,
  ]
    .map((line) => `    ${line}`)
    .join('\n');
}

/**
 * sitemap.xml: canonical pages only (the section URLs point to the home page), each with its
 * FR/EN alternates and the images it shows (Google Images), plus the CV. `lastmod` comes
 * from the caller (scripts/prerender.mjs: date of the page's last commit), so it only moves
 * when the page really changes; Google ignores a lastmod that changes on every build.
 */
export function renderSitemap(lastmod: { page: (route: Route) => string; cv: string }): string {
  const imageTags = (paths: string[]) => paths.map((p) => `    <image:image><image:loc>${abs(p)}</image:loc></image:image>`);

  const pages = getAllRoutes().filter((route) => !(route.name === 'home' && route.section)).map((route) => {
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
