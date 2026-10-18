import { z } from 'zod';

/**
 * The site's content as stored in content/ (one structure for both languages; every text a
 * reader sees is a Txt). The admin validates drafts against these schemas and builds its forms
 * from them: each field's `.describe()` is its label in the editor.
 * Runtime shapes used by the components (Project, CaseStudy…) come from src/content/localize.ts.
 */

export const TxtSchema = z.object({ fr: z.string(), en: z.string(), enOf: z.string().optional() });
export type { Txt } from './txt';

const txt = (label: string) => TxtSchema.describe(label);
const str = (label: string) => z.string().describe(label);

export const PROJECT_ID_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export const ImageSchema = z
  .object({
    src: str('Fichier'),
    width: z.number().int().positive().describe('Largeur'),
    height: z.number().int().positive().describe('Hauteur'),
    alt: txt('Texte alternatif'),
    caption: txt('Légende').optional(),
    fit: z.enum(['cover', 'contain']).describe('Cadrage').optional(),
  })
  .describe('Image');
export type StoredImage = z.infer<typeof ImageSchema>;

const FigureSchema = z
  .object({
    value: z.number().describe('Valeur'),
    prefix: txt('Préfixe').optional(),
    suffix: txt('Suffixe').optional(),
    label: txt('Libellé'),
  })
  .describe('Chiffre');

const StepSchema = z.object({ text: txt('Texte (long)'), image: ImageSchema }).describe('Étape');

export const BlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('text'), text: txt('Paragraphe (long)') }).describe('Texte'),
  z
    .object({ type: z.literal('figures'), items: z.array(FigureSchema).describe('Chiffres'), source: txt('Source').optional() })
    .describe('Chiffres'),
  z
    .object({
      type: z.literal('steps'),
      steps: z.array(StepSchema).describe('Étapes'),
      frame: z.enum(['screen', 'plain', 'mockup']).describe('Cadre').optional(),
    })
    .describe('Étapes'),
  z
    .object({
      type: z.literal('compare'),
      before: ImageSchema.describe('Avant'),
      after: ImageSchema.describe('Après'),
      beforeLabel: txt('Libellé avant'),
      afterLabel: txt('Libellé après'),
      caption: txt('Légende'),
    })
    .describe('Avant / après'),
  z
    .object({ type: z.literal('pair'), items: z.tuple([ImageSchema, ImageSchema]).describe('Images'), caption: txt('Légende') })
    .describe("Paire d'images"),
  z.object({ type: z.literal('strip'), items: z.array(ImageSchema).describe('Images') }).describe("Bande d'images"),
  z
    .object({
      type: z.literal('gallery'),
      items: z.array(ImageSchema).describe('Images'),
      cols: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]).describe('Colonnes').optional(),
      boxed: z.boolean().describe('Encadrée').optional(),
      narrow: z.boolean().describe('Étroite').optional(),
      caption: txt('Légende').optional(),
    })
    .describe('Galerie'),
  z.object({ type: z.literal('image'), image: ImageSchema, href: str('Lien').optional() }).describe('Image'),
  z.object({ type: z.literal('quote'), text: txt('Citation (long)'), source: txt('Source') }).describe('Citation'),
  z
    .object({
      type: z.literal('video'),
      src: str('Fichier vidéo'),
      poster: str("Image d'aperçu"),
      width: z.number().int().positive().describe('Largeur'),
      height: z.number().int().positive().describe('Hauteur'),
      caption: txt('Légende'),
    })
    .describe('Vidéo'),
  z
    .object({
      type: z.literal('architecture'),
      nodes: z
        .array(
          z
            .object({ title: txt('Titre'), sub: txt('Sous-titre'), note: txt('Note'), highlight: z.boolean().describe('Mis en avant').optional() })
            .describe('Élément'),
        )
        .describe('Éléments'),
      links: z.array(txt('Liaison')).describe('Liaisons'),
      caption: txt('Légende'),
    })
    .describe('Architecture'),
  z
    .object({
      type: z.literal('team'),
      members: z
        .array(z.object({ name: str('Nom'), role: txt('Rôle'), me: z.boolean().describe("C'est moi").optional() }).describe('Membre'))
        .describe('Membres'),
    })
    .describe('Équipe'),
]);
export type Block = z.infer<typeof BlockSchema>;

export const SectionSchema = z
  .object({
    id: str('Identifiant (ancre)'),
    nav: txt('Libellé du sommaire'),
    title: txt('Titre'),
    tone: z.enum(['accent']).describe('Bandeau en couleur du projet').optional(),
    content: z.array(BlockSchema).describe('Blocs'),
  })
  .describe('Section');
export type StoredSection = z.infer<typeof SectionSchema>;

export const StudySchema = z
  .object({
    kicker: txt('Surtitre'),
    title: txt('Titre'),
    hook: txt('Accroche'),
    intro: txt('Introduction (long)'),
    meta: z.array(z.object({ label: txt('Libellé'), value: txt('Valeur') }).describe('Info')).describe('Infos clés'),
    hero: ImageSchema.describe('Visuel principal').optional(),
    links: z.array(z.object({ label: txt('Libellé'), href: str('Adresse') }).describe('Lien')).describe('Liens publics').optional(),
    brief: z.array(z.object({ label: txt('Libellé'), text: txt('Texte (long)') }).describe('Point')).describe('Brief'),
    sections: z.array(SectionSchema).describe('Sections'),
    credits: z.array(z.object({ name: str('Nom'), role: txt('Rôle') }).describe('Crédit')).describe('Crédits'),
    creditsNote: txt('Note sous les crédits').optional(),
  })
  .describe('Étude de cas');
export type StoredStudy = z.infer<typeof StudySchema>;

const LogoSchema = z
  .object({
    src: str('Logo (thème clair)'),
    srcDark: str('Logo (thème sombre)'),
    width: z.number().int().positive().describe('Largeur'),
    height: z.number().int().positive().describe('Hauteur'),
    display: z.number().positive().describe('Hauteur affichée sur la carte (px)'),
  })
  .describe('Logo');

export const StoredProjectSchema = z
  .object({
    id: z.string().regex(PROJECT_ID_RE).describe('Adresse (slug)'),
    kind: z.enum(['pro', 'school-client', 'school']).describe('Type de projet'),
    name: str('Nom'),
    number: str('Numéro'),
    year: str('Année'),
    imageUrl: str('Couverture'),
    stack: z.array(txt('Outil')).describe('Outils'),
    accentColor: str('Couleur du projet').optional(),
    accentColorDark: str('Couleur du projet (thème sombre)').optional(),
    logo: LogoSchema.optional(),
    video: str('Vidéo au survol').optional(),
    card: z
      .object({
        subtitle: txt('Sous-titre'),
        category: txt('Catégorie'),
        hook: txt("Accroche sur l'image").optional(),
        badge: txt('Mon rôle (badge)').optional(),
        summary: txt('Résumé (long)'),
        overview: txt('Aperçu (long)'),
      })
      .describe("Carte de l'accueil"),
    seo: z
      .object({
        title: txt('Titre SEO'),
        description: txt('Description SEO'),
        llms: str('Fiche pour les IA, en français (llms.txt) (long)').optional(),
      })
      .describe('Référencement'),
    study: StudySchema,
  })
  .describe('Projet');
export type StoredProject = z.infer<typeof StoredProjectSchema>;

export const ProjectsIndexSchema = z.object({
  order: z.array(z.string()),
  hidden: z.array(z.string()),
  redirects: z.record(z.string(), z.string()),
});
export type ProjectsIndex = z.infer<typeof ProjectsIndexSchema>;

const SeoSchema = z.object({ title: txt('Titre SEO'), description: txt('Description SEO') });
export const SITE_PAGES = ['home', 'projets', 'a-propos', 'contact', 'privacy', 'notfound'] as const;

export const SiteSchema = z.object({
  contact: z
    .object({ name: str('Nom'), email: str('Email'), phone: str('Téléphone'), linkedin: str('LinkedIn'), cv: str('CV (PDF)') })
    .describe('Contact'),
  hero: z
    .object({
      eyebrow: txt('Ligne au-dessus du titre'),
      headline: z
        .object({ before: txt('Début du titre'), accent: txt('Mot en couleur'), joiner: txt('Liaison avant les mots qui défilent') })
        .describe('Titre'),
      outcomes: z.array(txt('Mot')).describe('Mots qui défilent'),
      lead: txt('Phrase sous le titre (long)'),
      availability: z
        .object({ before: txt('Avant le lien'), link: txt('Texte du lien'), after: txt('Après le lien') })
        .describe('Disponibilité'),
    })
    .describe('Hero'),
  about: z
    .object({
      bio: txt('Bio (long)'),
      languages: z.array(z.object({ name: txt('Langue'), level: txt('Niveau') }).describe('Langue')).describe('Langues'),
      passions: z.array(txt('Centre d’intérêt')).describe('Centres d’intérêt'),
      education: z
        .array(
          z
            .object({ period: txt('Période'), title: txt('Titre'), institution: str('École'), location: txt('Lieu'), details: txt('Détails (long)') })
            .describe('Formation'),
        )
        .describe('Formation'),
      experience: z
        .array(
          z
            .object({ period: txt('Période'), title: txt('Poste'), company: str('Entreprise'), location: txt('Lieu'), description: txt('Description (long)') })
            .describe('Expérience'),
        )
        .describe('Expériences'),
    })
    .describe('À propos'),
  skills: z
    .array(
      z
        .object({ id: str('Identifiant'), number: str('Numéro'), title: txt('Titre'), desc: txt('Description (long)'), tools: z.array(txt('Outil')).describe('Outils') })
        .describe('Compétence'),
    )
    .describe('Compétences'),
  seo: z.object(Object.fromEntries(SITE_PAGES.map((p) => [p, SeoSchema])) as Record<(typeof SITE_PAGES)[number], typeof SeoSchema>).describe('SEO des pages'),
});
export type Site = z.infer<typeof SiteSchema>;

export const ContentSchema = z.object({
  site: SiteSchema,
  index: ProjectsIndexSchema,
  projects: z.record(z.string(), StoredProjectSchema),
});
export type Content = z.infer<typeof ContentSchema>;
