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
| **Intro** | Rideau typographique au premier chargement de l'accueil (le nom se révèle lettre par lettre) |
| **Hero** | Accroche animée (« Je transforme des idées en… »), bandeau d'outils, fond dégradé + grain |
| **Compétences** | Six domaines, détail au survol (souris) ou au tap (mobile) |
| **Projets** | Six cartes : phrase clé sur l'image, rôle, légère inclinaison au survol et pastille floutée « Voir le projet » qui suit la souris ; filtres par catégorie ; sur mobile, cartes empilées au scroll |
| **Page projet** | Étude de cas racontée au scroll : accroche, contexte, problème / réponse / résultat, sections illustrées (captures, maquettes, galeries, comparateur avant / après, vidéo), chiffres clés animés, citation, équipe ; sommaire latéral sur grand écran ; type de projet (professionnel, académique avec un vrai client, académique) |
| **À propos** | Bio révélée à la lecture, langues, centres d'intérêt, frises expérience / formation, CV (ouvert dans un nouvel onglet) |
| **Contact** | Bloc en couleur d'accent : formulaire (emails de notification et de confirmation), email qui ouvre la messagerie + bouton copier, téléphone, LinkedIn |

Autres : thème clair / sombre (suit le système), recherche rapide (icône loupe dans l'en-tête, raccourci **⌘K / Ctrl+K**), page 404, politique de confidentialité, image d'aperçu pour les réseaux sociaux.

---

## Stack technique

| Domaine | Outils |
| --- | --- |
| Interface | [React 19](https://react.dev), TypeScript, [Tailwind CSS 4](https://tailwindcss.com) |
| Build | [Vite 6](https://vite.dev) (client + rendu serveur pour le pré-rendu), esbuild (serveur) |
| Animations | [Motion](https://motion.dev), [GSAP + ScrollTrigger](https://gsap.com), API View Transitions du navigateur |
| UI | [cmdk](https://cmdk.paco.me) (recherche ⌘K), [Hugeicons](https://hugeicons.com) (icônes, via `src/components/Icon.tsx`), polices Syne et Plus Jakarta Sans (auto-hébergées) |
| Serveur | Node.js (`node:http`, sans framework), [Nodemailer](https://nodemailer.com) (envoi des emails) |

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
| `npm run build` | Build complet : client → bundle de pré-rendu → pages HTML statiques + sitemap → serveur de production |
| `npm start` | Lance le serveur de production (`dist-server/index.mjs`) — à exécuter depuis la racine du projet |
| `npm run preview` | Aperçu Vite du dossier `dist/` (pour vérifier, pas pour la production) |
| `npm run lint` | Vérification TypeScript (`tsc --noEmit`) |
| `npm run images` | Génère les variantes 640 px et 1280 px des couvertures de projets (`public/images/sm/`, `md/`), converties en sRGB |
| `npm run clean` | Supprime `dist/`, `dist-ssr/`, `dist-server/` |

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

1. **`.env`** présent sur le serveur (SMTP + `STATS_KEY`).
2. Le dossier **`.data/`** (statistiques) doit **persister** entre deux déploiements.
3. Derrière un proxy (Nginx, Caddy, hébergeur…), le serveur lit l'IP réelle via `X-Forwarded-For` (limitation anti-spam du formulaire).
4. HTTPS est géré par le proxy / l'hébergeur ; le serveur envoie déjà `Strict-Transport-Security`.

Après une mise en ligne qui change l'image d'aperçu, la rafraîchir sur LinkedIn via le [Post Inspector](https://www.linkedin.com/post-inspector/).

**Remplacer une image :** le serveur met les fichiers de `public/` en cache 30 jours. Une image modifiée doit donc changer de **nom** (ex. `HUG-cover.webp` → `HUG-cover-2.webp`), sinon les visiteurs gardent l'ancienne.

---

## Structure du projet

```
├── index.html                 Gabarit HTML (thème appliqué avant affichage, zone SEO remplie au build)
├── public/                    Fichiers servis tels quels
│   ├── images/                Couvertures des projets (.webp) + sm/, md/ (variantes 640 / 1280 px)
│   │   └── case/<projet>/     Images des études de cas (captures, maquettes, photos)
│   ├── pdf/                   CV
│   ├── tools/                 Logos du bandeau d'outils
│   ├── og-image.jpg           Image d'aperçu réseaux sociaux (1200×630)
│   ├── llms.txt               Résumé du profil et des projets pour les assistants IA
│   ├── ai-catalog.json        Catalogue pour les agents IA (copies dans .well-known/)
│   └── robots.txt
├── src/
│   ├── App.tsx                Assemblage : intro, curseur, header, page (accueil / projet / 404)
│   ├── main.tsx               Point d'entrée navigateur
│   ├── entry-server.tsx       Point d'entrée du pré-rendu
│   ├── router.tsx             Routeur maison (History API + View Transitions)
│   ├── seo.ts                 <head> par page, JSON-LD, sitemap
│   ├── components/            Sections et composants (Hero, ProjectCard, CaseStudy, ContactSection…)
│   ├── context/               Langue (depuis l'URL), thème, couleur d'accent
│   ├── data/                  Contenu : projets, parcours, coordonnées ; variantes d'images
│   │   └── caseStudies/       Une étude de cas par projet (FR + EN), un fichier par projet
│   ├── hooks/                 usePauseOffscreen (animations en pause hors écran)
│   ├── theme/colors.ts        Catalogue de palettes d'accent (ACTIVE_ACCENT_ID)
│   └── index.css              Tailwind + styles globaux (curseur, fonds, transitions)
├── server/
│   ├── index.ts               Serveur de production
│   ├── contact.ts             POST /api/contact
│   ├── contactEmails.ts       Emails du formulaire (notification + confirmation signée)
│   └── analytics.ts           Statistiques internes + /stats
├── scripts/
│   ├── prerender.mjs          Génère les pages HTML, la 404 et le sitemap
│   ├── make-image-variants.py Variantes 640 / 1280 px des couvertures (sRGB)
│   ├── make-project-logos.py  Logos des projets, transparents, version claire et sombre
│   └── og/                    Modèle de l'image d'aperçu (voir og/README.md)
├── matiere/                   Matière brute des projets (rapports, exports) : locale, ignorée par git
└── vite.config.ts             Build + routes API en développement
```

---

## Modifier le contenu

| Je veux… | Où |
| --- | --- |
| Ajouter / modifier un **projet** (carte) | `src/data/portfolioData.ts` → `UNIFIED_PROJECTS` (textes FR/EN, type, catégorie, phrase clé, rôle, couverture, couleur). L'`id` devient l'URL : `/projets/<id>` et `/en/projects/<id>` |
| Écrire l'**étude de cas** d'un projet | `src/data/caseStudies/<projet>.ts` (FR + EN), puis l'enregistrer dans `src/data/caseStudies/index.ts`. Les images vont dans `public/images/case/<projet>/` |
| Changer le **titre / la description Google** d'une page | `META` en haut de `src/seo.ts` (titres ≤ 60 caractères, descriptions 120–160) |
| Changer le **logo** d'un projet | `python3 scripts/make-project-logos.py` (depuis les fichiers de `matiere/`) génère `public/images/logos/<id>.webp` et `<id>-dark.webp`, transparents ; puis `logo` du projet dans `src/data/portfolioData.ts`. Le logo remplace le nom sur la carte, en tête de l'étude de cas et dans « Projet suivant » |
| Changer la **vidéo de survol** d'une carte | Encoder la vidéo pour le web (16:10, 1152×720, sans son, une image clé par image pour que le retour en arrière soit fluide), par ex. `ffmpeg -i source.mp4 -an -vf "crop=1728:1080,scale=1152:720,setpts=0.5*PTS" -c:v libx264 -crf 27 -g 1 -movflags +faststart public/videos/<id>-dive.mp4`, puis `video` du projet dans `src/data/portfolioData.ts` |
| Ajouter une **couverture** de projet | `.webp` 1920×1200 (16:10) dans `public/images/`, puis `npm run images`. C'est aussi la première image de la vidéo de survol : même cadrage (recadrage 16:10 centré) et mêmes couleurs, sinon l'image saute quand la vidéo démarre |
| Modifier le **parcours** (expériences, formation) | `src/data/portfolioData.ts` (FR) et `src/components/AboutSection.tsx` (EN) |
| Modifier la **bio** et les textes d'interface | `src/context/LanguageContext.tsx` |
| Changer les **compétences** | `src/components/SkillsSection.tsx` → `SKILLS_DATA` |
| Remplacer le **CV** | `public/pdf/` + `USER_INFO.cv` dans `src/data/portfolioData.ts` |
| Changer la **couleur d'accent** | `ACTIVE_ACCENT_ID` dans `src/theme/colors.ts` **et** les valeurs par défaut en haut de `src/index.css` (premier affichage) |
| Modifier l'**image d'aperçu** | `scripts/og/og-image.html`, puis régénérer (voir `scripts/og/README.md`) |
| Mettre à jour les infos pour les **IA** | `public/llms.txt` et `representativeQueries` dans `public/ai-catalog.json` + `public/.well-known/` |

Après une modification de contenu : `npm run build` (le pré-rendu, les métadonnées et le sitemap se mettent à jour automatiquement).

---

## Fonctionnement

### Routage, pré-rendu et SEO

- **URLs réelles** : `/`, `/en/`, `/projets/<slug>`, `/en/projects/<slug>` — un petit routeur maison (`src/router.tsx`) basé sur l'History API. La langue vient de l'URL. L'ancienne adresse `/projets/hug-sangsationnel` redirige (301) vers `/projets/hug`.
- **Sections avec leur propre URL** : `/projets`, `/a-propos`, `/contact` (`/en/projects`, `/en/about`, `/en/contact`). L'accueil reste une seule page qui défile : un lien partagé ouvre directement la section, les liens du menu défilent en douceur sans recharger, et l'URL (ainsi que le titre de l'onglet) suit la section lue. Ces URLs ont leur titre et leur description, mais leur URL canonique est l'accueil (même contenu) : elles ne figurent pas dans le sitemap.
- **Pré-rendu** : au build, chaque page est rendue en HTML statique (`scripts/prerender.mjs`). Les moteurs de recherche et les réseaux sociaux voient le contenu complet sans exécuter de JavaScript.
- **Métadonnées par page** (`src/seo.ts`, table `META`) : titre et description uniques, dans les limites d'affichage de Google (titres ≤ 60 caractères / 580 px, descriptions 120–160 caractères / 920 px ; score SEO Lighthouse 100), URL canonique, `hreflang` FR/EN, Open Graph, Twitter Card et données structurées JSON-LD (`Person`, `WebSite`, `ProfilePage`, `CreativeWork`, `BreadcrumbList`).
- **Sitemap** généré automatiquement : pages canoniques FR/EN avec `hreflang`, images affichées par chaque page (Google Images) et CV. Le `lastmod` de chaque page est la date du dernier commit de ses fichiers (étude de cas + images pour un projet), il ne bouge donc que si la page change.
- **GEO** (assistants IA) : `llms.txt`, catalogues `ai-catalog.json`, et `robots.txt` qui autorise les robots des IA.
- **404** : page dédiée, servie avec un vrai statut 404 et exclue de l'indexation.
- **Pages cachées** (easter eggs) : `/stand` (coulisses du site) et `/podium` (classement du jeu « Lights out », `server/podium.ts`, scores dans `.data/podium.json` à conserver entre deux déploiements) ; `noindex`, hors du sitemap, accessibles via la recherche ⌘K.
- **Politique de confidentialité** : `noindex, follow` et hors du sitemap (utile aux visiteurs, pas une page à trouver dans Google).
- **Suggestion de langue** (`src/components/LanguageHint.tsx`) : si le navigateur ne demande pas la langue de la page (par ex. un recruteur anglophone sur la version française), une petite pastille propose l'autre version. Jamais de redirection ; une fois fermée ou suivie, elle ne revient plus.
- **Icônes** : `favicon.svg` (le « L. » en Syne, vectorisé : aucune police à charger), `apple-touch-icon.png`, `icon-192/512.png` et `site.webmanifest`.

### Formulaire de contact

- Le navigateur envoie le message à **`POST /api/contact`** (`server/contact.ts`), qui l'expédie via le compte SMTP de la boîte mail du site (Nodemailer). Aucun service de formulaire tiers.
- Protections : champ piège anti-robots, validation des champs, sujet limité à la liste du formulaire, taille limitée, délais d'attente SMTP, **5 messages / 10 minutes par IP**.
- Deux emails mis en forme (`server/contactEmails.ts`) : la notification reçue (« Répondre à » = le visiteur, objet = sujet choisi) et une confirmation envoyée au visiteur dans sa langue, avec le sujet en tête et la signature email, sans recopier son message (au plus 3 confirmations par jour vers une même adresse).
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
| Curseur | Rond en couleurs inversées + contour rouge qui épouse liens et boutons |
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
