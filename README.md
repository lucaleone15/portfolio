# Luca Leone — Portfolio

Portfolio personnel de **Luca Leone**, étudiant en ingénierie des médias à la HEIG-VD (Yverdon-les-Bains) : communication digitale, UI/UX design et développement web.

**En ligne : [luca-leone.ch](https://luca-leone.ch)**

Site bilingue (FR / EN), pré-rendu pour le référencement, avec ses propres routes serveur pour le formulaire de contact et les statistiques : aucun service tiers n'est nécessaire au fonctionnement.

---

## Sommaire

- [Aperçu](#aperçu)
- [Stack technique](#stack-technique)
- [Démarrer en local](#démarrer-en-local)
- [Scripts](#scripts)
- [Variables d'environnement](#variables-denvironnement)
- [Déploiement](#déploiement)
- [Structure du projet](#structure-du-projet)
- [Modifier le contenu](#modifier-le-contenu)
- [Dashboard admin](#dashboard-admin)
  - [Mise en place](#mise-en-place)
  - [Publier](#publier)
- [Fonctionnement](#fonctionnement)
  - [Routage, pré-rendu et SEO](#routage-pré-rendu-et-seo)
  - [Formulaire de contact](#formulaire-de-contact)
  - [Statistiques](#statistiques)
  - [Serveur de production](#serveur-de-production)
- [Animations et interactions](#animations-et-interactions)
- [Accessibilité et performance](#accessibilité-et-performance)
- [Branches](#branches)

---

## Aperçu

| Section | Contenu |
| --- | --- |
| **Intro** | Rideau rouge au premier chargement de l'accueil : le monogramme LL s'ouvre, ses deux L deviennent les L de « Luca Leone », sa moitié rouge vif devient le point ; le nom vole jusqu'au logo de l'en-tête, puis le rideau se lève (un clic, une touche ou un défilement le passe) |
| **Hero** | Accroche animée (« Je transforme des idées en… »), bandeau d'outils, fond dégradé + grain |
| **Compétences** | Six domaines, détail au survol (souris) ou au tap (mobile) |
| **Projets** | Six cartes : phrase clé sur l'image, rôle, légère inclinaison au survol et pastille floutée « Voir le projet » qui suit la souris ; filtres par catégorie ; sur mobile, cartes empilées au scroll |
| **Page projet** | Étude de cas racontée au scroll : accroche, contexte, problème / réponse / résultat, sections illustrées (captures, maquettes, galeries, comparateur avant / après, vidéo), chiffres clés animés, citation, équipe ; sommaire latéral sur grand écran ; type de projet (professionnel, académique avec un vrai client, académique) |
| **À propos** | Bio révélée à la lecture, langues, centres d'intérêt, frises expérience / formation, CV (ouvert dans un nouvel onglet) |
| **Contact** | Bloc en couleur d'accent : formulaire (emails de notification et de confirmation), email qui ouvre la messagerie + bouton copier, téléphone, LinkedIn |
| **Admin** | Espace privé (adresse secrète, mot de passe + code) pour modifier tout le contenu et le publier : voir [Dashboard admin](#dashboard-admin) |

Autres : thème clair / sombre (suit le système), recherche rapide (icône loupe dans l'en-tête, raccourci **⌘K / Ctrl+K**), page 404, politique de confidentialité, image d'aperçu pour les réseaux sociaux.

---

## Stack technique

| Domaine | Outils |
| --- | --- |
| Interface | [React 19](https://react.dev), TypeScript, [Tailwind CSS 4](https://tailwindcss.com) |
| Build | [Vite 6](https://vite.dev) (client + rendu serveur pour le pré-rendu), esbuild (serveur) |
| Animations | [Motion](https://motion.dev), [GSAP + ScrollTrigger](https://gsap.com), API View Transitions du navigateur |
| UI | [cmdk](https://cmdk.paco.me) (recherche ⌘K), [Hugeicons](https://hugeicons.com) (icônes, via `src/components/Icon.tsx`), polices Syne et Plus Jakarta Sans (auto-hébergées) |
| Serveur | Node.js (`node:http`, sans framework), [Nodemailer](https://nodemailer.com) (envoi des emails), [sharp](https://sharp.pixelplumbing.com) (images envoyées depuis l'admin) |
| Contenu | Fichiers JSON dans `content/`, validés par [zod](https://zod.dev) (`src/content/schema.ts`) |
| Admin | Bundle séparé (`admin.html`, `src/admin/`), glisser-déposer [dnd-kit](https://dndkit.com) |
| Tests | [Vitest](https://vitest.dev), Testing Library, jsdom |

GSAP et cmdk sont **chargés à la demande** : ils ne pèsent pas sur le premier affichage.

---

## Démarrer en local

**Prérequis :** Node.js **20.12 ou plus récent**, npm. Python 3 + Pillow uniquement pour régénérer les images (facultatif).

```bash
npm install
cp .env.example .env    # facultatif en local (formulaire et statistiques)
npm run dev             # http://localhost:3000
```

Pour tester la version de production en local :

```bash
npm run build
npm start               # http://localhost:3000
```

---

## Scripts

| Commande | Rôle |
| --- | --- |
| `npm run dev` | Serveur de développement Vite (rechargement à chaud), avec `/api/contact` et les statistiques |
| `npm run build` | Build complet : site (`build:site`) → admin (`build:admin`) → serveur de production (`build:server`) |
| `npm run build:site` | Le site seul : client → bundle de pré-rendu → pages HTML statiques, sitemap, `llms.txt` et catalogues IA (dans `$BUILD_OUT_DIR`, `dist/` par défaut) |
| `npm run build:admin` | Le bundle de l'admin (`dist-admin/`), jamais servi au public |
| `npm test` | Tests (Vitest) : contenu, serveur admin, publication (vrais dépôts git temporaires), écrans de l'admin |
| `npm run admin:setup` | Affiche les lignes `.env` de la connexion admin (empreinte du mot de passe, clé de l'app d'authentification). Après `npm run build` |
| `npm start` | Lance le serveur de production (`dist-server/index.mjs`) — à exécuter depuis la racine du projet |
| `npm run preview` | Aperçu Vite du dossier `dist/` (pour vérifier, pas pour la production) |
| `npm run lint` | Vérification TypeScript (`tsc --noEmit`) |
| `npm run images` | Génère les variantes 640 px et 1280 px des couvertures de projets (`public/images/sm/`, `md/`), converties en sRGB |
| `npm run clean` | Supprime `dist/`, `dist-ssr/`, `dist-server/` (et `dist-admin/` se reconstruit au build) |

---

## Variables d'environnement

À placer dans un fichier **`.env`** à la racine (jamais commité ; modèle : [`.env.example`](.env.example)).

| Variable | Rôle | Par défaut |
| --- | --- | --- |
| `SMTP_HOST` | Serveur d'envoi de la boîte mail | — (requis pour le formulaire) |
| `SMTP_PORT` | `465` (TLS) ou `587` (STARTTLS) | `465` |
| `SMTP_USER` | Identifiant de la boîte (ex. `luca@luca-leone.ch`) | — (requis) |
| `SMTP_PASS` | Mot de passe de la boîte ou mot de passe d'application | — (requis) |
| `CONTACT_TO` | Destinataire des messages | `SMTP_USER` |
| `SMTP_FROM` | Adresse d'expédition | `SMTP_USER` |
| `STATS_KEY` | Clé d'accès au tableau de bord `/stats` (longue chaîne aléatoire) | — (tableau désactivé) |
| `PORT` | Port du serveur de production | `3000` |
| `DATA_DIR` | Dossier des statistiques, du podium, du brouillon et des images en attente de l'admin (chemin absolu conseillé, hors du dossier du site) | `.data/` |
| `ADMIN_PATH` | Adresse de l'admin, difficile à deviner (ex. `/atelier-7k2q9`), jamais liée nulle part | — (admin désactivé) |
| `ADMIN_PASSWORD_HASH` | Empreinte du mot de passe (`npm run admin:setup`) | — (admin désactivé) |
| `ADMIN_TOTP_SECRET` | Clé de l'app d'authentification (`npm run admin:setup`) | — (admin désactivé) |
| `ADMIN_PUBLISH_MODE` | `git` sur le serveur (Publier = pull, commit, build, push), `files` en local (écrit seulement `content/` et `public/`) | `files` |
| `ADMIN_GIT_SSH_KEY` | Clé privée de la clé de déploiement GitHub (serveur) | — |
| `ADMIN_GIT_NAME` / `ADMIN_GIT_EMAIL` | Auteur des commits de l'admin | `Luca Leone (dashboard)` / `luca@luca-leone.ch` |

Sans configuration SMTP, le formulaire reste utilisable : il propose au visiteur d'envoyer son message depuis sa propre messagerie (lien pré-rempli).

---

## Déploiement

Le site nécessite **Node.js** en production (pages pré-rendues + routes `/api/contact` et statistiques).

```bash
npm ci
npm run build
npm start
```

Points d'attention :

1. **`.env`** présent sur le serveur (SMTP, `STATS_KEY`, et les variables `ADMIN_*` pour le dashboard : voir [Dashboard admin](#dashboard-admin)).
2. Les données (statistiques `hits.ndjson`, scores `podium.json`) doivent **persister** entre deux déploiements. Le plus sûr : `DATA_DIR` vers un dossier **hors du site** (ex. `DATA_DIR=/srv/customer/portfolio-data`), qu'aucun déploiement ne touche. Sinon, `.data/` est ignoré par git (un `git pull` ne le touche pas), mais ne jamais l'envoyer depuis sa machine (il contient les visites locales) ni supprimer le dossier du site pour le redéployer.
3. Derrière un proxy (Nginx, Caddy, hébergeur…), le serveur lit l'IP réelle via `X-Forwarded-For` (limitation anti-spam du formulaire).
4. HTTPS est géré par le proxy / l'hébergeur ; le serveur envoie déjà `Strict-Transport-Security`.

Après une mise en ligne qui change l'image d'aperçu, la rafraîchir sur LinkedIn via le [Post Inspector](https://www.linkedin.com/post-inspector/).

**Remplacer une image :** le serveur met les fichiers de `public/` en cache 30 jours. Une image modifiée doit donc changer de **nom** (ex. `HUG-cover.webp` → `HUG-cover-2.webp`), sinon les visiteurs gardent l'ancienne. Depuis l'admin, c'est automatique : chaque fichier envoyé reçoit un nom unique.

---

## Structure du projet

```
├── index.html                 Gabarit HTML (thème appliqué avant affichage, zone SEO remplie au build)
├── admin.html                 Page de l'admin (bundle séparé, vite.admin.config.ts → dist-admin/)
├── content/                   Le contenu du site (modifié par l'admin, ou à la main)
│   ├── site.json              Hero, À propos, compétences, contact, SEO des pages fixes
│   ├── projects.json          Ordre des projets, projets masqués, anciennes adresses (redirections)
│   └── projects/<id>.json     Un projet : carte, SEO, fiche llms.txt, étude de cas
├── public/                    Fichiers servis tels quels
│   ├── images/                Couvertures des projets (.webp) + sm/, md/ (variantes 640 / 1280 px)
│   │   └── case/<projet>/     Images des études de cas (captures, maquettes, photos)
│   ├── pdf/                   CV
│   ├── tools/                 Logos du bandeau d'outils
│   ├── og-image.jpg           Image d'aperçu réseaux sociaux (1200×630)
│   ├── llms.txt               Résumé du profil pour les assistants IA (la liste des projets est générée au build)
│   ├── ai-catalog.json        Catalogue pour les agents IA (copies dans .well-known/ ; {n}/{names} remplis au build)
│   └── robots.txt
├── src/
│   ├── App.tsx                Assemblage : intro, contour au survol, header, page (accueil / projet / 404)
│   ├── main.tsx               Point d'entrée navigateur
│   ├── entry-server.tsx       Point d'entrée du pré-rendu
│   ├── router.tsx             Routeur maison (History API + View Transitions)
│   ├── seo.ts                 <head> par page, JSON-LD, sitemap
│   ├── components/            Sections et composants (Hero, ProjectCard, CaseStudy, ContactSection…)
│   ├── context/               Langue (depuis l'URL), thème, couleur d'accent
│   ├── content/               Schéma du contenu (zod), lecture de content/, textes bilingues, crochets d'édition
│   ├── data/                  Types des études de cas (règles d'écriture), libellés, variantes d'images
│   ├── admin/                 L'admin : connexion, liste des projets, éditeur Page / Structure, publication
│   ├── hooks/                 usePauseOffscreen (animations en pause hors écran)
│   ├── theme/colors.ts        Catalogue de palettes d'accent (ACTIVE_ACCENT_ID)
│   └── index.css              Tailwind + styles globaux (fonds, transitions)
├── server/
│   ├── index.ts               Serveur de production
│   ├── contact.ts             POST /api/contact
│   ├── contactEmails.ts       Emails du formulaire (notification + confirmation signée)
│   ├── mailTest.ts            Test d'envoi de la confirmation (npm run mail:test)
│   ├── analytics.ts           Statistiques internes + /stats
│   ├── canonical.ts           Une URL par page, redirections des projets renommés
│   └── admin/                 Admin : connexion (mot de passe + TOTP), brouillon, images, publication git
├── scripts/
│   ├── prerender.mjs          Génère les pages HTML, la 404 et le sitemap
│   ├── make-image-variants.py Variantes 640 / 1280 px des couvertures (sRGB)
│   ├── make-project-logos.py  Logos des projets, transparents, version claire et sombre
│   └── og/                    Modèle de l'image d'aperçu (voir og/README.md)
├── tests/                     Tests Vitest (contenu, serveur, admin)
├── matiere/                   Matière brute des projets (rapports, exports) : locale, ignorée par git
└── vite.config.ts             Build + routes API en développement
```

---

## Modifier le contenu

Le plus simple : le **[dashboard admin](#dashboard-admin)**, qui modifie les fichiers de `content/` et publie. À la main, voici où sont les choses :

| Je veux… | Où |
| --- | --- |
| Ajouter / modifier un **projet** (carte, étude de cas, SEO) | Dans l'admin (Projets), ou `content/projects/<id>.json`. L'`id` devient l'URL : `/projets/<id>` et `/en/projects/<id>`. Chaque texte est `{ "fr", "en", "enOf" }` : `enOf` est l'empreinte du français dont l'anglais a été traduit (l'admin le tient à jour ; à la main, la laisser telle quelle signale l'anglais « à revoir ») |
| Changer l'**ordre**, **masquer** ou **renommer** un projet | Dans l'admin, ou `content/projects.json` (`order`, `hidden`, `redirects` : ancienne adresse → nouvelle) |
| Changer le **titre / la description Google** d'une page | Dans l'admin (onglet SEO des pages, ou Référencement d'un projet), ou `seo` dans `content/site.json` / le fichier du projet (titres ≤ 60 caractères, descriptions 120–160 ; `{N}` devient le nombre de projets en toutes lettres) |
| Changer le **logo** d'un projet | `python3 scripts/make-project-logos.py` (depuis les fichiers de `matiere/`) génère `public/images/logos/<id>.webp` et `<id>-dark.webp`, transparents ; puis `logo` dans `content/projects/<id>.json`. Le logo remplace le nom sur la carte, en tête de l'étude de cas et dans « Projet suivant » |
| Changer la **vidéo de survol** d'une carte | Encoder la vidéo pour le web (16:10, 1152×720, sans son, une image clé par image pour que le retour en arrière soit fluide), par ex. `ffmpeg -i source.mp4 -an -vf "crop=1728:1080,scale=1152:720,setpts=0.5*PTS" -c:v libx264 -crf 27 -g 1 -movflags +faststart <id>-dive.mp4`, puis l'envoyer depuis l'admin (Carte de l'accueil → Vidéo au survol) |
| Refaire les **mockups d'écrans** des études de cas | Lancer MockupLab (`../MockupLab`, `npx vite`), puis `node scripts/mockups/render.mjs scripts/mockups/jobs.json <dossier>` et `python3 scripts/mockups/frame.py <dossier> <nom> <sortie.webp>` : appareils de face, fond en dégradé radial aux couleurs de l'aperçu du projet, cadrage 4:3 identique pour tous |
| Ajouter une **couverture** de projet | Depuis l'admin (conversion sRGB, variantes 640 / 1280 px automatiques). À la main : `.webp` 1920×1200 (16:10) dans `public/images/`, puis `npm run images`. C'est aussi la première image de la vidéo de survol : même cadrage et mêmes couleurs |
| Modifier le **Hero**, la **bio**, les **langues**, le **parcours**, les **compétences**, le **contact** | Dans l'admin (onglets Hero, À propos, Compétences, Contact), ou `content/site.json` |
| Remplacer le **CV** | Dans l'admin (Contact → CV), ou `public/pdf/` + `contact.cv` dans `content/site.json` |
| Modifier les **textes d'interface** (titres de section, boutons) | `src/context/LanguageContext.tsx` (ce n'est pas du contenu : ils restent dans le code) |
| Changer la **couleur d'accent** | `ACTIVE_ACCENT_ID` dans `src/theme/colors.ts` **et** les valeurs par défaut en haut de `src/index.css` (premier affichage) |
| Modifier l'**image d'aperçu** | `scripts/og/og-image.html`, puis régénérer (voir `scripts/og/README.md`) |
| Mettre à jour les infos pour les **IA** | Le profil : `public/llms.txt` ; la fiche de chaque projet : « Fiche pour les IA » dans l'admin (`seo.llms`), la liste est rebâtie au build. `representativeQueries` : `public/ai-catalog.json` + `public/.well-known/` |

Après une modification à la main : `npm run build` (le pré-rendu, les métadonnées, le sitemap et les fichiers pour les IA se mettent à jour automatiquement). Les règles d'écriture des études de cas sont en tête de `src/data/caseStudies/types.ts` (et dans l'admin).

---

## Dashboard admin

Un espace privé pour modifier tout le contenu sans toucher au code, sur ordinateur comme sur téléphone, aux couleurs du site.

- **Accès** : à l'adresse `ADMIN_PATH`, avec un mot de passe **et** un code à 6 chiffres de l'app d'authentification. Sans session, toute adresse de l'admin répond la 404 du site ; rien n'est lié depuis le site public, rien n'est indexé. 5 essais ratés bloquent 15 min (20 essais toutes adresses confondues : 1 h). Session : 7 jours sans visite, 30 jours au plus.
- **Projets** : ordre (glisser ou flèches), visible / masqué, nouveau projet (il s'ouvre avec la structure des études de cas), changer l'adresse (l'ancienne redirige), supprimer.
- **Éditeur** : mode **Page** (l'étude de cas telle qu'en ligne : on clique sur un texte pour l'écrire, sur un bloc pour le régler, « + » pour ajouter un bloc) et mode **Structure** (les sections et leurs blocs, à réordonner, avec tous les réglages). FR / EN en haut. En anglais, le français est affiché au-dessus de chaque champ ; un texte français modifié après sa traduction marque l'anglais **« à revoir »**.
- **Brouillon** : tout s'enregistre au fil de l'eau sur le serveur (`DATA_DIR/admin/draft/`), le même brouillon sur le téléphone et l'ordinateur. Rien ne change en ligne avant « Publier ». Deux appareils qui modifient la même page : le second est prévenu au lieu d'écraser.
- **Images** : envoyées depuis l'ordinateur ou la pellicule, converties en WebP sRGB (1920 px), variantes 640 / 1280 px pour les couvertures, nom unique. Vidéos MP4/WebM et PDF gardés tels quels.

### Mise en place

En local : `npm run build && npm run admin:setup`, copier les deux lignes affichées dans `.env` avec un `ADMIN_PATH`, puis `npm run dev` et ouvrir `http://localhost:3000<ADMIN_PATH>/`. En local, « Publier » écrit seulement `content/` et `public/` : on relit, on commite et on pousse soi-même.

Sur le serveur (Infomaniak, site Node.js) :

1. Créer une **clé de déploiement** avec droit d'écriture : `ssh-keygen -t ed25519 -f ~/.ssh/portfolio-deploy -N ""`, puis sur GitHub : dépôt → Settings → Deploy keys → Add, coller `portfolio-deploy.pub`, cocher **Allow write access**.
2. Faire passer **l'envoi seulement** par SSH : `git remote set-url --push origin git@github.com:lucaleone15/portfolio.git`. La récupération (`git pull`, le déploiement manuel) reste sur l'adresse actuelle et marche comme avant ; seul « Publier » pousse, avec la clé de déploiement.
3. Dans le `.env` du serveur : `ADMIN_PATH`, `ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET` (générés par `npm run admin:setup`), `ADMIN_PUBLISH_MODE=git`, `ADMIN_GIT_SSH_KEY=/chemin/vers/.ssh/portfolio-deploy`, et un `DATA_DIR` hors du dossier du site.
4. Redéployer comme d'habitude (`git pull --ff-only && npm ci --include=dev && npm run build`, puis relancer `npm start`). Les dépendances de développement sont nécessaires : « Publier » reconstruit le site sur le serveur.

### Publier

Le bouton « Publier » montre ce qui a changé et les textes anglais pas à jour (chacun mène au champ en question), puis, en mode `git` :

1. **récupère** les changements de GitHub (`git pull --ff-only`) ;
2. **vérifie** : si une page du brouillon a aussi été modifiée sur GitHub depuis, on choisit page par page quelle version garder ; si du **code serveur** ou des **dépendances** ont changé (`server/`, `package.json`, `package-lock.json`, l'admin), la publication s'arrête : redéployer à la main d'abord ;
3. **écrit** le contenu et les images dans `content/` et `public/`, fait un **commit** (« Content: HUG, … ») ;
4. **construit** le site dans `dist-next/` (environ une minute) ;
5. **pousse** sur GitHub ;
6. **met en ligne** en échangeant `dist-next/` et `dist/`, sans redémarrer le serveur.

Si une étape échoue (build, push refusé, dossier du serveur modifié), le site en ligne et le dépôt du serveur restent sur leur version précédente et le brouillon est gardé. Sur sa machine, un `git pull` récupère tout ce qui a été publié depuis l'admin, images comprises.

---

## Fonctionnement

### Routage, pré-rendu et SEO

- **URLs réelles** : `/`, `/en/`, `/projets/<slug>`, `/en/projects/<slug>` — un petit routeur maison (`src/router.tsx`) basé sur l'History API. La langue vient de l'URL. L'ancienne adresse `/projets/hug-sangsationnel` redirige (301) vers `/projets/hug`.
- **Sections avec leur propre URL** : `/projets`, `/a-propos`, `/contact` (`/en/projects`, `/en/about`, `/en/contact`). L'accueil reste une seule page qui défile : un lien partagé ouvre directement la section, les liens du menu défilent en douceur sans recharger, et l'URL (ainsi que le titre de l'onglet) suit la section lue. Ces URLs ont leur titre et leur description, mais leur URL canonique est l'accueil (même contenu) : elles ne figurent pas dans le sitemap.
- **Pré-rendu** : au build, chaque page est rendue en HTML statique (`scripts/prerender.mjs`). Les moteurs de recherche et les réseaux sociaux voient le contenu complet sans exécuter de JavaScript.
- **Métadonnées par page** (`src/seo.ts`, table `META`) : titre et description uniques, dans les limites d'affichage de Google (titres ≤ 60 caractères / 580 px, descriptions 120–160 caractères / 920 px ; score SEO Lighthouse 100), URL canonique, `hreflang` FR/EN, Open Graph, Twitter Card et données structurées JSON-LD (`Person`, `WebSite`, `ProfilePage`, `CreativeWork`, `BreadcrumbList`).
- **Sitemap** généré automatiquement : pages canoniques FR/EN avec `hreflang`, images affichées par chaque page (Google Images) et CV. Le `lastmod` de chaque page est la date du dernier commit de ses fichiers (étude de cas + images pour un projet), il ne bouge donc que si la page change.
- **GEO** (assistants IA) : `llms.txt`, catalogues `ai-catalog.json`, et `robots.txt` qui autorise les robots des IA.
- **404** : page « Sortie de piste » (une F1 sortie dans le bac à gravier d'un virage dessiné à l'échelle), servie avec un vrai statut 404 et exclue de l'indexation.
- **Hors connexion** : un *service worker* (`public/sw.js`, enregistré en production seulement) affiche `public/offline.html`, « Drapeau rouge », avec un mini-jeu de F1 (`public/offline-game.js`, voiture `public/images/f1-car.svg`) quand une page ne peut pas se charger. Il ne met rien d'autre en cache : le site reste toujours à jour. Changer `VERSION` dans `sw.js` si l'un de ses fichiers change.
- **Pages cachées** (easter eggs) : `/stand` (coulisses du site) et `/podium` (classement du jeu « Lights out », `server/podium.ts`, scores dans `.data/podium.json` à conserver entre deux déploiements) ; `noindex`, hors du sitemap, accessibles via la recherche ⌘K.
- **Politique de confidentialité** : `noindex, follow` et hors du sitemap (utile aux visiteurs, pas une page à trouver dans Google).
- **Suggestion de langue** (`src/components/LanguageHint.tsx`) : si le navigateur ne demande pas la langue de la page (par ex. un recruteur anglophone sur la version française), une petite pastille propose l'autre version. Jamais de redirection ; une fois fermée ou suivie, elle ne revient plus.
- **Icônes** : le monogramme « LL » (deux L de part et d'autre d'une ligne, sur les deux rouges du site), généré par `python3 scripts/make-icons.py` : `favicon.svg`, `favicon-32.png`, `apple-touch-icon.png`, `icon-192/512.png` (liés avec `?v=2` dans `index.html` et `site.webmanifest` : changer ce numéro quand le logo change, les navigateurs gardent longtemps les favicons).

### Formulaire de contact

- Le navigateur envoie le message à **`POST /api/contact`** (`server/contact.ts`), qui l'expédie via le compte SMTP de la boîte mail du site (Nodemailer). Aucun service de formulaire tiers.
- Protections : champ piège anti-robots, validation des champs, sujet limité à la liste du formulaire, taille limitée, délais d'attente SMTP, **5 messages / 10 minutes par IP**.
- Deux emails mis en forme (`server/contactEmails.ts`) : la notification reçue (« Répondre à » = le visiteur, objet = sujet choisi) et une confirmation envoyée au visiteur dans sa langue, avec le sujet en tête et la signature email, sans recopier son message (au plus 3 confirmations par jour vers une même adresse, seules celles réellement envoyées comptent). La confirmation porte l'en-tête `Auto-Submitted: auto-replied` (réponse automatique, RFC 3834).
- Chaque envoi est journalisé avec la réponse du serveur SMTP (`[contact] confirmation → … accepted 1, rejected 0 · 250 …`) : c'est le premier endroit où regarder si un email manque.
- **Tester la confirmation sur le serveur** : `npm run mail:test -- adresse@exemple.com` (après `npm run build`). Vérifie la connexion SMTP, envoie la vraie confirmation à cette adresse, affiche la réponse du serveur et les enregistrements SPF / DMARC du domaine. Si le serveur l'accepte mais qu'elle n'arrive pas, elle a été filtrée à l'arrivée : regarder les indésirables, et activer **DKIM** pour le domaine chez l'hébergeur mail (Infomaniak : Service Mail → DKIM).
- En cas d'échec, le message n'est pas perdu : un lien ouvre la messagerie du visiteur avec le message pré-rempli.

### Statistiques

Statistiques internes et respectueuses de la vie privée (`server/analytics.ts`) :

- une ligne par page vue dans `.data/hits.ndjson` : date, page, site de provenance — **ni cookie, ni adresse IP** ;
- robots ignorés, visiteurs « Do Not Track » non comptés ;
- tableau de bord sur **`/stats?key=<STATS_KEY>`** (30 derniers jours : pages vues par jour, projets ouverts, provenance), et la même chose en JSON sur `/api/stats?key=…`.

### Serveur de production

`server/index.ts`, compilé en `dist-server/index.mjs` :

- sert les pages pré-rendues (`/x` → `x.html` ou `x/index.html`) ;
- compression **brotli / gzip** ;
- requêtes partielles (`Range`) pour les fichiers non compressés, nécessaires aux vidéos ;
- cache : fichiers du build 1 an (`immutable`), HTML revalidé à chaque visite, le reste 30 jours ; `ETag` / 304 ;
- redirections 301 vers l'URL unique de chaque page : `www.` → domaine nu, `x.html`, `x/index.html`, `x/` → `x`, `/en` → `/en/`, anciennes URLs de projets ;
- en-têtes de sécurité : **CSP stricte** (seuls les scripts du site + le script de thème, autorisé par son empreinte), `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS… ;
- protection contre la lecture de fichiers hors de `dist/`.

---

## Animations et interactions

| Élément | Technique |
| --- | --- |
| Carte → page projet | API **View Transitions** : l'image de la carte se transforme en visuel de la page |
| Études de cas | **IntersectionObserver + CSS sticky** : visuel fixe pendant que le texte défile, chiffres qui comptent, comparateur avant / après, sommaire qui suit la lecture |
| Cartes de projets | Inclinaison douce au survol, pastille floutée « Voir le projet » qui remplace le curseur ; vidéo qui plonge dans l'écran au survol (appui long sur mobile), garde la dernière image, puis se rembobine à l'envers |
| Survol | Curseur du système ; contour rouge qui épouse liens et boutons |
| Recherche | **cmdk**, ouverture instantanée (loupe ou ⌘K / Ctrl+K) |

Principes suivis (Emil Kowalski, Apple Human Interface) : courbes d'accélération personnalisées, durées courtes, animations interruptibles, uniquement `transform` / `opacity`, retour visuel à l'appui, effets de survol réservés aux souris.

---

## Accessibilité et performance

- **`prefers-reduced-motion`** respecté partout (Motion, GSAP, CSS) ;
- navigation clavier complète, anneau de focus visible, labels de formulaire, régions `aria-live` ;
- contrastes **WCAG AA** (couleurs de projets doublées pour le mode sombre) ;
- thème clair / sombre appliqué avant le premier affichage (pas de flash) ;
- images en WebP, variantes 640 px + `srcset`, chargement différé ;
- bibliothèques lourdes chargées à la demande ; animations de fond en pause hors écran.

---

## Branches

| Branche | Contenu |
| --- | --- |
| `main` | Version déployée |
| `v1` | Version après l'audit (corrections, SEO, pré-rendu) — point de retour |
| `v2` | Animations, nouvelles sections, serveur de production (fusionnée dans `main`) |
| `etude-de-cas` | Études de cas des six projets, contact enrichi, SEO des titres et descriptions |

---

© Luca Leone — [luca-leone.ch](https://luca-leone.ch) · [LinkedIn](https://linkedin.com/in/leone-luca)
