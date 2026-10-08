import type { Language } from '../types';

/**
 * Case studies told as a scroll story (CaseStudy.tsx). One entry per project and language;
 * a project without an entry for the current language keeps the classic project page.
 *
 * Writing rules: prose in the first person ("j'ai" for my work, "nous" for the team), no
 * invented figures — every number below comes from the project's own documents (brief,
 * report, user-test notes). Anything still missing is written [À COMPLÉTER].
 */

export interface CaseImage {
  src: string;
  width: number;
  height: number;
  alt: string;
  caption?: string;
}

export interface CaseFigure {
  /** Numeric part, counted up when it scrolls into view */
  value: number;
  prefix?: string;
  suffix?: string;
  label: string;
}

export interface CaseStep {
  text: string;
  image: CaseImage;
}

export type CaseBlock =
  | { type: 'figures'; items: CaseFigure[]; source?: string }
  | { type: 'steps'; steps: CaseStep[]; frame?: 'screen' | 'plain' }
  | { type: 'compare'; before: CaseImage; after: CaseImage; beforeLabel: string; afterLabel: string; caption: string }
  | { type: 'pair'; items: [CaseImage, CaseImage]; caption: string }
  | { type: 'strip'; items: CaseImage[] }
  | { type: 'gallery'; items: CaseImage[] }
  | { type: 'image'; image: CaseImage; href?: string }
  | { type: 'quote'; text: string; source: string }
  | { type: 'video'; src: string; poster: string; width: number; height: number; caption: string }
  | { type: 'architecture'; nodes: { title: string; sub: string; note: string; highlight?: boolean }[]; links: string[]; caption: string }
  | { type: 'team'; members: { name: string; role: string; me?: boolean }[] };

/** Prose paragraphs and blocks, in reading order */
export type CaseContent = (string | CaseBlock)[];

export interface CaseSection {
  id: string;
  title: string;
  content: CaseContent;
}

export interface CaseStudy {
  kicker: string;
  title: string;
  hook: string;
  intro: string;
  meta: { label: string; value: string }[];
  liveUrl?: string;
  liveLabel?: string;
  brief: { label: string; text: string }[];
  sections: CaseSection[];
  credits: { name: string; role: string }[];
  creditsNote?: string;
}

const IMG = '/images/case/hug/';
const img = (name: string, width: number, height: number, alt: string, caption?: string): CaseImage => ({
  src: `${IMG}${name}.webp`,
  width,
  height,
  alt,
  caption,
});

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
  kicker: 'HUG · Centre de transfusion sanguine',
  title: 'Dossier Sang-26',
  hook: 'Sur dix personnes inscrites à une collecte de sang, trois repartent sans avoir pu donner.',
  intro:
    'Les HUG nous ont demandé de dynamiser les collectes organisées dans les entreprises genevoises. Notre réponse : une enquête qui vérifie l’éligibilité avant l’inscription, et une campagne pour les entreprises.',
  meta: [
    { label: 'Contexte', value: 'Projet d’intégration HEIG-VD, mandat des HUG' },
    { label: 'Année', value: '2026' },
    { label: 'Durée', value: '4 semaines' },
    { label: 'Mon rôle', value: 'Développeur full-stack, concept et UX/UI' },
    { label: 'Équipe', value: '7 étudiant·e·s' },
    { label: 'Outils', value: 'Laravel, Vue 3, MySQL, Figma' },
  ],
  liveUrl: 'https://donnez-votre-sang.ch',
  liveLabel: 'Voir le site en ligne',
  brief: [
    { label: 'Le problème', text: '30 % des inscrits ne remplissent pas les critères le jour de la collecte.' },
    { label: 'Notre réponse', text: 'Une enquête d’éligibilité à faire avant de s’inscrire, et une campagne pour les entreprises.' },
    { label: 'Le résultat', text: 'Un site en ligne pendant un an et la note maximale : 6/6.' },
  ],
  sections: [
    {
      id: 'contexte',
      title: 'Un problème de logistique, pas de générosité',
      content: [
        'Les HUG organisent des collectes de sang directement dans les entreprises partenaires. Mais le jour J, près d’un tiers des inscrits ne remplissent pas les critères : un vaccin récent, un voyage hors d’Europe, une fièvre. Ils se sont libérés pour rien, et le centre de transfusion a réservé un créneau pour rien.',
        {
          type: 'figures',
          items: [
            { value: 10, suffix: ' %', label: 'des dons viennent des collectes en entreprise' },
            { value: 30, suffix: ' %', label: 'des inscrits ne peuvent finalement pas donner' },
          ],
          source: 'Source : brief des HUG, 2026',
        },
        'Les entreprises, elles, ne recevaient aucun support pour communiquer, et rien ne mettait en avant celles qui s’engagent.',
      ],
    },
    {
      id: 'equipe',
      title: 'Sept enquêteurs, quatre semaines',
      content: [
        {
          type: 'image',
          image: img('equipe', 1600, 588, 'Les sept membres de l’équipe photographiés devant une toise, chacun tenant une pancarte avec son nom et son rôle'),
        },
        'Nous étions sept, en Scrum, avec un sprint par semaine. Pour la photo d’équipe, nous avons joué le jeu jusqu’au bout.',
        'J’étais le développeur full-stack du groupe. J’ai réalisé une grande partie du front-end en Vue 3 : les pages publiques, l’enquête, la page de chaque entreprise, le label, le trophée, le kit et les rapports PDF. Le back-end Laravel était partagé. J’ai aussi participé à la recherche du concept et aux choix d’UX/UI.',
      ],
    },
    {
      id: 'idee',
      title: 'Du constat à l’idée',
      content: [
        'Nous avons étudié ce qui existe ailleurs et construit trois personas. Constat : les questionnaires d’éligibilité sont des listes administratives qu’on découvre souvent sur place, quand il est trop tard.',
        {
          type: 'strip',
          items: [
            img('brainstorm', 1000, 1333, 'Tableau de papier couvert de pistes écrites au feutre pendant un brainstorming', 'Brainstorming'),
            img('persona-lea', 1000, 1340, 'Fiche persona de Léa, 27 ans, chargée de communication', 'Persona principal'),
            img('wireframe-papier', 1000, 1333, 'Wireframe dessiné à la main d’une page du site', 'Wireframes papier'),
          ],
        },
        'Après une semaine à trier beaucoup d’idées, nous avons retenu celle-ci : transformer le questionnaire en enquête. La personne qui veut donner devient un agent dont on examine le dossier. Les critères restent les mêmes, mais on les découvre en avançant, sans jamais culpabiliser : « suspect » est devenu « profil recherché ».',
        {
          type: 'compare',
          before: img('cobrande-wireframe', 1280, 1280, 'Wireframe en niveaux de gris de la page d’une entreprise partenaire'),
          after: img('cobrande-final', 1280, 1280, 'Maquette finale de la page d’une entreprise partenaire, avec compte à rebours et tableau d’indices'),
          beforeLabel: 'Wireframe',
          afterLabel: 'Maquette finale',
          caption: 'La page de chaque entreprise, du wireframe à la maquette finale.',
        },
      ],
    },
    {
      id: 'site',
      title: 'Le site, page par page',
      content: [
        {
          type: 'steps',
          frame: 'screen',
          steps: [
            {
              text: 'L’accueil s’adresse aux entreprises : « Les HUG mènent l’enquête ». On y découvre le programme, le trophée et le label, et on peut inscrire son entreprise.',
              image: img('site-en-ligne', 1440, 900, 'Page d’accueil du site : « Les HUG mènent l’enquête », avec une loupe sur une goutte de sang'),
            },
            {
              text: 'Chaque entreprise reçoit sa propre page, à ses couleurs. Ses collaborateurs y lancent l’enquête : êtes-vous apte à sauver une vie aujourd’hui ?',
              image: img('quiz-1-intro', 1440, 900, 'Écran d’accueil de l’enquête : « Êtes-vous apte à sauver une vie aujourd’hui ? » à côté d’un dossier confidentiel'),
            },
            {
              text: 'Les questions reprennent les critères officiels, présentés comme les pièces d’un dossier. Certaines n’apparaissent que si une réponse précédente les rend nécessaires.',
              image: img('quiz-3-question', 1440, 900, 'Question du dossier : avez-vous séjourné en dehors de l’Europe au cours des six derniers mois ?'),
            },
            {
              text: 'Le verdict tombe tout de suite. Éligible : on prend rendez-vous. Sinon : on transmet l’enquête à un collègue.',
              image: img('quiz-5-eligible', 1440, 900, 'Dossier d’agent tamponné « Éligible », avec le bouton de prise de rendez-vous'),
            },
            {
              text: 'Le Trophée Sangsationnel récompense chaque année les trois entreprises les plus engagées.',
              image: img('site-trophee', 1440, 900, 'Page du Trophée Sangsationnel avec le trophée en forme de main tenant une goutte'),
            },
            {
              text: 'Le Label 100 pour Sang, lui, est attribué à toutes les entreprises qui organisent une collecte.',
              image: img('site-label', 1440, 900, 'Page du Label 100 pour Sang avec le badge du label'),
            },
            {
              text: 'Les entreprises téléchargent un kit de communication complet, et le centre de transfusion suit chaque collecte depuis son administration.',
              image: img('site-kit', 1440, 900, 'Page du kit de communication avec la liste des supports à télécharger'),
            },
          ],
        },
        'Côté technique, l’éligibilité est calculée sur le serveur : le navigateur ne reçoit jamais les réponses qui disqualifient, donc impossible de tricher. Et nous ne gardons aucune donnée personnelle, secret médical oblige.',
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
      title: 'Une campagne autour du site',
      content: [
        'L’équipe marketing a décliné l’enquête sur tous les supports : affiches, flyers, bannières intranet, réseaux sociaux et une vidéo pour les écrans des entreprises.',
        {
          type: 'video',
          src: `${IMG}infotv.mp4`,
          poster: `${IMG}infotv-poster.webp`,
          width: 1280,
          height: 720,
          caption: 'La vidéo diffusée sur les écrans des entreprises.',
        },
        {
          type: 'gallery',
          items: [
            img('affiche-loupe', 1000, 1415, 'Affiche noire « Seriez-vous le profil recherché ? » avec une empreinte digitale sous une loupe', 'Affiche A3'),
            img('affiche-poche', 1000, 1415, 'Affiche « 1 don peut sauver 3 vies, es-tu éligible ? » dans une poche de sang avec un chapeau d’inspecteur', 'Affiche A3'),
            img('carrousel-1', 900, 1125, 'Visuel Instagram : « Les indices sont formels »', 'Réseaux sociaux'),
            img('carrousel-2', 900, 1125, 'Visuel Instagram : 700 dons nécessaires par jour', 'Réseaux sociaux'),
          ],
        },
      ],
    },
    {
      id: 'resultats',
      title: 'Résultats',
      content: [
        {
          type: 'figures',
          items: [
            { value: 6, suffix: '/6', label: 'note du projet' },
            { value: 8, suffix: '/10', label: 'note moyenne d’utilisabilité de nos testeurs' },
            { value: 24, label: 'questions, environ 7 minutes' },
            { value: 4, label: 'langues' },
          ],
        },
        'Avant la fin, nous avons testé le site avec quatre personnes : trois étudiants et un enseignant. L’univers de l’enquête a tout de suite parlé, une testeuse a même eu « l’impression d’arriver dans un escape game, mais sérieux ». Leurs remarques nous ont fait corriger des formulations trop culpabilisantes et des boutons en double.',
        {
          type: 'strip',
          items: [
            img('tests-1', 1000, 1333, 'Un étudiant et une étudiante testent le site sur un ordinateur portable en prenant des notes', 'Tests utilisateurs'),
            img('tests-2', 1000, 1333, 'Une testeuse parcourt l’enquête sur un ordinateur portable', 'Tests utilisateurs'),
          ],
        },
        {
          type: 'quote',
          text: 'Le concept basé sur une enquête est très original et apporte une approche intéressante pour mieux engager les publics cibles.',
          source: 'Retour des HUG',
        },
        'L’équipe pédagogique a salué le parti pris de l’enquête, la qualité des rendus et notre gestion de projet : « vous avez fait preuve de beaucoup de dynamisme et de professionnalisme ».',
      ],
    },
    {
      id: 'apprentissages',
      title: 'Ce que je ferais autrement',
      content: [
        'Les HUG l’ont relevé, comme nos testeurs : avec 7 minutes, l’enquête est un peu longue et peut décourager. Le site enregistre la question à laquelle les gens abandonnent ; c’est par là que je commencerais pour la raccourcir.',
        'C’est le premier projet où j’ai livré un produit complet, de la base de données à la mise en ligne, avec une équipe de sept et des retours chaque semaine. J’y ai appris qu’un bon concept se trie autant qu’il se trouve.',
      ],
    },
  ],
  credits: HUG_TEAM,
  creditsNote: 'Projet d’intégration du Bachelor en Ingénierie des médias, HEIG-VD, pour le Centre de transfusion sanguine des HUG.',
};

const CASE_STUDIES: Record<string, Partial<Record<Language, CaseStudy>>> = {
  'hug-sangsationnel': { fr: HUG_FR },
};

export function getCaseStudy(projectId: string, lang: Language): CaseStudy | null {
  return CASE_STUDIES[projectId]?.[lang] ?? null;
}
