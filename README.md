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
| **Hero** | Accroche animée (« Je transforme des idées en… »), traînée d'images des projets qui suit la souris, fond dégradé + grain |
| **Compétences** | Six domaines, détail au survol (souris) ou au tap (mobile) |
| **Projets** | Cartes avec effet WebGL au survol ; sur mobile, cartes empilées au scroll |
| **Page projet** | Étude de cas racontée au scroll : fenêtre fixe + étapes (présentation, enjeux, réponses, chiffres clés) |
| **À propos** | Bio révélée à la lecture, langues, centres d'intérêt, frises expérience / formation, CV à télécharger |
| **Contact** | Bloc en couleur d'accent : formulaire, coordonnées directes, signature |

Autres : thème clair / sombre (suit le système), barre de commande **⌘K / Ctrl+K**, page 404, image d'aperçu pour les réseaux sociaux.

---

## Stack technique

| Domaine | Outils |
| --- | --- |
| Interface | [React 19](https://react.dev), TypeScript, [Tailwind CSS 4](https://tailwindcss.com) |
| Build | [Vite 6](https://vite.dev) (client + rendu serveur pour le pré-rendu), esbuild (serveur) |
| Animations | [Motion](https://motion.dev), [GSAP + ScrollTrigger](https://gsap.com), API View Transitions du navigateur |
| WebGL | [OGL](https://github.com/oframe/ogl) (images « vivantes » au survol) |
| UI | [cmdk](https://cmdk.paco.me) (barre ⌘K), [Lucide](https://lucide.dev) (icônes) |
| Serveur | Node.js (`node:http`, sans framework), [Nodemailer](https://nodemailer.com) (envoi des emails) |

GSAP, OGL et cmdk sont **chargés à la demande** : ils ne pèsent pas sur le premier affichage.

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
| `npm run images` | Génère les variantes 640 px des images de projets (`public/images/sm/`) |
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

---

## Structure du projet

```
├── index.html                 Gabarit HTML (thème appliqué avant affichage, zone SEO remplie au build)
├── public/                    Fichiers servis tels quels
│   ├── images/                Visuels des projets (.webp) + sm/ (variantes 640 px)
│   ├── pdf/                   CV et dossiers PDF des projets
│   ├── tools/                 Logos du bandeau d'outils
│   ├── og-image.jpg           Image d'aperçu réseaux sociaux (1200×630)
│   ├── llms.txt               Résumé du profil pour les assistants IA
│   └── robots.txt
├── src/
│   ├── App.tsx                Assemblage : intro, curseur, header, page (accueil / projet / 404)
│   ├── main.tsx               Point d'entrée navigateur
│   ├── entry-server.tsx       Point d'entrée du pré-rendu
│   ├── router.tsx             Routeur maison (History API + View Transitions)
│   ├── seo.ts                 <head> par page, JSON-LD, sitemap
│   ├── components/            Sections et composants (Hero, ProjectStory, ContactSection…)
│   ├── context/               Langue (depuis l'URL), thème, couleur d'accent
│   ├── data/                  Contenu : projets, parcours, coordonnées ; variantes d'images
│   ├── hooks/                 usePauseOffscreen (animations en pause hors écran)
│   ├── theme/colors.ts        Catalogue de palettes d'accent (ACTIVE_ACCENT_ID)
│   └── index.css              Tailwind + styles globaux (curseur, fonds, transitions)
├── server/
│   ├── index.ts               Serveur de production
│   ├── contact.ts             POST /api/contact
│   └── analytics.ts           Statistiques internes + /stats
├── scripts/
│   ├── prerender.mjs          Génère les pages HTML, la 404 et le sitemap
│   ├── make-image-variants.py Variantes 640 px des images
│   └── og/                    Modèle de l'image d'aperçu (voir og/README.md)
└── vite.config.ts             Build + routes API en développement
```

---

## Modifier le contenu

| Je veux… | Où |
| --- | --- |
| Ajouter / modifier un **projet** | `src/data/portfolioData.ts` → `UNIFIED_PROJECTS` (textes FR/EN, images, PDF, couleur, chiffres clés). L'`id` devient l'URL : `/projets/<id>` et `/en/projects/<id>` |
| Ajouter des **images** de projet | Les déposer en `.webp` dans `public/images/`, puis `npm run images` |
| Modifier le **parcours** (expériences, formation) | `src/data/portfolioData.ts` (FR) et `src/components/AboutSection.tsx` (EN) |
| Modifier la **bio** et les textes d'interface | `src/context/LanguageContext.tsx` |
| Changer les **compétences** | `src/components/SkillsSection.tsx` → `SKILLS_DATA` |
| Remplacer le **CV** | `public/pdf/` + `USER_INFO.cv` dans `src/data/portfolioData.ts` |
| Changer la **couleur d'accent** | `ACTIVE_ACCENT_ID` dans `src/theme/colors.ts` **et** les valeurs par défaut en haut de `src/index.css` (premier affichage) |
| Modifier l'**image d'aperçu** | `scripts/og/og-image.html`, puis régénérer (voir `scripts/og/README.md`) |
| Mettre à jour les infos pour les **IA** | `public/llms.txt` |

Après une modification de contenu : `npm run build` (le pré-rendu, les métadonnées et le sitemap se mettent à jour automatiquement).

---

## Fonctionnement

### Routage, pré-rendu et SEO

- **URLs réelles** : `/`, `/en/`, `/projets/<slug>`, `/en/projects/<slug>` — un petit routeur maison (`src/router.tsx`) basé sur l'History API. La langue vient de l'URL.
- **Pré-rendu** : au build, chaque page est rendue en HTML statique (`scripts/prerender.mjs`). Les moteurs de recherche et les réseaux sociaux voient le contenu complet sans exécuter de JavaScript.
- **Métadonnées par page** (`src/seo.ts`) : titre, description, URL canonique, `hreflang` FR/EN, Open Graph, Twitter Card et données structurées JSON-LD (`Person`, `WebSite`, `ProfilePage`, `CreativeWork`, `BreadcrumbList`).
- **Sitemap** généré automatiquement (pages + PDF).
- **404** : page dédiée, servie avec un vrai statut 404 et exclue de l'indexation.

### Formulaire de contact

- Le navigateur envoie le message à **`POST /api/contact`** (`server/contact.ts`), qui l'expédie via le compte SMTP de la boîte mail du site (Nodemailer). Aucun service de formulaire tiers.
- Protections : champ piège anti-robots, validation des champs, taille limitée, **5 messages / 10 minutes par IP**.
- L'email reçu a pour « Répondre à » l'adresse du visiteur, et pour objet le sujet choisi (Projet, Collaboration, Travail de Bachelor…).
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
- cache : fichiers du build 1 an (`immutable`), HTML revalidé à chaque visite, le reste 7 jours ; `ETag` / 304 ;
- en-têtes de sécurité : **CSP stricte** (seuls les scripts du site + le script de thème, autorisé par son empreinte), `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS… ;
- protection contre la lecture de fichiers hors de `dist/`.

---

## Animations et interactions

| Élément | Technique |
| --- | --- |
| Carte → page projet | API **View Transitions** : l'image de la carte se transforme en visuel de la page |
| Pages projet | **GSAP ScrollTrigger** : fenêtre fixe, volets d'images, étape active, rail de progression, notes animées |
| Images des cartes | Shader **WebGL (OGL)** : déformation, ondulation et décalage de couleurs selon la vitesse de la souris |
| Hero | Traînée d'images (WAAPI, nœuds DOM recyclés), pilote automatique sur mobile / souris immobile |
| Curseur | Rond en couleurs inversées + contour rouge qui épouse liens et boutons |
| ⌘K | **cmdk**, ouverture instantanée (action clavier) |

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
| `v2` | Version actuelle (animations, nouvelles sections, serveur de production) |

---

© Luca Leone — [luca-leone.ch](https://luca-leone.ch) · [LinkedIn](https://linkedin.com/in/leone-luca)
