import type React from 'react';
import { Project, ProjectLogo } from '../types';

export const USER_INFO = {
  name: 'Luca Leone',
  email: 'luca@luca-leone.ch',
  phone: '+41 79 868 72 04',
  linkedin: 'https://linkedin.com/in/leone-luca',
  cv: '/pdf/CV-LucaLeone2026.pdf',
};

/**
 * Single source of truth for all projects.
 * Shared technical data (images, PDFs, year, stack) is defined once.
 * Language-specific text is localized into `fr` and `en` sub-objects.
 */
export interface UnifiedProjectDefinition {
  /** Also the URL slug: /projets/:id and /en/projects/:id */
  id: string;
  /** pro: real work · school-client: course project for a real client · school: course project, fictional brief */
  kind: ProjectKind;
  /** Proper-case project name used in page titles and structured data */
  name: string;
  number: string;
  year: string;
  imageUrl: string;
  stack: string[];
  /** English labels of `stack` (same order) */
  stackEn: string[];
  /** Project colour (taken from the project's own documents): buttons, badges and accent texts */
  accentColor?: string;
  /** Same role on the dark theme, when the brand has a lighter variant that reads better there */
  accentColorDark?: string;
  /** Brand logo shown in place of the project's name (scripts/make-project-logos.py) */
  logo?: ProjectLogo;
  /** Short "dive into the screen" clip played on the card while hovered (public/videos/).
      Its first frame is the cover (`imageUrl`, same framing and colours): no shift when it starts */
  video?: string;
  fr: {
    subtitle: string;
    category: string;
    /** A few words written over the card image: the problem or the stake */
    hook?: string;
    /** My role, in a few words, on the card badge ("Projet solo" when I worked alone) */
    badge?: string;
    summary: string;
    overview: string;
  };
  en: {
    subtitle: string;
    category: string;
    /** A few words written over the card image: the problem or the stake */
    hook?: string;
    /** My role, in a few words, on the card badge ("Projet solo" when I worked alone) */
    badge?: string;
    summary: string;
    overview: string;
  };
}

/** Text on a fill of this colour: white when it reads (≥ 4.5:1, WCAG AA for small text), dark otherwise */
function textOn(hex: string) {
  const channel = (i: number) => {
    const c = parseInt(hex.slice(1 + i * 2, 3 + i * 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(1) + 0.0722 * channel(2);
  return 1.05 / (luminance + 0.05) >= 4.5 ? '#FFFFFF' : '#0A0A0C';
}

/** CSS variables for a project's accent; pair with the `project-accent` class (see index.css). */
export function projectAccentVars(project: Pick<Project, 'accentColor' | 'accentColorDark'>) {
  const light = project.accentColor || '#C50E36';
  const dark = project.accentColorDark || light;
  return {
    '--pa-l': light,
    '--pa-d': dark,
    '--pa-on-l': textOn(light),
    '--pa-on-d': textOn(dark),
  } as React.CSSProperties;
}

export type ProjectKind = 'pro' | 'school-client' | 'school';

/** How a project came about, shown on its card and page */
export const PROJECT_KIND_LABEL: Record<ProjectKind, { fr: string; en: string }> = {
  pro: { fr: 'Projet professionnel', en: 'Professional work' },
  'school-client': { fr: 'Académique · vrai client', en: 'Academic · real client' },
  school: { fr: 'Projet académique', en: 'Academic project' },
};

export const UNIFIED_PROJECTS: UnifiedProjectDefinition[] = [
  {
    id: 'hug',
    kind: 'school-client',
    name: 'HUG',
    number: '01',
    year: '2026',
    imageUrl: '/images/hug-apercu.webp',
    stack: [
      'Laravel & Vue.js',
      'UI/UX Design',
      'Communication Digitale',
      'Print & Social Media'
    ],
    stackEn: ['Laravel & Vue.js', 'UI/UX Design', 'Digital Communication', 'Print & Social Media'],
    // HUG red, as in the project PDF
    accentColor: '#D42524',
    accentColorDark: '#F0514F',
    logo: { src: '/images/logos/hug-color.webp', srcDark: '/images/logos/hug-color-dark.webp', width: 696, height: 160, display: 34 },
    video: '/videos/hug-dive.mp4',
    fr: {
      subtitle: 'Campagne digitale & plateforme web',
      category: 'Développement web',
      hook: '3 inscrits sur 10 repartaient sans donner.',
      badge: 'Développeur full-stack',
      summary: 'Conception d’une campagne de communication et d’une plateforme digitale gamifiée pour dynamiser les collectes de sang au sein des entreprises partenaires des HUG.',
      overview: 'Projet 360° réalisé dans le cadre d’un projet académique pour les Hôpitaux universitaires de Genève. Sangsationnel transforme le don du sang en une enquête interactive afin de rendre la participation plus engageante. Le projet couvre l’ensemble de l’expérience : conception UX/UI, identité et direction artistique, plateforme web full-stack, contenus pour les réseaux sociaux, affiches, bannières intranet et supports promotionnels. La plateforme permet notamment aux collaborateurs de créer leur profil, de passer un quiz d’éligibilité, d’accéder aux informations de leur collecte et de suivre leur impact. Un dashboard administrateur permet aux entreprises de suivre les statistiques de leurs campagnes.',
    },
    en: {
      subtitle: 'Digital campaign & web platform',
      category: 'Web development',
      hook: '3 in 10 donors left without giving.',
      badge: 'Full-stack developer',
      summary: 'Design of a communication campaign and gamified digital platform to increase blood donation participation within partner companies of the Geneva University Hospitals.',
      overview: 'A 360° academic project developed for the Geneva University Hospitals. Sangsationnel transforms blood donation into an interactive investigation to make participation more engaging. The project covers the entire experience: UX/UI design, visual identity and art direction, a full-stack web platform, social media content, posters, intranet banners and promotional materials. The platform allows employees to create their profile, complete an eligibility quiz, access information about their company’s blood drive and track their impact. An administrative dashboard allows companies to monitor campaign statistics.',
    }
  },
  {
    id: 'karting-vuiteboeuf',
    kind: 'pro',
    name: 'Karting de Vuiteboeuf',
    number: '02',
    year: '2026',
    imageUrl: '/images/karting-vuiteboeuf-apercu.webp',
    stack: [
      'Stratégie Social Media',
      'Instagram & TikTok',
      'Photo & Vidéo',
      'Premiere Pro',
      'Automatisation (React, Electron)'
    ],
    stackEn: ['Social Media Strategy', 'Instagram & TikTok', 'Photo & Video', 'Premiere Pro', 'Automation (React, Electron)'],
    // Karting Vuiteboeuf red, as in the project PDF (underlines, italics)
    accentColor: '#D31432',
    accentColorDark: '#F4505F',
    logo: { src: '/images/logos/karting-vuiteboeuf.webp', srcDark: '/images/logos/karting-vuiteboeuf-dark.webp', width: 709, height: 160, display: 34 },
    video: '/videos/karting-vuiteboeuf-dive.mp4',
    fr: {
      subtitle: 'Communication digitale & création de contenus',
      category: 'Communication digitale',
      hook: 'De la piste à 329’000 vues.',
      badge: 'Community manager',
      summary: 'Développement de la présence digitale du Karting de Vuiteboeuf à travers la création de contenus, la gestion des réseaux sociaux et la promotion des offres et événements.',
      overview: "Accompagnement du Karting de Vuiteboeuf dans le développement de son image et de sa présence en ligne. De la conception à la publication, je prends en charge la création de contenus photo et vidéo, l'animation d'Instagram et TikTok ainsi que la communication autour des offres, événements, compétitions et activités du circuit.",
    },
    en: {
      subtitle: 'Digital communication & content creation',
      category: 'Digital communication',
      hook: 'From the track to 329,000 views.',
      badge: 'Community manager',
      summary: "Developing Karting de Vuiteboeuf's digital presence through content creation, social media management and the promotion of offers and events.",
      overview: 'Supporting Karting de Vuiteboeuf in developing its digital image and online presence. From concept to publication, I manage photo and video content creation, Instagram and TikTok activity, as well as communication around offers, events, competitions and activities at the circuit.',
    }
  },
  {
    id: 'oceansight',
    kind: 'school',
    name: 'OceanSight',
    number: '03',
    year: '2026',
    imageUrl: '/images/oceansight-apercu.webp',
    stack: [
      'UI/UX Design',
      'Figma & Prototypage',
      'Tests utilisateurs',
      'Design Mobile'
    ],
    stackEn: ['UI/UX Design', 'Figma & Prototyping', 'User Testing', 'Mobile Design'],
    // OceanSight teal, as in the project PDF: the deep one on light, the bright one on dark
    accentColor: '#275F5F',
    accentColorDark: '#2EBBA6',
    logo: { src: '/images/logos/oceansight.webp', srcDark: '/images/logos/oceansight-dark.webp', width: 482, height: 160, display: 40 },
    video: '/videos/oceansight-dive.mp4',
    fr: {
      subtitle: 'Application mobile de signalement des déchets marins',
      category: 'UX/UI design',
      hook: '11 millions de tonnes de plastique par an.',
      badge: 'Designer UX/UI',
      summary: "Conception d'une application mobile collaborative simplifiant le signalement des déchets marins et encourageant l'action collective.",
      overview: "Projet UI/UX réalisé dans le cadre d'un semestre à la HEIG-VD avec Sacha Loskov et Romain Blanchard. OceanSight propose une plateforme collaborative permettant de signaler des déchets marins, de rejoindre des missions de nettoyage, de découvrir les espèces menacées et de suivre son impact grâce à des statistiques et des achievements. Le projet s'est appuyé sur une démarche UX itérative intégrant prototypage, tests utilisateurs et amélioration continue de l'expérience.",
    },
    en: {
      subtitle: 'Mobile app for marine waste reporting',
      category: 'UX/UI design',
      hook: '11 million tonnes of plastic a year.',
      badge: 'UX/UI designer',
      summary: 'Design of a collaborative mobile application that simplifies marine waste reporting and encourages collective action.',
      overview: 'UI/UX project developed over a semester at HEIG-VD with Sacha Loskov and Romain Blanchard. OceanSight is a collaborative platform designed to report marine waste, join clean-up missions, discover endangered species and track personal impact through statistics and achievements. The project followed an iterative UX approach combining prototyping, user testing and continuous improvements to the experience.',
    }
  },
  {
    id: 'etoile-blanche',
    kind: 'school-client',
    name: 'Étoile Blanche',
    number: '04',
    year: '2026',
    imageUrl: '/images/etoile-blanche-apercu.webp',
    stack: ['Identité & print', 'Réseaux sociaux', 'Campagne d’affichage', 'Canva & Figma'],
    stackEn: ['Identity & print', 'Social media', 'Poster campaign', 'Canva & Figma'],
    // Étoile Blanche red, as on the printed menus
    accentColor: '#AB2328',
    accentColorDark: '#E0484E',
    logo: { src: '/images/logos/etoile-blanche-color.webp', srcDark: '/images/logos/etoile-blanche-color-dark.webp', width: 705, height: 160, display: 34 },
    video: '/videos/etoile-blanche-dive.mp4',
    fr: {
      subtitle: 'Communication d’un restaurant lausannois',
      category: 'Communication digitale',
      hook: 'Une nouvelle direction, une nouvelle image.',
      badge: 'Chef de projet',
      summary: 'Refonte de la communication du restaurant L’Étoile Blanche à Lausanne : cartes, affichage, anecdotes et réseaux sociaux, autour d’un message rassembleur.',
      overview: 'Projet de l’agence étudiante Zest pour le restaurant L’Étoile Blanche à Lausanne, repris par une nouvelle direction : refonte des cartes, campagne d’affichage pour l’afterwork, affichettes « anecdotes » et contenus pour les réseaux sociaux.',
    },
    en: {
      subtitle: 'Communication for a Lausanne restaurant',
      category: 'Digital communication',
      hook: 'New owners, a new image.',
      badge: 'Project lead',
      summary: 'A new communication for L’Étoile Blanche restaurant in Lausanne: menus, posters, anecdote cards and social media, built around one welcoming message.',
      overview: 'A project by the student agency Zest for L’Étoile Blanche, a Lausanne restaurant taken over by new owners: redesigned menus, a poster campaign for the after-work, “anecdote” cards and social media content.',
    }
  },
  {
    id: 'drivegear',
    kind: 'school',
    name: 'DriveGear',
    number: '05',
    year: '2025',
    imageUrl: '/images/drivegear-apercu.webp',
    stack: [
      'E-Commerce',
      'WordPress & WooCommerce',
      'UI/UX Design'
    ],
    stackEn: ['E-Commerce', 'WordPress & WooCommerce', 'UI/UX Design'],
    // DriveGear navy and blue, as in the brand palette
    accentColor: '#2A2A72',
    accentColorDark: '#009FFD',
    logo: { src: '/images/logos/drivegear.webp', srcDark: '/images/logos/drivegear-dark.webp', width: 1111, height: 160, display: 22 },
    video: '/videos/drivegear-dive.mp4',
    fr: {
      subtitle: 'Boutique e-commerce automobile',
      category: 'E-commerce',
      hook: 'Du logo au premier panier.',
      badge: 'Projet solo',
      summary: "Conception d'une boutique e-commerce spécialisée dans l'univers automobile, développée sur WordPress et WooCommerce.",
      overview: "Création de DriveGear, une boutique en ligne dédiée aux passionnés d'automobile. Le projet porte sur la conception de l'expérience utilisateur, la structuration du catalogue, l'identité visuelle et la mise en place de la boutique avec WordPress et WooCommerce. Une attention particulière a été portée à la clarté de la navigation, à la présentation des produits et à la cohérence de l'ensemble de l'expérience d'achat.",
    },
    en: {
      subtitle: 'Automotive e-commerce store',
      category: 'E-commerce',
      hook: 'From logo to first checkout.',
      badge: 'Solo project',
      summary: 'Design of an e-commerce store dedicated to the automotive world, built with WordPress and WooCommerce.',
      overview: 'Creation of DriveGear, an online store dedicated to automotive enthusiasts. The project focused on user experience, catalogue structure, visual identity and the implementation of the online store using WordPress and WooCommerce. Particular attention was given to clear navigation, product presentation and a consistent purchasing experience.',
    }
  },
  {
    id: 'f1-pitwall',
    kind: 'school',
    name: 'F1 PitWall',
    number: '06',
    year: '2025',
    imageUrl: '/images/f1-pitwall-apercu.webp',
    stack: ['Concept produit', 'UI design', 'Données & IA', 'Figma'],
    stackEn: ['Product concept', 'UI design', 'Data & AI', 'Figma'],
    // The app's racing red
    accentColor: '#C8102E',
    accentColorDark: '#F23845',
    logo: { src: '/images/logos/f1-pitwall.webp', srcDark: '/images/logos/f1-pitwall-dark.webp', width: 1792, height: 160, display: 18 },
    video: '/videos/f1-pitwall-dive.mp4',
    fr: {
      subtitle: 'Application de second écran pour la Formule 1',
      category: 'UX/UI design',
      hook: 'Et si on regardait la course comme un ingénieur ?',
      badge: 'Projet solo',
      summary: 'Concept d’une application qui donne aux fans de Formule 1 les données et la stratégie du muret des stands, en direct.',
      overview: 'Projet individuel du cours WebDon : une app de second écran qui affiche le classement détaillé, la télémétrie, la position des pilotes sur le circuit, et des prédictions de course basées sur l’IA et la simulation.',
    },
    en: {
      subtitle: 'A second-screen app for Formula 1',
      category: 'UX/UI design',
      hook: 'What if you watched the race like an engineer?',
      badge: 'Solo project',
      summary: 'Concept for an app that brings the pit wall’s data and strategy to Formula 1 fans, live.',
      overview: 'Individual project for the WebDon course: a second-screen app showing detailed standings, telemetry, drivers’ positions on track, and race predictions powered by AI and simulation.',
    }
  }
];

export const PROJECTS_FR: Project[] = UNIFIED_PROJECTS.map((item) => ({
  id: item.id,
  kind: item.kind,
  name: item.name,
  number: item.number,
  year: item.year,
  imageUrl: item.imageUrl,
  stack: item.stack,
  accentColor: item.accentColor,
  accentColorDark: item.accentColorDark,
  logo: item.logo,
  video: item.video,
  ...item.fr
}));

export const PROJECTS_EN: Project[] = UNIFIED_PROJECTS.map((item) => ({
  id: item.id,
  kind: item.kind,
  name: item.name,
  number: item.number,
  year: item.year,
  imageUrl: item.imageUrl,
  stack: item.stackEn,
  accentColor: item.accentColor,
  accentColorDark: item.accentColorDark,
  logo: item.logo,
  video: item.video,
  ...item.en
}));

export const EDUCATION_TIMELINE = [
  {
    period: '2024 - 2027',
    title: 'Bachelor of Science en ingénierie des médias',
    institution: 'HEIG-VD',
    location: 'Yverdon-les-Bains, Suisse',
    details: "Stratégie & innovation numérique, développement web, marketing et design d'interfaces utilisateur (UX/UI)."
  },
  {
    period: '2023 - 2024',
    title: 'Maturité professionnelle spécialisée en communication et information',
    institution: 'ERACOM',
    location: 'Lausanne, Suisse',
    details: "Communication visuelle, médias interactifs, création de contenus print & digitaux, formats audiovisuels."
  },
  {
    period: '2020 – 2023',
    title: "Certificat d'école de culture générale en communication et information",
    institution: "Gymnase d'Yverdon",
    location: 'Yverdon-les-Bains, Suisse',
    details: ''
  }
];

export const EXPERIENCE_TIMELINE = [
  {
    period: 'Mai 2026 - Aujourd’hui',
    title: 'Responsable communication digitale & création de contenus',
    company: 'Karting de Vuiteboeuf',
    location: 'Vuitebœuf, Vaud, Suisse · Hybride',
    description: "Stratégie de marque & réseaux sociaux (Instagram, TikTok), création et production de contenus photo et vidéo sur circuit, promotion des offres et événements."
  },
  {
    period: 'Juillet 2022 (1 mois)',
    title: 'Stagiaire',
    company: 'Groupe AFH Automobile',
    location: 'Yverdon-les-Bains, Suisse · Sur site',
    description: "Découverte des métiers du commerce automobile, accueil clients, soutien administratif et gestion de la communication commerciale."
  }
];


export const EDUCATION_TIMELINE_EN = [
  {
    period: '2024 - 2027',
    title: 'Bachelor of Science in Media Engineering',
    institution: 'HEIG-VD',
    location: 'Yverdon-les-Bains, Switzerland',
    details: "Digital strategy & innovation, web development, marketing, and user interface design (UX/UI)."
  },
  {
    period: '2023 - 2024',
    title: 'Specialized Baccalaureate in Communication & Information',
    institution: 'ERACOM',
    location: 'Lausanne, Switzerland',
    details: "Visual communication, interactive media, print & digital content creation, audiovisual formats."
  },
  {
    period: '2020 – 2023',
    title: 'General Culture Certificate in Communication & Information',
    institution: "Gymnase d'Yverdon",
    location: 'Yverdon-les-Bains, Switzerland',
    details: ''
  }
];

export const EXPERIENCE_TIMELINE_EN = [
  {
    period: 'May 2026 - Present',
    title: 'Digital Communication & Content Creation Manager',
    company: 'Karting de Vuiteboeuf',
    location: 'Vuitebœuf, Vaud, Switzerland · Hybrid',
    description: 'Brand strategy & social media (Instagram, TikTok), on-track photo/video production, and event campaigns.'
  },
  {
    period: 'July 2022 (1 month)',
    title: 'Intern',
    company: 'Groupe AFH Automobile',
    location: 'Yverdon-les-Bains, Switzerland · On-site',
    description: 'Customer relations, administrative support, and commercial digital communication management.'
  }
];

export const LANGUAGES = {
  fr: [
    { name: 'Français', level: 'Langue maternelle' },
    { name: 'Anglais', level: 'Niveau C1' },
    { name: 'Italien', level: 'Niveau B2' },
  ],
  en: [
    { name: 'French', level: 'Native language' },
    { name: 'English', level: 'C1 Level' },
    { name: 'Italian', level: 'B2 Level' },
  ],
};
