import { imagesIn, type CaseStudy } from './types';

const img = imagesIn('karting');

const stories = (alt: (n: number) => string) =>
  [1, 2, 3, 4, 5, 6].map((n) => img(`story-${n}`, 400, 711, alt(n)));

const KARTING_FR: CaseStudy = {
  kicker: 'Karting de Vuiteboeuf · Community management',
  title: 'Karting de Vuiteboeuf',
  hook: 'Faire ressentir la vitesse d’un circuit à travers l’écran d’un téléphone.',
  intro:
    'Depuis mai 2026, je gère la communication digitale du Karting de Vuiteboeuf : la stratégie, les prises de vue sur la piste, le montage et la publication sur Instagram et TikTok.',
  meta: [
    { label: 'Contexte', value: 'Emploi en parallèle des études' },
    { label: 'Année', value: '2026' },
    { label: 'Durée', value: 'Depuis mai 2026, en cours' },
    { label: 'Mon rôle', value: 'Community manager : stratégie, photo, vidéo, publication' },
    { label: 'Équipe', value: 'Seul, avec l’équipe du karting' },
    { label: 'Outils', value: 'Premiere Pro, Instagram, TikTok' },
  ],
  liveUrl: 'https://www.instagram.com/kartingvuiteboeuf/',
  liveLabel: 'Voir le compte Instagram',
  brief: [
    { label: 'Le problème', text: 'Une offre attractive, mais une présence en ligne irrégulière et peu variée.' },
    { label: 'Ma réponse', text: 'Des contenus réguliers, tournés sur la piste, et des rendez-vous qui reviennent.' },
    { label: 'Le résultat', text: 'Une image cohérente sur tous les supports, et des publications qui dépassent les 600 j’aime.' },
  ],
  sections: [
    {
      id: 'contexte',
      nav: 'Le karting',
      title: 'Un circuit qui méritait d’être vu',
      content: [
        'Le Karting de Vuiteboeuf, dans le canton de Vaud, propose un circuit de 1600 mètres, en intérieur comme en extérieur, pour les familles, les groupes, les entreprises et les pilotes de compétition. Mais aujourd’hui, on choisit ses loisirs en ligne, et sa présence sur les réseaux ne rendait pas justice à la piste.',
        {
          type: 'figures',
          items: [
            { value: 1600, suffix: ' m', label: 'de circuit, en intérieur et en extérieur' },
            { value: 11, suffix: ' k', label: 'abonnés sur Instagram' },
            { value: 4, prefix: '3 à ', label: 'publications par semaine visées' },
          ],
        },
        'Les objectifs étaient clairs : gagner en visibilité, attirer de nouveaux clients, moderniser l’image du karting et remplir les créneaux plus calmes, le mardi et le jeudi.',
      ],
    },
    {
      id: 'strategie',
      nav: 'La stratégie',
      title: 'Une stratégie avant les images',
      content: [
        'J’ai commencé par une proposition écrite pour la direction. Deux plateformes complémentaires : Instagram pour la crédibilité, les infos et les événements ; TikTok pour toucher vite un public plus jeune. Et quatre messages à faire passer : les sensations, l’immersion, une activité accessible à tous et le plaisir de la compétition.',
        'Pour les publications, j’ai écrit un guide de ton : des descriptions courtes, directes, qui donnent une information plutôt que d’empiler les adjectifs. Le karting doit parler à ses clients, pas sonner comme une publicité.',
      ],
    },
    {
      id: 'terrain',
      nav: 'Sur la piste',
      title: 'Tout se passe sur la piste',
      content: [
        'Les contenus se fabriquent sur le circuit : prises de vue pendant les courses, vidéos embarquées, interviews du staff et moments de vie du karting.',
        {
          type: 'gallery',
          cols: 3,
          items: [
            img('photo-vitesse', 1600, 1067, 'Kart en pleine vitesse sur la piste intérieure, avec un effet de filé'),
            img('photo-exterieur', 1600, 1067, 'Kart sur la piste extérieure, l’arrière-plan flou de vitesse'),
            img('photo-pilote', 1600, 1067, 'Pilote casqué au volant de son kart, au premier plan'),
            img('photo-drapeau', 1600, 1067, 'Commissaire agitant le drapeau à damier devant un kart'),
            img('photo-equipe', 1600, 1067, 'Groupe de pilotes en combinaison, casque à la main, dans le paddock'),
            img('photo-anniversaire', 1600, 1243, 'Enfants réunis autour d’une table pour un anniversaire au karting'),
          ],
        },
      ],
    },
    {
      id: 'formats',
      nav: 'Les formats',
      title: 'Des rendez-vous qui reviennent',
      content: [
        {
          type: 'steps',
          frame: 'mockup',
          steps: [
            {
              text: 'Chaque mois, les meilleurs chronos de la piste. Les pilotes attendent le classement et le partagent.',
              image: img('posts-chronos', 1600, 1200, 'Deux publications : les meilleurs chronos RX250 du mois et une vidéo embarquée « Envie de progresser ? »'),
            },
            {
              text: 'Les offres et activités sont mieux mises en avant, comme l’Académie suisse de karting pour les jeunes pilotes.',
              image: img('posts-ask', 1600, 1200, 'Deux publications : l’Académie suisse de karting et un événement caritatif sur le circuit'),
            },
            {
              text: 'Des formats vidéo plus personnels, comme les interviews de celles et ceux qui font vivre le karting.',
              image: img('posts-reels', 1600, 1200, 'Deux reels : une interview d’un membre du staff et une vidéo embarquée'),
            },
          ],
        },
        'Rappels de course, résultats en carrousel, photos de course, promotions de la semaine : ces formats récurrents donnent aux abonnés une raison de revenir.',
      ],
    },
    {
      id: 'identite',
      nav: 'L’identité',
      tone: 'accent',
      title: 'Une image qui se reconnaît',
      content: [
        'Toutes les publications partagent maintenant les mêmes codes : le rouge du karting, une typographie de course et des gabarits réutilisables, jusqu’aux couvertures des stories à la une. Réseaux sociaux, site et supports racontent enfin la même chose.',
        {
          type: 'gallery',
          cols: 3,
          narrow: true,
          items: stories((n) => ['Couverture de story « Events 2026 »', 'Couverture de story « Horaires »', 'Couverture de story « Concours »', 'Couverture de story avec un calendrier 2026', 'Couverture de story avec une horloge', 'Couverture de story avec une étoile'][n - 1]),
        },
      ],
    },
    {
      id: 'resultats',
      nav: 'Résultats',
      title: 'Ce qui a changé',
      content: [
        'Avant, les contenus étaient moins réguliers, les formats plus limités et la communication moins diversifiée. Aujourd’hui : des formats variés, des rendez-vous récurrents, plus de photo et de vidéo, des offres mieux mises en avant et une image cohérente.',
        {
          type: 'gallery',
          cols: 2,
          boxed: true,
          caption: 'Le compte Instagram en mai 2026, puis aujourd’hui.',
          items: [
            img('avant-instagram', 1600, 982, 'Grille du compte Instagram du karting en mai 2026', 'Mai 2026'),
            img('apres-instagram', 700, 2140, 'Profil Instagram du karting aujourd’hui, avec des publications harmonisées', 'Aujourd’hui'),
          ],
        },
        {
          type: 'figures',
          items: [
            { value: 661, label: 'j’aime sur le reel des interviews du staff' },
            { value: 331, label: 'j’aime sur la publication du Karting for Smile' },
          ],
        },
      ],
    },
    {
      id: 'retenu',
      nav: 'Ce que je retiens',
      title: 'Ce que je retiens',
      content: [
        'Travailler pour un vrai client, chaque semaine, m’apprend à tenir un rythme et à penser chaque publication comme une partie d’un tout. Les prochaines étapes : continuer à tester de nouveaux formats et faire évoluer la communication au fil des projets.',
        'Cinq mois, et ce n’est que le début.',
      ],
    },
  ],
  credits: [{ name: 'Luca Leone', role: 'Community manager' }],
  creditsNote: 'Emploi au Karting de Vuiteboeuf (VD), en parallèle du Bachelor en Ingénierie des médias, HEIG-VD.',
};

const KARTING_EN: CaseStudy = {
  kicker: 'Karting de Vuiteboeuf · Community management',
  title: 'Karting de Vuiteboeuf',
  hook: 'Making people feel the speed of a race track through a phone screen.',
  intro:
    'Since May 2026, I’ve been running the digital communication of Karting de Vuiteboeuf: strategy, shooting on the track, editing and publishing on Instagram and TikTok.',
  meta: [
    { label: 'Context', value: 'Part-time job alongside my studies' },
    { label: 'Year', value: '2026' },
    { label: 'Duration', value: 'Since May 2026, ongoing' },
    { label: 'My role', value: 'Community manager: strategy, photo, video, publishing' },
    { label: 'Team', value: 'Solo, with the karting staff' },
    { label: 'Tools', value: 'Premiere Pro, Instagram, TikTok' },
  ],
  liveUrl: 'https://www.instagram.com/kartingvuiteboeuf/',
  liveLabel: 'See the Instagram account',
  brief: [
    { label: 'The problem', text: 'An attractive offer, but an irregular and repetitive online presence.' },
    { label: 'My answer', text: 'Regular content shot on the track, and formats that come back.' },
    { label: 'The result', text: 'A consistent image across every medium, and posts with over 600 likes.' },
  ],
  sections: [
    {
      id: 'contexte',
      nav: 'The track',
      title: 'A track that deserved to be seen',
      content: [
        'Karting de Vuiteboeuf, in the canton of Vaud, offers a 1,600-metre circuit, indoors and outdoors, for families, groups, companies and racing drivers. But people now choose their activities online, and its social media didn’t do the track justice.',
        {
          type: 'figures',
          items: [
            { value: 1600, suffix: ' m', label: 'of track, indoors and outdoors' },
            { value: 11, suffix: 'k', label: 'Instagram followers' },
            { value: 4, prefix: '3 to ', label: 'posts a week targeted' },
          ],
        },
        'The goals were clear: more visibility, new customers, a more modern image, and fuller quiet slots on Tuesdays and Thursdays.',
      ],
    },
    {
      id: 'strategie',
      nav: 'The strategy',
      title: 'Strategy before images',
      content: [
        'I started with a written proposal for the management. Two complementary platforms: Instagram for credibility, information and events; TikTok to reach a younger audience fast. And four messages to get across: thrills, immersion, an activity open to everyone, and the fun of competition.',
        'For the captions, I wrote a tone-of-voice guide: short, direct descriptions that give information instead of piling up adjectives. The karting should speak to its customers, not sound like an ad.',
      ],
    },
    {
      id: 'terrain',
      nav: 'On the track',
      title: 'It all happens on the track',
      content: [
        'Content is made at the circuit: shooting during races, onboard videos, staff interviews and everyday moments of karting life.',
        {
          type: 'gallery',
          cols: 3,
          items: [
            img('photo-vitesse', 1600, 1067, 'Kart at full speed on the indoor track, with a motion blur'),
            img('photo-exterieur', 1600, 1067, 'Kart on the outdoor track, the background blurred by speed'),
            img('photo-pilote', 1600, 1067, 'Helmeted driver at the wheel of his kart, in the foreground'),
            img('photo-drapeau', 1600, 1067, 'Marshal waving the chequered flag in front of a kart'),
            img('photo-equipe', 1600, 1067, 'Group of drivers in race suits, helmets in hand, in the paddock'),
            img('photo-anniversaire', 1600, 1243, 'Children gathered around a table for a birthday party at the karting'),
          ],
        },
      ],
    },
    {
      id: 'formats',
      nav: 'The formats',
      title: 'Formats that come back',
      content: [
        {
          type: 'steps',
          frame: 'mockup',
          steps: [
            {
              text: 'Every month, the fastest laps on the track. Drivers wait for the ranking and share it.',
              image: img('posts-chronos', 1600, 1200, 'Two posts: the month’s fastest RX250 laps and an onboard video “Want to improve?”'),
            },
            {
              text: 'Offers and activities are better showcased, like the Swiss Karting Academy for young drivers.',
              image: img('posts-ask', 1600, 1200, 'Two posts: the Swiss Karting Academy and a charity event at the circuit'),
            },
            {
              text: 'More personal video formats, like interviews with the people who keep the karting running.',
              image: img('posts-reels', 1600, 1200, 'Two reels: an interview with a staff member and an onboard video'),
            },
          ],
        },
        'Race reminders, results carousels, race photos, weekly deals: these recurring formats give followers a reason to come back.',
      ],
    },
    {
      id: 'identite',
      nav: 'The identity',
      tone: 'accent',
      title: 'An image you recognise',
      content: [
        'Every post now shares the same codes: the karting red, a racing typeface and reusable templates, right down to the story highlight covers. Social media, website and printed media finally tell the same story.',
        {
          type: 'gallery',
          cols: 3,
          narrow: true,
          items: stories((n) => ['“Events 2026” story cover', '“Opening hours” story cover', '“Contests” story cover', 'Story cover with a 2026 calendar', 'Story cover with a clock', 'Story cover with a star'][n - 1]),
        },
      ],
    },
    {
      id: 'resultats',
      nav: 'Results',
      title: 'What changed',
      content: [
        'Before, content was less regular, formats were more limited and communication less varied. Today: varied formats, recurring events, more photo and video, better-showcased offers and a consistent image.',
        {
          type: 'gallery',
          cols: 2,
          boxed: true,
          caption: 'The Instagram account in May 2026, and today.',
          items: [
            img('avant-instagram', 1600, 982, 'The karting’s Instagram grid in May 2026', 'May 2026'),
            img('apres-instagram', 700, 2140, 'The karting’s Instagram profile today, with consistent posts', 'Today'),
          ],
        },
        {
          type: 'figures',
          items: [
            { value: 661, label: 'likes on the staff interviews reel' },
            { value: 331, label: 'likes on the Karting for Smile post' },
          ],
        },
      ],
    },
    {
      id: 'retenu',
      nav: 'What I take away',
      title: 'What I take away',
      content: [
        'Working for a real client every week teaches me to keep a pace and to think of every post as part of a whole. Next: keep testing new formats and let the communication grow with each project.',
        'Five months in, and it’s only the beginning.',
      ],
    },
  ],
  credits: [{ name: 'Luca Leone', role: 'Community manager' }],
  creditsNote: 'Job at Karting de Vuiteboeuf (Vaud), alongside the Bachelor in Media Engineering, HEIG-VD.',
};

export const karting = { fr: KARTING_FR, en: KARTING_EN };
