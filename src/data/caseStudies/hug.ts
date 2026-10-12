import { imagesIn, type CaseStudy } from './types';

const IMG = '/images/case/hug/';
const img = imagesIn('hug');

const HUG_TEAM = [
  { name: 'Luca Leone', role: 'Développeur full-stack' },
  { name: 'Romain Blanchard', role: 'Product Owner' },
  { name: 'Étienne Bergeon', role: 'Scrum Master' },
  { name: 'Christophe Cunha', role: 'UX/UI Designer' },
  { name: 'Aissya M’Ghirbi', role: 'UX/UI Designer' },
  { name: 'Liliana Kolmakova', role: 'Marketing et communication' },
  { name: 'Marc Bridy', role: 'Marketing et communication' },
];

const HUG_FR: CaseStudy = {
  kicker: 'Développement web · Don du sang',
  title: 'Les HUG mènent l’enquête',
  hook: 'Sur dix inscrits à une collecte de sang, trois repartaient sans avoir pu donner.',
  intro: 'Nous avons transformé le questionnaire d’éligibilité en enquête policière, pour que chacun sache avant de s’inscrire s’il peut donner.',
  meta: [
    { label: 'Contexte', value: 'Projet d’intégration HEIG-VD, mandat des HUG' },
    { label: 'Année', value: '2026' },
    { label: 'Durée', value: '4 semaines' },
    { label: 'Mon rôle', value: 'Développeur full-stack, concept et UX/UI' },
    { label: 'Équipe', value: '7 étudiant·e·s' },
    { label: 'Outils', value: 'Laravel, Vue 3, MySQL, Figma' },
  ],
  links: [{ label: 'Voir le site en ligne', href: 'https://donnez-votre-sang.ch' }],
  brief: [
    { label: 'Le problème', text: '30 % des inscrits ne peuvent pas donner le jour de la collecte.' },
    { label: 'Notre réponse', text: 'Vérifier son éligibilité avant de s’inscrire, en menant l’enquête.' },
    { label: 'Le résultat', text: 'Un site en ligne pendant un an et la note maximale : 6/6.' },
  ],
  sections: [
    {
      id: 'mandat',
      nav: 'Le mandat',
      title: 'Trois inscrits sur dix, perdus d’avance',
      content: [
        'Les Hôpitaux universitaires de Genève (HUG) sont le groupe hospitalier public du canton. Leur Centre de transfusion sanguine doit garantir des réserves de sang toute l’année, et une partie des dons vient de collectes organisées directement dans les entreprises genevoises, des banques aux maisons de luxe.',
        {
          type: 'figures',
          items: [
            { value: 10, suffix: ' %', label: 'des dons viennent des collectes en entreprise' },
            { value: 30, suffix: ' %', label: 'des inscrits ne peuvent finalement pas donner' },
          ],
        },
        'Le problème se voit le jour J : un vaccin récent, un voyage, une fièvre, et l’inscrit repart sans avoir donné. Notre mandat : dynamiser ces collectes.',
      ],
    },
    {
      id: 'equipe',
      nav: 'L’équipe',
      title: 'Sept enquêteurs, quatre semaines',
      content: [
        {
          type: 'image',
          image: img('equipe', 1600, 588, 'Les sept membres de l’équipe photographiés devant une toise, chacun tenant une pancarte avec son nom et son rôle'),
        },
        'Nous étions sept, en Scrum. J’étais le développeur full-stack : une grande partie du front-end en Vue 3 (pages publiques, enquête, pages des entreprises, label, trophée, kit), une part du back-end Laravel, et ma contribution au concept et à l’UX/UI.',
      ],
    },
    {
      id: 'idee',
      nav: 'L’idée',
      title: 'Et si le donneur menait l’enquête ?',
      content: [
        'Les questionnaires d’éligibilité sont des listes administratives qu’on découvre souvent trop tard. Nous en avons fait une enquête : on examine le dossier de l’agent, critère après critère, sans jamais culpabiliser. « Suspect » est devenu « profil recherché ».',
        {
          type: 'strip',
          items: [
            img('papier-brainstorm', 1000, 1333, 'Tableau de papier couvert de pistes écrites au feutre pendant un brainstorming', 'Brainstorming'),
            img('papier-wireframe', 1000, 1333, 'Wireframe dessiné à la main d’une page du site', 'Wireframes papier'),
            img('papier-esquisses', 1000, 1333, 'Esquisses au crayon du label et du trophée', 'Esquisses du label et du trophée'),
          ],
        },
      ],
    },
    {
      id: 'site',
      nav: 'Le site',
      title: 'Du wireframe au site',
      content: [
        {
          type: 'compare',
          before: img('avant-wireframe-admin-mockup-3', 1600, 1200, 'Wireframe en niveaux de gris du tableau de bord de l’administration'),
          after: img('apres-site-admin-mockup-2', 1600, 1200, 'Tableau de bord de l’administration sur le site en ligne, avec les chiffres et le classement du trophée'),
          beforeLabel: 'Wireframe',
          afterLabel: 'Site en ligne',
          caption: 'Le tableau de bord de l’administration, du wireframe au site en ligne. Faites glisser pour comparer.',
        },
        {
          type: 'steps',
          frame: 'mockup',
          steps: [
            {
              text: 'L’accueil s’adresse aux entreprises : « Les HUG mènent l’enquête ». On y découvre le programme et on inscrit son entreprise.',
              image: img('site-accueil-mockup-2', 1600, 1200, 'Page d’accueil : « Les HUG mènent l’enquête », avec une loupe sur une goutte de sang'),
            },
            {
              text: 'Chaque entreprise reçoit sa propre page, à ses couleurs : un don sauve trois vies, une mission de sept minutes.',
              image: img('site-entreprise-mockup-2', 1600, 1200, 'Page de la Banque Cantonale de Genève, en rouge : « Un don de sang sauve 3 vies. Une mission de 7 minutes. »'),
            },
            {
              text: 'Sur la même page, un tableau d’indices répond aux questions qu’on n’ose pas poser : est-ce que ça fait mal, combien de temps ça dure.',
              image: img('site-indices-mockup-2', 1600, 1200, 'Tableau de liège avec des fiches reliées par des fils rouges : « C’est quoi le don du sang ? »'),
            },
            {
              text: 'L’enquête reprend les critères officiels, posés comme les questions d’un interrogatoire. À la fin, la personne éligible prend rendez-vous ; les autres transmettent l’enquête à un collègue.',
              image: img('site-enquete-mockup-2', 1600, 1200, 'Question de l’enquête sur un dossier en papier kraft : « Avez-vous entre 18 et 75 ans ? »'),
            },
            {
              text: 'Toutes les entreprises qui organisent une collecte reçoivent le Label 100 pour Sang ; le Trophée Sangsationnel classe les plus engagées.',
              image: img('site-trophee-mockup-2', 1600, 1200, 'Classement 2026 du trophée avec un podium de trois entreprises'),
            },
            {
              text: 'Le centre de transfusion suit tout depuis son administration, jusqu’à la question où les gens abandonnent l’enquête.',
              image: img('site-admin-mockup-2', 1600, 1200, 'Page Analytics de l’administration : entonnoir, abandons par question, appareils et sources'),
            },
          ],
        },
        'Côté technique, l’éligibilité est calculée sur le serveur : le navigateur ne reçoit jamais les réponses qui disqualifient. Et aucune donnée personnelle n’est enregistrée, secret médical oblige.',
        {
          type: 'architecture',
          nodes: [
            { title: 'Navigateur', sub: 'Vue 3', note: 'Reçoit les questions, jamais les critères' },
            { title: 'Serveur', sub: 'Laravel', note: 'Retire les critères, calcule l’éligibilité', highlight: true },
            { title: 'Base de données', sub: 'MySQL', note: 'Jeton anonyme, entreprise, éligible : oui ou non' },
          ],
          links: ['questions', 'résultat'],
          caption: 'Les critères de disqualification ne quittent jamais le serveur.',
        },
      ],
    },
    {
      id: 'campagne',
      nav: 'La campagne',
      tone: 'accent',
      title: 'La campagne : la même enquête, partout',
      content: [
        'Le site n’était qu’une partie de la réponse. Avec l’équipe marketing et UI, nous avons décliné l’enquête sur tous les supports qu’une entreprise peut utiliser : affiches, flyers, roll-up pour le jour de la collecte, bannières intranet, réseaux sociaux, vidéo pour les écrans et même des stickers pour les donneurs. Tout tient dans un kit que chaque entreprise télécharge depuis le site.',
        {
          type: 'gallery',
          cols: 3,
          caption: 'Affiches A3 et A4, en version noire et blanche.',
          items: [
            img('affiche-loupe', 1000, 1415, 'Affiche noire « Seriez-vous le profil recherché ? » avec une empreinte digitale sous une loupe'),
            img('affiche-poche', 1000, 1415, 'Affiche « 1 don peut sauver 3 vies, es-tu éligible ? » dans une poche de sang avec un chapeau d’inspecteur'),
            img('affiche-loupe-blanc', 1000, 1415, 'Affiche blanche « Seriez-vous le profil recherché ? »'),
          ],
        },
        {
          type: 'video',
          src: `${IMG}infotv.mp4`,
          poster: `${IMG}infotv-poster.webp`,
          width: 1280,
          height: 720,
          caption: 'La vidéo diffusée sur les écrans des entreprises, dans les couloirs et les espaces de pause.',
        },
        {
          type: 'gallery',
          cols: 3,
          boxed: true,
          caption: 'Le flyer A5 recto verso, adapté à chaque collecte, et le roll-up du jour J.',
          items: [
            img('flyer-recto', 800, 1136, 'Recto du flyer : « Seriez-vous le profil recherché ? »'),
            img('flyer-verso', 800, 1136, 'Verso du flyer avec la date, le lieu et les horaires de la collecte'),
            img('rollup', 700, 1400, 'Roll-up de la campagne avec la loupe sur l’empreinte digitale'),
          ],
        },
        {
          type: 'gallery',
          cols: 3,
          caption: 'Un carrousel pour Instagram et LinkedIn, qui explique le don du sang en chiffres.',
          items: [
            img('carrousel-1', 900, 1125, 'Visuel du carrousel : « Les indices sont formels »'),
            img('carrousel-2', 900, 1125, 'Visuel du carrousel : 700 dons nécessaires par jour'),
            img('carrousel-3', 900, 1125, 'Visuel du carrousel : une personne sur trois aura besoin d’une transfusion'),
          ],
        },
        {
          type: 'gallery',
          cols: 1,
          caption: 'Les bannières pour l’intranet des entreprises, en version sombre et claire.',
          items: [
            img('banniere-label', 1200, 180, 'Bannière intranet sombre : « Nous organisons une collecte ! »'),
            img('banniere-trophee', 1200, 180, 'Bannière intranet claire : « Aide ton entreprise à remporter le trophée Sangsationnel »'),
          ],
        },
        {
          type: 'gallery',
          cols: 2,
          narrow: true,
          caption: 'Les stickers remis aux donneurs et aux entreprises lauréates.',
          items: [
            img('sticker-donneur-1', 500, 500, 'Sticker rond « Donneur certifié » avec le chapeau d’inspecteur'),
            img('sticker-trophee', 500, 500, 'Sticker rond « Gagnant 2025 » avec la main du trophée'),
          ],
        },
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
            { value: 6, suffix: '/6', label: 'note du projet' },
            { value: 24, label: 'questions, environ 7 minutes' },
            { value: 4, label: 'langues' },
          ],
        },
        {
          type: 'quote',
          text: 'Le concept basé sur une enquête est très original et apporte une approche intéressante pour mieux engager les publics cibles.',
          source: 'Retour des HUG',
        },
      ],
    },
    {
      id: 'retenu',
      nav: 'Ce que je retiens',
      title: 'Ce que je retiens',
      content: [
        'J’ai adoré travailler avec cette équipe : sept profils très différents, et une vraie entraide du premier au dernier jour. Je suis fier de ce que nous avons construit, et de ma part dans ce résultat.',
        'Le rythme Scrum, avec un point chaque matin et un sprint par semaine, m’a beaucoup plu. Et répondre à un vrai mandat change tout : on ne code plus pour un exercice, mais pour des gens qui vont s’en servir.',
        'Surtout, j’ai aimé mener un projet full-stack sans me limiter au code : réfléchir au concept et à l’expérience, puis les construire de la base de données jusqu’à l’écran.',
      ],
    },
  ],
  credits: HUG_TEAM,
  creditsNote: 'Projet d’intégration du Bachelor en Ingénierie des médias, HEIG-VD, pour le Centre de transfusion sanguine des HUG.',
};

const HUG_TEAM_EN = [
  { name: 'Luca Leone', role: 'Full-stack developer' },
  { name: 'Romain Blanchard', role: 'Product Owner' },
  { name: 'Étienne Bergeon', role: 'Scrum Master' },
  { name: 'Christophe Cunha', role: 'UX/UI designer' },
  { name: 'Aissya M’Ghirbi', role: 'UX/UI designer' },
  { name: 'Liliana Kolmakova', role: 'Marketing and communication' },
  { name: 'Marc Bridy', role: 'Marketing and communication' },
];

const HUG_EN: CaseStudy = {
  kicker: 'Web development · Blood donation',
  title: 'The HUG are investigating',
  hook: 'Three in ten people booked for a blood drive were leaving without being able to give.',
  intro: 'We turned the eligibility questionnaire into a detective investigation, so that everyone knows whether they can give before they book.',
  meta: [
    { label: 'Context', value: 'HEIG-VD integration project, commissioned by the HUG' },
    { label: 'Year', value: '2026' },
    { label: 'Duration', value: '4 weeks' },
    { label: 'My role', value: 'Full-stack developer, concept and UX/UI' },
    { label: 'Team', value: '7 students' },
    { label: 'Tools', value: 'Laravel, Vue 3, MySQL, Figma' },
  ],
  links: [{ label: 'Visit the live site', href: 'https://donnez-votre-sang.ch' }],
  brief: [
    { label: 'The problem', text: '30% of people who book cannot give blood on the day.' },
    { label: 'Our answer', text: 'Check your eligibility before booking, by leading the investigation.' },
    { label: 'The result', text: 'A site live for a year and the top grade: 6/6.' },
  ],
  sections: [
    {
      id: 'mandat',
      nav: 'The brief',
      title: 'Three in ten, lost before they arrive',
      content: [
        'The Geneva University Hospitals (HUG) are the canton’s public hospital group. Their Blood Transfusion Centre has to keep blood reserves all year round, and part of the donations comes from blood drives held directly in Geneva companies, from banks to luxury brands.',
        {
          type: 'figures',
          items: [
            { value: 10, suffix: '%', label: 'of donations come from company blood drives' },
            { value: 30, suffix: '%', label: 'of people who book end up unable to give' },
          ],
        },
        'The problem shows on the day itself: a recent vaccine, a trip, a fever, and the donor leaves without giving. Our brief: boost these blood drives.',
      ],
    },
    {
      id: 'equipe',
      nav: 'The team',
      title: 'Seven investigators, four weeks',
      content: [
        {
          type: 'image',
          image: img('equipe', 1600, 588, 'The seven team members photographed against a height chart, each holding a sign with their name and role'),
        },
        'There were seven of us, working in Scrum. I was the full-stack developer: a large part of the Vue 3 front end (public pages, the survey, company pages, label, trophy, kit), part of the Laravel back end, and my share of the concept and UX/UI.',
      ],
    },
    {
      id: 'idee',
      nav: 'The idea',
      title: 'What if the donor led the investigation?',
      content: [
        'Eligibility questionnaires are administrative checklists that people often discover too late. We turned them into an investigation: the agent’s file is examined criterion by criterion, without ever making anyone feel guilty. “Suspect” became “wanted profile”.',
        {
          type: 'strip',
          items: [
            img('papier-brainstorm', 1000, 1333, 'Flip chart covered with ideas written in marker during a brainstorm', 'Brainstorm'),
            img('papier-wireframe', 1000, 1333, 'Hand-drawn wireframe of a page of the site', 'Paper wireframes'),
            img('papier-esquisses', 1000, 1333, 'Pencil sketches of the label and the trophy', 'Label and trophy sketches'),
          ],
        },
      ],
    },
    {
      id: 'site',
      nav: 'The site',
      title: 'From wireframe to website',
      content: [
        {
          type: 'compare',
          before: img('avant-wireframe-admin-mockup-3', 1600, 1200, 'Greyscale wireframe of the admin dashboard'),
          after: img('apres-site-admin-mockup-2', 1600, 1200, 'Admin dashboard on the live site, with the figures and the trophy ranking'),
          beforeLabel: 'Wireframe',
          afterLabel: 'Live site',
          caption: 'The admin dashboard, from wireframe to live site. Drag to compare.',
        },
        {
          type: 'steps',
          frame: 'mockup',
          steps: [
            {
              text: 'The home page speaks to companies: “The HUG are investigating”. It presents the programme and lets a company sign up.',
              image: img('site-accueil-mockup-2', 1600, 1200, 'Home page: “The HUG are investigating”, with a magnifying glass over a drop of blood'),
            },
            {
              text: 'Each company gets its own page, in its own colours: one donation saves three lives, a seven-minute mission.',
              image: img('site-entreprise-mockup-2', 1600, 1200, 'Banque Cantonale de Genève page, in red: “One blood donation saves 3 lives. A 7-minute mission.”'),
            },
            {
              text: 'On the same page, an evidence board answers the questions people don’t dare to ask: does it hurt, how long does it take.',
              image: img('site-indices-mockup-2', 1600, 1200, 'Corkboard with cards linked by red threads: “What is blood donation?”'),
            },
            {
              text: 'The survey uses the official criteria, asked like interrogation questions. At the end, eligible people book an appointment; the others pass the survey on to a colleague.',
              image: img('site-enquete-mockup-2', 1600, 1200, 'Survey question on a kraft-paper file: “Are you between 18 and 75?”'),
            },
            {
              text: 'Every company that holds a blood drive receives the Label 100 pour Sang; the Trophée Sangsationnel ranks the most committed ones.',
              image: img('site-trophee-mockup-2', 1600, 1200, '2026 trophy ranking with a podium of three companies'),
            },
            {
              text: 'The transfusion centre follows everything from its admin area, down to the question where people drop out of the survey.',
              image: img('site-admin-mockup-2', 1600, 1200, 'Admin analytics page: funnel, drop-offs per question, devices and sources'),
            },
          ],
        },
        'Under the hood, eligibility is calculated on the server: the browser never receives the answers that disqualify. And no personal data is stored, as medical confidentiality requires.',
        {
          type: 'architecture',
          nodes: [
            { title: 'Browser', sub: 'Vue 3', note: 'Receives the questions, never the criteria' },
            { title: 'Server', sub: 'Laravel', note: 'Strips the criteria, calculates eligibility', highlight: true },
            { title: 'Database', sub: 'MySQL', note: 'Anonymous token, company, eligible: yes or no' },
          ],
          links: ['questions', 'result'],
          caption: 'The disqualifying criteria never leave the server.',
        },
      ],
    },
    {
      id: 'campagne',
      nav: 'The campaign',
      tone: 'accent',
      title: 'The campaign: the same investigation, everywhere',
      content: [
        'The website was only part of the answer. With the marketing and UI team, we carried the investigation onto every medium a company can use: posters, flyers, a roll-up for the day of the drive, intranet banners, social media, a video for office screens and even stickers for donors. It all comes in a kit each company downloads from the site.',
        {
          type: 'gallery',
          cols: 3,
          caption: 'A3 and A4 posters, in black and white versions.',
          items: [
            img('affiche-loupe', 1000, 1415, 'Black poster “Are you the wanted profile?” with a fingerprint under a magnifying glass'),
            img('affiche-poche', 1000, 1415, 'Poster “1 donation can save 3 lives, are you eligible?” in a blood bag with a detective hat'),
            img('affiche-loupe-blanc', 1000, 1415, 'White poster “Are you the wanted profile?”'),
          ],
        },
        {
          type: 'video',
          src: `${IMG}infotv.mp4`,
          poster: `${IMG}infotv-poster.webp`,
          width: 1280,
          height: 720,
          caption: 'The video shown on company screens, in corridors and break rooms.',
        },
        {
          type: 'gallery',
          cols: 3,
          boxed: true,
          caption: 'The double-sided A5 flyer, adapted to each blood drive, and the roll-up for the day.',
          items: [
            img('flyer-recto', 800, 1136, 'Front of the flyer: “Are you the wanted profile?”'),
            img('flyer-verso', 800, 1136, 'Back of the flyer with the date, place and times of the blood drive'),
            img('rollup', 700, 1400, 'Campaign roll-up with the magnifying glass over the fingerprint'),
          ],
        },
        {
          type: 'gallery',
          cols: 3,
          caption: 'A carousel for Instagram and LinkedIn that explains blood donation in figures.',
          items: [
            img('carrousel-1', 900, 1125, 'Carousel slide: “The clues are clear”'),
            img('carrousel-2', 900, 1125, 'Carousel slide: 700 donations needed every day'),
            img('carrousel-3', 900, 1125, 'Carousel slide: one person in three will need a transfusion'),
          ],
        },
        {
          type: 'gallery',
          cols: 1,
          caption: 'Banners for company intranets, in dark and light versions.',
          items: [
            img('banniere-label', 1200, 180, 'Dark intranet banner: “We are holding a blood drive!”'),
            img('banniere-trophee', 1200, 180, 'Light intranet banner: “Help your company win the Trophée Sangsationnel”'),
          ],
        },
        {
          type: 'gallery',
          cols: 2,
          narrow: true,
          caption: 'Stickers handed to donors and to winning companies.',
          items: [
            img('sticker-donneur-1', 500, 500, 'Round “Certified donor” sticker with the detective hat'),
            img('sticker-trophee', 500, 500, 'Round “Winner 2025” sticker with the trophy hand'),
          ],
        },
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
            { value: 6, suffix: '/6', label: 'project grade' },
            { value: 24, label: 'questions, about 7 minutes' },
            { value: 4, label: 'languages' },
          ],
        },
        {
          type: 'quote',
          text: 'The investigation-based concept is very original and brings an interesting approach to better engage the target audiences.',
          source: 'Feedback from the HUG',
        },
      ],
    },
    {
      id: 'retenu',
      nav: 'What I take away',
      title: 'What I take away',
      content: [
        'I loved working with this team: seven very different profiles, and real mutual support from the first day to the last. I’m proud of what we built, and of my part in it.',
        'I really enjoyed the Scrum rhythm, with a stand-up every morning and a sprint every week. And answering a real brief changes everything: you’re no longer coding for an exercise, but for people who will use it.',
        'Above all, I enjoyed leading a full-stack project without limiting myself to code: thinking through the concept and the experience, then building them from the database to the screen.',
      ],
    },
  ],
  credits: HUG_TEAM_EN,
  creditsNote: 'Integration project of the Bachelor in Media Engineering, HEIG-VD, for the HUG Blood Transfusion Centre.',
};

export const hug = { fr: HUG_FR, en: HUG_EN };
