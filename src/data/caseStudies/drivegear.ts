import { imagesIn, type CaseStudy } from './types';

const img = imagesIn('drivegear');

const DRIVEGEAR_FR: CaseStudy = {
  kicker: 'Cours E-commerce · HEIG-VD',
  title: 'DriveGear',
  hook: 'Une boutique auto suisse, du nom de domaine à la première campagne.',
  intro:
    'Seul, j’ai créé DriveGear de A à Z : la stratégie, la marque, la boutique WooCommerce, les contenus, la newsletter et les réseaux sociaux.',
  meta: [
    { label: 'Contexte', value: 'Cours E-commerce, HEIG-VD' },
    { label: 'Année', value: '2025–2026' },
    { label: 'Durée', value: 'Un semestre' },
    { label: 'Mon rôle', value: 'Tout : stratégie, design, boutique, marketing' },
    { label: 'Équipe', value: 'Projet solo' },
    { label: 'Outils', value: 'WordPress, WooCommerce, Yoast, GA4, Notion' },
  ],
  brief: [
    { label: 'Le constat', text: 'Les boutiques auto en ligne sont soit très techniques, soit génériques, et rarement pensées pour la Suisse.' },
    { label: 'Ma réponse', text: 'Une boutique hybride : vente directe, affiliation et objets imprimés à la demande.' },
    { label: 'Le résultat', text: 'Une boutique en ligne sur drivegear.ch, notée 5.9/6.' },
  ],
  sections: [
    {
      id: 'marche',
      nav: 'Le marché',
      title: 'Une place à prendre',
      content: [
        'La Suisse compte des millions de voitures, dont beaucoup ont besoin d’entretien et d’accessoires. En face, Autodoc mise sur le prix, Swisstuning sur le tuning, Amazon sur le volume. Aucun ne parle à la fois aux passionnés et aux conducteurs du quotidien.',
        {
          type: 'figures',
          items: [
            { value: 4.7, suffix: ' mio', label: 'de voitures en Suisse, dont un tiers ont plus de 10 ans' },
            { value: 14.9, suffix: ' mia', label: 'de francs de commerce en ligne en Suisse en 2024' },
          ],
        },
        'Deux personas ont guidé le projet : Léo, 27 ans, passionné et pilote amateur, qui veut des gadgets et des vêtements à l’image de sa passion ; et Sofia, 33 ans, conductrice pragmatique, qui veut des accessoires fiables, des conseils clairs et une livraison rapide.',
      ],
    },
    {
      id: 'modele',
      nav: 'Le modèle',
      title: 'Trois façons de vendre',
      content: [
        'Pour proposer une offre riche sans stocker de matériel électronique, DriveGear repose sur trois piliers : la vente directe pour l’entretien et l’usage quotidien, l’affiliation pour les gadgets technologiques comme les dashcams, et l’impression à la demande pour les produits lifestyle comme les t-shirts et les posters.',
        {
          type: 'figures',
          items: [
            { value: 40, suffix: ' %', label: 'du chiffre d’affaires visé en vente directe' },
            { value: 35, suffix: ' %', label: 'en affiliation' },
            { value: 25, suffix: ' %', label: 'en impression à la demande' },
          ],
        },
      ],
    },
    {
      id: 'marque',
      nav: 'La marque',
      tone: 'accent',
      title: 'Une marque à créer',
      content: [
        'J’ai dessiné le logo, choisi la palette et la typographie, puis créé les visuels des produits pour que la boutique ait une vraie identité, entre passion automobile et lifestyle.',
        {
          type: 'gallery',
          cols: 2,
          items: [
            img('logo-ligne', 1200, 900, 'Logo DriveGear en version horizontale, lettres noires géométriques'),
            img('couleurs', 1600, 1131, 'Palette de couleurs de DriveGear : rouge, bleu, bleu nuit, noir et bleu très clair'),
          ],
        },
        {
          type: 'gallery',
          cols: 3,
          caption: 'Quelques visuels des produits de la boutique.',
          items: [
            img('produit-kit', 1000, 1000, 'Kit de nettoyage intérieur utilisé sur le tableau de bord d’une voiture'),
            img('produit-gant', 1000, 1000, 'Mains gantées de cuir sur le volant en bois d’une voiture ancienne'),
            img('produit-led', 1000, 1000, 'Éclairage LED hexagonal au plafond d’un garage'),
            img('produit-brosse', 1000, 1000, 'Brosse spéciale pour nettoyer les jantes'),
            img('produit-dashcam', 1000, 1000, 'Caméra embarquée fixée au pare-brise d’une voiture'),
            img('produit-housse', 1000, 1000, 'Housse de protection posée sur une voiture'),
          ],
        },
      ],
    },
    {
      id: 'boutique',
      nav: 'La boutique',
      title: 'Du wireframe à la boutique',
      content: [
        {
          type: 'compare',
          before: img('avant-accueil', 1600, 1000, 'Wireframe en noir et blanc de la page d’accueil'),
          after: img('apres-accueil', 1600, 1000, 'Page d’accueil de DriveGear : « Votre route. Votre style. Votre passion. »'),
          beforeLabel: 'Wireframe',
          afterLabel: 'Boutique en ligne',
          caption: 'La page d’accueil, du wireframe à la boutique en ligne. Faites glisser pour comparer.',
        },
        'Peu de catégories, une hiérarchie claire et des appels à l’action toujours visibles : la navigation a été pensée pour qu’on comprenne l’offre en quelques secondes, sans la surcharge des grandes plateformes.',
        {
          type: 'steps',
          frame: 'screen',
          steps: [
            {
              text: 'L’accueil pose l’univers : votre route, votre style, votre passion.',
              image: img('site-accueil', 1600, 1000, 'Page d’accueil de DriveGear avec une voiture de sport jaune'),
            },
            {
              text: 'Chaque fiche produit est optimisée pour le référencement : description, caractéristiques et photos.',
              image: img('site-produit', 1600, 1000, 'Fiche produit d’un spray rénovateur pour plastiques, avec prix et boutons d’achat'),
            },
            {
              text: 'Le panier et le paiement fonctionnent de bout en bout, avec PayPal et le virement.',
              image: img('site-panier', 1600, 1000, 'Page du panier avec deux produits, le total et le bouton de paiement PayPal'),
            },
          ],
        },
      ],
    },
    {
      id: 'croissance',
      nav: 'Faire venir',
      title: 'Faire venir les clients',
      content: [
        'Une boutique ne sert à rien si personne ne la trouve. J’ai optimisé le référencement avec Yoast et la Search Console, écrit des articles de blog avec l’aide de l’IA, mis en place une newsletter avec pop-up, double confirmation et mail de bienvenue, ouvert Instagram, Facebook, TikTok et WhatsApp, et conçu une campagne publicitaire suivie dans Google Analytics.',
      ],
    },
    {
      id: 'resultats',
      nav: 'Résultats',
      title: 'Résultats',
      content: [
        {
          type: 'figures',
          items: [
            { value: 5.9, suffix: '/6', label: 'note du projet' },
            { value: 30, label: 'produits au catalogue' },
            { value: 3, label: 'modèles de vente dans une même boutique' },
          ],
        },
        { type: 'quote', text: 'Globalement, c’est un excellent travail.', source: 'Retour du professeur' },
      ],
    },
    {
      id: 'retenu',
      nav: 'Ce que je retiens',
      title: 'Ce que je retiens',
      content: [
        'Le plus stimulant a été d’explorer les coulisses du e-commerce : comprendre comment vente directe, affiliation et impression à la demande se complètent, et construire une identité de marque du logo jusqu’à la boutique.',
        'Gérer seul 30 produits demande déjà une rigueur de chaque instant. Ça m’a donné une idée vertigineuse de ce que gèrent les grandes enseignes.',
      ],
    },
  ],
  credits: [{ name: 'Luca Leone', role: 'Projet solo' }],
  creditsNote: 'Cours E-commerce du Bachelor en Ingénierie des médias, HEIG-VD, avec le professeur Arnaud Dufour.',
};

const DRIVEGEAR_EN: CaseStudy = {
  kicker: 'E-commerce course · HEIG-VD',
  title: 'DriveGear',
  hook: 'A Swiss car store, from the domain name to the first campaign.',
  intro:
    'On my own, I built DriveGear from A to Z: the strategy, the brand, the WooCommerce store, the content, the newsletter and the social media.',
  meta: [
    { label: 'Context', value: 'E-commerce course, HEIG-VD' },
    { label: 'Year', value: '2025–2026' },
    { label: 'Duration', value: 'One semester' },
    { label: 'My role', value: 'Everything: strategy, design, store, marketing' },
    { label: 'Team', value: 'Solo project' },
    { label: 'Tools', value: 'WordPress, WooCommerce, Yoast, GA4, Notion' },
  ],
  brief: [
    { label: 'The gap', text: 'Online car stores are either highly technical or generic, and rarely designed for Switzerland.' },
    { label: 'My answer', text: 'A hybrid store: direct sales, affiliate products and print-on-demand.' },
    { label: 'The result', text: 'A live store at drivegear.ch, graded 5.9/6.' },
  ],
  sections: [
    {
      id: 'marche',
      nav: 'The market',
      title: 'A gap in the market',
      content: [
        'Switzerland has millions of cars, many of them in need of care and accessories. Meanwhile, Autodoc competes on price, Swisstuning on tuning, Amazon on volume. None of them speaks to enthusiasts and everyday drivers at the same time.',
        {
          type: 'figures',
          items: [
            { value: 4.7, suffix: ' mio', label: 'cars in Switzerland, a third of them over 10 years old' },
            { value: 14.9, suffix: ' bn', label: 'Swiss francs of online retail in Switzerland in 2024' },
          ],
        },
        'Two personas guided the project: Léo, 27, an enthusiast and amateur racer who wants gadgets and clothes that reflect his passion; and Sofia, 33, a pragmatic driver who wants reliable accessories, clear advice and fast delivery.',
      ],
    },
    {
      id: 'modele',
      nav: 'The model',
      title: 'Three ways to sell',
      content: [
        'To offer a rich range without stocking electronics, DriveGear rests on three pillars: direct sales for care and everyday use, affiliate links for tech gadgets such as dashcams, and print-on-demand for lifestyle products such as t-shirts and posters.',
        {
          type: 'figures',
          items: [
            { value: 40, suffix: '%', label: 'of target revenue from direct sales' },
            { value: 35, suffix: '%', label: 'from affiliate sales' },
            { value: 25, suffix: '%', label: 'from print-on-demand' },
          ],
        },
      ],
    },
    {
      id: 'marque',
      nav: 'The brand',
      tone: 'accent',
      title: 'A brand to create',
      content: [
        'I drew the logo, chose the palette and typeface, then created the product visuals so the store would have a real identity, between car culture and lifestyle.',
        {
          type: 'gallery',
          cols: 2,
          items: [
            img('logo-ligne', 1200, 900, 'Horizontal DriveGear logo, geometric black letters'),
            img('couleurs', 1600, 1131, 'DriveGear colour palette: red, blue, navy, black and very light blue'),
          ],
        },
        {
          type: 'gallery',
          cols: 3,
          caption: 'A few of the store’s product visuals.',
          items: [
            img('produit-kit', 1000, 1000, 'Interior cleaning kit used on a car dashboard'),
            img('produit-gant', 1000, 1000, 'Leather-gloved hands on the wooden steering wheel of a classic car'),
            img('produit-led', 1000, 1000, 'Hexagonal LED lighting on a garage ceiling'),
            img('produit-brosse', 1000, 1000, 'Special brush for cleaning wheel rims'),
            img('produit-dashcam', 1000, 1000, 'Dashcam mounted on a car windscreen'),
            img('produit-housse', 1000, 1000, 'Protective cover on a car'),
          ],
        },
      ],
    },
    {
      id: 'boutique',
      nav: 'The store',
      title: 'From wireframe to store',
      content: [
        {
          type: 'compare',
          before: img('avant-accueil', 1600, 1000, 'Black and white wireframe of the home page'),
          after: img('apres-accueil', 1600, 1000, 'DriveGear home page: “Your road. Your style. Your passion.”'),
          beforeLabel: 'Wireframe',
          afterLabel: 'Live store',
          caption: 'The home page, from wireframe to live store. Drag to compare.',
        },
        'Few categories, a clear hierarchy and calls to action always in sight: navigation is designed so you understand the offer in seconds, without the clutter of the big marketplaces.',
        {
          type: 'steps',
          frame: 'screen',
          steps: [
            {
              text: 'The home page sets the tone: your road, your style, your passion.',
              image: img('site-accueil', 1600, 1000, 'DriveGear home page with a yellow sports car'),
            },
            {
              text: 'Every product page is optimised for search: description, specifications and photos.',
              image: img('site-produit', 1600, 1000, 'Product page of a plastic restorer spray, with price and buy buttons'),
            },
            {
              text: 'Cart and checkout work end to end, with PayPal and bank transfer.',
              image: img('site-panier', 1600, 1000, 'Cart page with two products, the total and the PayPal button'),
            },
          ],
        },
      ],
    },
    {
      id: 'croissance',
      nav: 'Bringing traffic',
      title: 'Bringing customers in',
      content: [
        'A store is useless if nobody finds it. I optimised search with Yoast and Search Console, wrote blog articles with the help of AI, set up a newsletter with a pop-up, double opt-in and welcome email, opened Instagram, Facebook, TikTok and WhatsApp, and designed an ad campaign tracked in Google Analytics.',
      ],
    },
    {
      id: 'resultats',
      nav: 'Results',
      title: 'Results',
      content: [
        {
          type: 'figures',
          items: [
            { value: 5.9, suffix: '/6', label: 'project grade' },
            { value: 30, label: 'products in the catalogue' },
            { value: 3, label: 'sales models in a single store' },
          ],
        },
        { type: 'quote', text: 'Overall, it’s excellent work.', source: 'Feedback from the professor' },
      ],
    },
    {
      id: 'retenu',
      nav: 'What I take away',
      title: 'What I take away',
      content: [
        'The most exciting part was exploring the backstage of e-commerce: understanding how direct sales, affiliate links and print-on-demand complement each other, and building a brand identity from the logo all the way to the store.',
        'Running 30 products on my own already takes constant rigour. It gave me a dizzying idea of what the big retailers manage.',
      ],
    },
  ],
  credits: [{ name: 'Luca Leone', role: 'Solo project' }],
  creditsNote: 'E-commerce course of the Bachelor in Media Engineering, HEIG-VD, with Professor Arnaud Dufour.',
};

export const drivegear = { fr: DRIVEGEAR_FR, en: DRIVEGEAR_EN };
