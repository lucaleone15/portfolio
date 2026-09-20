import { Project, SkillCategory, EducationMilestone } from '../types';

export const USER_INFO = {
  name: 'Luca Leone',
  title: 'Étudiant en ingénierie des médias',
  subtitle: 'Communication · Marketing digital · Design · Web · UI/UX',
  email: 'lucaleone2004@gmail.com',
  phone: '+41 79 868 72 04',
  linkedin: 'https://linkedin.com/in/leone-luca',
  linkedinLabel: 'linkedin.com/in/leone-luca',
  // User's exact requested profile text
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

export const PROJECTS_FR: Project[] = [
  {
    id: 'pulse-app',
    number: '01',
    title: 'PULSE',
    subtitle: 'Application mobile de santé',
    client: "Projet d'application mobile",
    year: '2024',
    category: 'UI/UX Design',
    role: 'UI/UX Design',
    summary: "Application mobile de santé et bien-être : suivi d'activité, visualisations en temps réel et interface fluide.",
    overview: "Conception ergonomique complète d'une application mobile facilitant le suivi quotidien des habitudes saines. L'accent a été mis sur la clarté des indicateurs visuels et la fluidité des micro-interactions.",
    imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop'
    ],
    challenges: [
      "Visualiser des indicateurs physiologiques complexes sans surcharger l'écran.",
      'Créer une routine utilisateur engageante et motivante au quotidien.',
      'Garantir une hiérarchie visuelle contrastée adaptée aux écrans mobiles.'
    ],
    solutions: [
      'Tableaux de bord modulaires avec jauges circulaires et graphiques épurés.',
      'Composants interactifs avec transitions fluides sur Figma.',
      'Système de design cohérent fondé sur des tokens modulaires.'
    ],
    metrics: [
      { label: 'Plateforme', value: 'iOS & Android' },
      { label: 'Design System', value: 'Figma Tokens' },
      { label: 'Prototype', value: 'Interactif' },
      { label: 'Thème', value: 'Santé & Routine' }
    ],
    stack: ['Figma', 'UI/UX Design', 'Design System', 'Mobile App'],
    accentColor: '#CCFF00',
    badgeBg: 'bg-white/10 text-white',
    featuredType: 'custom'
  },
  {
    id: 'lumen-studio',
    number: '02',
    title: 'LUMEN STUDIO',
    subtitle: 'Boutique en ligne & E-Commerce',
    client: 'Studio de luminaires & design',
    year: '2024',
    category: 'UI/UX Design',
    role: 'UI/UX Design',
    summary: "Boutique en ligne minimaliste et soignée : catalogue immersif, fiches produits sculpturales et tunnel d'achat fluide.",
    overview: "Direction artistique et conception d'une expérience de shopping numérique contemporaine pour des pièces d'éclairage architectural. Travail poussé sur le rendu des textures et l'éclairage photographique.",
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1200&auto=format&fit=crop'
    ],
    challenges: [
      'Mettre en valeur le travail de la lumière et des matériaux nobles en ligne.',
      "Proposer une navigation fluide sans friction vers le panier.",
      'Harmoniser typographie élégante et réactivité mobile.'
    ],
    solutions: [
      "Mise en page éditoriale spacieuse avec grand format d'image.",
      'Fiches produits interactives avec aperçu 360° et spécifications claires.',
      'Intégration réactive optimisée pour un chargement rapide.'
    ],
    metrics: [
      { label: 'Type', value: 'E-Commerce' },
      { label: 'Univers', value: 'Design & Lumière' },
      { label: 'Responsive', value: 'Mobile-First' },
      { label: 'Tunnel', value: '3 étapes' }
    ],
    stack: ['Vue.js', 'UI/UX Design', 'E-Commerce', 'Tailwind CSS'],
    accentColor: '#CCFF00',
    badgeBg: 'bg-neutral-900 text-white',
    featuredType: 'custom'
  },
  {
    id: 'karting-vuiteboeuf',
    number: '03',
    title: 'KARTING VUITEBOEUF',
    subtitle: 'Création de contenus & Réseaux sociaux',
    client: 'Karting Vuiteboeuf',
    year: '2024',
    category: 'Communication Digitale',
    role: 'Communication Digitale',
    summary: "Gestion des réseaux sociaux, création de contenus photo/vidéo sur circuit et promotion des événements.",
    overview: "Développement de la stratégie de marque pour l'un des plus importants complexes de karting en Suisse romande. Coordination éditoriale, production de visuels dynamiques et animation de la communauté.",
    imageUrl: 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1596727147705-61a532a659bd?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop'
    ],
    challenges: [
      'Captation dynamique sur piste avec forte vitesse et conditions de lumière changeantes.',
      'Fédérer deux audiences distinctes : le grand public loisirs et les pilotes de compétition.',
      'Maintenir un calendrier éditorial régulier et réactif entre les événements et les courses.'
    ],
    solutions: [
      "Production de formats courts verticaux (TikTok, Reels) axés sur l'immersion et l'adrénaline.",
      "Conception de gabarits visuels harmonisés pour les annonces d'événements et résultats de course.",
      "Coordination directe entre le site web officiel et les réseaux sociaux pour convertir l'engagement en réservations."
    ],
    metrics: [
      { label: 'Plateformes', value: 'Instagram & TikTok' },
      { label: 'Contenus', value: 'Photo, Vidéo, Print' },
      { label: 'Canaux', value: 'Web & Réseaux' },
      { label: 'Secteur', value: 'Sport Automobile' }
    ],
    stack: ['Instagram', 'TikTok', 'Premiere Pro', 'Photoshop', 'Canva'],
    accentColor: '#CCFF00',
    badgeBg: 'bg-red-950 text-red-200',
    featuredType: 'custom',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    pdfTitle: 'Dossier de communication & Plan médias · Karting Vuiteboeuf'
  },
  {
    id: 'nova-editorial',
    number: '04',
    title: 'NOVA MAGAZINE',
    subtitle: 'Média interactif & Webzine',
    client: 'Publication digitale indépendante',
    year: '2025',
    category: 'Développement Web',
    role: 'Développement Web',
    summary: "Webzine interactif explorant les cultures numériques, le design d'interaction et la création multimédia.",
    overview: "Conception et développement d'une plateforme éditoriale moderne dotée d'un mode de lecture immersif, d'animations au défilement soignées et d'un système de typographie suisse rigoureux.",
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1481487196290-c152efe083f5?q=80&w=1200&auto=format&fit=crop'
    ],
    challenges: [
      "Proposer une expérience de lecture confortable sur tous formats d'écrans.",
      "Intégrer du contenu multimédia (vidéos, galeries d'images, audio) sans ralentir l'affichage.",
      'Composer une grille typographique flexible et expressive.'
    ],
    solutions: [
      'Architecture modulaire en composants TypeScript avec optimisation des images.',
      'Barre de progression de lecture et indicateurs discrets de chapitres.',
      'Navigation intuitive avec filtres thématiques instantanés.'
    ],
    metrics: [
      { label: 'Type', value: 'Webzine Digital' },
      { label: 'Stack', value: 'TypeScript & Vite' },
      { label: 'Accessibilité', value: 'WCAG AA' },
      { label: 'Performance', value: 'Score 98+' }
    ],
    stack: ['TypeScript', 'Tailwind CSS', 'UI/UX Design', 'Design Éditorial'],
    accentColor: '#CCFF00',
    badgeBg: 'bg-emerald-950 text-emerald-200',
    featuredType: 'custom'
  }
];

export const PROJECTS_EN: Project[] = [
  {
    id: 'pulse-app',
    number: '01',
    title: 'PULSE',
    subtitle: 'Health & Wellness Mobile App',
    client: 'Mobile App Project',
    year: '2024',
    category: 'UI/UX Design',
    role: 'UI/UX Design',
    summary: 'Health and wellness mobile application: activity tracking, real-time data visualisations, and intuitive interactions.',
    overview: 'Comprehensive ergonomic design of a mobile application supporting healthy daily habits. Emphasis was placed on clear visual indicators and seamless micro-interactions.',
    imageUrl: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551650975-87deedd944c3?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1616469829941-c7200edec809?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?q=80&w=1200&auto=format&fit=crop'
    ],
    challenges: [
      'Visualizing complex physiological metrics without cluttering mobile screens.',
      'Building an engaging and motivating daily user routine.',
      'Ensuring strong visual hierarchy tailored for diverse mobile screens.'
    ],
    solutions: [
      'Modular dashboards with circular progress rings and clean minimalist charts.',
      'Interactive prototyping with fluid animated micro-interactions in Figma.',
      'Consistent design system built on reusable tokens and components.'
    ],
    metrics: [
      { label: 'Platform', value: 'iOS & Android' },
      { label: 'Design System', value: 'Figma Tokens' },
      { label: 'Prototype', value: 'Interactive' },
      { label: 'Theme', value: 'Health & Wellness' }
    ],
    stack: ['Figma', 'UI/UX Design', 'Design System', 'Mobile App'],
    accentColor: '#CCFF00',
    badgeBg: 'bg-white/10 text-white',
    featuredType: 'custom'
  },
  {
    id: 'lumen-studio',
    number: '02',
    title: 'LUMEN STUDIO',
    subtitle: 'Online Shop & E-Commerce',
    client: 'Lighting & Architectural Design Studio',
    year: '2024',
    category: 'UI/UX Design',
    role: 'UI/UX Design',
    summary: 'Refined minimalist online shop: immersive product catalog, sculptural detail pages, and seamless checkout flow.',
    overview: 'Art direction and digital shopping experience design for architectural lighting pieces. Deep focus on texture rendering and photographic lighting.',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=1200&auto=format&fit=crop'
    ],
    challenges: [
      'Highlighting delicate lighting and noble materials in an online medium.',
      'Delivering frictionless navigation and a seamless path to checkout.',
      'Harmonizing elegant editorial typography with responsive mobile performance.'
    ],
    solutions: [
      'Spacious editorial layout with high-resolution imagery and generous breathing room.',
      'Interactive product sheets with 360° visual previews and clear technical specs.',
      'Optimized responsive integration ensuring rapid page load times.'
    ],
    metrics: [
      { label: 'Type', value: 'E-Commerce' },
      { label: 'Industry', value: 'Design & Lighting' },
      { label: 'Responsive', value: 'Mobile-First' },
      { label: 'Checkout', value: '3 steps' }
    ],
    stack: ['Vue.js', 'UI/UX Design', 'E-Commerce', 'Tailwind CSS'],
    accentColor: '#CCFF00',
    badgeBg: 'bg-neutral-900 text-white',
    featuredType: 'custom'
  },
  {
    id: 'karting-vuiteboeuf',
    number: '03',
    title: 'KARTING VUITEBOEUF',
    subtitle: 'Social Media & Content Creation',
    client: 'Karting Vuiteboeuf',
    year: '2024',
    category: 'Communication Digitale',
    role: 'Communication Digitale',
    summary: 'Social media administration, trackside photo/video creation, and promotion of events.',
    overview: "Brand strategy development for one of French-speaking Switzerland's largest karting centers. Editorial alignment, high-energy visuals production, and community engagement.",
    imageUrl: 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1596727147705-61a532a659bd?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511919884226-fd3cad34687c?q=80&w=1200&auto=format&fit=crop'
    ],
    challenges: [
      'Dynamic high-speed on-track shooting under rapidly shifting indoor/outdoor lighting.',
      'Uniting two distinct target audiences: casual leisure visitors and competitive racers.',
      'Maintaining a consistent, reactive content calendar synchronized with races and events.'
    ],
    solutions: [
      'Production of immersive short-form vertical videos (TikTok, Reels) highlighting adrenaline.',
      'Harmonized visual templates for event announcements and race results.',
      'Direct coordination between official website and social media to convert engagement into bookings.'
    ],
    metrics: [
      { label: 'Platforms', value: 'Instagram & TikTok' },
      { label: 'Content', value: 'Photo, Video, Print' },
      { label: 'Channels', value: 'Web & Social' },
      { label: 'Industry', value: 'Motorsport' }
    ],
    stack: ['Instagram', 'TikTok', 'Premiere Pro', 'Photoshop', 'Canva'],
    accentColor: '#CCFF00',
    badgeBg: 'bg-red-950 text-red-200',
    featuredType: 'custom',
    pdfUrl: 'https://raw.githubusercontent.com/mozilla/pdf.js/ba2edeae/web/compressed.tracemonkey-pldi-09.pdf',
    pdfTitle: 'Communication Dossier & Media Plan · Karting Vuiteboeuf'
  },
  {
    id: 'nova-editorial',
    number: '04',
    title: 'NOVA MAGAZINE',
    subtitle: 'Interactive Media & Webzine',
    client: 'Independent digital publication',
    year: '2025',
    category: 'Développement Web',
    role: 'Développement Web',
    summary: 'Interactive webzine exploring digital cultures, interaction design, and multimedia creation.',
    overview: 'Design and development of a modern editorial platform featuring immersive reading mode, smooth scroll animations, and a disciplined Swiss typography system.',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=1200&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1481487196290-c152efe083f5?q=80&w=1200&auto=format&fit=crop'
    ],
    challenges: [
      'Delivering a comfortable reading experience across all screen sizes.',
      'Integrating rich multimedia (videos, image galleries, audio) without performance hitches.',
      'Composing an expressive, flexible typographic grid.'
    ],
    solutions: [
      'Modular TypeScript component architecture with proactive image optimization.',
      'Reading progress indicator and discrete chapter markers.',
      'Intuitive navigation with instant thematic filters.'
    ],
    metrics: [
      { label: 'Type', value: 'Digital Webzine' },
      { label: 'Stack', value: 'TypeScript & Vite' },
      { label: 'Accessibility', value: 'WCAG AA' },
      { label: 'Performance', value: 'Score 98+' }
    ],
    stack: ['TypeScript', 'Tailwind CSS', 'UI/UX Design', 'Editorial Design'],
    accentColor: '#CCFF00',
    badgeBg: 'bg-emerald-950 text-emerald-200',
    featuredType: 'custom'
  }
];

export const PROJECTS = PROJECTS_FR;

export const EDUCATION_TIMELINE: EducationMilestone[] = [
  {
    period: '2024 - 2027',
    title: 'Bachelor of Science en ingénierie des médias',
    institution: 'HEIG-VD',
    location: 'Yverdon-les-Bains, Suisse',
    details: "Stratégie et innovation digitale, développement web, marketing et conception d’interfaces utilisateur (UX/UI)."
  },
  {
    period: '2023 - 2024',
    title: 'Maturité spécialisée communication information',
    institution: "Ecole Romande d'Arts et Communication (ERACOM)",
    location: 'Lausanne, Suisse',
    details: "Communication visuelle, médias interactifs, création print et numérique, formats audiovisuels."
  },
  {
    period: '2020 – 2023',
    title: 'Certificat de culture générale communication information',
    institution: "Gymnase d'Yverdon",
    location: 'Yverdon-les-Bains, Suisse',
    details: ''
  }
];

export const EXPERIENCE_TIMELINE = [
  {
    period: 'mai 2026 - aujourd’hui · 5 mois',
    title: 'Responsable communication digitale',
    company: 'Karting - Indépendant',
    location: 'Vuitebœuf, Vaud, Suisse · Hybride',
    description: "Stratégie de marque et réseaux sociaux (Instagram, TikTok), production photo/vidéo sur piste et promotion d'événements."
  },
  {
    period: 'juil. 2022 · 1 mois',
    title: 'Stagiaire',
    company: 'Groupe AFH Automobile - Stage',
    location: 'Yverdon-les-Bains, Vaud, Suisse · Sur site',
    description: "Relation clientèle, support administratif et gestion de la communication digitale commerciale."
  }
];
