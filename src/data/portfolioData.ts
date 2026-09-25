import { Project } from '../types';

export const USER_INFO = {
  name: 'Luca Leone',
  title: 'Étudiant en ingénierie des médias',
  subtitle: 'Communication · Marketing digital · Design · Web · UI/UX',
  email: 'luca@luca-leone.ch',
  phone: '+41 79 868 72 04',
  linkedin: 'https://linkedin.com/in/leone-luca',
  linkedinLabel: 'linkedin.com/in/leone-luca',
  bio: "Étudiant en dernière année de Bachelor en ingénierie des médias à la HEIG-VD, je me forme à la communication digitale, au design et aux technologies web, avec une approche qui combine créativité et technique.\n\nJ’aime concevoir des projets numériques de A à Z, de l’idée à sa réalisation : création de contenus, communication sur les réseaux sociaux, identité visuelle, UI/UX, conception de sites web et développement de projets digitaux.\n\nEn parallèle de mes études, je travaille comme community manager pour le Karting de Vuiteboeuf, où je mets en pratique ces compétences à travers la création de contenus photo et vidéo, la gestion des réseaux sociaux et le développement de la présence digitale de la marque.\n\nCurieux et polyvalent, j’aime apprendre, expérimenter avec de nouveaux outils et transformer des idées en projets concrets. Toujours intéressé par de nouvelles collaborations et opportunités dans le digital.",
  bioEn: "As a final-year Bachelor student in Media Engineering at HEIG-VD, I specialize in digital communication, design, and web technologies, with an approach that bridges creativity and technical execution.\n\nI love crafting digital projects from A to Z, from initial concept to deployment: content creation, social media strategy, visual identity, UI/UX, website design, and interactive media.\n\nAlongside my studies, I work as a community manager for Karting de Vuiteboeuf, applying these skills through photo and video production, social media management, and expanding the brand's digital presence.\n\nCurious and versatile, I thrive on learning, experimenting with new tools, and turning ideas into tangible digital realities. Always open to new collaborations and digital opportunities.",
  languagesFr: [
    { name: 'Français', level: 'Langue maternelle' },
    { name: 'Anglais', level: 'Niveau C1' },
    { name: 'Italien', level: 'Niveau B2' }
  ],
  languagesEn: [
    { name: 'French', level: 'Native language' },
    { name: 'English', level: 'C1 Level' },
    { name: 'Italian', level: 'B2 Level' }
  ],
  passionsFr: ['Automobile & Circuit', 'Sport', 'Voyages & Découvertes', 'Nouvelles Technologies'],
  passionsEn: ['Automotive & Racing', 'Sports & Fitness', 'Travel & Culture', 'New Technologies']
};

/**
 * Single source of truth for all projects.
 * Shared technical data (images, PDFs, year, stack) is defined once.
 * Language-specific text is localized into `fr` and `en` sub-objects.
 */
export interface UnifiedProjectDefinition {
  id: string;
  number: string;
  year: string;
  imageUrl: string;
  images: string[];
  pdfUrl?: string;
  pdfTitle?: string;
  pdfTitleEn?: string;
  stack: string[];
  accentColor?: string;
  fr: {
    title: string;
    subtitle: string;
    client: string;
    category: string;
    role: string;
    team?: string;
    summary: string;
    overview: string;
    challenges: string[];
    solutions: string[];
    metrics: { label: string; value: string }[];
  };
  en: {
    title: string;
    subtitle: string;
    client: string;
    category: string;
    role: string;
    team?: string;
    summary: string;
    overview: string;
    challenges: string[];
    solutions: string[];
    metrics: { label: string; value: string }[];
  };
}

export const UNIFIED_PROJECTS: UnifiedProjectDefinition[] = [
  {
    id: 'hug-sang',
    number: '01',
    year: '2026',
    imageUrl: '/images/HUG-01.webp',
    images: [
      '/images/HUG-01.webp',
      '/images/HUG-02.webp',
      '/images/HUG-03.webp',
      '/images/HUG-04.webp',
      '/images/HUG-05.webp',
      '/images/HUG-06.webp',
      '/images/HUG-07.webp'
    ],
    pdfUrl: '/pdf/ProjInt1_HUG.pdf',
    pdfTitle: 'Projet Sangsationnel · HUG',
    stack: [
      'Laravel & Vue.js',
      'UI/UX Design',
      'Communication Digitale',
      'Print & Social Media'
    ],
    accentColor: '#991B1B',
    fr: {
      title: 'HUG',
      subtitle: 'Campagne digitale & plateforme web',
      client: 'Hôpitaux universitaires de Genève · Projet académique',
      category: 'Projet 360°',
      role: 'Conception 360° (UX/UI, Dév & Com)',
      team: 'Marc Bridy, Romain Blanchard, Étienne Bergeon, Liliana Kolmakova, Christophe Cunha et Assya Mghirbi.',
      summary: 'Conception d’une campagne de communication et d’une plateforme digitale gamifiée pour dynamiser les collectes de sang au sein des entreprises partenaires des HUG.',
      overview: 'Projet 360° réalisé dans le cadre d’un projet académique pour les Hôpitaux universitaires de Genève. Sangsationnel transforme le don du sang en une enquête interactive afin de rendre la participation plus engageante. Le projet couvre l’ensemble de l’expérience : conception UX/UI, identité et direction artistique, plateforme web full-stack, contenus pour les réseaux sociaux, affiches, bannières intranet et supports promotionnels. La plateforme permet notamment aux collaborateurs de créer leur profil, de passer un quiz d’éligibilité, d’accéder aux informations de leur collecte et de suivre leur impact. Un dashboard administrateur permet aux entreprises de suivre les statistiques de leurs campagnes.',
      challenges: [
        'Dynamiser les collectes de sang au sein des entreprises partenaires et favoriser la participation.',
        'Transformer un sujet institutionnel en une expérience de communication engageante et mémorable.',
        'Décliner un même concept sur différents supports tout en conservant une identité visuelle cohérente.',
        'Concevoir une expérience digitale complète, de l’interface utilisateur à l’administration des campagnes.'
      ],
      solutions: [
        'Création d’un univers d’investigation dans lequel chaque participant devient un agent et doit établir son profil avant de rejoindre une mission.',
        'Conception d’une plateforme web co-brandée adaptée à chaque entreprise partenaire, avec couleurs, logos et informations personnalisées.',
        'Développement full-stack avec Laravel, Vue.js et MySQL, incluant le parcours utilisateur et le dashboard administrateur.',
        'Création de contenus de communication pour les réseaux sociaux, affiches, bannières intranet et supports promotionnels.',
        'Mise en place d’un système de reconnaissance avec un label automatique et un trophée annuel récompensant l’engagement des entreprises.'
      ],
      metrics: [
        { label: 'Type', value: 'Projet 360°' },
        { label: 'Digital', value: 'Web Full-Stack' },
        { label: 'Communication', value: 'Print & Social Media' },
        { label: 'Stack', value: 'Laravel & Vue.js' }
      ]
    },
    en: {
      title: 'HUG',
      subtitle: 'Digital campaign & web platform',
      client: 'Geneva University Hospitals · Academic project',
      category: '360° Project',
      role: '360° Lead (UX/UI, Dev & Com)',
      team: 'Marc Bridy, Romain Blanchard, Étienne Bergeon, Liliana Kolmakova, Christophe Cunha and Assya Mghirbi.',
      summary: 'Design of a communication campaign and gamified digital platform to increase blood donation participation within partner companies of the Geneva University Hospitals.',
      overview: 'A 360° academic project developed for the Geneva University Hospitals. Sangsationnel transforms blood donation into an interactive investigation to make participation more engaging. The project covers the entire experience: UX/UI design, visual identity and art direction, a full-stack web platform, social media content, posters, intranet banners and promotional materials. The platform allows employees to create their profile, complete an eligibility quiz, access information about their company’s blood drive and track their impact. An administrative dashboard allows companies to monitor campaign statistics.',
      challenges: [
        'Increase participation in blood drives within partner companies.',
        'Transform an institutional topic into an engaging and memorable communication experience.',
        'Adapt the same concept across multiple communication channels while maintaining a consistent visual identity.',
        'Design a complete digital experience, from the user interface to campaign administration.'
      ],
      solutions: [
        'Creation of an investigation universe in which each participant becomes an agent and establishes their profile before joining a mission.',
        'Design of a co-branded web experience adapted to each partner company, with personalized colors, logos and information.',
        'Full-stack development using Laravel, Vue.js and MySQL, including the user journey and administrative dashboard.',
        'Creation of communication content for social media, posters, intranet banners and promotional materials.',
        'Implementation of a recognition system combining an automatic label and an annual trophy rewarding company engagement.'
      ],
      metrics: [
        { label: 'Type', value: '360° Project' },
        { label: 'Digital', value: 'Full-Stack Web' },
        { label: 'Communication', value: 'Print & Social Media' },
        { label: 'Stack', value: 'Laravel & Vue.js' }
      ]
    }
  },
  {
    id: 'karting-vuiteboeuf',
    number: '02',
    year: '2026',
    imageUrl: '/images/KV-01.webp',
    images: [
      '/images/KV-01.webp',
      '/images/KV-03.webp',
      '/images/KV-04.webp',
      '/images/KV-05.webp',
      '/images/KV-06.webp',
      '/images/KV-07.webp'
    ],
    pdfUrl: '/pdf/Repenser-la-communication-digitale-du-Karting-Vuiteboeuf.pdf',
    pdfTitle: 'Dossier de communication & contenus · Karting Vuiteboeuf',
    pdfTitleEn: 'Communication & Content Strategy · Karting Vuiteboeuf',
    stack: [
      'Stratégie Social Media',
      'Instagram & TikTok',
      'Photo & Vidéo',
      'Premiere Pro'
    ],
    accentColor: '#DC2626',
    fr: {
      title: 'KARTING VUITEBOEUF',
      subtitle: 'Communication digitale & création de contenus',
      client: 'Karting de Vuiteboeuf',
      category: 'Communication Digitale',
      role: 'Responsable communication digitale',
      summary: 'Développement de la présence digitale du Karting de Vuiteboeuf à travers la création de contenus, la gestion des réseaux sociaux et la promotion des offres et événements.',
      overview: "Accompagnement du Karting de Vuiteboeuf dans le développement de son image et de sa présence en ligne. De la conception à la publication, je prends en charge la création de contenus photo et vidéo, l'animation d'Instagram et TikTok ainsi que la communication autour des offres, événements, compétitions et activités du circuit.",
      challenges: [
        'Moderniser et dynamiser la présence du karting sur les réseaux sociaux.',
        'Créer des contenus capables de transmettre les sensations et l’expérience vécue sur le circuit.',
        'Communiquer efficacement sur les offres, événements, compétitions et activités auprès des publics loisirs et compétition.'
      ],
      solutions: [
        'Production de contenus photo et vidéo directement sur le circuit, de la captation à la publication.',
        'Création de formats adaptés à Instagram et TikTok : Reels, vidéos courtes, stories, carrousels et visuels.',
        'Mise en place de contenus récurrents autour des courses, résultats, meilleurs chronos, offres et activités du karting.'
      ],
      metrics: [
        { label: 'Plateformes', value: 'Instagram & TikTok' },
        { label: 'Formats', value: 'Photo, Vidéo & Reels' },
        { label: 'Communication', value: 'Web & Réseaux sociaux' },
        { label: 'Secteur', value: 'Sport & Loisirs' }
      ]
    },
    en: {
      title: 'KARTING VUITEBOEUF',
      subtitle: 'Digital communication & content creation',
      client: 'Karting de Vuiteboeuf',
      category: 'Digital Communication',
      role: 'Digital Communications Manager',
      summary: "Developing Karting de Vuiteboeuf's digital presence through content creation, social media management and the promotion of offers and events.",
      overview: 'Supporting Karting de Vuiteboeuf in developing its digital image and online presence. From concept to publication, I manage photo and video content creation, Instagram and TikTok activity, as well as communication around offers, events, competitions and activities at the circuit.',
      challenges: [
        'Modernize and strengthen the karting center’s presence on social media.',
        'Create content that communicates the sensations and experience of being on the track.',
        'Effectively communicate offers, events, competitions and activities to both leisure and competitive audiences.'
      ],
      solutions: [
        'Production of photo and video content directly at the circuit, from shooting to publication.',
        'Creation of formats adapted to Instagram and TikTok: Reels, short-form videos, stories, carousels and visuals.',
        'Development of recurring content around races, results, fastest lap times, offers and karting activities.'
      ],
      metrics: [
        { label: 'Platforms', value: 'Instagram & TikTok' },
        { label: 'Formats', value: 'Photo, Video & Reels' },
        { label: 'Communication', value: 'Web & Social Media' },
        { label: 'Industry', value: 'Motorsport & Leisure' }
      ]
    }
  },
  {
    id: 'oceansight',
    number: '03',
    year: '2026',
    imageUrl: '/images/OceanSight-01.webp',
    images: [
      '/images/OceanSight-01.webp',
      '/images/OceanSight-02.webp',
      '/images/OceanSight-03.webp'
    ],
    pdfUrl: '/pdf/OceanSight.pdf',
    pdfTitle: 'OceanSight · UI/UX Design',
    stack: [
      'UI/UX Design',
      'Figma & Prototypage',
      'Tests utilisateurs',
      'Design Mobile'
    ],
    accentColor: '#166534',
    fr: {
      title: 'OCEANSIGHT',
      subtitle: 'Application mobile de signalement des déchets marins',
      client: 'Projet académique · HEIG-VD',
      category: 'UI/UX Design',
      role: 'UI/UX Design',
      team: 'Sacha Loskov et Romain Blanchard.',
      summary: "Conception d'une application mobile collaborative simplifiant le signalement des déchets marins et encourageant l'action collective.",
      overview: "Projet UI/UX réalisé dans le cadre d'un semestre à la HEIG-VD avec Sacha Loskov et Romain Blanchard. OceanSight propose une plateforme collaborative permettant de signaler des déchets marins, de rejoindre des missions de nettoyage, de découvrir les espèces menacées et de suivre son impact grâce à des statistiques et des achievements. Le projet s'est appuyé sur une démarche UX itérative intégrant prototypage, tests utilisateurs et amélioration continue de l'expérience.",
      challenges: [
        'Simplifier le signalement des déchets marins pour des utilisateurs aux profils variés.',
        "Concevoir une expérience suffisamment intuitive pour transformer l'identification d'un problème en action concrète.",
        "Organiser de nombreuses fonctionnalités — carte, galerie, filtres, missions et suivi de l'impact — sans complexifier la navigation."
      ],
      solutions: [
        'Conception d’une plateforme mobile collaborative permettant de signaler des filets fantômes et des accumulations de plastique.',
        'Création d’un parcours utilisateur combinant carte interactive, galerie, filtres, missions de nettoyage et suivi de l’impact.',
        'Prototypage, tests utilisateurs et itérations successives pour identifier et corriger les frictions de navigation et d’interaction.'
      ],
      metrics: [
        { label: 'Type', value: 'Application mobile' },
        { label: 'Démarche', value: 'UX & Prototypage' },
        { label: 'Évaluation UI', value: '5.8 / 6' },
        { label: 'Évaluation UX', value: '6 / 6' }
      ]
    },
    en: {
      title: 'OCEANSIGHT',
      subtitle: 'Mobile app for marine waste reporting',
      client: 'Academic project · HEIG-VD',
      category: 'UI/UX Design',
      role: 'UI/UX Design',
      team: 'Sacha Loskov and Romain Blanchard.',
      summary: 'Design of a collaborative mobile application that simplifies marine waste reporting and encourages collective action.',
      overview: 'UI/UX project developed over a semester at HEIG-VD with Sacha Loskov and Romain Blanchard. OceanSight is a collaborative platform designed to report marine waste, join clean-up missions, discover endangered species and track personal impact through statistics and achievements. The project followed an iterative UX approach combining prototyping, user testing and continuous improvements to the experience.',
      challenges: [
        'Simplify marine waste reporting for users with different profiles and levels of engagement.',
        'Design an intuitive experience that turns identifying a problem into concrete action.',
        'Organize multiple features — map, gallery, filters, missions and impact tracking — without making navigation more complex.'
      ],
      solutions: [
        'Design of a collaborative mobile platform for reporting ghost fishing nets and plastic waste accumulation.',
        'Creation of a user journey combinant l’application d’une carte interactive, gallery, filtres, missions et suivi.',
        'Prototyping, user testing and iterative improvements to identify and resolve navigation and interaction issues.'
      ],
      metrics: [
        { label: 'Type', value: 'Mobile Application' },
        { label: 'Approach', value: 'UX & Prototyping' },
        { label: 'UI Score', value: '5.8 / 6' },
        { label: 'UX Score', value: '6 / 6' }
      ]
    }
  },
  {
    id: 'drivegear',
    number: '04',
    year: '2025',
    imageUrl: '/images/DriveGear-01.webp',
    images: [
      '/images/DriveGear-01.webp',
      '/images/DriveGear-03.webp',
      '/images/DriveGear-04.webp'
    ],
    stack: [
      'E-Commerce',
      'WordPress & WooCommerce',
      'UI/UX Design'
    ],
    accentColor: '#38BDF8',
    fr: {
      title: 'DRIVEGEAR',
      subtitle: 'Boutique e-commerce automobile',
      client: 'Projet académique · HEIG-VD',
      category: 'E-Commerce',
      role: 'Conception & UX/UI',
      summary: "Conception d'une boutique e-commerce spécialisée dans l'univers automobile, développée sur WordPress et WooCommerce.",
      overview: "Création de DriveGear, une boutique en ligne dédiée aux passionnés d'automobile. Le projet porte sur la conception de l'expérience utilisateur, la structuration du catalogue, l'identité visuelle et la mise en place de la boutique avec WordPress et WooCommerce. Une attention particulière a été portée à la clarté de la navigation, à la présentation des produits et à la cohérence de l'ensemble de l'expérience d'achat.",
      challenges: [
        'Structurer une boutique automobile avec une navigation claire et intuitive.',
        'Créer une identité visuelle cohérente avec l’univers automobile.',
        'Présenter efficacement les produits et leurs informations tout au long du parcours d’achat.'
      ],
      solutions: [
        'Conception de l’interface et de l’expérience utilisateur de la boutique.',
        'Structuration du catalogue et des différentes catégories de produits.',
        'Création d’une identité visuelle distinctive et intégration de la boutique avec WordPress et WooCommerce.'
      ],
      metrics: [
        { label: 'Type', value: 'E-Commerce' },
        { label: 'CMS', value: 'WordPress' },
        { label: 'Plateforme', value: 'WooCommerce' },
        { label: 'Évaluation', value: '5.9 / 6' }
      ]
    },
    en: {
      title: 'DRIVEGEAR',
      subtitle: 'Automotive e-commerce store',
      client: 'Academic project · HEIG-VD',
      category: 'E-Commerce',
      role: 'Design & UX/UI',
      summary: 'Design of an e-commerce store dedicated to the automotive world, built with WordPress and WooCommerce.',
      overview: 'Creation of DriveGear, an online store dedicated to automotive enthusiasts. The project focused on user experience, catalogue structure, visual identity and the implementation of the online store using WordPress and WooCommerce. Particular attention was given to clear navigation, product presentation and a consistent purchasing experience.',
      challenges: [
        'Structure an automotive store with clear and intuitive navigation.',
        'Create a visual identity consistent with the automotive world.',
        'Present products and their information effectively throughout the purchasing journey.'
      ],
      solutions: [
        'Design of the store interface and overall user experience.',
        'Structuring of the product catalogue and its different categories.',
        'Creation of a distinctive visual identity and implementation of the store with WordPress and WooCommerce.'
      ],
      metrics: [
        { label: 'Type', value: 'E-Commerce' },
        { label: 'CMS', value: 'WordPress' },
        { label: 'Platform', value: 'WooCommerce' },
        { label: 'Evaluation', value: '5.9 / 6' }
      ]
    }
  }
];

export const PROJECTS_FR: Project[] = UNIFIED_PROJECTS.map((item) => ({
  id: item.id,
  number: item.number,
  year: item.year,
  imageUrl: item.imageUrl,
  images: item.images,
  pdfUrl: item.pdfUrl,
  pdfTitle: item.pdfTitle || item.fr.title,
  stack: item.stack,
  accentColor: item.accentColor,
  ...item.fr
}));

export const PROJECTS_EN: Project[] = UNIFIED_PROJECTS.map((item) => ({
  id: item.id,
  number: item.number,
  year: item.year,
  imageUrl: item.imageUrl,
  images: item.images,
  pdfUrl: item.pdfUrl,
  pdfTitle: item.pdfTitleEn || item.pdfTitle || item.en.title,
  stack: item.stack,
  accentColor: item.accentColor,
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

