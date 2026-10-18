# Dashboard admin : socle + module Contenu

*Document de conception, 18 octobre 2026. Premier de trois chantiers : Contenu (ce document), puis Statistiques, puis Messages du formulaire. Les deux suivants auront leur propre document.*

## Intention

Luca veut un vrai espace d'administration pour son portfolio (luca-leone.ch), d'abord pour **modifier tout le contenu du site sans toucher au code**, depuis l'ordinateur comme depuis le téléphone. Aujourd'hui, tout le contenu est écrit en dur dans `src/data/` et `src/context/LanguageContext.tsx` : chaque changement de texte ou d'image passe par le code, un commit et un déploiement manuel en SSH.

Une première tentative a existé (commit `573c670`, septembre 2026 : une fenêtre `AdminModal` cachée derrière ⌘E, des champs texte bruts, sauvegarde dans le `localStorage`). Elle a été retirée parce qu'elle était « nulle » :
- des champs bruts, sans voir le rendu ;
- une impression de bricolage ;
- rien n'était vraiment publié (les données restaient dans le navigateur) ;
- elle était **trop accessible** (un raccourci clavier sur le site public).

Le nouvel espace doit être l'inverse sur chacun de ces points.

## Objectifs

1. **Un espace privé et sûr**, séparé du site public, auquel Luca seul peut accéder.
2. **Dans la DA du site** : les deux rouges (`--accent-primary #FF2E55`, `--accent-light #C50E36`), le papier `#F7F6F3`, le graphite `#1A1A1A`, les polices Syne et Plus Jakarta Sans auto-hébergées, le monogramme LL, le thème clair/sombre qui suit le système. Il doit donner l'impression de faire partie du portfolio, pas d'un outil générique.
3. **Utilisable sur téléphone**, pas seulement sur ordinateur (retoucher un texte dans le train, ajouter une image depuis sa pellicule).
4. **Tout le contenu modifiable** : projets (cartes de l'accueil + études de cas), page « À propos », Hero, informations de contact.
5. **Créer un projet de A à Z** à partir de la structure d'étude de cas actuelle, proposée d'office.
6. **Ouvrir les six projets existants** dans le même éditeur, tels qu'ils sont, et tout y modifier.
7. **Un vrai bouton « Publier »** qui met le site en ligne à jour, et des modifications qu'on retrouve en local avec un simple `git pull`.

## Non-objectifs (pour ce chantier)

- Les **statistiques** (la page `/stats?key=…` actuelle reste telle quelle pour l'instant) et les **messages du formulaire de contact** : chantiers 2 et 3. La coque du dashboard doit toutefois prévoir leur place (navigation à plusieurs sections).
- La **traduction automatique** : Luca écrit lui-même l'anglais (voir plus bas).
- Le **multi-utilisateur** : un seul compte, celui de Luca.
- Une **interface d'historique** des versions dans le dashboard : git garde tout l'historique, ça suffit pour ce chantier.
- Modifier le **design** du site public (mise en page, animations, composants) depuis le dashboard : seul le contenu est éditable.

## Anti-objectifs (ce qui en ferait un échec, même si « ça marche »)

- N'importe qui peut tomber dessus : raccourci sur le site public, lien visible, page indexée.
- Des modifications qui restent coincées quelque part (navigateur, serveur) au lieu d'arriver sur le site et dans le dépôt.
- Un formulaire de champs bruts où l'on ne voit pas ce qu'on fait.
- Une publication qui **écrase** du travail fait en local, ou qui **casse le site en ligne** si quelque chose échoue.
- De l'anglais publié sans que Luca l'ait écrit ou relu.
- Un look d'outil générique, sans rapport avec la charte.

## Ce qui a été décidé avec Luca

### Accès

- Un espace séparé, protégé par une **connexion côté serveur** : **mot de passe + code à 6 chiffres** (TOTP, app type Google Authenticator / 1Password). Luca a validé.
- Session qui expire, blocage après plusieurs essais ratés, espace jamais indexé.
- Aucun raccourci, lien ou trace de l'admin sur le site public.

### L'éditeur : deux modes et un bouton (option validée sur maquette)

- **Mode Page** : l'étude de cas (ou la section du site) s'affiche telle qu'elle sera en ligne. On clique sur un titre, un texte ou une image pour le modifier sur place. Un « + » entre deux blocs en insère un.
- **Mode Structure** : le même contenu en liste de blocs, rangés par section, qu'on glisse pour réordonner. C'est ici que se font les réglages fins de chaque bloc (colonnes d'une galerie, cadrage `cover`/`contain`, cadre des étapes, source d'un chiffre, ton « accent » d'une section…).
- Un **bouton bascule** de l'un à l'autre en restant au même endroit (le bloc sélectionné reste sélectionné).
- Un **sélecteur FR / EN** en haut.
- Les types de blocs sont ceux qui existent déjà (`src/data/caseStudies/types.ts`) : texte, chiffres, étapes, avant/après, paire, bande, galerie, image, citation, vidéo, architecture, équipe ; plus l'en-tête (kicker, titre, accroche, intro, méta, visuel principal, liens), le brief, les sections et les crédits.
- **Nouveau projet** : s'ouvre avec la structure des études de cas actuelles déjà en place (en-tête, brief, sections type, crédits), et la carte de l'accueil à remplir (nom, numéro, année, catégorie, accroche, rôle, résumé, stack, couleur du projet, couverture, vidéo de survol, logo, type pro / école-client / école).
- **Projets existants** : les six projets actuels s'ouvrent dans l'éditeur sans aucune perte, et le site public doit être **identique au pixel près** après la migration.

### Le reste du contenu

Modifiable aussi, avec le même éditeur et le même bouton « Publier » (Luca : « oui ça serait bien ») :
- **À propos** : bio, langues, centres d'intérêt, frises expérience et formation, CV (remplacement du PDF).
- **Hero** : textes d'accroche (y compris les mots qui défilent dans « Je transforme des idées en… »), boutons.
- **Contact** : email, téléphone, LinkedIn.

### Brouillon puis publication

- On travaille en **brouillon** : rien ne change en ligne tant qu'on n'a pas cliqué sur « Publier » (Luca : « tu as raison »).
- **Images** : on dépose une image (depuis l'ordinateur ou la pellicule du téléphone), et le dashboard la prépare tout seul comme le fait aujourd'hui `scripts/make-image-variants.py` : conversion sRGB (les captures Mac sont en Display P3), WebP, variantes `sm` (640 px) et `md` (1280 px), dimensions relevées. Le texte alternatif reste demandé. Le serveur met `public/` en cache 30 jours : une image remplacée doit **changer de nom** (le dashboard s'en charge, Luca n'a pas à y penser).

### GitHub fait référence (option 1, validée)

- Le contenu quitte les fichiers TypeScript et devient des **fichiers de contenu dans le dépôt** (`lucaleone15/portfolio`), que le site lit au build. Le dépôt reste la seule source de vérité.
- **« Publier » en prod** :
  1. le serveur récupère les éventuels changements (`git pull --ff-only`, comme le déploiement manuel actuel) ;
  2. il écrit le contenu et les images préparées, fait un **commit** et le **pousse** sur GitHub ;
  3. il lance le build, et le site en ligne se met à jour (environ une minute), avec une progression visible dans le dashboard.
- Si du code a été poussé entre-temps depuis la machine de Luca, l'étape 1 l'intègre d'abord. Si les deux versions se contredisent, la publication **s'arrête et prévient** : elle n'écrase jamais rien.
- **En local**, `git pull` suffit pour retrouver tout ce qui a été publié depuis la prod, images comprises.
- Le déploiement manuel actuel (`git pull --ff-only && npm ci --include=dev && npm run build`) doit continuer de fonctionner tel quel.

### Langues : Luca écrit l'anglais lui-même

- Pas de traduction automatique.
- Quand un texte français est modifié après sa version anglaise, la version EN est marquée **« à revoir »**.
- Au moment de publier, le dashboard **prévient** (« 3 textes anglais pas à jour, publier quand même ? ») et liste les textes concernés, chacun cliquable pour y aller.

## Décisions prises par moi (Claude), à vérifier par Luca

- **Brouillons enregistrés sur le serveur**, en continu (pas dans le navigateur), pour retrouver le même brouillon sur le téléphone et sur l'ordinateur. Ils n'entrent dans git qu'à la publication.
- **Publication de tout le brouillon d'un coup** (un bouton « Publier » global, qui montre ce qui a changé depuis la dernière publication), plutôt que projet par projet.
- **Liste des projets** : ordre de l'accueil réglable (glisser), un projet peut être **masqué** du site sans être supprimé, et la suppression demande une confirmation.
- **Projet sans version anglaise complète** : on peut le publier après l'avertissement ; il n'apparaît alors que sur le site français jusqu'à ce que l'anglais soit écrit, plutôt que d'afficher des trous.
- **Adresse de l'admin** : un chemin choisi par Luca dans le `.env`, non listé dans `robots.txt` (ce qui le révélerait), servi avec `X-Robots-Tag: noindex` ; un chemin inconnu ou une requête non connectée reçoit la même 404 que n'importe quelle page inexistante.
- **En local** (`npm run dev`), le dashboard fonctionne aussi, mais « Publier » écrit seulement les fichiers dans le dossier de travail : Luca commite et pousse lui-même. Pas de commit automatique sur sa machine.
- **Vidéos** (survol des cartes, blocs vidéo) : acceptées telles quelles en MP4/WebM, avec une taille maximale et une image d'aperçu obligatoire ; pas de conversion vidéo sur le serveur.
- **Sur téléphone** : le mode Page sert surtout à retoucher les textes et les images ; dans le mode Structure, en plus du glisser, chaque bloc a des flèches monter/descendre, plus fiables au doigt.
- **Conflit entre la prod et le local** : un brouillon retient la version publiée sur laquelle il a démarré. Si, au moment de publier, quelqu'un (Luca en local) a modifié depuis la même page (un même projet, À propos, Hero, contact) que le brouillon touche aussi, la publication s'arrête et le dashboard propose de choisir, page par page, entre la version du brouillon et celle du dépôt. Pas de fusion automatique champ par champ. Les pages que le brouillon ne touche pas sont simplement reprises du dépôt.
- **Structure partagée FR/EN** : un projet a une seule structure de blocs, avec un texte par langue (comme les fichiers actuels, qui se répondent). Un bloc ajouté en FR dont le texte anglais manque est **masqué sur la page EN** et figure dans l'avertissement avant publication.
- **SEO et fichiers dérivés font partie du contenu**, sinon on ne crée pas vraiment un projet « de A à Z » :
  - chaque projet a un titre et une description SEO (FR/EN), avec les longueurs recommandées affichées (titre ≤ 60 caractères, description de 120 à 160) ;
  - les textes qui comptent ou listent les projets (« Six projets… » dans la description de `/projets`, `public/llms.txt`, `public/ai-catalog.json` et ses copies dans `.well-known/`) sont générés au build à partir du contenu ;
  - la section **Compétences** (`SKILLS_DATA`) est éditable aussi ;
  - les **libellés d'interface** (titres de section, boutons, « Parlons de votre prochain projet »…) restent dans le code : ce sont des éléments de design, pas du contenu ;
  - la phrase de disponibilité du Hero, aujourd'hui en JSX avec des liens, devient du texte éditable avec des liens.
- **Projet masqué** : il renvoie la 404 du site et disparaît partout : sitemap, hreflang, recherche ⌘K, « Projet suivant », filtres.
- **Projet sans anglais** : `/en/projects/x` renvoie la 404 anglaise, le projet n'apparaît que côté FR, et le sélecteur de langue sur sa page mène à la liste des projets EN.
- **Changer l'adresse (slug) d'un projet déjà publié** est permis : l'ancienne adresse redirige alors en 301 vers la nouvelle, comme `hug-sangsationnel` → `hug` aujourd'hui, mais à partir du contenu au lieu d'être écrit en dur.
- **Pas de nouveau service tiers.** Le site fonctionne aujourd'hui sans aucun service externe (principe du README), et ça doit rester le cas. GitHub, qui héberge déjà le code, est la seule dépendance ajoutée, pour le push.

## Contraintes

- **Stack existante, à garder** : React 19, TypeScript, Tailwind CSS 4, Vite 6 (client + rendu serveur pour le pré-rendu, `scripts/prerender.mjs`), serveur Node `node:http` **sans framework** (`server/index.ts`), esbuild pour le serveur. Le dashboard s'appuie dessus.
- **Hébergement** : un **site Node.js géré depuis le Manager Infomaniak**, mis à jour en SSH (`git pull --ff-only && npm ci --include=dev && npm run build`), puis le serveur est relancé **à la main** avec `npm start`. Rien ne le supervise (pas de pm2). Conséquence, *ma décision* : une publication de contenu ne doit **jamais** nécessiter de redémarrage (seuls `dist/` et les fichiers de contenu changent). Si le `git pull` de l'étape 1 ramène du code serveur ou des dépendances (`server/`, `package.json`, `package-lock.json`), la publication **s'arrête** avec le message « du code a changé, redéploie à la main », sans rien publier. La personne qui construit vérifie sur place que le build (vite + SSR + prérendu + esbuild) tient à côté du serveur en ligne en CPU et en mémoire, et que le dossier du site est bien un clone git dans lequel le processus Node peut écrire. Le serveur aura besoin d'un **droit d'écriture sur le dépôt GitHub** (clé de déploiement ou jeton), stocké hors du dépôt.
- **Le site public est pré-rendu** : une publication doit donc reconstruire les pages. Le serveur met aujourd'hui en mémoire les fichiers compressés et calcule les empreintes CSP du script de thème au démarrage : après une publication, il doit servir les nouvelles pages sans redémarrage manuel ni contenu périmé.
- **Une publication ratée** (build en erreur, push refusé, conflit) ne doit jamais laisser le site en ligne cassé ou à moitié à jour : le site garde la version précédente, et le dashboard affiche l'erreur en clair.
- **Données persistantes** : brouillons et images en attente vivent dans `DATA_DIR` (hors du site, comme `hits.ndjson` et `podium.json`), pour survivre aux déploiements.
- **Sécurité** : CSP stricte déjà en place, à respecter côté admin ; secrets (empreinte du mot de passe, secret TOTP, accès GitHub) uniquement dans `.env` ; `.env.example` documenté.
- **Règles d'écriture des études de cas** (`types.ts`) : prose à la première personne, aucun chiffre inventé, `[À COMPLÉTER]` pour ce qui manque. Le dashboard ne doit rien générer à la place de Luca.
- **Accessibilité et performance du site public inchangées** : le code de l'admin ne doit pas alourdir les pages publiques.
- Le README (en français) est mis à jour : connexion, publication, variables d'environnement.

## Laissé à la personne qui construit

- Le format exact et l'emplacement des fichiers de contenu, et la migration des données actuelles (TypeScript → contenu), tant que le rendu public reste identique.
- L'architecture de l'éditeur (rendu du mode Page à partir des vrais composants du site ou non), les bibliothèques éventuelles (glisser-déposer, TOTP, traitement d'images côté Node), en restant léger.
- La façon de rendre la publication sûre (build à côté puis bascule, verrou contre deux publications simultanées, etc.).
- La durée de session, le nombre d'essais avant blocage, la fréquence d'enregistrement des brouillons.
- Le détail visuel des écrans, dans le respect de la DA et des deux maquettes validées (`.superpowers/brainstorm/…/editeur-hybride.html`, option 2).
