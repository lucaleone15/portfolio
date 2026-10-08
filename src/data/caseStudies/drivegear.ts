import { imagesIn, type CaseStudy } from './types';

const img = imagesIn('drivegear');

const DRIVEGEAR_FR: CaseStudy = {
  kicker: 'Cours E-commerce · HEIG-VD',
  title: 'DriveGear',
  hook: 'Une boutique auto suisse, du nom de domaine à la première campagne.',
  intro:
    'Seul, j’ai créé DriveGear de A à Z : la marque, la boutique WooCommerce, les fiches produits, les contenus, la newsletter et les réseaux sociaux.',
  meta: [
    { label: 'Contexte', value: 'Cours E-commerce, HEIG-VD' },
    { label: 'Année', value: '2025–2026' },
    { label: 'Durée', value: 'Un semestre' },
    { label: 'Mon rôle', value: 'Tout : stratégie, design, boutique, marketing' },
    { label: 'Équipe', value: 'Projet solo' },
    { label: 'Outils', value: 'WordPress, WooCommerce, Yoast, GA4, Notion' },
  ],
  brief: [
    { label: 'L’idée', text: 'Une boutique qui parle à la fois aux passionnés d’automobile et aux conducteurs du quotidien.' },
    { label: 'Mon rôle', text: 'Tout construire seul : marque, boutique, catalogue, contenus et promotion.' },
    { label: 'Le résultat', text: 'Une boutique complète et fonctionnelle, notée 5.9/6.' },
  ],
  sections: [
    {
      id: 'idee',
      nav: 'L’idée',
      title: 'Une boutique pour passionnés',
      content: [
        'Le cours demandait de lancer une vraie boutique en ligne, de A à Z. J’ai choisi l’automobile, une passion : les boutiques existantes sont soit très techniques, soit génériques, et rarement pensées pour la Suisse.',
        'DriveGear mélange trois façons de vendre : des produits d’entretien en vente directe, des gadgets comme les dashcams en affiliation, et des objets lifestyle, t-shirts et posters, imprimés à la demande. Deux profils m’ont guidé : le passionné qui veut afficher sa passion, et le conducteur pragmatique qui veut des accessoires fiables et une livraison rapide.',
      ],
    },
    {
      id: 'marque',
      nav: 'La marque',
      tone: 'accent',
      title: 'Une marque à créer',
      content: [
        'J’ai dessiné le logo, choisi la palette et la typographie, puis mis en scène les produits aux couleurs de la marque, pour que la boutique ait une vraie identité, entre passion automobile et lifestyle.',
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
          items: [
            img('produit-spray-studio', 1000, 1000, 'Flacon de rénovateur intérieur DriveGear en studio, sur fond gris'),
            img('produit-spray-interieur', 1000, 1000, 'Rénovateur intérieur DriveGear utilisé dans l’habitacle d’une voiture'),
            img('produit-parfum', 1000, 1000, 'Désodorisant premium DriveGear et sa boîte posés dans une voiture'),
            img('produit-brosse-lavage', 1000, 1000, 'Brosse à jantes en action sur une voiture noire, sous un jet d’eau'),
            img('produit-gants', 1000, 1000, 'Mains gantées de cuir sur le volant en bois d’une voiture ancienne'),
            img('produit-housse-jardin', 1000, 1000, 'Housse de protection DriveGear posée sur une voiture devant une maison'),
          ],
        },
      ],
    },
    {
      id: 'boutique',
      nav: 'La boutique',
      title: 'La boutique',
      content: [
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
              text: 'Chacune des 30 fiches produits est rédigée et optimisée pour le référencement : description, caractéristiques et photos.',
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
    'On my own, I built DriveGear from A to Z: the brand, the WooCommerce store, the product pages, the content, the newsletter and the social media.',
  meta: [
    { label: 'Context', value: 'E-commerce course, HEIG-VD' },
    { label: 'Year', value: '2025–2026' },
    { label: 'Duration', value: 'One semester' },
    { label: 'My role', value: 'Everything: strategy, design, store, marketing' },
    { label: 'Team', value: 'Solo project' },
    { label: 'Tools', value: 'WordPress, WooCommerce, Yoast, GA4, Notion' },
  ],
  brief: [
    { label: 'The idea', text: 'A store that speaks to car enthusiasts and everyday drivers alike.' },
    { label: 'My role', text: 'Build everything on my own: brand, store, catalogue, content and promotion.' },
    { label: 'The result', text: 'A complete, working store, graded 5.9/6.' },
  ],
  sections: [
    {
      id: 'idee',
      nav: 'The idea',
      title: 'A store for car lovers',
      content: [
        'The course asked us to launch a real online store, from A to Z. I chose cars, a passion of mine: existing stores are either highly technical or generic, and rarely designed for Switzerland.',
        'DriveGear mixes three ways of selling: care products sold directly, gadgets such as dashcams through affiliate links, and lifestyle items, t-shirts and posters, printed on demand. Two profiles guided me: the enthusiast who wants to show his passion, and the pragmatic driver who wants reliable accessories and fast delivery.',
      ],
    },
    {
      id: 'marque',
      nav: 'The brand',
      tone: 'accent',
      title: 'A brand to create',
      content: [
        'I drew the logo, chose the palette and typeface, then staged the products in the brand’s colours, so the store would have a real identity, between car culture and lifestyle.',
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
          items: [
            img('produit-spray-studio', 1000, 1000, 'DriveGear interior restorer bottle in a studio, on a grey background'),
            img('produit-spray-interieur', 1000, 1000, 'DriveGear interior restorer used inside a car'),
            img('produit-parfum', 1000, 1000, 'DriveGear premium air freshener and its box inside a car'),
            img('produit-brosse-lavage', 1000, 1000, 'Wheel brush at work on a black car, under a jet of water'),
            img('produit-gants', 1000, 1000, 'Leather-gloved hands on the wooden steering wheel of a classic car'),
            img('produit-housse-jardin', 1000, 1000, 'DriveGear protective cover on a car in front of a house'),
          ],
        },
      ],
    },
    {
      id: 'boutique',
      nav: 'The store',
      title: 'The store',
      content: [
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
              text: 'Each of the 30 product pages is written and optimised for search: description, specifications and photos.',
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
