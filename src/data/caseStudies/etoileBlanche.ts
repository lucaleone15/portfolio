import { imagesIn, type CaseStudy } from './types';

const img = imagesIn('etoile-blanche');
const DIR = '/images/case/etoile-blanche/';

const ETOILE_FR: CaseStudy = {
  kicker: 'Communication digitale · Print & réseaux sociaux',
  title: 'L’Étoile Blanche',
  hook: 'Un restaurant repris par une nouvelle direction, et une image à réinventer.',
  intro:
    'Avec l’agence étudiante Zest, nous avons repensé la communication de L’Étoile Blanche, à Lausanne : ses cartes, son affichage et ses réseaux sociaux, autour d’un seul message.',
  meta: [
    { label: 'Contexte', value: 'Projet d’agence, HEIG-VD' },
    { label: 'Année', value: '2026' },
    { label: 'Client', value: 'Restaurant L’Étoile Blanche, Lausanne' },
    { label: 'Mon rôle', value: 'Vision globale et cohérence du projet' },
    { label: 'Équipe', value: 'Agence Zest, 5 étudiants' },
    { label: 'Outils', value: 'Canva, Figma' },
  ],
  brief: [
    { label: 'Le défi', text: 'Une nouvelle direction, et une communication qui ne la reflétait pas encore.' },
    { label: 'Notre réponse', text: 'Un message, « l’endroit qui rassemble », décliné du menu jusqu’à Instagram.' },
    { label: 'Le résultat', text: 'Quatre cartes, une campagne d’affichage, des anecdotes et des contenus pour trois réseaux.' },
  ],
  sections: [
    {
      id: 'agence',
      nav: 'L’agence',
      title: 'Une agence, un client',
      content: [
        'Pour ce projet, nous avons monté Zest, une agence de cinq étudiants. Le nom vient du zeste de citron, pour la fraîcheur ; le slogan, « la comm’ qui a du jus », donne le ton.',
        'Notre client : L’Étoile Blanche, un café-restaurant lausannois repris par une nouvelle direction, qui voulait mettre en avant l’établissement et la nouvelle équipe. Avec Sacha Loskov, j’étais chargé de la vision globale : que chaque support raconte la même histoire.',
      ],
    },
    {
      id: 'message',
      nav: 'Le message',
      title: 'Un seul message',
      content: [
        'Avant de dessiner quoi que ce soit, nous avons cherché ce qui relierait tous les supports. L’Étoile Blanche est ouverte du café du matin à l’apéro et au souper : on peut s’y retrouver à toute heure.',
        { type: 'quote', text: 'L’Étoile Blanche, l’endroit qui rassemble.', source: 'Le message clé de la campagne' },
      ],
    },
    {
      id: 'cartes',
      nav: 'Les cartes',
      title: 'Quatre cartes, un même univers',
      content: [
        {
          type: 'steps',
          frame: 'plain',
          steps: [
            {
              text: 'Le menu sert aussi de set de table. Des titres massifs aux courbes rétro, une typographie classique pour les plats : l’héritage de la brasserie, en plus moderne.',
              image: img('menu-terrasse', 1184, 864, 'Menu rouge et blanc posé en set de table, avec un café et un croissant'),
            },
            {
              text: 'La carte des boissons reprend les mêmes codes en inversant les couleurs.',
              image: img('boissons', 864, 1184, 'Carte des boissons rouge et crème sur une table, avec un cocktail'),
            },
            {
              text: 'Les suggestions changent chaque semaine : nous en avons fait un gabarit facile à mettre à jour, qui invite aussi les clients du midi à revenir pour l’afterwork.',
              image: img('suggestions', 864, 1184, 'Carte des suggestions de la semaine, posée sur une table du restaurant'),
            },
            {
              text: 'La carte des bricoles se plie en étoile : fermée, elle montre les catégories ; ouverte, tout le menu de l’afterwork.',
              image: img('bricoles-etoile', 992, 1072, 'Carte des bricoles pliée en étoile, fermée puis ouverte sur une table'),
            },
          ],
        },
      ],
    },
    {
      id: 'affichage',
      nav: 'L’affichage',
      tone: 'accent',
      title: 'L’afterwork, jusque dans la rue',
      content: [
        'Pour faire connaître l’afterwork, notre première idée était d’utiliser les grands panneaux d’affichage de la ville. Trop cher : plus de 25’000 francs par semaine. Nous avons gardé l’idée en passant par l’affichage libre, dans les quartiers de bureaux voisins, avec des flèches qui mènent jusqu’au restaurant.',
        {
          type: 'gallery',
          cols: 2,
          narrow: true,
          items: [
            img('affiche-blanche', 900, 1778, 'Affiche blanche « L’after-work, c’est à l’Étoile Blanche », avec une flèche et la distance'),
            img('affiche-rouge', 900, 1778, 'Affiche rouge « L’after-work, c’est à l’Étoile Blanche », avec une flèche et la distance'),
          ],
        },
        'Dans le restaurant, des affichettes « Le saviez-vous ? » racontent des anecdotes sur l’établissement, son équipe et son histoire : de quoi lancer la conversation.',
        {
          type: 'gallery',
          cols: 2,
          items: [
            img('anecdote-mur', 1184, 864, 'Affichette rouge « Le saviez-vous ? » sur un mur couvert de vieilles affiches'),
            img('anecdote-salle', 1184, 864, 'Salle du restaurant avec des affichettes d’anecdotes sur les colonnes'),
          ],
        },
      ],
    },
    {
      id: 'reseaux',
      nav: 'Les réseaux',
      title: 'Une nouvelle ère sur les réseaux',
      content: [
        'Sur Instagram, TikTok et Facebook, les nouveaux contenus marquent une rupture avec les anciens : mêmes couleurs et mêmes typographies que les cartes, et un message qui revient, on peut venir à toute heure.',
        {
          type: 'gallery',
          cols: 4,
          items: [
            img('post-1', 700, 875, 'Publication « On se fait une pause ? » avec un café'),
            img('post-2', 700, 875, 'Publication « Ici, on partage bien plus qu’un repas » avec des amis à table'),
            img('post-3', 700, 875, 'Publication avec la façade du restaurant'),
            img('post-4', 700, 875, 'Publication « Tu viens profiter en terrasse ? »'),
          ],
        },
        {
          type: 'video',
          src: `${DIR}reel.mp4`,
          poster: `${DIR}reel-poster.webp`,
          width: 720,
          height: 900,
          caption: 'Un des reels de la campagne.',
        },
        {
          type: 'image',
          image: img('calendrier', 1600, 900, 'Calendrier éditorial de janvier, avec les publications planifiées par type', 'Le calendrier éditorial, pour planifier stories, posts et reels.'),
        },
      ],
    },
    {
      id: 'resultats',
      nav: 'La livraison',
      title: 'Un playbook pour durer',
      content: [
        {
          type: 'figures',
          items: [
            { value: 4, label: 'cartes repensées' },
            { value: 3, label: 'réseaux sociaux : Instagram, TikTok, Facebook' },
            { value: 2, label: 'campagnes print : affichage et anecdotes' },
          ],
        },
        'Nous avons remis au restaurant un playbook qui explique chaque support, et tous les fichiers modifiables sur Canva et Figma : l’équipe peut changer un prix, une photo ou une suggestion sans repasser par nous.',
      ],
    },
    {
      id: 'retenu',
      nav: 'Ce que je retiens',
      title: 'Ce que je retiens',
      content: [
        'Garder la vue d’ensemble m’a appris qu’une identité forte tient moins à un beau visuel qu’à la cohérence de tous. Et l’affichage m’a rappelé qu’une bonne idée doit aussi tenir dans le budget du client.',
      ],
    },
  ],
  credits: [
    { name: 'Luca Leone', role: 'Vision globale et cohérence' },
    { name: 'Sacha Loskov', role: 'Vision globale et cohérence' },
    { name: 'Romain Blanchard', role: 'Supports print' },
    { name: 'Ryad Ait-Slimane', role: 'Supports digitaux' },
    { name: 'Cindy Demont', role: 'Supports digitaux' },
  ],
  creditsNote: 'Agence Zest, Bachelor en Ingénierie des médias, HEIG-VD, pour le restaurant L’Étoile Blanche à Lausanne.',
};

const ETOILE_EN: CaseStudy = {
  kicker: 'Digital communication · Print & social media',
  title: 'L’Étoile Blanche',
  hook: 'A restaurant under new management, and an image to reinvent.',
  intro:
    'With the student agency Zest, we reimagined the communication of L’Étoile Blanche in Lausanne: its menus, its posters and its social media, around a single message.',
  meta: [
    { label: 'Context', value: 'Agency project, HEIG-VD' },
    { label: 'Year', value: '2026' },
    { label: 'Client', value: 'L’Étoile Blanche restaurant, Lausanne' },
    { label: 'My role', value: 'Overall vision and consistency' },
    { label: 'Team', value: 'Zest agency, 5 students' },
    { label: 'Tools', value: 'Canva, Figma' },
  ],
  brief: [
    { label: 'The challenge', text: 'New owners, and a communication that didn’t reflect them yet.' },
    { label: 'Our answer', text: 'One message, “the place that brings people together”, from the menu to Instagram.' },
    { label: 'The result', text: 'Four menus, a poster campaign, anecdote cards and content for three social networks.' },
  ],
  sections: [
    {
      id: 'agence',
      nav: 'The agency',
      title: 'One agency, one client',
      content: [
        'For this project, we set up Zest, an agency of five students. The name comes from lemon zest, for freshness; the tagline, “comms with a kick”, sets the tone.',
        'Our client: L’Étoile Blanche, a Lausanne café-restaurant taken over by new owners, who wanted to showcase the place and the new team. With Sacha Loskov, I was in charge of the overall vision: making every medium tell the same story.',
      ],
    },
    {
      id: 'message',
      nav: 'The message',
      title: 'A single message',
      content: [
        'Before designing anything, we looked for what would tie every medium together. L’Étoile Blanche is open from morning coffee to drinks and dinner: people can meet there at any time.',
        { type: 'quote', text: 'L’Étoile Blanche, the place that brings people together.', source: 'The campaign’s key message' },
      ],
    },
    {
      id: 'cartes',
      nav: 'The menus',
      title: 'Four menus, one world',
      content: [
        {
          type: 'steps',
          frame: 'plain',
          steps: [
            {
              text: 'The menu doubles as a placemat. Bold retro titles, a classic typeface for the dishes: the brasserie heritage, made more modern.',
              image: img('menu-terrasse', 1184, 864, 'Red and white menu used as a placemat, with a coffee and a croissant'),
            },
            {
              text: 'The drinks menu uses the same codes with the colours reversed.',
              image: img('boissons', 864, 1184, 'Red and cream drinks menu on a table, with a cocktail'),
            },
            {
              text: 'The specials change every week, so we made them an easy-to-update template that also invites lunch guests back for the after-work.',
              image: img('suggestions', 864, 1184, 'Weekly specials menu on a restaurant table'),
            },
            {
              text: 'The bar-snacks menu folds into a star: closed, it shows the categories; open, the whole after-work menu.',
              image: img('bricoles-etoile', 992, 1072, 'Star-folded bar-snacks menu, closed then open on a table'),
            },
          ],
        },
      ],
    },
    {
      id: 'affichage',
      nav: 'The posters',
      tone: 'accent',
      title: 'Taking the after-work to the street',
      content: [
        'To promote the after-work, our first idea was the city’s large billboards. Too expensive: more than 25,000 francs a week. We kept the idea using free poster spaces in the nearby office districts, with arrows leading to the restaurant.',
        {
          type: 'gallery',
          cols: 2,
          narrow: true,
          items: [
            img('affiche-blanche', 900, 1778, 'White poster “The after-work is at L’Étoile Blanche”, with an arrow and the distance'),
            img('affiche-rouge', 900, 1778, 'Red poster “The after-work is at L’Étoile Blanche”, with an arrow and the distance'),
          ],
        },
        'Inside the restaurant, “Did you know?” cards tell stories about the place, its team and its history: a way to start a conversation.',
        {
          type: 'gallery',
          cols: 2,
          items: [
            img('anecdote-mur', 1184, 864, 'Red “Did you know?” card on a wall covered with old posters'),
            img('anecdote-salle', 1184, 864, 'Restaurant dining room with anecdote cards on the columns'),
          ],
        },
      ],
    },
    {
      id: 'reseaux',
      nav: 'Social media',
      title: 'A new era on social media',
      content: [
        'On Instagram, TikTok and Facebook, the new content breaks with the old: the same colours and typefaces as the menus, and one recurring message, you can drop by at any time.',
        {
          type: 'gallery',
          cols: 4,
          items: [
            img('post-1', 700, 875, 'Post “Coffee break?” with a cup of coffee'),
            img('post-2', 700, 875, 'Post “Here, we share much more than a meal” with friends at a table'),
            img('post-3', 700, 875, 'Post with the restaurant’s façade'),
            img('post-4', 700, 875, 'Post “Fancy the terrace?”'),
          ],
        },
        {
          type: 'video',
          src: `${DIR}reel.mp4`,
          poster: `${DIR}reel-poster.webp`,
          width: 720,
          height: 900,
          caption: 'One of the campaign’s reels.',
        },
        {
          type: 'image',
          image: img('calendrier', 1600, 900, 'January editorial calendar, with posts planned by type', 'The editorial calendar, to plan stories, posts and reels.'),
        },
      ],
    },
    {
      id: 'resultats',
      nav: 'The handover',
      title: 'A playbook built to last',
      content: [
        {
          type: 'figures',
          items: [
            { value: 4, label: 'menus redesigned' },
            { value: 3, label: 'social networks: Instagram, TikTok, Facebook' },
            { value: 2, label: 'print campaigns: posters and anecdotes' },
          ],
        },
        'We handed the restaurant a playbook explaining every medium, plus every file editable in Canva and Figma: the team can change a price, a photo or a special without going through us.',
      ],
    },
    {
      id: 'retenu',
      nav: 'What I take away',
      title: 'What I take away',
      content: [
        'Keeping the big picture taught me that a strong identity is less about one beautiful visual than about everything fitting together. And the posters reminded me that a good idea also has to fit the client’s budget.',
      ],
    },
  ],
  credits: [
    { name: 'Luca Leone', role: 'Overall vision and consistency' },
    { name: 'Sacha Loskov', role: 'Overall vision and consistency' },
    { name: 'Romain Blanchard', role: 'Print media' },
    { name: 'Ryad Ait-Slimane', role: 'Digital media' },
    { name: 'Cindy Demont', role: 'Digital media' },
  ],
  creditsNote: 'Zest agency, Bachelor in Media Engineering, HEIG-VD, for L’Étoile Blanche restaurant in Lausanne.',
};

export const etoileBlanche = { fr: ETOILE_FR, en: ETOILE_EN };
