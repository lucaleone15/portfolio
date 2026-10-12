import { imagesIn, type CaseStudy } from './types';

const img = imagesIn('f1-pitwall');

const F1_FR: CaseStudy = {
  kicker: 'UX/UI design · Données & IA',
  title: 'F1 PitWall',
  hook: 'Ce que l’on voit d’une course dépend entièrement de ce que la réalisation TV décide de montrer.',
  intro:
    'J’ai imaginé une application de second écran qui place les fans de Formule 1 sur le muret des stands : classement détaillé, télémétrie, circuit en direct et prédictions de course.',
  meta: [
    { label: 'Contexte', value: 'Cours WebDon, HEIG-VD' },
    { label: 'Année', value: '2025' },
    { label: 'Durée', value: 'Novembre 2025' },
    { label: 'Mon rôle', value: 'Concept, données et UI' },
    { label: 'Équipe', value: 'Projet solo' },
    { label: 'Outils', value: 'Figma, Ergast, FastF1, OpenF1' },
  ],
  brief: [
    { label: 'Le problème', text: 'Les fans restent spectateurs : les données de course leur échappent.' },
    { label: 'Ma réponse', text: 'Une app qui rend visibles la course et sa stratégie, en direct.' },
    { label: 'Le résultat', text: '5.5/6, pour un concept jugé « original et ambitieux ».' },
  ],
  sections: [
    {
      id: 'probleme',
      nav: 'Le problème',
      title: 'Des spectateurs passifs',
      content: [
        'Je suis passionné de Formule 1 depuis tout petit. Mais devant une course, il me manque quelque chose : les statistiques, les images et les caméras embarquées sont choisies par la F1 ou par les diffuseurs. Impossible de suivre ce qui m’intéresse vraiment.',
        'Pendant ce temps, sur le muret des stands, des ingénieurs analysent la course en temps réel et prennent les décisions qui la font basculer. Mon idée : donner aux fans un accès à ce point de vue.',
        {
          type: 'gallery',
          cols: 2,
          items: [
            img('slide-probleme', 1600, 900, 'Diapositive : « Ce que l’on voit dépend entièrement de ce que la réalisation TV décide de nous montrer »'),
            img('slide-pitwall', 1600, 900, 'Diapositive : les ingénieurs d’une écurie sur le muret des stands, devant leurs écrans'),
          ],
        },
      ],
    },
    {
      id: 'app',
      nav: 'L’app',
      title: 'Visualiser, analyser, prédire',
      content: [
        {
          type: 'steps',
          frame: 'mockup',
          steps: [
            {
              text: 'L’accueil montre la course en cours ou la prochaine, le calendrier et les classements. On rejoint la course en un geste.',
              image: img('app-accueil-mockup', 1600, 1200, 'Deux écrans d’accueil : la course en cours et le compte à rebours de la prochaine'),
            },
            {
              text: 'Le classement va plus loin que la TV : l’âge et le type de pneus, le rythme par secteur. Et le circuit montre la position de chaque pilote, les zones DRS, la météo et les incidents.',
              image: img('app-classement-circuit-mockup', 1600, 1200, 'Deux écrans : le classement détaillé en direct et la carte du circuit avec les pilotes'),
            },
            {
              text: 'La télémétrie traduit les données brutes en courbes lisibles : vitesse, accélération, freinage. Et on peut comparer la trajectoire de deux pilotes, virage par virage.',
              image: img('app-telemetrie-mockup', 1600, 1200, 'Deux écrans : les courbes de télémétrie d’un pilote et la comparaison de trajectoire entre deux pilotes'),
            },
            {
              text: 'La caméra embarquée et les radios entre le pilote et son équipe, parfois avant qu’elles ne passent à la TV.',
              image: img('app-onboard-radio-mockup', 1600, 1200, 'Deux écrans : la caméra embarquée d’un pilote et le fil des messages radio'),
            },
            {
              text: 'Les prédictions et le simulateur : chances de victoire, fenêtres d’arrêt, scénarios « et si » et sa propre stratégie à tester.',
              image: img('app-predictions-mockup', 1600, 1200, 'Deux écrans : les prédictions de classement final et le simulateur de stratégie'),
            },
          ],
        },
      ],
    },
    {
      id: 'donnees',
      nav: 'Les données',
      tone: 'accent',
      title: 'Des données bien réelles',
      content: [
        'Le concept repose sur des sources qui existent : Ergast pour l’historique des résultats, FastF1 pour la télémétrie, OpenF1 pour un prototype, et un flux officiel sous licence pour la version finale. Pour chaque écran, j’ai décrit précisément les données qu’il recevrait, du classement en direct aux résultats du modèle.',
        {
          type: 'image',
          image: img('slide-second-ecran', 1600, 900, 'La course sur une télévision, et l’app PitWall dans la main d’un fan avec le classement en direct', 'Un second écran : la course à la TV, le muret des stands dans la main.'),
        },
      ],
    },
    {
      id: 'ia',
      nav: 'Les prédictions',
      title: 'Prédire la fin de la course',
      content: [
        'Pour les prédictions, j’ai proposé un modèle hybride. LightGBM estime le temps au tour de chaque pilote, avec sa marge d’incertitude, à partir de son rythme, de ses pneus, de la météo et de son historique sur le circuit. Puis une simulation Monte-Carlo joue des milliers de fins de course, en tenant compte des arrêts, du trafic et des voitures de sécurité.',
        {
          type: 'architecture',
          nodes: [
            { title: 'Données', sub: 'Ergast · FastF1 · live', note: 'Rythme, pneus, météo, historique du circuit' },
            { title: 'LightGBM', sub: 'Machine learning', note: 'Temps au tour attendu et incertitude', highlight: true },
            { title: 'Monte-Carlo', sub: 'Simulation', note: 'Des milliers de fins de course simulées' },
          ],
          links: ['features', 'distribution'],
          caption: 'Le modèle capte la performance, la simulation gère la stratégie et les imprévus.',
        },
        'Le même principe recommande la meilleure stratégie d’arrêts : zéro, un ou deux arrêts sont simulés, et l’app affiche les trois meilleures options avec le gain attendu.',
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
            { value: 5.5, suffix: '/6', label: 'note du projet' },
            { value: 5, label: 'vues : accueil, classement, circuit, télémétrie, stratégie' },
            { value: 3, label: 'sources de données ouvertes pour un premier prototype' },
          ],
        },
        {
          type: 'quote',
          text: 'Concept original et ambitieux, une exploitation des données remarquable et des aspects techniques solides.',
          source: 'Retour de l’enseignant',
        },
      ],
    },
    {
      id: 'retenu',
      nav: 'Ce que je retiens',
      title: 'Ce que je retiens',
      content: [
        'Partir d’une passion m’a poussé loin dans les données et les algorithmes. Le retour m’a aussi appris à simplifier : l’interface était trop chargée, et la valeur du concept aurait gagné à être démontrée par des cas d’usage concrets.',
        'La suite logique : un premier prototype sur les données ouvertes, puis des tests avec de vrais fans pour alléger l’interface.',
      ],
    },
  ],
  credits: [{ name: 'Luca Leone', role: 'Projet solo' }],
  creditsNote: 'Cours WebDon du Bachelor en Ingénierie des médias, HEIG-VD. Données et marques de Formule 1 utilisées à titre d’exemple.',
};

const F1_EN: CaseStudy = {
  kicker: 'UX/UI design · Data & AI',
  title: 'F1 PitWall',
  hook: 'What we see of a race depends entirely on what the TV director decides to show.',
  intro:
    'I designed a second-screen app that puts Formula 1 fans on the pit wall: detailed standings, telemetry, a live track map and race predictions.',
  meta: [
    { label: 'Context', value: 'WebDon course, HEIG-VD' },
    { label: 'Year', value: '2025' },
    { label: 'Duration', value: 'November 2025' },
    { label: 'My role', value: 'Concept, data and UI' },
    { label: 'Team', value: 'Solo project' },
    { label: 'Tools', value: 'Figma, Ergast, FastF1, OpenF1' },
  ],
  brief: [
    { label: 'The problem', text: 'Fans stay spectators: race data is out of their reach.' },
    { label: 'My answer', text: 'An app that makes the race and its strategy visible, live.' },
    { label: 'The result', text: '5.5/6, for a concept called “original and ambitious”.' },
  ],
  sections: [
    {
      id: 'probleme',
      nav: 'The problem',
      title: 'Passive spectators',
      content: [
        'I’ve loved Formula 1 since I was a kid. But watching a race, something is missing: stats, images and onboard cameras are chosen by F1 or the broadcasters. There’s no way to follow what really interests me.',
        'Meanwhile, on the pit wall, engineers analyse the race in real time and make the calls that decide it. My idea: give fans access to that point of view.',
        {
          type: 'gallery',
          cols: 2,
          items: [
            img('slide-probleme', 1600, 900, 'Slide: “What we see depends entirely on what the TV director decides to show us”'),
            img('slide-pitwall', 1600, 900, 'Slide: a team’s engineers on the pit wall, in front of their screens'),
          ],
        },
      ],
    },
    {
      id: 'app',
      nav: 'The app',
      title: 'Visualise, analyse, predict',
      content: [
        {
          type: 'steps',
          frame: 'mockup',
          steps: [
            {
              text: 'The home screen shows the race in progress or the next one, the calendar and the standings. You join the race in one tap.',
              image: img('app-accueil-mockup', 1600, 1200, 'Two home screens: the race in progress and the countdown to the next one'),
            },
            {
              text: 'The standings go further than TV: tyre age and compound, pace per sector. And the track map shows every driver’s position, DRS zones, weather and incidents.',
              image: img('app-classement-circuit-mockup', 1600, 1200, 'Two screens: detailed live standings and the track map with the drivers'),
            },
            {
              text: 'Telemetry turns raw data into readable curves: speed, throttle, braking. And you can compare two drivers’ lines, corner by corner.',
              image: img('app-telemetrie-mockup', 1600, 1200, 'Two screens: a driver’s telemetry curves and a line comparison between two drivers'),
            },
            {
              text: 'The onboard camera and the radio between drivers and their team, sometimes before it airs on TV.',
              image: img('app-onboard-radio-mockup', 1600, 1200, 'Two screens: a driver’s onboard camera and the radio message feed'),
            },
            {
              text: 'Predictions and the simulator: chances of winning, pit windows, “what if” scenarios and your own strategy to test.',
              image: img('app-predictions-mockup', 1600, 1200, 'Two screens: final standing predictions and the strategy simulator'),
            },
          ],
        },
      ],
    },
    {
      id: 'donnees',
      nav: 'The data',
      tone: 'accent',
      title: 'Real data underneath',
      content: [
        'The concept relies on sources that exist: Ergast for historical results, FastF1 for telemetry, OpenF1 for a prototype, and a licensed official feed for the final version. For every screen, I described exactly the data it would receive, from the live standings to the model’s output.',
        {
          type: 'image',
          image: img('slide-second-ecran', 1600, 900, 'The race on a TV, and the PitWall app in a fan’s hand showing the live standings', 'A second screen: the race on TV, the pit wall in your hand.'),
        },
      ],
    },
    {
      id: 'ia',
      nav: 'The predictions',
      title: 'Predicting the end of the race',
      content: [
        'For the predictions, I proposed a hybrid model. LightGBM estimates each driver’s lap time, with its uncertainty, from their pace, tyres, the weather and their track history. Then a Monte-Carlo simulation plays out thousands of race endings, accounting for pit stops, traffic and safety cars.',
        {
          type: 'architecture',
          nodes: [
            { title: 'Data', sub: 'Ergast · FastF1 · live', note: 'Pace, tyres, weather, track history' },
            { title: 'LightGBM', sub: 'Machine learning', note: 'Expected lap time and uncertainty', highlight: true },
            { title: 'Monte-Carlo', sub: 'Simulation', note: 'Thousands of simulated race endings' },
          ],
          links: ['features', 'distribution'],
          caption: 'The model captures performance; the simulation handles strategy and the unexpected.',
        },
        'The same approach recommends the best pit strategy: zero, one or two stops are simulated, and the app shows the three best options with the expected gain.',
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
            { value: 5.5, suffix: '/6', label: 'project grade' },
            { value: 5, label: 'views: home, standings, track, telemetry, strategy' },
            { value: 3, label: 'open data sources for a first prototype' },
          ],
        },
        {
          type: 'quote',
          text: 'An original and ambitious concept, remarkable use of data and solid technical aspects.',
          source: 'Feedback from the teacher',
        },
      ],
    },
    {
      id: 'retenu',
      nav: 'What I take away',
      title: 'What I take away',
      content: [
        'Starting from a passion pushed me deep into data and algorithms. The feedback also taught me to simplify: the interface was too busy, and the concept’s value would have been clearer with concrete use cases.',
        'The logical next step: a first prototype on open data, then tests with real fans to lighten the interface.',
      ],
    },
  ],
  credits: [{ name: 'Luca Leone', role: 'Solo project' }],
  creditsNote: 'WebDon course of the Bachelor in Media Engineering, HEIG-VD. Formula 1 data and brands used for illustration only.',
};

export const f1Pitwall = { fr: F1_FR, en: F1_EN };
