# Dashboard admin (socle + Contenu) — plan de construction

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal :** un espace admin privé, dans la DA du site, qui permet de modifier tout le contenu de luca-leone.ch (projets, études de cas, Hero, À propos, Compétences, contact, SEO) en brouillon, puis de le publier via git et un rebuild, depuis l'ordinateur comme depuis le téléphone.

**Architecture :** le contenu quitte le TypeScript pour des fichiers JSON dans `content/`, avec un seul schéma (zod) où chaque texte est un `Txt` bilingue `{ fr, en, enOf }`. Le site lit ces fichiers au build (rendu public identique) via un `ContentProvider` React, que l'admin réutilise avec le brouillon pour le mode Page. Le serveur Node existant gagne un handler `server/admin/` caché derrière `ADMIN_PATH` : connexion mot de passe + TOTP, brouillon et images en attente dans `DATA_DIR/admin/`, et une publication qui fait pull, écriture, commit, build à côté (`dist-next`), push, puis bascule. L'interface admin est un bundle Vite séparé (`dist-admin/`), jamais servi au public.

**Tech Stack :** React 19, TypeScript 5.8, Tailwind 4, Vite 6, `node:http` sans framework, esbuild. Ajouts : zod 3.23.8 (schéma + validation), sharp 0.33.5 (images côté serveur), @dnd-kit/core 6.3.1 + @dnd-kit/sortable 10.0.0 (glisser), et en dev vitest 3.0.5, jsdom 25.0.1, @testing-library/react 16.1.0. `tsx` seulement via `npx tsx@4.19.2` pour le script de migration, sans l'ajouter aux dépendances.

**Spec :** `docs/superpowers/specs/2026-10-18-dashboard-contenu-design.md`. À lire en entier avant de commencer : ce plan s'appuie dessus.

## Global Constraints

- Le site public doit rester **identique** après la migration : même HTML pré-rendu, mêmes URL, même sitemap. Seuls les noms des fichiers JS/CSS hashés peuvent changer.
- Aucun code ni CSS de l'admin dans le bundle public. Pas d'`admin.html` dans `dist/`.
- Aucune trace de l'admin sur le site public : ni lien, ni raccourci, ni entrée dans `robots.txt` ou le sitemap.
- Sous `ADMIN_PATH` : en-tête `X-Robots-Tag: noindex, nofollow` partout. Une requête API sans session, ou un chemin admin inconnu, reçoit **la même 404** que le site (`dist/404.html`, statut 404).
- La CSP actuelle (`server/index.ts`) s'applique à l'admin : pas de script inline dans `admin.html`.
- Secrets uniquement dans `.env` : `ADMIN_PATH`, `ADMIN_PASSWORD_HASH`, `ADMIN_TOTP_SECRET`, `ADMIN_GIT_SSH_KEY`, `ADMIN_GIT_NAME`, `ADMIN_GIT_EMAIL`, `ADMIN_PUBLISH_MODE` (`git` en prod, `files` par défaut en dev). Si `ADMIN_PATH`, `ADMIN_PASSWORD_HASH` ou `ADMIN_TOTP_SECRET` manque, l'admin est entièrement désactivé (tout renvoie 404).
- Une publication n'exige **jamais** de redémarrage du serveur. Elle refuse de continuer (`code-changed`) si le pull ramène des changements dans `server/`, `package.json`, `package-lock.json`, `src/admin/`, `admin.html` ou `vite.admin.config.ts`.
- Une publication ratée laisse le site en ligne sur sa version précédente et le dépôt du serveur sur son commit précédent.
- Pas de traduction automatique. Le dashboard ne génère aucun texte à la place de Luca. Les règles d'écriture de `src/data/caseStudies/types.ts` (première personne, aucun chiffre inventé, `[À COMPLÉTER]`) sont recopiées en tête de l'éditeur d'étude de cas.
- Textes de l'interface admin en **français**, ton du site (tutoiement, phrases simples). Thème clair/sombre qui suit le système, avec les jetons de `src/index.css` (`--accent-primary #FF2E55`, `--accent-light #C50E36`, `--color-paper #F7F6F3`, `--color-graphite #1A1A1A`, `--color-muted #6B6B6B`, `--color-border #E2E1DC`), Syne pour les titres, Plus Jakarta Sans pour le texte, monogramme LL de `public/favicon.svg`.
- Utilisable dès 360 px de large, cibles tactiles d'au moins 44 px.
- Commits : messages en anglais, une phrase descriptive comme dans l'historique. **Aucune ligne `Co-Authored-By` ni signature Claude.**
- Le déploiement manuel `git pull --ff-only && npm ci --include=dev && npm run build` puis `npm start` doit continuer de marcher.

## Review Focus

1. **Deux appareils ouverts sur le même brouillon** (téléphone + ordi) : aucune modification ne doit être perdue en silence. Chaque page du brouillon a une révision. Un enregistrement fait sur une révision périmée reçoit un 409, et l'éditeur affiche « Modifié sur un autre appareil » avec « Recharger » (test en tâche 7).
2. **Connexion coupée ou onglet fermé pendant l'enregistrement auto** (train) : les enregistrements en attente partent au `pagehide` (`fetch` avec `keepalive`), un échec réseau est réessayé, et l'état « Non enregistré » reste visible (test en tâche 9).
3. **Session expirée en pleine édition** : l'API répond 404, mais les modifications en attente sont gardées en mémoire. L'éditeur affiche la connexion par-dessus la page, puis renvoie ce qui était en attente une fois reconnecté (test en tâche 9).
4. **Fichier refusé** : HEIC d'iPhone si sharp ne sait pas le lire, image corrompue, vidéo trop lourde, PDF qui n'en est pas un. Réponse 422 avec un message en français (« Format non pris en charge : exporte en JPEG ou PNG »), jamais une 500 (test en tâche 8).
5. **Renommer un projet** vers un id déjà pris, invalide (hors `[a-z0-9-]`) ou qui sert déjà de redirection : refusé avec un message. Les chaînes de redirections sont aplaties (a→b puis b→c donne a→c et b→c) (test en tâche 7).

---

## Structure des fichiers

```
content/                         ← nouvelle source de vérité (commitée)
  site.json                      contact, hero, about, skills, seo des pages fixes
  projects.json                  { order, hidden, redirects }
  projects/<id>.json             un fichier par projet : carte + seo + étude de cas
src/content/
  schema.ts                      schémas zod + types inférés (Txt, Image, Block, StoredProject, Site, ProjectsIndex, Content)
  txt.ts                         hashFr, tx, isStale, setEn
  localize.ts                    StoredProject/Site → types runtime existants (Project, CaseStudy, …)
  load.ts                        CONTENT lu depuis content/ (import.meta.glob)
  ContentContext.tsx             ContentProvider / useContent
  edit.tsx                       EditContext : useEditAttrs, EditSlot (vides en public)
  derived.ts                     textes dérivés (nombre de projets, liste, bloc llms.txt)
server/admin/
  auth.ts  sessions.ts  rateLimit.ts  draft.ts  uploads.ts  git.ts  publish.ts  handler.ts  setup.ts
src/admin/
  main.tsx  AdminApp.tsx  api.ts  store.ts  Login.tsx  Shell.tsx  templates.ts
  fields/FieldEditor.tsx  fields/TxtField.tsx  fields/ImageField.tsx
  structure/StructureView.tsx  structure/BlockList.tsx  structure/blockTemplates.ts
  page/PageView.tsx  page/InlineEditor.tsx
  pages/ProjectsList.tsx  pages/ProjectEditor.tsx  pages/SiteEditor.tsx
  publish/PublishPanel.tsx
admin.html  vite.admin.config.ts  vitest.config.ts
scripts/migrate-content.ts       (one-shot, supprimé en fin de tâche 3)
tests/                           tests vitest, miroir de l'arborescence (tests/content, tests/server, tests/admin)
```

---

## Phase A — Le contenu en fichiers (aucun changement visible)

### Task 1 : Tests, schéma du contenu et `Txt`

**Files :**
- Create : `vitest.config.ts`, `src/content/schema.ts`, `src/content/txt.ts`, `tests/content/txt.test.ts`, `tests/content/schema.test.ts`
- Modify : `package.json` (deps, scripts `test` = `vitest run`, `test:watch` = `vitest`)

**Interfaces :**
- Produces (`src/content/txt.ts`) :
  - `hashFr(s: string): string` : FNV-1a 32 bits en hexa sur 8 caractères (pas de `node:crypto`, il tourne aussi dans le navigateur).
  - `tx(t: Txt, lang: Language): string`
  - `isMissingEn(t: Txt): boolean` (`en.trim() === ''`)
  - `isStale(t: Txt): boolean` (`!isMissingEn(t) && t.enOf !== hashFr(t.fr)`)
  - `setEn(t: Txt, en: string): Txt` (renvoie `{ ...t, en, enOf: hashFr(t.fr) }`)
  - `setFr(t: Txt, fr: string): Txt` (ne touche pas `enOf`, c'est ce qui rend l'anglais périmé)
- Produces (`src/content/schema.ts`), schémas zod + `type X = z.infer<…>` :
  - `TxtSchema` `{ fr: string, en: string, enOf?: string }`
  - `ImageSchema` `{ src, width: int, height: int, alt: Txt, caption?: Txt, fit?: 'cover'|'contain' }`
  - `BlockSchema` : union discriminée sur `type`, qui reprend `CaseBlock` de `src/data/caseStudies/types.ts` champ pour champ, plus `{ type: 'text', text: Txt }` pour les paragraphes (aujourd'hui des `string` dans `CaseContent`). Les textes lisibles sont des `Txt`. `src`, `href`, `width`, `height`, `cols`, `frame`, `fit`, `boxed`, `narrow`, `highlight`, `me`, `value` et les `name` de personnes sont partagés. `prefix`, `suffix` et `source` des chiffres sont des `Txt`.
  - `StudySchema` : `CaseStudy` avec `Txt`, `sections[].id` partagé, `sections[].content: Block[]`, `credits[].name` partagé et `role: Txt`.
  - `StoredProjectSchema` : `{ id, kind, name, number, year, imageUrl, stack: Txt[], accentColor?, accentColorDark?, logo?: ProjectLogo, video?, card: { subtitle, category, hook?, badge?, summary, overview } (tous Txt), seo: { title: Txt, description: Txt }, study: Study }`
  - `ProjectsIndexSchema` `{ order: string[], hidden: string[], redirects: Record<string, string> }`
  - `SiteSchema` `{ contact: { email, phone, linkedin, cv }, hero: { headline: { before: Txt, accent: Txt, joiner: Txt }, outcomes: Txt[], lead: Txt, availability: { before: Txt, link: Txt, after: Txt } }, about: { bio: Txt, languages: { name: Txt, level: Txt }[], passions: Txt[], education: { period: Txt, title: Txt, institution: string, location: Txt, details: Txt }[], experience: { period: Txt, title: Txt, company: string, location: Txt, description: Txt }[] }, skills: { id, number, title: Txt, desc: Txt, tools: Txt[] }[], seo: Record<'home'|'projets'|'a-propos'|'contact'|'privacy'|'notfound', { title: Txt, description: Txt }> }`
  - `ContentSchema` `{ site: Site, index: ProjectsIndex, projects: Record<string, StoredProject> }`
  - `PROJECT_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/` ; `StoredProjectSchema.id` le respecte.
  - Chaque champ porte `.describe('<libellé FR>')`, que l'éditeur générique (tâche 10) affiche.

- [ ] **Step 1 :** installer les dépendances (versions de la Tech Stack). Ajouter `vitest.config.ts` (environnement `node` par défaut, `jsdom` pour `tests/admin/**`), et les scripts `test` / `test:watch`.
- [ ] **Step 2 : tests qui échouent** (`tests/content/txt.test.ts`)
  ```ts
  test('hashFr is stable and short', () => { expect(hashFr('Bonjour')).toBe(hashFr('Bonjour')); expect(hashFr('a')).toMatch(/^[0-9a-f]{8}$/); expect(hashFr('a')).not.toBe(hashFr('b')); });
  test('editing FR after EN makes EN stale', () => { const t = setEn({ fr: 'Salut', en: '' }, 'Hi'); expect(isStale(t)).toBe(false); expect(isStale(setFr(t, 'Bonjour'))).toBe(true); });
  test('missing EN is not stale, it is missing', () => { const t = { fr: 'Salut', en: '' }; expect(isMissingEn(t)).toBe(true); expect(isStale(t)).toBe(false); });
  test('tx picks the language', () => { expect(tx({ fr: 'a', en: 'b' }, 'en')).toBe('b'); });
  ```
  et `tests/content/schema.test.ts` : un projet minimal valide passe `StoredProjectSchema.parse`, `id: 'Hug Projet'` échoue, un bloc `{ type: 'figures', items: [{ value: 'x' }] }` échoue.
- [ ] **Step 3 :** `npm test` → les tests échouent (modules manquants).
- [ ] **Step 4 :** implémenter `txt.ts` et `schema.ts` selon les Interfaces.
- [ ] **Step 5 :** `npm test` → PASS ; `npm run lint` → aucune erreur.
- [ ] **Step 6 : commit** `Content schema (zod) with bilingual Txt values whose English is flagged out of date when the French changes; vitest set up`

### Task 2 : Migration vers `content/` et preuve d'équivalence

**Files :**
- Create : `scripts/migrate-content.ts`, `content/site.json`, `content/projects.json`, `content/projects/*.json` (générés), `src/content/localize.ts`, `src/content/load.ts`, `tests/content/equivalence.test.ts`

**Interfaces :**
- Consumes : schémas et `tx` de la tâche 1.
- Produces (`src/content/localize.ts`) :
  - `toProject(p: StoredProject, lang: Language): Project` (type existant `src/types.ts`)
  - `toCaseStudy(p: StoredProject, lang: Language, opts?: { keepIncomplete?: boolean }): CaseStudy | null` : `null` si `!isEnglishReady(p)` et `lang === 'en'`. En EN, un bloc dont un `Txt` requis manque est retiré. Avec `keepIncomplete` (aperçu admin), il est gardé, et chaque texte EN manquant est rendu `⟨à traduire⟩ ` + texte FR, pour que les index restent stables.
  - `isEnglishReady(p: StoredProject): boolean` : tous les `Txt` requis de `card`, `seo` et de l'en-tête de `study` (`kicker`, `title`, `hook`, `intro`) ont un anglais.
  - `toSite(s: Site, lang)` : `{ contact, hero: { headline, outcomes: string[], lead, availability }, about: { bio, languages, passions, education, experience }, skills: SkillItem[], seo }`, avec la forme qu'attendent `AboutSection` (`EDUCATION_TIMELINE`, …), `SkillsSection` (`SkillItem`) et `Hero` (`OUTCOMES[lang]`).
  - `visibleProjects(c: Content, lang): StoredProject[]` : dans l'ordre de `index.order`, sans `index.hidden`, et en EN sans les projets dont `isEnglishReady` est faux.
- Produces (`src/content/load.ts`) : `export const CONTENT: Content`, construit avec `import.meta.glob('../../content/projects/*.json', { eager: true, import: 'default' })` + `site.json` + `projects.json`, validé par `ContentSchema.parse` (une erreur casse le build, c'est voulu).

- [ ] **Step 1 : écrire `scripts/migrate-content.ts`** (lancé avec `npx tsx@4.19.2 scripts/migrate-content.ts`). Il importe les modules actuels (`UNIFIED_PROJECTS`, les `*_FR`/`*_EN` de chaque étude de cas, timelines, `LANGUAGES`, `META`, `USER_INFO`, et les constantes `OUTCOMES`, `SKILLS_DATA` et passions, à exporter temporairement de leurs composants). Il fusionne FR et EN en `Txt` (avec `enOf = hashFr(fr)`) en parcourant les deux arbres en parallèle. Il **s'arrête avec la liste des chemins** si les deux langues n'ont pas la même structure (longueur de tableau, type de bloc) ou si un champ partagé diffère (un `src` ou un `href` différent entre FR et EN). Ces cas se tranchent à la main dans les données sources, puis on relance. Il écrit des JSON indentés de 2 espaces avec un saut de ligne final. `projects.json` reprend l'ordre actuel de `UNIFIED_PROJECTS`, `hidden: []` et `redirects: { "hug-sangsationnel": "hug" }`.
- [ ] **Step 2 : test d'équivalence qui échoue** (`tests/content/equivalence.test.ts`). Pour chaque projet et chaque langue, `toCaseStudy(CONTENT.projects[id], lang)` doit faire un `toEqual` avec `getCaseStudy(id, lang)` de l'ancien module. Même chose pour `toProject` vs `PROJECTS_FR`/`PROJECTS_EN`, `toSite(...).about.education` vs `EDUCATION_TIMELINE(_EN)` (et experience, languages, passions), `skills` vs `SKILLS_DATA`, `hero.outcomes` vs `OUTCOMES`, `seo` vs `META`, et `visibleProjects(CONTENT, lang).map(p => p.id)` vs l'ordre actuel.
- [ ] **Step 3 :** `npm test` → échec (pas encore de `content/`, ni de `localize`).
- [ ] **Step 4 :** implémenter `localize.ts` et `load.ts`, lancer le script, relancer jusqu'à ce qu'il passe.
- [ ] **Step 5 :** `npm test` → PASS (l'équivalence est stricte, champ par champ).
- [ ] **Step 6 : commit** `Content moved to content/*.json (generated from the TypeScript data, French and English merged into one structure), proven equal to the old data by a test`

### Task 3 : Le site lit `content/`, l'ancien TypeScript disparaît

**Files :**
- Create : `src/content/ContentContext.tsx`
- Modify : `src/App.tsx`, `src/seo.ts`, `src/entry-server.tsx`, `src/components/{AboutSection,SkillsSection,Hero,Header,ContactSection,CommandPaletteDialog,ProjectsSection,ProjectDetailView,StandPage,PrivacyPolicy,CaseStudy}.tsx`, `src/data/portfolioData.ts` (ne garde que `ProjectKind`, `PROJECT_KIND_LABEL`, `projectAccentVars`, plus `USER_INFO` dérivé de `CONTENT.site.contact`), `scripts/prerender.mjs` (`CASE_STUDY_FILES` et `HOME_SOURCES` pointent vers `content/projects/<id>.json`, `content/site.json`, `content/projects.json`)
- Delete : `src/data/caseStudies/{hug,karting,oceansight,drivegear,etoileBlanche,f1Pitwall,index}.ts`, `src/data/projectsStorage.ts`, `scripts/migrate-content.ts`, `tests/content/equivalence.test.ts`. `src/data/caseStudies/types.ts` reste (types runtime et règles d'écriture).

**Interfaces :**
- Produces : `ContentProvider({ value?: Content, children })` (par défaut `CONTENT`) ; `useContent(): Content` ; `useSite(): ReturnType<typeof toSite>` (pour la langue courante) ; `useProjects(): Project[]` (= `visibleProjects` → `toProject`) ; `useCaseStudy(id): CaseStudy | null`.
- Les composants lisent le contenu **uniquement** par ces hooks (pour que l'admin puisse injecter le brouillon). `seo.ts` et `prerender.mjs`, qui tournent hors React, utilisent `CONTENT` directement.

- [ ] **Step 1 : capturer la référence.** Sur le commit de la tâche 2 : `npm run build && cp -R dist /tmp/claude-dist-before` (dossier temporaire hors du dépôt).
- [ ] **Step 2 :** brancher composants, `App.tsx`, `seo.ts` et `prerender.mjs` sur `content/`, puis supprimer les fichiers listés. `App` enveloppe l'arbre dans `ContentProvider`.
- [ ] **Step 3 : vérifier l'identité.** `npm run build`, puis comparer chaque `.html` et `sitemap.xml` en neutralisant les hashes de fichiers :
  ```bash
  norm() { sed -E 's/-[A-Za-z0-9_-]{8}\.(js|css)/.\1/g' "$1"; }
  for f in $(cd /tmp/claude-dist-before && find . -name '*.html' -o -name sitemap.xml); do diff <(norm /tmp/claude-dist-before/$f) <(norm dist/$f) >/dev/null || echo "DIFF $f"; done
  ```
  Attendu : aucune ligne `DIFF`. Les `lastmod` du sitemap peuvent bouger, puisque les fichiers sources ont changé. C'est acceptable, à noter dans le commit.
- [ ] **Step 4 :** `npm test && npm run lint` → PASS.
- [ ] **Step 5 : commit** `The site reads its content from content/ through a ContentProvider (prerendered pages unchanged); the TypeScript project, case study and about data files are gone`

### Task 4 : Projets masqués, FR seulement, renommés ; textes dérivés

**Files :**
- Create : `src/content/derived.ts`, `tests/content/visibility.test.ts`, `tests/content/derived.test.ts`
- Modify : `src/seo.ts` (`getAllRoutes`, `alternatesFor`, `META` remplacé par `site.seo` + `project.seo`), `src/context/LanguageContext.tsx` (`setLang`), `server/index.ts` (`canonicalPagePath` lit `redirects`), `scripts/prerender.mjs` (fichiers dérivés), `public/llms.txt`, `public/ai-catalog.json`, `public/.well-known/ai-catalog.json`, `public/.well-known/ard.json` (gabarits avec marqueurs), `content/site.json` (description de `projets` avec `{n}`)

**Interfaces :**
- Produces (`src/content/derived.ts`) :
  - `countWord(n: number, lang, capitalized?: boolean): string` (`fr` : un…douze, `en` : one…twelve, chiffres au-delà)
  - `fillTemplate(text: string, c: Content, lang): string` : remplace `{n}` / `{N}` (nombre en lettres, en minuscule / avec majuscule) et `{names}` (noms des projets visibles, séparés par des virgules).
  - `llmsProjectsBlock(c: Content): string` : la liste numérotée des projets, au format actuel de `public/llms.txt`, section « Projets Principaux & Réalisations ».
- `server/index.ts` : `loadRedirects(root): Record<string,string>` lu depuis `content/projects.json`, et `canonicalPagePath` l'applique sous `/projets/` et `/en/projects/`.
- `seo.ts` : `getAllRoutes` = projets visibles par langue (FR : non masqués ; EN : non masqués et `isEnglishReady`). Pour un projet FR seulement, `alternatesFor` n'émet que `fr` et `x-default`.
- `LanguageContext.setLang` : sur une page projet qui n'existe pas dans la langue visée, navigue vers `sectionPath(lang, 'projets')`.

- [ ] **Step 1 : tests qui échouent** (`visibility.test.ts`) sur un `Content` de test :
  - projet masqué → absent de `getAllRoutes()`, de `visibleProjects(c,'fr')` et `'en'`, et de `renderSitemap` ;
  - projet sans anglais → présent en FR, absent des routes EN, `toCaseStudy(p,'en') === null`, alternates sans `en` ;
  - `canonicalPagePath('/projets/ancien')` avec `redirects: { ancien: 'nouveau' }` → `/projets/nouveau`, et pareil pour `/en/projects/ancien`.
- [ ] **Step 2 : tests qui échouent** (`derived.test.ts`) :
  - `fillTemplate('{N} projets de Luca Leone', c6, 'fr') === 'Six projets de Luca Leone'` ;
  - avec 7 projets visibles dont 1 masqué → `'Six'` ;
  - `countWord(7,'en',true) === 'Seven'`.
- [ ] **Step 3 :** `npm test` → FAIL.
- [ ] **Step 4 :** implémenter. Dans `public/llms.txt`, entourer la liste de projets de `<!--projets:start-->` / `<!--projets:end-->`. Dans les trois JSON, remplacer « six études de cas (HUG, …) » par « {n} études de cas ({names}) ». Après le pré-rendu, `prerender.mjs` réécrit ces quatre fichiers dans `dist/` (bloc régénéré, placeholders remplis).
- [ ] **Step 5 :** `npm test && npm run build`, puis refaire la comparaison de la tâche 3 et `diff public/llms.txt dist/llms.txt` → seuls les marqueurs diffèrent. Les JSON de `dist/` contiennent « six études de cas (HUG, Karting de Vuiteboeuf, … ) ».
- [ ] **Step 6 : commit** `Hidden, French-only and renamed projects handled from content/projects.json (routes, sitemap, hreflang, redirects); project count and list in llms.txt and the AI catalogues generated at build`

---

## Phase B — Accès

### Task 5 : Mot de passe, TOTP, sessions, limitation, `npm run admin:setup`

**Files :**
- Create : `server/admin/auth.ts`, `server/admin/sessions.ts`, `server/admin/rateLimit.ts`, `server/admin/setup.ts`, `tests/server/auth.test.ts`, `tests/server/sessions.test.ts`, `tests/server/rateLimit.test.ts`
- Modify : `package.json` (`admin:setup` = `node dist-server/setup.mjs`, et `server/admin/setup.ts` ajouté à `build:server`), `.env.example`

**Interfaces :**
- `auth.ts` :
  - `hashPassword(pw: string): Promise<string>` : format `scrypt$16384$8$1$<salt b64>$<hash b64>` (`node:crypto.scrypt`, 64 octets)
  - `verifyPassword(pw: string, stored: string): Promise<boolean>` (`timingSafeEqual`)
  - `base32Encode(buf: Buffer): string` / `base32Decode(s: string): Buffer` (RFC 4648, sans padding)
  - `totpAt(secretB32: string, counter: number): string` (RFC 6238 : HMAC-SHA1, 6 chiffres, pas de 30 s)
  - `verifyTotp(secretB32: string, code: string, nowMs: number, lastCounter: number | null): number | null` : accepte les compteurs `now-1..now+1`, refuse un compteur `<= lastCounter` (un code ne sert qu'une fois) et renvoie le compteur accepté.
- `sessions.ts` : `createSessionStore(file: string, opts: { idleMs: number; maxMs: number })` → `{ create(): string; check(token: string): boolean; destroy(token: string): void }`. Jeton de 32 octets aléatoires en base64url. Le fichier ne stocke que le SHA-256 du jeton. `check` prolonge l'inactivité. Valeurs : `idleMs` 7 jours, `maxMs` 30 jours.
- `rateLimit.ts` : `createLoginLimiter(opts)` → `{ retryAfterMs(ip: string): number; fail(ip: string): void; succeed(ip: string): void }`. Par IP : 5 échecs en 15 min → blocage 15 min. Global : 20 échecs en 1 h → blocage 1 h pour tous.
- `setup.ts` (CLI) : demande le mot de passe deux fois (sans écho), génère un secret TOTP de 20 octets et affiche les lignes `.env` à copier (`ADMIN_PASSWORD_HASH=…`, `ADMIN_TOTP_SECRET=…`), l'URI `otpauth://totp/luca-leone.ch:Luca?secret=…&issuer=luca-leone.ch` et le secret, pour une saisie manuelle dans l'app d'authentification. Elle n'écrit rien sur le disque.

- [ ] **Step 1 : tests qui échouent.**
  - **RFC 6238** (secret ASCII `12345678901234567890` → base32 `GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ`) : `totpAt(s, Math.floor(59/30)) === '287082'` et `totpAt(s, Math.floor(1111111109/30)) === '081804'`.
  - **`verifyTotp`** : accepte le code du pas précédent, refuse celui d'il y a deux pas, refuse le même code une deuxième fois (`lastCounter`).
  - **Mot de passe** : aller-retour `hashPassword`/`verifyPassword`, et un mauvais mot de passe renvoie `false`.
  - **Sessions** (horloge injectée via `opts.now?: () => number`) : un jeton expire après 7 jours d'inactivité et après 30 jours même actif ; `destroy` l'invalide ; le fichier ne contient pas le jeton en clair.
  - **Limiteur** : au 5e échec, `retryAfterMs > 0` ; une autre IP n'est pas bloquée tant qu'on n'atteint pas 20 échecs au total ; `succeed` remet l'IP à zéro.
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** implémenter.
- [ ] **Step 4 :** `npm test` → PASS.
- [ ] **Step 5 :** documenter dans `.env.example` toutes les variables `ADMIN_*` des Global Constraints, avec une phrase chacune. `ADMIN_PATH` : « une adresse difficile à deviner, ex. /atelier-7k2q9 ».
- [ ] **Step 6 : commit** `Admin auth building blocks: scrypt password, one-time TOTP codes (RFC 6238), hashed server-side sessions, login lockout; npm run admin:setup prints the .env lines`

### Task 6 : Handler admin, bundle séparé, écran de connexion

**Files :**
- Create : `server/admin/handler.ts`, `admin.html`, `vite.admin.config.ts`, `src/admin/main.tsx`, `src/admin/AdminApp.tsx`, `src/admin/api.ts`, `src/admin/Login.tsx`, `src/admin/Shell.tsx`, `tests/server/handler.test.ts`
- Modify : `server/index.ts` (chaîne de handlers ; `SECURITY_HEADERS` CSP calculée par une fonction `csp()` ; export interne `reloadDist()` qui vide `compressedCache`, recalcule les hashes inline et recharge les redirections), `vite.config.ts` (le plugin `siteApi` monte aussi le handler admin en dev et réécrit `${ADMIN_PATH}/*` vers `/admin.html`), `package.json` (`build:admin` = `vite build --config vite.admin.config.ts`, appelé par `build` ; `build:site` = les trois étapes actuelles du site ; `build` = `build:site && build:admin && build:server`), `.gitignore` (`dist-admin`, `dist-next`, `dist-prev`)

**Interfaces :**
- `createAdminHandler(env: Env, deps: { dataDir: string; repoRoot: string; distAdmin: string; notFound: (req, res) => void; onPublished: () => void; now?: () => number })` → `(req, res, next) => void`. Même signature que `createAnalyticsHandler`. Il reçoit la fonction 404 du site au lieu de la refaire.
- Routes, toutes sous `P = env.ADMIN_PATH` (sans `/` final) :
  - `GET P` → 301 vers `P/` ;
  - `GET P/` et `GET P/<route client>` → `dist-admin/admin.html` avec `<base href="P/">` injecté ;
  - `GET P/assets/*` → `dist-admin/assets/*` ;
  - `POST P/api/login` `{ password, code }` → 204 + `Set-Cookie: ll_admin=<token>; HttpOnly; Secure; SameSite=Strict; Path=P; Max-Age=2592000` (sans `Secure` si `env.NODE_ENV !== 'production'` et host `localhost`), 401 `{ error: 'invalid' }`, 429 `{ retryAfter: seconds }` ;
  - `POST P/api/logout` → 204 ;
  - `GET P/api/me` → 204 si connecté.
  - Toute autre `P/api/*` sans session valide → `notFound`.
  - Toute mutation (POST, PUT, DELETE) sans en-tête `X-Admin: 1` → 403.
  - `X-Robots-Tag: noindex, nofollow` sur toutes les réponses sous `P`.
- `src/admin/api.ts` :
  - `apiUrl(path: string): string`, relatif à `document.baseURI` ;
  - `api<T>(method, path, body?): Promise<T>`, qui lève `ApiError { status: number; body: unknown }` et envoie toujours `X-Admin: 1` et `credentials: 'same-origin'` ;
  - `login(password: string, code: string): Promise<void>` ;
  - `logout(): Promise<void>` ;
  - `me(): Promise<boolean>` (`false` sur 404).
- `Shell` : en-tête avec monogramme LL et « Luca Leone · Atelier », navigation « Contenu » (active), « Statistiques » et « Messages » grisés avec la mention « bientôt », bouton « Publier » (inactif jusqu'à la tâche 14) et « Se déconnecter ». Sur téléphone, la navigation passe dans une barre en bas.
- `Login` : deux champs (mot de passe, code à 6 chiffres avec `inputmode="numeric"` et `autocomplete="one-time-code"`), messages d'erreur : « Mot de passe ou code incorrect. » / « Trop d'essais. Réessaie dans N min. »

- [ ] **Step 1 : tests qui échouent** (`handler.test.ts`, serveur `http` réel sur un port aléatoire, env de test avec un hash et un secret connus) :
  - sans `ADMIN_PATH` → `GET /atelier/` renvoie la 404 du site ;
  - `GET P/api/content` sans cookie → 404 avec le corps de la 404 du site ;
  - login avec un bon code → 204 et cookie `HttpOnly`, puis `GET P/api/me` → 204 ;
  - mauvais code ×5 → la 6e tentative renvoie 429 ;
  - `POST P/api/logout` sans `X-Admin` → 403 ;
  - chaque réponse sous `P` a `X-Robots-Tag` ;
  - `GET P/../dist/index.html` ne sort pas de `dist-admin`.
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** implémenter le handler et le brancher dans `server/index.ts` en premier dans la chaîne (`admin(req,res,() => analytics(...))`).
- [ ] **Step 4 :** implémenter le bundle admin. `admin.html` charge `/src/admin/main.tsx`, sans script inline. Le thème est appliqué au démarrage de `main.tsx` depuis `prefers-color-scheme`. `main.tsx` importe les polices fontsource et `src/index.css`. `vite.admin.config.ts` : `base: './'`, `build.outDir: 'dist-admin'`, `rollupOptions.input: 'admin.html'`, `copyPublicDir: false`.
- [ ] **Step 5 :** `npm test` → PASS. `npm run build` → `dist-admin/admin.html` existe, `dist/` ne contient ni `admin.html` ni chunk admin (`grep -rl "Atelier" dist/` → vide).
- [ ] **Step 6 : vérification manuelle.** `npm run admin:setup`, renseigner `.env` avec `ADMIN_PATH=/atelier-test`, `npm start`, ouvrir `http://localhost:3000/atelier-test/` à 390 px puis à 1280 px, en clair puis en sombre : connexion avec le code de l'app. `/atelier-test/api/content` dans un onglet privé renvoie la 404 du site.
- [ ] **Step 7 : commit** `Private admin behind ADMIN_PATH: password + one-time code login, every unauthenticated admin request gets the site's 404, noindex; admin UI is its own bundle (dist-admin), never part of the public site`

---

## Phase C — Brouillon et fichiers

### Task 7 : Brouillon côté serveur

**Files :**
- Create : `server/admin/draft.ts`, `tests/server/draft.test.ts`
- Modify : `server/admin/handler.ts` (routes contenu)

**Interfaces :**
- `type PageRef = 'site' | 'index' | \`project:${string}\``. Fichier correspondant dans le dépôt : `content/site.json`, `content/projects.json`, `content/projects/<id>.json` (`pageFile(ref): string`).
- `createDraftStore(deps: { repoRoot: string; dir: string /* DATA_DIR/admin/draft */ })` → objet (`type DraftStore = ReturnType<typeof createDraftStore>`) avec :
  - `read(): { content: Content; revisions: Record<PageRef, number>; changed: PageRef[]; baseCommit: string }`. Sans brouillon : le contenu du dépôt, `changed: []`.
  - `write(ref: PageRef, data: unknown, revision: number): { revision: number }`. Valide avec le schéma de la page. Lève `DraftError('invalid', issues)` ou `DraftError('stale')` si `revision` ≠ révision courante. Crée le brouillon au premier appel : copie du contenu du dépôt dans `dir`, et `base.json` = `{ commit: HEAD, hashes: { [file]: sha256 } }`.
  - `remove(id: string, revision: number)` : supprime le fichier projet du brouillon, le retire de `order` et de `hidden`.
  - `rename(from: string, to: string)` : `to` doit respecter `PROJECT_ID_RE`, ne pas exister et ne pas être une clé de `redirects`. Ajoute `redirects[from] = to` et réécrit les redirections qui pointaient vers `from` (`x→from` devient `x→to`). Met à jour `order` et `hidden`, et change le `id` du fichier.
  - `conflicts(): PageRef[]` : pages modifiées dans le brouillon (hash ≠ base) **et** dans le dépôt (hash actuel ≠ base).
  - `resolve(ref: PageRef, keep: 'draft' | 'repo')` : `repo` remplace la page du brouillon par celle du dépôt ; dans les deux cas, le hash de base de la page devient le hash actuel du dépôt.
  - `refreshUntouched()` : les pages que le brouillon ne modifie pas sont recopiées depuis le dépôt.
  - `applyTo(repoRoot)` : écrit les pages modifiées et supprime les fichiers des projets retirés.
  - `discard()`.
- Routes (handler) :
  - `GET P/api/content` → `read()` + `stale: { ref, path, fr }[]` et `missingEn: { ref, path }[]` (parcours des `Txt` avec `isStale` / `isMissingEn`, chemins en notation pointée, ex. `study.sections.2.content.0.text`) ;
  - `PUT P/api/content/<ref>` `{ data, revision }` → 200 `{ revision }` / 422 `{ issues }` / 409 `{ error: 'stale' }` ;
  - `DELETE P/api/content/project:<id>` ;
  - `POST P/api/content/project:<id>/rename` `{ to }` ;
  - `POST P/api/draft/discard`.

- [ ] **Step 1 : tests qui échouent** (`draft.test.ts`, dépôt temporaire avec `git init` et un `content/` minimal) :
  - lire sans brouillon renvoie le contenu du dépôt ;
  - `write('project:a', invalide)` → `invalid` ;
  - deux `write` avec la même révision → le second lève `stale` (Review Focus 1) ;
  - modifier `project:a` dans le brouillon **et** dans le dépôt → `conflicts()` = `['project:a']` ; modifier `project:b` seulement dans le dépôt → pas de conflit, et `refreshUntouched()` recopie b ;
  - `resolve('project:a','repo')` → la page du brouillon égale celle du dépôt et le conflit disparaît ;
  - `rename('a','b')` quand `b` existe → erreur ; `rename('a','hug-sangsationnel')` → erreur (clé de redirection) ; `rename('a','A b')` → erreur ; `rename('a','c')` puis `rename('c','d')` → `redirects` = `{ a: 'd', c: 'd' }` (Review Focus 5) ;
  - `applyTo` écrit uniquement les pages modifiées.
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** implémenter, avec des écritures atomiques (fichier temporaire puis `rename`).
- [ ] **Step 4 :** `npm test` → PASS.
- [ ] **Step 5 : commit** `Server-side draft of the content (DATA_DIR/admin/draft): per-page revisions against overwrites from another device, conflict detection against the repo, project rename with flattened redirects`

### Task 8 : Images, vidéos, PDF

**Files :**
- Create : `server/admin/uploads.ts`, `tests/server/uploads.test.ts`, `tests/fixtures/p3.png` (petite image en Display P3), `tests/fixtures/photo.jpg`
- Modify : `server/admin/handler.ts` (route upload), `package.json` (sharp)

**Interfaces :**
- `processUpload(input: { kind: 'image' | 'video' | 'pdf'; filename: string; body: Buffer; folder: string /* '' = public/images, 'case/hug', … */; stagingDir: string }): Promise<{ src: string; width?: number; height?: number }>`, qui lève `UploadError(message: string)` (message en français, prêt à afficher).
- Nom final : `<base slugifiée>-<8 hex du sha256 du contenu>.<ext>`. Une image remplacée change donc toujours de nom.
- **Images** (jpeg, png, webp, avif ; ≤ 25 Mo) :
  - `sharp(body).rotate()` (EXIF), puis conversion sRGB à partir du profil embarqué (`.toColorspace('srgb')` après `.withIccProfile` / `keepIccProfile` selon l'API de sharp 0.33) ;
  - largeur max 1920 px, WebP qualité 82 ;
  - si `folder === ''` (couvertures de cartes), variantes `sm/` (640 px, q76) et `md/` (1280 px, q78), comme `scripts/make-image-variants.py`.
- **Vidéos** : mp4 ou webm, ≤ 60 Mo, copiées telles quelles dans `public/videos/`.
- **PDF** : signature `%PDF-`, ≤ 10 Mo, dans `public/pdf/`.
- Fichiers écrits dans `stagingDir` (`DATA_DIR/admin/uploads/`) au chemin relatif de `public/`. La publication les copie (tâche 13).
- Route : `POST P/api/uploads?kind=…&folder=…&filename=…`, corps brut (pas de multipart) → 200 `{ src, width, height }` / 413 / 422 `{ error }`. Le serveur sert aussi les fichiers en attente sous `P/staged/<chemin public>`, et l'aperçu admin réécrit les `src` qui n'existent pas encore dans `public/` vers ce chemin.

- [ ] **Step 1 : tests qui échouent.**
  - **P3** : l'image P3 ressort en WebP, en sRGB (métadonnées sharp `space === 'srgb'`), et ses dimensions sont renvoyées.
  - **Variantes** : `folder ''` crée `images/sm/x-<hash>.webp` et `images/md/…`, `folder 'case/hug'` n'en crée pas.
  - **Nom** : deux contenus différents avec le même nom de fichier donnent deux `src` différents.
  - **Refus (Review Focus 4)** : un faux JPEG (octets aléatoires) et un `.heic` non lisible → `UploadError` avec « Format non pris en charge : exporte en JPEG ou PNG » ; un PDF sans signature est refusé ; une vidéo de 61 Mo est refusée (taille simulée).
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** implémenter. Le handler lit le corps avec une limite par type et coupe la connexion au-delà.
- [ ] **Step 4 :** `npm test` → PASS.
- [ ] **Step 5 : commit** `Admin uploads: images converted to sRGB WebP (1920 px, sm/md variants for card covers) under content-hashed names; videos and PDFs checked and kept as they are`

---

## Phase D — L'éditeur

### Task 9 : Store du brouillon côté client, liste des projets, nouveau projet

**Files :**
- Create : `src/admin/store.ts`, `src/admin/templates.ts`, `src/admin/pages/ProjectsList.tsx`, `tests/admin/store.test.ts`, `tests/admin/templates.test.ts`
- Modify : `src/admin/AdminApp.tsx` (routes client : `/` liste des projets, `/projets/<id>`, `/site/<onglet>`), `src/admin/api.ts`

**Interfaces :**
- `api.ts` ajoute :
  - `getContent(): Promise<ContentResponse>`
  - `savePage(ref: PageRef, data: unknown, revision: number, opts?: { keepalive?: boolean }): Promise<{ revision: number }>`
  - `deleteProject(id: string, revision: number)`
  - `renameProject(from: string, to: string)`
  - `upload(file: File, kind, folder): Promise<{ src: string; width?: number; height?: number }>`
  - `discardDraft()`
- `store.ts` : `createDraftClient(api, opts: { debounceMs: 800; retryMs: 3000 })` → `{ getState(); subscribe(fn); update(ref, updater: (draft) => void); flush(): Promise<void>; resumeAfterLogin(): Promise<void> }`, et le hook `useDraft()` qui l'expose.
  - L'état contient `content`, `revisions`, `stale`, `missingEn`, `saveState: 'saved' | 'saving' | 'offline' | 'conflict' | 'signedOut'` et `pending: Set<PageRef>`.
  - `update` applique immuablement (structuredClone + mutation de la copie), puis planifie l'enregistrement de la page.
  - En cas d'échec réseau : `offline` et nouvel essai toutes les 3 s. Sur 404 : `signedOut`, les modifications en attente sont gardées et renvoyées après `login`. Sur 409 : `conflict` pour la page.
  - Au `pagehide` et à `visibilitychange: hidden`, les pages en attente partent avec `keepalive`.
  - `stale` et `missingEn` sont recalculés côté client après chaque `update` (mêmes fonctions de parcours que le serveur, à mettre dans `src/content/txt.ts` : `walkTxt(value, path, fn)`).
- `templates.ts` : `newProject(id: string, name: string): StoredProject`.
  - Tous les `Txt` sont vides, `kind: 'school'`, `number` = prochain numéro sur 2 chiffres, `year` = année en cours.
  - Sections de l'étude : `idee` (« L'idée »), `resultats` (« Les résultats »), `retenu` (« Ce que je retiens »), chacune avec un bloc texte `[À COMPLÉTER]`.
  - `meta` : Contexte / Année / Durée / Mon rôle ; `brief` : Le problème / Ma réponse / Le résultat.
  - Ce sont les sections et rubriques communes aux six études de cas actuelles.
- `ProjectsList` :
  - cartes dans l'ordre de `index.order`, à réordonner par glisser (dnd-kit, poignée) et par flèches monter/descendre ;
  - interrupteur « Visible sur le site » (`hidden`), et pastille « FR seulement » si `!isEnglishReady` ;
  - « Nouveau projet » : nom → id proposé (slugifié et modifiable) → `newProject` → ouvre l'éditeur ;
  - « Changer l'adresse » dans un menu : champ prérempli avec l'id, aperçu de la nouvelle URL, appel à `renameProject`, et les erreurs de la tâche 7 affichées telles quelles ;
  - « Supprimer » dans le même menu, avec une confirmation qui demande de retaper le nom du projet.

- [ ] **Step 1 : tests qui échouent** (`store.test.ts`, faux `api` et horloge factice vitest) :
  - deux `update` en 500 ms → un seul `savePage` ;
  - `savePage` rejeté une fois (réseau) → `offline`, puis un nouvel essai 3 s plus tard qui passe → `saved` (Review Focus 2) ;
  - `savePage` → `ApiError(404)` : `signedOut`, `pending` garde la page, et après `resumeAfterLogin()` la page repart (Review Focus 3) ;
  - `ApiError(409)` → `conflict` ;
  - un événement `pagehide` appelle `savePage` avec `keepalive: true`.
  Et `templates.test.ts` : `StoredProjectSchema.parse(newProject('test','Test'))` passe, et les ids des sections valent `['idee','resultats','retenu']`.
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** implémenter le store, les templates et `ProjectsList`. L'indicateur d'enregistrement de la barre du haut affiche « Enregistré » / « Enregistrement… » / « Hors ligne, nouvel essai… » / « Modifié sur un autre appareil : Recharger ».
- [ ] **Step 4 :** `npm test` → PASS.
- [ ] **Step 5 : vérification manuelle** (dev, 390 px) : réordonner au doigt et aux flèches, masquer un projet, en créer un. Le brouillon survit à un rechargement, et un deuxième onglet voit le changement après rechargement.
- [ ] **Step 6 : commit** `Admin draft client (debounced autosave, retries offline, keeps edits through a sign-out, flushes on page hide) and the projects list: reorder, hide, create from the case study template, delete`

### Task 10 : Mode Structure (éditeur générique + blocs)

**Files :**
- Create : `src/admin/fields/FieldEditor.tsx`, `src/admin/fields/TxtField.tsx`, `src/admin/fields/ImageField.tsx`, `src/admin/structure/StructureView.tsx`, `src/admin/structure/BlockList.tsx`, `src/admin/structure/blockTemplates.ts`, `src/admin/pages/ProjectEditor.tsx`, `tests/admin/FieldEditor.test.tsx`, `tests/admin/blockTemplates.test.ts`

**Interfaces :**
- `FieldEditor({ schema: z.ZodTypeAny; value: unknown; onChange(v: unknown): void; lang: Language; path: string; selected?: string })` parcourt le schéma zod (v3, `_def.typeName`) :
  - `TxtSchema` (reconnu par identité) → `TxtField` ;
  - `ImageSchema` → `ImageField` ;
  - `ZodString` → champ texte (multi-ligne si `.describe` finit par `(long)`) ;
  - `ZodNumber` → champ numérique ;
  - `ZodBoolean` → interrupteur ;
  - `ZodEnum` → liste ;
  - `ZodOptional` → bouton « Ajouter <libellé> » / « Retirer » ;
  - `ZodArray` → liste avec ajout, suppression, monter et descendre ;
  - `ZodObject` → champs dans l'ordre du schéma ;
  - `ZodDiscriminatedUnion` → formulaire du type courant.
  Libellé = `.describe()`. Chaque champ porte `data-path={path}` pour la synchronisation avec le mode Page.
- `TxtField` :
  - en FR, modifie `fr` (via `setFr`) ;
  - en EN, affiche le français au-dessus en petit gris et modifie `en` (via `setEn`) ;
  - pastille « à revoir » si `isStale`, « manquant » si `isMissingEn` (EN uniquement).
- `ImageField` : vignette, « Remplacer » (input file `accept="image/*"`, qui ouvre la pellicule sur téléphone), largeur et hauteur en lecture seule, texte alternatif (Txt, obligatoire), légende, cadrage.
- `blockTemplates.ts` : `BLOCK_TYPES: { type: Block['type']; label: string /* « Texte », « Chiffres », « Étapes », « Avant / après », « Paire d'images », « Bande d'images », « Galerie », « Image », « Citation », « Vidéo », « Architecture », « Équipe » */ }[]` et `emptyBlock(type): Block`.
- `StructureView({ project, lang, selection, onSelect, onChange })` :
  - à gauche, la carte, le SEO, l'en-tête, le brief, puis les sections avec leurs blocs (`BlockList`, sortable dnd-kit + flèches, menu « + Ajouter un bloc ») ;
  - à droite, le `FieldEditor` de l'élément sélectionné ;
  - sous 768 px, le panneau de droite devient une feuille plein écran avec « ‹ Retour ».
- `ProjectEditor` : barre du haut avec le nom du projet, la bascule `Page | Structure` (la sélection est gardée, tâche 11), le sélecteur `FR | EN`, l'indicateur d'enregistrement, et le bandeau des règles d'écriture (repliable).
- Le SEO du projet affiche le nombre de caractères : vert si titre ≤ 60 et description entre 120 et 160, orange sinon.
- Pour les mots du Hero, alerte si un mot dépasse 23 caractères (longueur de « contenus engageants » + « en »), la limite qui garde la phrase sur une ligne.

- [ ] **Step 1 : tests qui échouent** (`FieldEditor.test.tsx`, Testing Library + jsdom) :
  - avec le schéma du bloc `figures` en FR, taper dans « Libellé » appelle `onChange` avec `items[0].label.fr` modifié et `enOf` inchangé ;
  - en EN, taper dans le même champ change `en` et met `enOf` à `hashFr(fr)` ;
  - un `Txt` périmé affiche « à revoir » ;
  - le bouton « Descendre » d'un tableau échange deux éléments ;
  - `ZodOptional` absent affiche « Ajouter Source ».
  Et `blockTemplates.test.ts` : pour chaque type, `BlockSchema.parse(emptyBlock(type))` passe, et `BLOCK_TYPES` couvre toutes les options de l'union.
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** implémenter.
- [ ] **Step 4 :** `npm test` → PASS.
- [ ] **Step 5 : vérification manuelle** (dev) : ouvrir HUG, réordonner deux blocs, changer les colonnes d'une galerie, ajouter un bloc Chiffres, passer en EN et voir « manquant » sur le nouveau bloc. À 390 px, la feuille de réglages s'ouvre et se ferme.
- [ ] **Step 6 : commit** `Structure mode: the project as sections of blocks to drag or move with arrows, every block edited through a form generated from the content schema, English shown next to its French with "to review" and "missing" badges`

### Task 11 : Mode Page (édition sur le rendu réel)

**Files :**
- Create : `src/content/edit.tsx`, `src/admin/page/PageView.tsx`, `src/admin/page/InlineEditor.tsx`, `tests/content/edit.test.tsx`, `tests/admin/PageView.test.tsx`
- Modify : `src/components/CaseStudy.tsx`, `src/components/ProjectCard.tsx`, `src/components/Hero.tsx`, `src/components/AboutSection.tsx`, `src/components/SkillsSection.tsx` (attributs d'édition et emplacements d'insertion)

**Interfaces :**
- `src/content/edit.tsx` :
  - `EditProvider({ value: { onInsert(sectionIdx: number, at: number): void } | null, children })` ;
  - `useEditAttrs(path: string): { 'data-edit'?: string }`, qui renvoie `{}` sans provider ;
  - `EditSlot({ section, at })`, qui ne rend rien sans provider et un bouton rond « + » en pointillés rouges avec provider.
  Les chemins sont ceux du `StoredProject` (`study.title`, `study.sections.2.content.1.items.0.label`, `card.hook`, …) ou du `Site` (`hero.outcomes.3`, `about.education.0.title`).
- Dans les composants publics, chaque texte et chaque image éditable reçoit `{...useEditAttrs(path)}`, et `CaseStudy` rend un `EditSlot` avant chaque élément de `content` et après le dernier. **En public (sans provider), le HTML ne change pas** : la comparaison de la tâche 3 doit toujours passer.
- `PageView({ page, lang, selection, onSelect, onEdit(path, value) })` (`page: PageRef`) :
  - rend les vrais composants (`CaseStudy` + `ProjectCard` pour un projet ; `Hero`, `AboutSection`, `SkillsSection` ou `ContactSection` pour le site) dans `ContentProvider value={draftContent}`, un routeur statique (comme `entry-server`) et `EditProvider` ;
  - pour un projet, utilise `toCaseStudy(p, lang, { keepIncomplete: true })` et réécrit les `src` en attente vers `P/staged/…` ;
  - les animations à l'entrée dans l'écran sont désactivées dans l'aperçu (`MotionConfig reducedMotion="always"`).
- `InlineEditor` :
  - un clic sur un élément `[data-edit]` dont la cible est un `Txt` ouvre, posé exactement sur l'élément (`getBoundingClientRect`, suivi au scroll), un `textarea` qui reprend sa typographie calculée (font, size, weight, line-height, letter-spacing, color) ;
  - chaque frappe appelle `onEdit` (`setFr` / `setEn` selon la langue) ; Échap ou un clic dehors ferme ;
  - un clic sur une image ouvre un popover `ImageField` ;
  - un clic sur un « + » ouvre le menu des types de blocs (`BLOCK_TYPES`) et insère `emptyBlock`.
- **Bascule Page ↔ Structure** : la sélection (chemin) est partagée. En passant en Structure, le bloc qui contient le chemin est sélectionné et défile dans la vue. En passant en Page, l'élément `[data-edit^=chemin]` défile au centre et clignote une fois en contour rouge.

- [ ] **Step 1 : tests qui échouent.**
  - `edit.test.tsx` : sans provider, `renderToString(<CaseStudy …/>)` ne contient ni `data-edit` ni bouton « + » ; avec provider, il contient `data-edit="study.title"` et un « + » par emplacement.
  - `PageView.test.tsx` : cliquer sur le titre puis taper « X » appelle `onEdit('study.title', …)` avec un `fr` qui finit par « X » ; en EN, un bloc sans anglais est rendu avec « ⟨à traduire⟩ ».
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** implémenter.
- [ ] **Step 4 :** `npm test` → PASS ; `npm run build` et la comparaison de la tâche 3 → aucun `DIFF`.
- [ ] **Step 5 : vérification manuelle** (dev) : sur HUG en mode Page, modifier le titre sur place, remplacer une image (le rendu se met à jour), ajouter un bloc par « + », basculer en Structure (le bon bloc est sélectionné) puis revenir. À 390 px, le `textarea` est lisible et ne déclenche pas le zoom iOS (au moins 16 px).
- [ ] **Step 6 : commit** `Page mode: the real case study rendered from the draft, text edited in place over the element with its own typography, images replaced on click, blocks inserted with "+"; public HTML unchanged`

### Task 12 : Hero, À propos, Compétences, Contact, SEO des pages

**Files :**
- Create : `src/admin/pages/SiteEditor.tsx`
- Modify : `src/admin/AdminApp.tsx`, `src/admin/Shell.tsx` (sous-navigation « Projets · Hero · À propos · Compétences · Contact · SEO »)

**Interfaces :**
- `SiteEditor({ tab: 'hero' | 'a-propos' | 'competences' | 'contact' | 'seo' })` reprend `PageView` et `StructureView` sur la page `'site'`, avec le sous-schéma de l'onglet (`SiteSchema.shape.hero`, …). Le mode Page n'existe pas pour `seo` (Structure seulement).
- Contact : le CV se remplace par `upload(kind: 'pdf')`, et `contact.cv` prend le nouveau `src`.
- SEO des pages : la description de `projets` affiche l'aperçu de `fillTemplate` (« Six projets… ») et rappelle que `{N}` et `{names}` sont remplacés tout seuls.

- [ ] **Step 1 : test qui échoue** (`tests/admin/SiteEditor.test.tsx`) : l'onglet Hero en Structure liste les 5 mots qui défilent et accepte d'en ajouter un sixième ; l'onglet Contact accepte le remplacement du CV (faux `upload`) et met `contact.cv` à jour.
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** implémenter.
- [ ] **Step 4 :** `npm test` → PASS.
- [ ] **Step 5 : vérification manuelle** : modifier la bio en mode Page et un mot du Hero, voir l'alerte au-delà de 23 caractères. À 390 px, tous les onglets sont accessibles.
- [ ] **Step 6 : commit** `Admin editors for the hero, about, skills, contact (CV replacement) and the fixed pages' SEO, with the same Page / Structure modes`

---

## Phase E — Publication

### Task 13 : Le pipeline de publication

**Files :**
- Create : `server/admin/git.ts`, `server/admin/publish.ts`, `tests/server/publish.test.ts`
- Modify : `server/admin/handler.ts` (routes publish), `vite.config.ts` (`build.outDir` = `process.env.BUILD_OUT_DIR ?? 'dist'` pour le build client), `scripts/prerender.mjs` (`dist` = `process.env.BUILD_OUT_DIR ?? 'dist'`), `server/index.ts` (`onPublished` → `reloadDist()`)

**Interfaces :**
- `git.ts` :
  - `type Run = (cmd: string, args: string[], opts: { cwd: string; env?: NodeJS.ProcessEnv }) => Promise<{ code: number; stdout: string; stderr: string }>` ;
  - `createGit(run: Run, repoRoot: string, env: { sshKey?: string; name: string; email: string })` (`type Git = ReturnType<typeof createGit>`) → `{ isClean(): Promise<boolean>; head(): Promise<string>; fetch(): Promise<void>; changedFiles(from: string, to: string): Promise<string[]>; fastForward(): Promise<void>; commitAll(paths: string[], message: string): Promise<void>; push(): Promise<'ok' | 'rejected'>; resetHard(ref: string): Promise<void> }`.
  - Avec `sshKey`, chaque commande reçoit `GIT_SSH_COMMAND="ssh -i <key> -o IdentitiesOnly=yes"`. L'identité passe par `-c user.name=… -c user.email=…`. Remote `origin`, branche `main`.
- `publish.ts` : `createPublisher(deps: { mode: 'git' | 'files'; repoRoot: string; draft: DraftStore; stagingDir: string; git: Git; build: () => Promise<{ ok: boolean; log: string }>; swap: () => void; onPublished: () => void })` → `{ start(): JobStatus; status(): JobStatus }`.
  - `JobStatus = { state: 'idle' | 'running' | 'done' | 'failed'; step?: 'pull' | 'check' | 'write' | 'build' | 'push' | 'swap'; error?: { code: 'busy' | 'dirty' | 'code-changed' | 'conflict' | 'build-failed' | 'push-rejected'; pages?: PageRef[]; files?: string[]; log?: string }; finishedAt?: string }`.
- **Étapes en mode `git`**, dans cet ordre :
  1. **pull** : `isClean` (sinon `dirty`), `fetch`, `changedFiles(HEAD, origin/main)` ∩ motifs protégés des Global Constraints (sinon `code-changed` avec `files`), `fastForward`.
  2. **check** : `draft.conflicts()` (sinon `conflict` avec `pages`), puis `draft.refreshUntouched()`.
  3. **write** : `draft.applyTo(repoRoot)`, puis copie dans `public/` des fichiers en attente référencés par le brouillon.
  4. **commit** : `commitAll(['content', 'public/images', 'public/videos', 'public/pdf'], 'Content: <libellés des pages>')`. Libellés : nom du projet, « site » ; ex. `Content: HUG, Karting de Vuiteboeuf, site`.
  5. **build** : `BUILD_OUT_DIR=dist-next npm run build:site` (en cas d'échec : `resetHard(ancien HEAD)`, suppression de `dist-next`, `build-failed` avec les 40 dernières lignes du log).
  6. **push** (`rejected` : `resetHard(ancien HEAD)`, suppression de `dist-next`, `push-rejected`).
  7. **swap** : `dist` → `dist-prev`, `dist-next` → `dist`, suppression de `dist-prev`, puis `onPublished()`, `draft.discard()` et vidage des fichiers en attente publiés.
- **Mode `files`** (dev) : **check**, puis **write** ; ni git ni build (Vite recharge tout seul).
- Un seul job à la fois (`busy`).
- Routes :
  - `GET P/api/publish` → `{ status, changed: { ref, label }[], stale, missingEn }` ;
  - `POST P/api/publish` → 202 `JobStatus` / 409 `busy` ;
  - `POST P/api/publish/resolve` `{ ref, keep }`.

- [ ] **Step 1 : tests qui échouent** (`publish.test.ts`, vrais dépôts git temporaires : un bare `remote.git` + un clone « serveur » + un clone « portable », et un `build` factice qui écrit `dist-next/index.html` ou échoue sur demande) :
  - cas nominal : le brouillon modifie `project:a` → commit poussé sur le remote avec le message `Content: A`, `dist/index.html` vient du nouveau build, `status().state === 'done'`, brouillon vidé ;
  - le « portable » pousse une modification de `server/index.ts` → `code-changed`, rien n'est commité ni poussé, `dist` inchangé ;
  - le « portable » pousse une modification de `content/projects/a.json` pendant que le brouillon touche aussi `a` → `conflict` avec `pages: ['project:a']` ;
  - le « portable » modifie `b` seulement → publication réussie, et le `b` du portable est conservé ;
  - build en échec → `build-failed`, `HEAD` du serveur = ancien HEAD, `dist` inchangé, brouillon conservé ;
  - push rejeté (le remote avance entre fetch et push, simulé par un hook `pre-receive` qui refuse) → `push-rejected`, `HEAD` = ancien, `dist` inchangé ;
  - fichier non commité dans le clone serveur → `dirty` ;
  - deux `start()` → le second renvoie `busy`.
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** implémenter. Dans `server/index.ts`, `reloadDist()` vide `compressedCache`, recalcule la CSP depuis le nouveau `dist/index.html` et recharge les redirections.
- [ ] **Step 4 :** `npm test` → PASS.
- [ ] **Step 5 : vérification locale de bout en bout.** Clone de travail dans `/tmp/claude-publish-e2e` avec un bare local comme `origin`, `ADMIN_PUBLISH_MODE=git`, `npm run build && npm start`. Modifier un titre dans l'admin, publier, puis vérifier que la page servie a changé **sans redémarrer** et que le bare contient le commit.
- [ ] **Step 6 : commit** `Publish: pull (refuses server or dependency changes and conflicting pages), write the draft, commit, build into dist-next, push, then swap dist with no restart; any failure leaves the live site and the repo as they were`

### Task 14 : L'écran « Publier »

**Files :**
- Create : `src/admin/publish/PublishPanel.tsx`, `tests/admin/PublishPanel.test.tsx`
- Modify : `src/admin/Shell.tsx` (bouton « Publier » avec le nombre de pages modifiées), `src/admin/api.ts` (`getPublish`, `startPublish`, `resolveConflict`)

**Interfaces :**
- `PublishPanel` (feuille latérale, plein écran sur téléphone). Ouvrir le panneau fait d'abord un `store.flush()`.
- **Avant publication :**
  - la liste des pages modifiées ;
  - si `stale` ou `missingEn` n'est pas vide, l'encadré « N textes anglais pas à jour » avec la liste des textes, chacun cliquable (ouvre la page, en EN, sur le bon chemin), et le bouton « Publier quand même » ;
  - sinon, « Publier ».
  - Un projet sans anglais complet affiche aussi : « Ce projet n'apparaîtra que sur le site français. »
- **Pendant :** les étapes avec libellés FR : Récupération des changements, Vérification, Écriture, Construction du site (≈ 1 min), Envoi sur GitHub, Mise en ligne. Interrogation de `GET P/api/publish` toutes les 1,5 s.
- **Erreurs** (copie exacte) :
  - `code-changed` : « Du code a changé sur GitHub (fichiers : …). Redéploie le site à la main, puis publie. »
  - `conflict` : « Ces pages ont aussi été modifiées ailleurs : » + pour chaque page « Garder mon brouillon » / « Garder la version du dépôt » (`resolveConflict`), puis « Publier » à nouveau.
  - `build-failed` : « La construction du site a échoué. Le site en ligne n'a pas changé. » + log repliable.
  - `push-rejected` : « GitHub a refusé l'envoi. Le site en ligne n'a pas changé. Réessaie. »
  - `dirty` : « Le dossier du site sur le serveur contient des modifications non commitées. »
- **Succès :** « C'est en ligne. » + liens vers les pages publiques modifiées.

- [ ] **Step 1 : tests qui échouent** (faux `api`) :
  - avec 2 textes `stale`, « Publier quand même » est présent et un clic sur un texte navigue vers `/projets/hug?lang=en&path=…` ;
  - `flush` est appelé avant `getPublish` ;
  - l'erreur `conflict` affiche les deux boutons par page, et « Garder la version du dépôt » appelle `resolveConflict('project:hug','repo')` ;
  - l'erreur `build-failed` affiche la phrase exacte.
- [ ] **Step 2 :** `npm test` → FAIL.
- [ ] **Step 3 :** implémenter.
- [ ] **Step 4 :** `npm test` → PASS.
- [ ] **Step 5 : commit** `Publish panel: what changed, out-of-date English listed and linked before publishing, live progress, conflict resolution page by page, plain-French errors`

### Task 15 : Documentation et vérification finale

**Files :**
- Modify : `README.md` (sections « Dashboard admin » : mise en place sur Infomaniak, `npm run admin:setup`, clé de déploiement GitHub en écriture, `git remote set-url origin git@github.com:lucaleone15/portfolio.git`, `ADMIN_GIT_SSH_KEY`, variables ; « Modifier le contenu » réécrit autour de `content/` ; « Structure du projet » ; la mention « Six projets » de l'aperçu remplacée), `.env.example`

- [ ] **Step 1 :** rédiger le README (en français, dans le ton du README actuel).
- [ ] **Step 2 :** `npm test && npm run lint && npm run build` → tout passe. Puis la comparaison HTML de la tâche 3 contre `/tmp/claude-dist-before` → aucun `DIFF` hors `lastmod`.
- [ ] **Step 3 :** parcours complet en local, à 390 px puis à 1280 px, en clair puis en sombre : connexion ; nouveau projet de A à Z avec une image depuis un fichier ; anglais laissé vide → avertissement → publication ; projet visible sur `/projets/<id>` et absent de `/en/projects` ; masquer un projet ; renommer → l'ancienne URL redirige en 301.
- [ ] **Step 4 : commit** `README: the admin dashboard (setup on Infomaniak, GitHub deploy key, publishing) and editing content in content/`
