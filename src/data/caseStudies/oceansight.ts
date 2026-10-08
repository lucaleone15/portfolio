import { imagesIn, type CaseStudy } from './types';

const os = imagesIn('oceansight');

const OCEANSIGHT_FR: CaseStudy = {
  kicker: 'HEIG-VD · ODD 14, vie aquatique',
  title: 'OceanSight',
  hook: 'Les gens de la mer voient les déchets. Ils ne savent pas à qui les signaler.',
  intro:
    'Avec Sacha Loskov et Romain Blanchard, j’ai conçu une app mobile qui permet à n’importe qui de signaler des filets fantômes et des îles de plastique, puis de rejoindre une mission pour les ramasser.',
  meta: [
    { label: 'Contexte', value: 'Cours Bases UI/UX, HEIG-VD' },
    { label: 'Année', value: '2026' },
    { label: 'Durée', value: 'Un semestre' },
    { label: 'Mon rôle', value: 'UX/UI design, de la recherche au prototype' },
    { label: 'Équipe', value: '3 étudiants' },
    { label: 'Outils', value: 'Figma, FigJam' },
  ],
  brief: [
    { label: 'Le problème', text: 'Pêcheurs, plaisanciers et ONG croisent des déchets en mer sans savoir comment les signaler.' },
    { label: 'Notre réponse', text: 'Une app collaborative : signaler, rejoindre une mission, suivre son impact.' },
    { label: 'Le résultat', text: '6/6 en UX et 5.4/6 en UI, après des tests avec cinq personnes.' },
  ],
  sections: [
    {
      id: 'constat',
      nav: 'Le constat',
      title: 'Un océan qui se vide',
      content: [
        'Le cours nous demandait de choisir un des Objectifs de développement durable de l’ONU et d’y répondre par le design. Après trois mind maps, nous avons retenu la vie aquatique : la pollution y est aussi souvent invisible, et c’est là qu’une app pouvait agir vite.',
        {
          type: 'figures',
          items: [
            { value: 11, suffix: ' mio', label: 'de tonnes de plastique finissent en mer chaque année' },
            { value: 6500, label: 'espèces aquatiques menacées' },
            { value: 17, suffix: ' %', label: 'de biomasse marine en moins d’ici 2100' },
          ],
        },
        'Nous nous sommes concentrés sur deux fléaux concrets : les filets de pêche abandonnés, qui continuent de piéger des animaux, et les îles flottantes de plastique.',
      ],
    },
    {
      id: 'recherche',
      nav: 'Les utilisateurs',
      title: 'Trois profils, un même blocage',
      content: [
        {
          type: 'steps',
          frame: 'plain',
          steps: [
            {
              text: 'Le pêcheur veut agir et refuse d’abandonner ses filets, mais il se sent impuissant face à l’ampleur des dégâts, et chaque démarche lui fait perdre du temps.',
              image: os('persona-pecheur', 1200, 680, 'Fiche persona du pêcheur : description, aisance avec la technologie, motivations et points de douleur'),
            },
            {
              text: 'Le plaisancier croise des déchets lors de ses sorties, sans savoir à qui s’adresser. Il veut que son temps en mer ait un impact mesurable.',
              image: os('persona-plaisancier', 1200, 677, 'Fiche persona du plaisancier, passionné d’océan et de technologie'),
            },
            {
              text: 'La responsable d’ONG, le persona que j’ai construit, croule sous les signalements imprécis : sans photo ni position fiable, impossible d’envoyer une équipe.',
              image: os('persona-ong', 1200, 677, 'Fiche persona de la responsable d’ONG qui coordonne des missions de dépollution'),
            },
          ],
        },
        'Les trois profils butaient sur le même point : ils voient le problème, mais rien ne leur permet de le signaler simplement, ni de passer à l’action.',
      ],
    },
    {
      id: 'idee',
      nav: 'L’idée',
      title: 'Trois idées, une seule retenue',
      content: [
        {
          type: 'strip',
          items: [
            os('mindmap-vie-aquatique', 1000, 750, 'Mind map dessinée à la main autour de la vie aquatique', 'Vie aquatique'),
            os('mindmap-consommation', 1000, 751, 'Mind map dessinée à la main autour de la consommation responsable', 'Consommation responsable'),
            os('mindmap-education', 1000, 753, 'Mind map dessinée à la main autour de l’éducation de qualité', 'Éducation de qualité'),
          ],
        },
        'Notre question : comment simplifier le signalement des filets abandonnés et des îles de plastique ? Nous avons exploré trois pistes : un éco-score qui récompense les pêcheurs, un outil qui prédit les zones d’accumulation grâce aux courants marins, et une app de signalement ouverte à tous.',
        'Nous avons gardé la troisième. C’est la plus accessible, celle qui rassemble le plus de monde autour d’une même cause, et chaque signalement crée une donnée géolocalisée utile aux ONG comme aux scientifiques.',
      ],
    },
    {
      id: 'app',
      nav: 'L’app',
      title: 'L’app',
      content: [
        {
          type: 'steps',
          frame: 'mockup',
          steps: [
            {
              text: 'Rejoindre la communauté : un compte suffit pour signaler et participer.',
              image: os('app-1-accueil', 1600, 1200, 'Écran d’accueil « Join us » sur une photo de déchets plastiques en mer'),
            },
            {
              text: 'Trouver une mission sur la carte ou dans une liste, filtrée par région, type de déchet ou difficulté.',
              image: os('app-2-carte', 1600, 1200, 'Deux écrans : la carte des missions et la liste des missions avec leurs photos'),
            },
            {
              text: 'Chaque mission indique le lieu, la date et ce qui a été vu. On la rejoint en un geste.',
              image: os('app-3-mission', 1600, 1200, 'Écran de détail d’une mission : photo, type de déchet, lieu, date et description'),
            },
            {
              text: 'Après une mission, le rapport documente l’action et les espèces sauvées, avec leur fiche.',
              image: os('app-4-rapport', 1600, 1200, 'Deux écrans : le détail d’une mission et la liste des espèces sauvées'),
            },
            {
              text: 'Le profil montre son impact : missions réalisées, kilos de plastique retirés, espèces sauvées, badges.',
              image: os('app-5-profil', 1600, 1200, 'Écran du profil avec les badges, les statistiques et le nombre de missions réalisées'),
            },
          ],
        },
      ],
    },
    {
      id: 'design',
      nav: 'Le design',
      title: 'Une identité couleur océan',
      tone: 'accent',
      content: [
        'Pour l’interface, nous avons construit un design system complet : une palette de dix teintes de vert d’eau, une typographie hiérarchisée et une bibliothèque de composants réutilisables, des cartes de mission aux filtres.',
        {
          type: 'gallery',
          cols: 3,
          items: [
            os('logo', 1600, 900, 'Logo OceanSight : un globe et le nom de l’app sur fond vert d’eau'),
            os('design-typo-couleurs', 1600, 900, 'Échelle typographique et palette de dix teintes de vert d’eau'),
            os('design-composants', 1600, 900, 'Composants de l’interface : cartes de mission, filtres, tri et carte'),
          ],
        },
      ],
    },
    {
      id: 'tests',
      nav: 'Tests et résultats',
      title: 'Cinq testeurs, cinq frictions',
      content: [
        'Nous avons fait tester le prototype à cinq personnes. Chaque friction est devenue une piste d’amélioration : pouvoir zoomer sur la carte, faire défiler les espèces et les badges, agrandir les photos de la galerie, et valider ses filtres avec un bouton.',
        {
          type: 'quote',
          text: 'Quand je remplis les filtres, je m’attends à avoir un bouton pour les valider.',
          source: 'Participante aux tests',
        },
        'Il nous restait du temps après les tests : nous avons intégré quatre des cinq améliorations dans le prototype final.',
        {
          type: 'figures',
          items: [
            { value: 6, suffix: '/6', label: 'note en UX' },
            { value: 5.4, suffix: '/6', label: 'note en UI' },
            { value: 5, label: 'personnes ont testé le prototype' },
            { value: 4, label: 'améliorations intégrées après les tests' },
          ],
        },
        {
          type: 'quote',
          text: 'Le design system est solide et démontre une bonne compréhension des principes d’accessibilité, de grille et de Gestalt.',
          source: 'Retour des enseignants',
        },
      ],
    },
    {
      id: 'retenu',
      nav: 'Ce que je retiens',
      title: 'Ce que je retiens',
      content: [
        'J’ai suivi pour la première fois une vraie démarche UX de bout en bout : de la recherche aux personas, de l’idée au prototype, puis aux tests. Les retours des testeurs ont été précieux, chaque friction relevée nous a fait progresser.',
        'Je suis fier du chemin parcouru avec Sacha et Romain, et encore plus de ce que nous avons appris ensemble.',
      ],
    },
  ],
  credits: [
    { name: 'Luca Leone', role: 'UX/UI design' },
    { name: 'Sacha Loskov', role: 'UX/UI design' },
    { name: 'Romain Blanchard', role: 'UX/UI design' },
  ],
  creditsNote: 'Cours Bases UI/UX du Bachelor en Ingénierie des médias, HEIG-VD. Accompagnement : Marie Kuter et Patrick Donaldson.',
};


const OCEANSIGHT_EN: CaseStudy = {
  kicker: 'HEIG-VD · SDG 14, life below water',
  title: 'OceanSight',
  hook: 'People at sea see the waste. They don’t know who to report it to.',
  intro:
    'With Sacha Loskov and Romain Blanchard, I designed a mobile app that lets anyone report ghost nets and plastic islands, then join a mission to clean them up.',
  meta: [
    { label: 'Context', value: 'UI/UX Fundamentals course, HEIG-VD' },
    { label: 'Year', value: '2026' },
    { label: 'Duration', value: 'One semester' },
    { label: 'My role', value: 'UX/UI design, from research to prototype' },
    { label: 'Team', value: '3 students' },
    { label: 'Tools', value: 'Figma, FigJam' },
  ],
  brief: [
    { label: 'The problem', text: 'Fishers, sailors and NGOs come across waste at sea without knowing how to report it.' },
    { label: 'Our answer', text: 'A collaborative app: report, join a mission, track your impact.' },
    { label: 'The result', text: '6/6 in UX and 5.4/6 in UI, after testing with five people.' },
  ],
  sections: [
    {
      id: 'constat',
      nav: 'The issue',
      title: 'An ocean running empty',
      content: [
        'The course asked us to pick one of the UN Sustainable Development Goals and answer it through design. After three mind maps, we chose life below water: pollution there is often invisible, and that’s where an app could act quickly.',
        {
          type: 'figures',
          items: [
            { value: 11, suffix: ' mio', label: 'tonnes of plastic end up in the sea every year' },
            { value: 6500, label: 'aquatic species under threat' },
            { value: 17, suffix: '%', label: 'less marine biomass by 2100' },
          ],
        },
        'We focused on two concrete threats: abandoned fishing nets, which keep trapping animals, and floating islands of plastic.',
      ],
    },
    {
      id: 'recherche',
      nav: 'The users',
      title: 'Three profiles, one roadblock',
      content: [
        {
          type: 'steps',
          frame: 'plain',
          steps: [
            {
              text: 'The fisher wants to act and refuses to abandon his nets, but feels powerless against the scale of the damage, and every procedure costs him time.',
              image: os('persona-pecheur', 1200, 680, 'Fisher persona card: description, comfort with technology, motivations and pain points'),
            },
            {
              text: 'The sailor comes across waste on his trips without knowing who to contact. He wants his time at sea to have a measurable impact.',
              image: os('persona-plaisancier', 1200, 677, 'Persona card of the sailor, passionate about the ocean and technology'),
            },
            {
              text: 'The NGO coordinator, the persona I built, is swamped with imprecise reports: without a photo or a reliable position, she can’t send a team.',
              image: os('persona-ong', 1200, 677, 'Persona card of the NGO coordinator who organises clean-up missions'),
            },
          ],
        },
        'All three profiles hit the same wall: they see the problem, but nothing lets them report it simply, or take action.',
      ],
    },
    {
      id: 'idee',
      nav: 'The idea',
      title: 'Three ideas, one kept',
      content: [
        {
          type: 'strip',
          items: [
            os('mindmap-vie-aquatique', 1000, 750, 'Hand-drawn mind map about life below water', 'Life below water'),
            os('mindmap-consommation', 1000, 751, 'Hand-drawn mind map about responsible consumption', 'Responsible consumption'),
            os('mindmap-education', 1000, 753, 'Hand-drawn mind map about quality education', 'Quality education'),
          ],
        },
        'Our question: how can we simplify the reporting of abandoned nets and plastic islands? We explored three leads: an eco-score that rewards fishers, a tool that predicts accumulation zones from ocean currents, and a reporting app open to everyone.',
        'We kept the third. It is the most accessible, the one that rallies the most people around a common cause, and every report creates geolocated data useful to NGOs and scientists alike.',
      ],
    },
    {
      id: 'app',
      nav: 'The app',
      title: 'The app',
      content: [
        {
          type: 'steps',
          frame: 'mockup',
          steps: [
            {
              text: 'Join the community: one account is enough to report and take part.',
              image: os('app-1-accueil', 1600, 1200, '“Join us” welcome screen over a photo of plastic waste at sea'),
            },
            {
              text: 'Find a mission on the map or in a list, filtered by region, type of waste or difficulty.',
              image: os('app-2-carte', 1600, 1200, 'Two screens: the mission map and the list of missions with their photos'),
            },
            {
              text: 'Each mission shows the place, the date and what was spotted. You join it in one tap.',
              image: os('app-3-mission', 1600, 1200, 'Mission detail screen: photo, type of waste, place, date and description'),
            },
            {
              text: 'After a mission, the report documents the action and the species saved, each with its own card.',
              image: os('app-4-rapport', 1600, 1200, 'Two screens: mission details and the list of saved species'),
            },
            {
              text: 'The profile shows your impact: missions completed, kilos of plastic removed, species saved, badges.',
              image: os('app-5-profil', 1600, 1200, 'Profile screen with badges, statistics and the number of missions completed'),
            },
          ],
        },
      ],
    },
    {
      id: 'design',
      nav: 'The design',
      title: 'An ocean-coloured identity',
      tone: 'accent',
      content: [
        'For the interface, we built a complete design system: a palette of ten sea-green shades, a clear type hierarchy and a library of reusable components, from mission cards to filters.',
        {
          type: 'gallery',
          cols: 3,
          items: [
            os('logo', 1600, 900, 'OceanSight logo: a globe and the app name on a sea-green background'),
            os('design-typo-couleurs', 1600, 900, 'Type scale and a palette of ten sea-green shades'),
            os('design-composants', 1600, 900, 'Interface components: mission cards, filters, sorting and map'),
          ],
        },
      ],
    },
    {
      id: 'tests',
      nav: 'Tests and results',
      title: 'Five testers, five frictions',
      content: [
        'Five people tested the prototype. Each friction became an improvement: zooming on the map, scrolling through species and badges, enlarging gallery photos, and confirming filters with a button.',
        {
          type: 'quote',
          text: 'When I fill in the filters, I expect a button to apply them.',
          source: 'Test participant',
        },
        'We still had time after the tests, so we built four of the five improvements into the final prototype.',
        {
          type: 'figures',
          items: [
            { value: 6, suffix: '/6', label: 'UX grade' },
            { value: 5.4, suffix: '/6', label: 'UI grade' },
            { value: 5, label: 'people tested the prototype' },
            { value: 4, label: 'improvements built in after testing' },
          ],
        },
        {
          type: 'quote',
          text: 'The design system is solid and shows a good understanding of accessibility, grid and Gestalt principles.',
          source: 'Feedback from the teachers',
        },
      ],
    },
    {
      id: 'retenu',
      nav: 'What I take away',
      title: 'What I take away',
      content: [
        'For the first time, I followed a real UX process end to end: from research to personas, from the idea to the prototype, then to testing. The testers’ feedback was invaluable; every friction they found made us better.',
        'I’m proud of the road we travelled with Sacha and Romain, and even more of what we learned together.',
      ],
    },
  ],
  credits: [
    { name: 'Luca Leone', role: 'UX/UI design' },
    { name: 'Sacha Loskov', role: 'UX/UI design' },
    { name: 'Romain Blanchard', role: 'UX/UI design' },
  ],
  creditsNote: 'UI/UX Fundamentals course of the Bachelor in Media Engineering, HEIG-VD. Supervised by Marie Kuter and Patrick Donaldson.',
};

export const oceansight = { fr: OCEANSIGHT_FR, en: OCEANSIGHT_EN };
