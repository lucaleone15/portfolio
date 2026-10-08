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
  /** Inside a fixed frame: crop to fill (default) or show whole */
  fit?: 'cover' | 'contain';
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
  | { type: 'steps'; steps: CaseStep[]; frame?: 'screen' | 'plain' | 'mockup' }
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
  kicker: 'Hôpitaux universitaires de Genève · Don du sang',
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
  liveUrl: 'https://donnez-votre-sang.ch',
  liveLabel: 'Voir le site en ligne',
  brief: [
    { label: 'Le problème', text: '30 % des inscrits ne peuvent pas donner le jour de la collecte.' },
    { label: 'Notre réponse', text: 'Vérifier son éligibilité avant de s’inscrire, en menant l’enquête.' },
    { label: 'Le résultat', text: 'Un site en ligne pendant un an et la note maximale : 6/6.' },
  ],
  sections: [
    {
      id: 'mandat',
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
        {
          type: 'gallery',
          items: [
            img('affiche-loupe', 1000, 1415, 'Affiche noire « Seriez-vous le profil recherché ? » avec une empreinte digitale sous une loupe'),
            img('affiche-poche', 1000, 1415, 'Affiche « 1 don peut sauver 3 vies, es-tu éligible ? » dans une poche de sang avec un chapeau d’inspecteur'),
          ],
        },
      ],
    },
    {
      id: 'site',
      title: 'Du wireframe au site',
      content: [
        {
          type: 'compare',
          before: img('avant-wireframe-entreprise', 1600, 1000, 'Wireframe en niveaux de gris du haut de la page d’une entreprise partenaire'),
          after: img('apres-site-entreprise', 1600, 1000, 'Haut de la page d’une entreprise partenaire sur le site en ligne'),
          beforeLabel: 'Wireframe',
          afterLabel: 'Site en ligne',
          caption: 'La page d’une entreprise, du wireframe au site en ligne. Faites glisser pour comparer.',
        },
        {
          type: 'steps',
          frame: 'screen',
          steps: [
            {
              text: 'L’accueil s’adresse aux entreprises : « Les HUG mènent l’enquête ». On y découvre le programme et on inscrit son entreprise.',
              image: img('site-accueil', 1600, 1000, 'Page d’accueil : « Les HUG mènent l’enquête », avec une loupe sur une goutte de sang'),
            },
            {
              text: 'Chaque entreprise reçoit sa propre page, à ses couleurs : un don sauve trois vies, une mission de sept minutes.',
              image: img('site-entreprise', 1600, 1000, 'Page de la Banque Cantonale de Genève, en rouge : « Un don de sang sauve 3 vies. Une mission de 7 minutes. »'),
            },
            {
              text: 'Sur la même page, un tableau d’indices répond aux questions qu’on n’ose pas poser : est-ce que ça fait mal, combien de temps ça dure.',
              image: img('site-indices', 1600, 1000, 'Tableau de liège avec des fiches reliées par des fils rouges : « C’est quoi le don du sang ? »'),
            },
            {
              text: 'L’enquête reprend les critères officiels, posés comme les questions d’un interrogatoire. À la fin, la personne éligible prend rendez-vous ; les autres transmettent l’enquête à un collègue.',
              image: img('site-enquete', 1600, 1000, 'Question de l’enquête sur un dossier en papier kraft : « Avez-vous entre 18 et 75 ans ? »'),
            },
            {
              text: 'Toutes les entreprises qui organisent une collecte reçoivent le Label 100 pour Sang ; le Trophée Sangsationnel classe les plus engagées.',
              image: img('site-trophee', 1600, 1000, 'Classement 2026 du trophée avec un podium de trois entreprises'),
            },
            {
              text: 'Le centre de transfusion suit tout depuis son administration, jusqu’à la question où les gens abandonnent l’enquête.',
              image: img('site-admin', 1600, 1000, 'Page Analytics de l’administration : entonnoir, abandons par question, appareils et sources'),
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
      id: 'resultats',
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
      id: 'apprentissages',
      title: 'Ce que je ferais autrement',
      content: [
        'Les HUG l’ont relevé : sept minutes, c’est long. Le site enregistre à quelle question les gens abandonnent ; c’est par là que je commencerais pour raccourcir l’enquête.',
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
