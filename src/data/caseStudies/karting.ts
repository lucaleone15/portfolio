import { imagesIn, type CaseStudy } from './types';

const img = imagesIn('karting');

const KARTING_FR: CaseStudy = {
  kicker: 'Communication digitale · Photo & vidéo',
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
    { label: 'Outils', value: 'Premiere Pro, Instagram, TikTok ; React et Electron pour l’app' },
  ],
  links: [
    { label: 'Instagram', href: 'https://www.instagram.com/kartingvuiteboeuf/' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@kartingvuiteboeuf' },
    { label: 'Facebook', href: 'https://www.facebook.com/KartingVuiteboeuf/' },
  ],
  brief: [
    { label: 'Le problème', text: 'Une offre attractive, mais une présence en ligne irrégulière et peu variée.' },
    { label: 'Ma réponse', text: 'Des contenus réguliers, tournés sur la piste, et des rendez-vous qui reviennent.' },
    { label: 'Le résultat', text: 'Depuis mai : 329’000 vues sur Instagram (+73 %) et des vues Facebook multipliées par près de six (+479 %).' },
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
          cols: 5,
          items: [
            img('photo-08', 1000, 1500, 'File de karts au départ de la Sprint Junior Cup'),
            img('photo-12', 1000, 1500, 'Jeune pilote casqué de vert dans son kart, de près'),
            img('photo-11', 1000, 1500, 'Kart numéro 217 attaquant un virage'),
            img('photo-09', 1000, 1500, 'Commissaire au drapeau rouge au bord de la piste'),
            img('photo-07', 1000, 1500, 'Kart seul dans un virage de la piste extérieure'),
            img('photo-10', 1000, 1500, 'Pilote sortant du paddock couvert vers la piste'),
            img('photo-13', 1000, 1500, 'Kart passant devant les arbres, de loin'),
            img('photo-14', 1000, 1500, 'Kart dans un virage, un commissaire en arrière-plan'),
            img('photo-15', 1000, 1500, 'Kart dans un virage, l’herbe au premier plan'),
            img('photo-06', 1000, 1500, 'Coach de l’ASK débriefant devant le tableau des chronos'),
            img('photo-05', 1000, 1500, 'Coach de l’ASK expliquant un tracé à un jeune pilote'),
            img('photo-04', 1000, 1500, 'Pilote en combinaison Red Bull dans le paddock intérieur'),
            img('photo-01', 1000, 1500, 'Supercar exposée devant le karting lors du Karting for Smile'),
            img('photo-02', 1000, 1500, 'Portière papillon ouverte d’une supercar sur le parking'),
            img('photo-03', 1000, 1500, 'Jante et étrier jaunes d’une Porsche, voitures de collection derrière'),
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
              image: img('posts-chronos-mockup', 1600, 1200, 'Deux publications : les meilleurs chronos RX250 du mois et une vidéo embarquée « Envie de progresser ? »'),
            },
            {
              text: 'Les offres et activités sont mieux mises en avant, comme l’Académie suisse de karting pour les jeunes pilotes.',
              image: img('posts-ask-mockup', 1600, 1200, 'Deux publications : l’Académie suisse de karting et un événement caritatif sur le circuit'),
            },
            {
              text: 'Des formats vidéo plus personnels, comme les interviews de celles et ceux qui font vivre le karting.',
              image: img('posts-reels-mockup', 1600, 1200, 'Deux reels : une interview d’un membre du staff et une vidéo embarquée'),
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
        'Toutes les publications partagent maintenant les mêmes codes : le rouge du karting, une typographie de course et des gabarits réutilisables, jusqu’aux carrousels de résultats. Réseaux sociaux, site et supports racontent enfin la même chose.',
        {
          type: 'gallery',
          cols: 4,
          caption: 'Le carrousel des résultats Sprint du 1er septembre : la couverture, la photo de groupe, puis un podium par course, avec la photo de chaque pilote.',
          items: [
            img('resultats-photos-1', 800, 1000, 'Couverture du carrousel « Les résultats Sprint, 1er septembre 2026 »'),
            img('resultats-photos-2', 800, 1000, 'Slide « Photo de groupe » : les pilotes de la soirée réunis sur le podium'),
            img('resultats-photos-3', 800, 1000, 'Podium de la Sprint RX250, première manche, avec la photo des trois premiers, puis le classement'),
            img('resultats-photos-4', 800, 1000, 'Podium de la Sprint 270cc, première manche, avec la photo des trois premiers, puis le classement'),
          ],
        },
        'Ces carrousels de résultats, je ne les monte plus à la main : ils sortent d’une application que j’ai développée.',
      ],
    },
    {
      id: 'automatisation',
      nav: 'L’automatisation',
      title: 'Une app pour publier les résultats',
      content: [
        'Après chaque course, les classements paraissent sur SWS, la plateforme des championnats de karting, puis il fallait les recopier dans les visuels. Un week-end peut compter jusqu’à huit courses : c’était long, répétitif, et la moindre faute dans un nom se voyait.',
        'J’ai donc conçu et développé une application pour Mac qui fait ce travail, en quatre semaines, entre juin et juillet.',
        {
          type: 'steps',
          frame: 'mockup',
          steps: [
            {
              text: 'Un clic sur « Mettre à jour » récupère le calendrier, les résultats et les classements du circuit sur SWS (je valide moi-même la vérification anti-robot du site). L’app signale ce qui a changé depuis la dernière fois.',
              image: img('app-mise-a-jour-mockup-2', 1600, 1200, 'Application Karting Vuiteboeuf : calendrier des courses et bandeau « 8 nouveaux résultats · 4 changements de classement »'),
            },
            {
              text: 'Je coche les courses d’un même événement, et l’app prépare le carrousel : une couverture, puis le podium et le classement de chaque course, les noms remis dans l’ordre prénom-nom et le drapeau de chaque pilote.',
              image: img('app-selection-mockup-2', 1600, 1200, 'Section Résultats de l’application, quatre courses Junior Cup cochées et le bouton « Générer les visuels (4) »'),
            },
            {
              text: 'Pour mettre un visage sur chaque place, j’importe la photo du podium et je place un cadre sur chacun des trois premiers : l’app découpe la photo et met chaque pilote à sa place. La photo de groupe peut aussi s’ajouter en slide, juste après la couverture. (Ici, une photo et des noms fictifs.)',
              image: img('app-podium-mockup-2', 1600, 1200, 'Recadrage d’une photo de podium dans l’app : un cadre de couleur sur chacun des trois pilotes, avec son nom (photo et noms fictifs pour l’exemple)'),
            },
          ],
        },
        'Les mêmes données s’exportent aussi en Excel, CSV, PDF, JSON ou vers un agenda. Les résultats sortent plus vite, toujours au même format, et sans erreur de recopie.',
        {
          type: 'figures',
          items: [
            { value: 22, label: 'mises à jour depuis fin juin' },
            { value: 46, label: 'courses suivies au calendrier' },
            { value: 6, label: 'formats d’export, images comprises' },
          ],
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
          type: 'figures',
          items: [
            { value: 329, suffix: ' k', label: 'vues sur Instagram depuis mai, +73 %' },
            { value: 89, prefix: '+', suffix: ' %', label: 'd’interactions sur Instagram' },
            { value: 118, suffix: ' k', label: 'vues sur le reel le plus regardé' },
            { value: 479, prefix: '+', suffix: ' %', label: 'de vues sur Facebook' },
          ],
        },
        { type: 'quote', text: 'Merci pour le travail, super boulot. Continue comme ça !', source: 'Retour de la direction du karting' },
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
  kicker: 'Digital communication · Photo & video',
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
    { label: 'Tools', value: 'Premiere Pro, Instagram, TikTok; React and Electron for the app' },
  ],
  links: [
    { label: 'Instagram', href: 'https://www.instagram.com/kartingvuiteboeuf/' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@kartingvuiteboeuf' },
    { label: 'Facebook', href: 'https://www.facebook.com/KartingVuiteboeuf/' },
  ],
  brief: [
    { label: 'The problem', text: 'An attractive offer, but an irregular and repetitive online presence.' },
    { label: 'My answer', text: 'Regular content shot on the track, and formats that come back.' },
    { label: 'The result', text: 'Since May: 329,000 views on Instagram (+73%) and Facebook views up nearly sixfold (+479%).' },
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
          cols: 5,
          items: [
            img('photo-08', 1000, 1500, 'Line of karts at the start of the Sprint Junior Cup'),
            img('photo-12', 1000, 1500, 'Close-up of a young driver in a green helmet in his kart'),
            img('photo-11', 1000, 1500, 'Kart number 217 attacking a bend'),
            img('photo-09', 1000, 1500, 'Marshal with a red flag at the trackside'),
            img('photo-07', 1000, 1500, 'A lone kart in a bend of the outdoor track'),
            img('photo-10', 1000, 1500, 'Driver leaving the covered paddock for the track'),
            img('photo-13', 1000, 1500, 'Kart passing in front of the trees, from afar'),
            img('photo-14', 1000, 1500, 'Kart in a bend, a marshal in the background'),
            img('photo-15', 1000, 1500, 'Kart in a bend, grass in the foreground'),
            img('photo-06', 1000, 1500, 'ASK coach debriefing in front of the lap-time board'),
            img('photo-05', 1000, 1500, 'ASK coach explaining a racing line to a young driver'),
            img('photo-04', 1000, 1500, 'Driver in a Red Bull suit in the indoor paddock'),
            img('photo-01', 1000, 1500, 'Supercar on display in front of the karting at Karting for Smile'),
            img('photo-02', 1000, 1500, 'Open butterfly door of a supercar in the car park'),
            img('photo-03', 1000, 1500, 'Yellow brake caliper of a Porsche, classic cars behind'),
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
              image: img('posts-chronos-mockup', 1600, 1200, 'Two posts: the month’s fastest RX250 laps and an onboard video “Want to improve?”'),
            },
            {
              text: 'Offers and activities are better showcased, like the Swiss Karting Academy for young drivers.',
              image: img('posts-ask-mockup', 1600, 1200, 'Two posts: the Swiss Karting Academy and a charity event at the circuit'),
            },
            {
              text: 'More personal video formats, like interviews with the people who keep the karting running.',
              image: img('posts-reels-mockup', 1600, 1200, 'Two reels: an interview with a staff member and an onboard video'),
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
        'Every post now shares the same codes: the karting red, a racing typeface and reusable templates, right down to the results carousels. Social media, website and printed media finally tell the same story.',
        {
          type: 'gallery',
          cols: 4,
          caption: 'The Sprint results carousel of 1 September: the cover, the group photo, then a podium per race, with each driver’s photo.',
          items: [
            img('resultats-photos-1', 800, 1000, 'Carousel cover “Sprint results, 1 September 2026”'),
            img('resultats-photos-2', 800, 1000, '“Group photo” slide: the evening’s drivers together on the podium'),
            img('resultats-photos-3', 800, 1000, 'Podium of the Sprint RX250, first heat, with photos of the top three, then the standings'),
            img('resultats-photos-4', 800, 1000, 'Podium of the Sprint 270cc, first heat, with photos of the top three, then the standings'),
          ],
        },
        'I no longer put these results carousels together by hand: they come out of an app I developed.',
      ],
    },
    {
      id: 'automatisation',
      nav: 'Automation',
      title: 'An app to publish the results',
      content: [
        'After each race, the standings are published on SWS, the karting championship platform, and then had to be copied into the visuals. A weekend can hold up to eight races: it was slow, repetitive, and the slightest typo in a name showed.',
        'So I designed and developed a Mac app that does the job, in four weeks, between June and July.',
        {
          type: 'steps',
          frame: 'mockup',
          steps: [
            {
              text: 'One click on “Mettre à jour” fetches the track’s calendar, results and standings from SWS (I pass the site’s anti-bot check myself). The app flags what has changed since last time.',
              image: img('app-mise-a-jour-mockup-2', 1600, 1200, 'Karting Vuiteboeuf app: race calendar and a banner reading “8 new results · 4 standings changes”'),
            },
            {
              text: 'I tick the races of one event, and the app builds the carousel: a cover, then the podium and standings of each race, names put back in first-name order and each driver’s flag.',
              image: img('app-selection-mockup-2', 1600, 1200, 'Results section of the app, four Junior Cup races ticked and the “Generate visuals (4)” button'),
            },
            {
              text: 'To put a face on each place, I import the podium photo and draw a frame on each of the top three: the app crops the photo and puts every driver in their spot. The group photo can also go in as a slide, right after the cover. (Here, a made-up photo and names.)',
              image: img('app-podium-mockup-2', 1600, 1200, 'Cropping a podium photo in the app: a coloured frame on each of the three drivers, with their name (photo and names made up for the example)'),
            },
          ],
        },
        'The same data also exports to Excel, CSV, PDF, JSON or a calendar. Results go out faster, always in the same format, and without copying mistakes.',
        {
          type: 'figures',
          items: [
            { value: 22, label: 'updates since late June' },
            { value: 46, label: 'races tracked on the calendar' },
            { value: 6, label: 'export formats, images included' },
          ],
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
          type: 'figures',
          items: [
            { value: 329, suffix: 'k', label: 'Instagram views since May, up 73%' },
            { value: 89, prefix: '+', suffix: '%', label: 'Instagram interactions' },
            { value: 118, suffix: 'k', label: 'views on the most-watched reel' },
            { value: 479, prefix: '+', suffix: '%', label: 'Facebook views' },
          ],
        },
        { type: 'quote', text: 'Thanks for the work, great job. Keep it up!', source: 'Feedback from the karting management' },
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
