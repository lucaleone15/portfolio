import { Language } from './types';
import { PROJECTS_EN, PROJECTS_FR, UNIFIED_PROJECTS, USER_INFO } from './data/portfolioData';
import { homePath, pathFor, privacyPath, projectPath, Route } from './router';

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

const HOME_COPY = {
  fr: {
    title: 'Luca Leone – Portfolio · Ingénierie des médias HEIG-VD',
    description:
      'Portfolio de Luca Leone, étudiant en ingénierie des médias à la HEIG-VD (Yverdon-les-Bains) : communication numérique, UI/UX design, développement web et production média.',
    imageAlt: 'Portrait de Luca Leone, étudiant en ingénierie des médias à la HEIG-VD',
    ogAlt: 'Luca Leone. — Portfolio, ingénierie des médias, HEIG-VD',
    projectsList: 'Projets de Luca Leone',
    home: 'Accueil',
    projects: 'Projets',
  },
  en: {
    title: 'Luca Leone – Portfolio · Media Engineering HEIG-VD',
    description:
      'Portfolio of Luca Leone, Media Engineering student at HEIG-VD (Yverdon-les-Bains, Switzerland): digital communication, UI/UX design, web development and media production.',
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

function projectHead(lang: Language, slug: string): HeadData | null {
  const project = projectsFor(lang).find((p) => p.id === slug);
  if (!project) return null;

  const copy = HOME_COPY[lang];
  const url = abs(projectPath(lang, slug));
  const images = (project.images?.length ? project.images : [project.imageUrl]).map(abs);
  const title = `${project.name} – ${project.subtitle} | Luca Leone`;

  return {
    lang,
    title,
    description: project.summary,
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
          description: project.summary,
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
          description: project.summary,
          abstract: project.overview,
          genre: project.category,
          image: images,
          dateCreated: project.year,
          inLanguage: IN_LANGUAGE[lang],
          keywords: project.stack.join(', '),
          author: { '@id': PERSON_ID },
          creator: { '@id': PERSON_ID },
          ...(project.pdfUrl ? { associatedMedia: { '@type': 'MediaObject', contentUrl: abs(project.pdfUrl), encodingFormat: 'application/pdf' } } : {}),
        },
        {
          '@type': 'BreadcrumbList',
          '@id': `${url}#breadcrumb`,
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: copy.home, item: abs(homePath(lang)) },
            { '@type': 'ListItem', position: 2, name: copy.projects, item: `${abs(homePath(lang))}#projets` },
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
  const title = lang === 'fr' ? 'Politique de confidentialité | Luca Leone' : 'Privacy policy | Luca Leone';
  const description =
    lang === 'fr'
      ? 'Quelles données le portfolio de Luca Leone traite, pourquoi, et vos droits : aucun cookie, aucun suivi tiers, hébergement en Suisse.'
      : 'What data Luca Leone’s portfolio processes, why, and your rights: no cookies, no third-party tracking, hosted in Switzerland.';
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
    title: lang === 'fr' ? 'Page introuvable | Luca Leone' : 'Page not found | Luca Leone',
    description: lang === 'fr' ? 'Cette page n’existe pas ou plus.' : 'This page doesn’t exist anymore.',
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
    `<meta property="og:url" content="${head.canonical}" />`,
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

export function renderSitemap(lastmod: string): string {
  const pages = getAllRoutes().map((route) => {
    const head = getHeadData(route);
    const links = head.alternates
      .map((a) => `    <xhtml:link rel="alternate" hreflang="${a.hreflang}" href="${a.href}" />`)
      .join('\n');
    const priority = route.name === 'home' ? '1.0' : route.name === 'privacy' ? '0.3' : '0.8';
    return `  <url>\n    <loc>${head.canonical}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>${priority}</priority>\n${links}\n  </url>`;
  });

  const pdfs = [{ pdfUrl: USER_INFO.cv }, ...UNIFIED_PROJECTS].filter((p) => p.pdfUrl).map(
    (p) => `  <url>\n    <loc>${abs(p.pdfUrl!)}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <priority>0.5</priority>\n  </url>`,
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
    ...pages,
    ...pdfs,
    '</urlset>',
    '',
  ].join('\n');
}
