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
  { name: 'Luca Leone', role: 'Développeur full-stack', me: true },
  { name: 'Romain Blanchard', role: 'Product Owner, développeur back-end' },
  { name: 'Étienne Bergeon', role: 'Scrum Master' },
  { name: 'Christophe Cunha', role: 'UX/UI' },
  { name: 'Aissya Mghirbi', role: 'UI' },
  { name: 'Marc Bridy', role: 'Marketing, communication et UX' },
  { name: 'Liliana Kolmakova', role: 'Marketing et communication' },
];

const HUG_FR: CaseStudy = {
  kicker: 'HUG · Centre de transfusion sanguine',
  title: 'Dossier Sang-26',
  hook: 'Sur dix personnes inscrites à une collecte de sang, trois repartent sans avoir pu donner.',
  intro:
    'Les HUG nous ont demandé de dynamiser les collectes organisées dans les entreprises genevoises. Nous avons choisi de prévenir les donneurs avant qu’ils ne se déplacent, avec une enquête qui vérifie leur éligibilité.',
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
    { label: 'Le résultat', text: 'Un site en ligne pendant un an, testé par quatre personnes : 8/10 de moyenne en utilisabilité.' },
  ],
  sections: [
    {
      id: 'contexte',
      title: 'Un problème de logistique, pas de générosité',
      content: [
        'Les Hôpitaux universitaires de Genève organisent des collectes de sang directement dans les entreprises partenaires. Les collaborateurs n’ont pas à se déplacer, et ces collectes pèsent déjà environ un dixième des dons.',
        {
          type: 'figures',
          items: [
            { value: 10, suffix: ' %', label: 'des dons viennent des collectes en entreprise' },
            { value: 30, suffix: ' %', label: 'des inscrits ne peuvent finalement pas donner' },
          ],
          source: 'Source : brief des HUG, 2026',
        },
        'Le problème se voit le jour J. Près d’un tiers des inscrits ne remplissent pas les critères : un vaccin récent, un voyage hors d’Europe, une fièvre. Ils se sont libérés pour rien, et le centre de transfusion a réservé un créneau pour rien.',
        'Il manquait aussi de la reconnaissance. Les entreprises ne recevaient aucun support pour communiquer, et rien ne mettait en avant celles qui s’engagent. Les grandes banques et maisons de luxe genevoises participent depuis longtemps ; les PME restent à convaincre.',
        'Nous avions quatre semaines, Vue et MySQL imposés, et une organisation en Scrum avec un sprint par semaine.',
      ],
    },
    {
      id: 'role',
      title: 'Développeur full-stack, et pas seulement',
      content: [
        'Nous étions sept, répartis en pôles : gestion de projet, UX/UI, marketing et communication, développement. Chaque matin à 9 h, un point rapide permettait de voir où en était chacun.',
        'Mon rôle principal était le développement. J’ai réalisé une grande partie du front-end en Vue 3 : les pages publiques, l’enquête, le tableau d’indices interactif, la page propre à chaque entreprise, les pages du label et du trophée, le kit de communication, le générateur d’emails et les rapports PDF de l’administration. Le back-end Laravel était réparti dans l’équipe ; j’y ai notamment ajouté la gestion de plusieurs créneaux de collecte par entreprise et préparé la mise en production.',
        'Je ne me suis pas limité au code. J’ai participé à la recherche du concept dès la première semaine et aux choix d’UX/UI, ce qui m’a permis de développer des écrans dont je comprenais l’intention.',
        { type: 'team', members: HUG_TEAM },
      ],
    },
    {
      id: 'recherche',
      title: 'Personne ne lit un questionnaire médical par plaisir',
      content: [
        'Avant de dessiner quoi que ce soit, nous avons étudié ce qui existe : l’EFS, Blutspende, Héma-Québec, le CHUV, et l’ancien Trophée de la générosité que les HUG avaient décerné de 2008 à 2010. Nous avons ensuite construit trois personas et quatre parcours utilisateurs.',
        {
          type: 'steps',
          frame: 'plain',
          steps: [
            {
              text: 'Léa, 27 ans, chargée de communication, est notre utilisatrice principale. Elle veut aider, mais elle a peu de temps et ne connaît pas les critères. Christiane, responsable RH, et Jérémie, administrateur au centre de transfusion, complètent le tableau.',
              image: img('persona-lea', 1000, 1340, 'Fiche persona de Léa, 27 ans, chargée de communication : activités, douleurs et motivations'),
            },
            {
              text: 'Premier constat : les questionnaires d’éligibilité existants sont des listes administratives. On les découvre souvent sur place, quand il est trop tard. C’est là que se perdent les 30 %.',
              image: img('benchmark', 1400, 1044, 'Extrait du benchmark : organismes de don du sang comparés, avec leurs points forts et leurs limites'),
            },
            {
              text: 'Deuxième constat : presque aucun organisme ne valorise les entreprises qui s’engagent, alors que la collecte fait partie de leur politique RSE. Pour Christiane, organiser une collecte doit aussi se voir.',
              image: img('persona-christiane', 1000, 1340, 'Fiche persona de Christiane, responsable RH qui organise les collectes dans son entreprise'),
            },
            {
              text: 'Troisième constat : la peur des piqûres et la culpabilité freinent autant que le manque d’information. Dans une PME, s’absenter une heure peut déjà sembler de trop. Le ton devait rassurer, jamais culpabiliser.',
              image: img('empathy-map', 1600, 1037, 'Empathy map des donneurs de sang, couverte de post-it sur ce qu’ils pensent, voient et ressentent'),
            },
          ],
        },
      ],
    },
    {
      id: 'ideation',
      title: 'Une semaine pour choisir une seule idée',
      content: [
        'La première semaine, nous avions trop d’idées. Il a fallu plusieurs séances, où chacun présentait ses pistes, pour les trier et converger vers un concept cohérent.',
        {
          type: 'strip',
          items: [
            img('brainstorm', 1000, 1333, 'Tableau de papier couvert de pistes écrites au feutre pendant un brainstorming', 'Brainstorming'),
            img('wireframe-papier', 1000, 1333, 'Wireframe dessiné à la main d’une page du site', 'Wireframes papier'),
            img('sketch-label-trophee', 1000, 1333, 'Esquisses au crayon du label et du trophée', 'Esquisses du label et du trophée'),
          ],
        },
        'L’idée retenue : transformer le questionnaire d’éligibilité en enquête. La personne qui veut donner devient un agent dont on examine le dossier. Les critères médicaux restent les mêmes, mais on les découvre en avançant au lieu de les subir en bloc.',
        'Le pari avait un risque : un vocabulaire policier peut être maladroit quand on parle de santé. Nous avons écarté certains mots dès les premières discussions. « Suspect » est devenu « profil recherché ».',
        'Pour les entreprises, nous avons imaginé deux niveaux de reconnaissance : le Label 100 pour Sang, attribué à toutes celles qui organisent une collecte, et le Trophée Sangsationnel, qui récompense chaque année les trois plus engagées.',
        {
          type: 'compare',
          before: img('cobrande-wireframe', 1280, 1280, 'Wireframe en niveaux de gris de la page d’une entreprise partenaire'),
          after: img('cobrande-final', 1280, 1280, 'Maquette finale de la page d’une entreprise partenaire, avec compte à rebours et tableau d’indices'),
          beforeLabel: 'Wireframe',
          afterLabel: 'Maquette finale',
          caption: 'La page de chaque entreprise, du wireframe à la maquette finale.',
        },
        'Le même tri s’est fait côté technique. Au départ, nous voulions tout stocker en base de données, y compris les questions et les réponses des participants. Nous avions vu trop grand. L’enquête est finalement dans des fichiers, et nous ne gardons aucune donnée personnelle : seulement un jeton anonyme, l’entreprise et le résultat. C’est plus simple, et c’est ce qu’exige le secret médical.',
        {
          type: 'pair',
          items: [
            img('modele-avant', 1600, 1200, 'Premier diagramme de classes, imprimé et annoté, avec de nombreuses entités'),
            img('modele-apres', 1600, 1234, 'Modèle de données final, réduit à quelques tables'),
          ],
          caption: 'Le modèle de données, avant et après simplification.',
        },
      ],
    },
    {
      id: 'realisation',
      title: 'Un interrogatoire, pas un formulaire',
      content: [
        'Visuellement, nous avons gardé le blanc et le rouge des HUG pour rester crédibles, et ajouté le noir et les codes du dossier d’enquête : papier kraft, tampons, empreinte digitale dans la goutte de sang.',
        {
          type: 'steps',
          frame: 'screen',
          steps: [
            {
              text: 'L’enquête commence par une question directe : êtes-vous apte à sauver une vie aujourd’hui ?',
              image: img('quiz-1-intro', 1440, 900, 'Écran d’accueil de l’enquête : « Êtes-vous apte à sauver une vie aujourd’hui ? » à côté d’un dossier confidentiel'),
            },
            {
              text: 'Chaque entreprise a sa propre entrée, à ses couleurs et avec son logo. Ce sont les RH qui envoient le lien à leurs collaborateurs.',
              image: img('quiz-2-bureau', 1440, 900, 'Bureau de l’inspecteur aux couleurs d’une entreprise partenaire, avant le début de l’interrogatoire'),
            },
            {
              text: 'Les questions sont regroupées par thèmes, comme les étapes d’un interrogatoire. Certaines n’apparaissent que si une réponse précédente les rend nécessaires.',
              image: img('quiz-3-question', 1440, 900, 'Question du dossier : avez-vous séjourné en dehors de l’Europe au cours des six derniers mois ?'),
            },
            {
              text: 'Les critères viennent des recommandations officielles du centre de transfusion : voyages, symptômes, soins récents.',
              image: img('quiz-4-symptomes', 1440, 900, 'Question à cocher sur les symptômes des quatre dernières semaines : fièvre, rhume, diarrhée'),
            },
            {
              text: 'À la fin, le verdict tombe. Si la personne est éligible, elle prend rendez-vous directement.',
              image: img('quiz-5-eligible', 1440, 900, 'Dossier d’agent tamponné « Éligible », avec le bouton de prise de rendez-vous'),
            },
            {
              text: 'Sinon, elle peut contacter les HUG, ou transmettre l’enquête à un collègue qui, lui, pourra peut-être donner.',
              image: img('quiz-6-pas-eligible', 1440, 900, 'Dossier d’agent tamponné « Pas éligible », avec les boutons pour partager l’enquête à un collègue'),
            },
          ],
        },
        'Un choix technique ne se voit pas, mais compte beaucoup. Si le navigateur connaissait les réponses qui rendent inéligible, n’importe qui pourrait modifier le code pour obtenir le résultat voulu. Le calcul se fait donc sur le serveur : avant d’envoyer les questions, Laravel retire les champs qui disent quelle réponse disqualifie. Un jeton unique, créé au début de l’enquête, empêche aussi d’envoyer deux fois le même formulaire.',
        {
          type: 'architecture',
          nodes: [
            { title: 'Navigateur', sub: 'Vue 3', note: 'Reçoit les questions, jamais les critères' },
            { title: 'Serveur', sub: 'Laravel', note: 'Retire les critères, calcule l’éligibilité', highlight: true },
            { title: 'Base de données', sub: 'MySQL', note: 'Jeton anonyme, entreprise, éligible : oui ou non' },
          ],
          links: ['questions', 'résultat'],
          caption: 'Les critères de disqualification ne quittent jamais le serveur, et aucune donnée personnelle n’est enregistrée.',
        },
        'Le site existe en quatre langues. L’administration permet au centre de transfusion de valider les entreprises, de suivre les statistiques de chaque collecte et de générer un rapport PDF à leur envoyer.',
        {
          type: 'image',
          image: img('admin-dashboard', 1280, 830, 'Tableau de bord de l’administration avec les entreprises actives, les collectes et les enquêtes complétées', 'Le tableau de bord de l’administration (données de démonstration).'),
        },
        'Autour du site, l’équipe marketing a décliné la campagne sur tous les supports : affiches, flyers, roll-up, bannières intranet, carrousels pour les réseaux sociaux, une courte vidéo pour les écrans des entreprises et même des stickers.',
        {
          type: 'video',
          src: `${IMG}infotv.mp4`,
          poster: `${IMG}infotv-poster.webp`,
          width: 1280,
          height: 720,
          caption: 'La vidéo diffusée sur les écrans des entreprises (InfoTV).',
        },
        {
          type: 'gallery',
          items: [
            img('affiche-loupe', 1000, 1415, 'Affiche noire « Seriez-vous le profil recherché ? » avec une empreinte digitale sous une loupe', 'Affiche A3'),
            img('affiche-poche', 1000, 1415, 'Affiche « 1 don peut sauver 3 vies, es-tu éligible ? » dans une poche de sang avec un chapeau d’inspecteur', 'Affiche A3'),
            img('carrousel-1', 900, 1125, 'Premier visuel du carrousel Instagram : « Les indices sont formels »', 'Carrousel réseaux sociaux'),
            img('carrousel-2', 900, 1125, 'Deuxième visuel du carrousel : 700 dons nécessaires par jour', 'Carrousel réseaux sociaux'),
          ],
        },
      ],
    },
    {
      id: 'resultats',
      title: 'Ce que nous avons livré',
      content: [
        'Le site donnez-votre-sang.ch est en ligne pour un an. Il réunit la page publique destinée aux entreprises, une page par entreprise partenaire, l’enquête, le label, le trophée, le kit de communication et l’administration.',
        {
          type: 'figures',
          items: [
            { value: 24, label: 'questions dans l’enquête, environ 7 minutes' },
            { value: 4, label: 'langues : français, anglais, allemand, italien' },
            { value: 68, label: 'user stories livrées en 4 sprints d’une semaine' },
            { value: 8, suffix: '/10', label: 'note moyenne d’utilisabilité donnée par nos testeurs' },
          ],
          source: 'Sources : rapport de projet et synthèse des tests utilisateurs',
        },
        'Nous avons testé le prototype avec quatre personnes : trois étudiants en ingénierie des médias et un enseignant de la HEIG-VD. Chacun devait comprendre le site en le parcourant, vérifier son éligibilité, trouver le trophée et inscrire une entreprise. L’univers de l’enquête a fonctionné : une participante a même eu « l’impression d’arriver dans un escape game, mais sérieux ».',
        { type: 'quote', text: 'On comprend tout de suite le thème.', source: 'Participante aux tests utilisateurs' },
        'Les tests ont aussi montré nos erreurs : certaines formulations paraissaient culpabilisantes, des boutons faisaient doublon, et la page d’une entreprise se confondait avec le site principal. Nous les avons corrigés, et ajouté un message qui rappelle qu’aucune réponse n’est enregistrée.',
        '[À COMPLÉTER : la note du projet et les retours des enseignants]',
        {
          type: 'image',
          href: 'https://donnez-votre-sang.ch',
          image: img('site-en-ligne', 1440, 900, 'Page d’accueil du site donnez-votre-sang.ch : « Les HUG mènent l’enquête »', 'Le site en ligne : donnez-votre-sang.ch'),
        },
      ],
    },
    {
      id: 'apprentissages',
      title: 'Ce que je ferais autrement',
      content: [
        'Une critique revient dans les tests : l’enquête est longue. Une participante a abandonné après dix questions, et l’enseignant a perdu le fil vers la dix-septième. Nous ne l’avons pas raccourcie avant la fin du projet. Le site enregistre en revanche la question à laquelle les gens abandonnent : c’est la première donnée que j’exploiterais pour couper les questions qui coûtent le plus.',
        'Côté organisation, nous aurions dû faire une vraie rétrospective à la fin de chaque sprint, plutôt qu’un rapide bilan oral, et documenter l’évolution du site au fil des versions. Une partie de nos itérations n’existe plus que dans l’historique du code.',
        'C’est le premier projet où j’ai livré un produit complet, de la base de données à la mise en ligne, avec une équipe de sept personnes et des retours chaque semaine. J’en retiens qu’un choix comme ne stocker aucune donnée personnelle simplifie autant le code que la confiance des utilisateurs.',
      ],
    },
  ],
  credits: HUG_TEAM.map(({ name, role }) => ({ name, role })),
  creditsNote: 'Projet d’intégration du Bachelor en Ingénierie des médias, HEIG-VD, pour le Centre de transfusion sanguine des HUG.',
};

const CASE_STUDIES: Record<string, Partial<Record<Language, CaseStudy>>> = {
  'hug-sangsationnel': { fr: HUG_FR },
};

export function getCaseStudy(projectId: string, lang: Language): CaseStudy | null {
  return CASE_STUDIES[projectId]?.[lang] ?? null;
}
