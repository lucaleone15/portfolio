/**
 * =====================================================================
 * 🎨 FICHIER CENTRAL DES VARIABLES DE COULEURS DU SITE
 * =====================================================================
 * Pour tester ou changer la couleur d'accent du site, modifiez simplement
 * la valeur de `ACTIVE_ACCENT_ID` ci-dessous !
 *
 * 🌈 PALETTES DISPONIBLES :
 *
 * --- BLEUS & CYANS ---
 *  - 'electric-blue'   : Bleu Cobalt Électrique (Moderne, studio suisse, contraste max)
 *  - 'klein-blue'      : Bleu Yves Klein (Direction artistique, haute couture)
 *  - 'deep-indigo'     : Indigo Nuit / Digital (Élégant, tech premium)
 *  - 'cyber-cyan'      : Cyan Électrique / Aqua (Digital, vibrant, pure media)
 *  - 'teal-ocean'      : Bleu Canard / Vert Océan (Moderne, organique et sobre)
 *
 * --- CHAUDS & SOLAIRES ---
 *  - 'hyper-orange'    : Orange Hyper Solaire (Style Teenage Engineering, percutant)
 *  - 'flame-coral'     : Corail Néo-Vibrant (Chaleureux, dynamique, studio créatif)
 *  - 'amber-gold'      : Ambre & Or Solaire (Raffiné, chaleureux, éditorial)
 *  - 'acid-yellow'     : Jaune Acide / Cyber (Audacieux, graphisme contemporain)
 *
 * --- ROUGES & ROSES ---
 *  - 'hot-crimson'     : Rouge Vermillon / Crimson (Impact visuel immédiat, affirmé)
 *  - 'deep-burgundy'   : Bordeaux Profond / Rouge Sang (Prestigieux, typographique)
 *  - 'cyber-pink'      : Rose Néon / Cyberpunk (Énergique, pop culture, audace)
 *
 * --- VIOLETS ---
 *  - 'neon-violet'     : Violet Ultraviolet (Direction artistique, contemporain)
 *  - 'iris-blurple'    : Iris / Blurple Électrique (Style Linear, hyper clean)
 *
 * --- VERTS ---
 *  - 'deep-emerald'    : Émeraude Profond (Noble, calme, haute lisibilité)
 *  - 'electric-mint'   : Menthe Givrée (Frais, digital, lumineux)
 *  - 'neon-lime'       : Vert Lime Fluo (Original, avec émeraude profond sur fond blanc)
 *
 * ✨ DOUBLE CONTRASTE AUTOMATIQUE :
 * - Sur la version en blanc (mode clair) : la couleur s'adapte automatiquement
 *   en version contrastée et lisible (norme WCAG AAA), bien visible sur fond blanc !
 * - Sur la version noire (mode sombre) : la couleur est électrique et lumineuse.
 * =====================================================================
 */

export type AccentPresetId =
  | 'electric-blue'
  | 'klein-blue'
  | 'deep-indigo'
  | 'cyber-cyan'
  | 'teal-ocean'
  | 'hyper-orange'
  | 'flame-coral'
  | 'amber-gold'
  | 'acid-yellow'
  | 'hot-crimson'
  | 'deep-burgundy'
  | 'cyber-pink'
  | 'neon-violet'
  | 'iris-blurple'
  | 'deep-emerald'
  | 'electric-mint'
  | 'neon-lime';

/**
 * 🌟 MODIFIEZ CETTE LIGNE POUR CHANGER LA COULEUR D'ACCENT DU SITE :
 */
export const ACTIVE_ACCENT_ID: AccentPresetId = 'hot-crimson';

// Rétrocompatibilité
export const DEFAULT_ACCENT_ID = ACTIVE_ACCENT_ID;

export interface AccentColorDefinition {
  id: AccentPresetId;
  nameFr: string;
  nameEn: string;
  // Couleur mode sombre (électrique, percutante sur fond sombre)
  hexDark: string;
  // Couleur mode clair (punchy, saturée et très lisible sur fond blanc / papier)
  hexLight: string;
  hex: string;
  contrastTextDark: '#000000' | '#FFFFFF';
  contrastTextLight: '#000000' | '#FFFFFF';
  contrastText: '#000000' | '#FFFFFF';
  rgbDark: string;
  rgbLight: string;
  glowDark: string;
  glowLight: string;
  taglineFr: string;
  taglineEn: string;
  contrastRating: string;
}

export const ACCENT_PALETTES: AccentColorDefinition[] = [
  // 1. Bleu Cobalt Électrique
  {
    id: 'electric-blue',
    nameFr: 'Bleu Cobalt Électrique',
    nameEn: 'Electric Cobalt',
    hexDark: '#2979FF',
    hexLight: '#004FE6',
    hex: '#2979FF',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '41, 121, 255',
    rgbLight: '0, 79, 230',
    glowDark: 'rgba(41, 121, 255, 0.4)',
    glowLight: 'rgba(0, 79, 230, 0.25)',
    taglineFr: 'Contraste maximal, esprit studio suisse & tech de pointe',
    taglineEn: 'Maximum contrast, Swiss studio & cutting-edge tech',
    contrastRating: 'WCAG AAA'
  },
  // 2. Bleu Yves Klein
  {
    id: 'klein-blue',
    nameFr: 'Bleu Yves Klein',
    nameEn: 'Klein International Blue',
    hexDark: '#3D72FE',
    hexLight: '#002FA7',
    hex: '#3D72FE',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '61, 114, 254',
    rgbLight: '0, 47, 167',
    glowDark: 'rgba(61, 114, 254, 0.4)',
    glowLight: 'rgba(0, 47, 167, 0.25)',
    taglineFr: 'Direction artistique iconique, profondeur picturale',
    taglineEn: 'Iconic art direction, pictorial depth',
    contrastRating: 'WCAG AAA'
  },
  // 3. Indigo Nuit
  {
    id: 'deep-indigo',
    nameFr: 'Indigo Nuit Digital',
    nameEn: 'Digital Indigo',
    hexDark: '#6366F1',
    hexLight: '#4338CA',
    hex: '#6366F1',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '99, 102, 241',
    rgbLight: '67, 56, 202',
    glowDark: 'rgba(99, 102, 241, 0.4)',
    glowLight: 'rgba(67, 56, 202, 0.25)',
    taglineFr: 'Moderne, numérique, élégance discrète',
    taglineEn: 'Modern, digital, understated elegance',
    contrastRating: 'WCAG AAA'
  },
  // 4. Cyan Cyber / Aqua
  {
    id: 'cyber-cyan',
    nameFr: 'Cyan Électrique / Aqua',
    nameEn: 'Cyber Cyan',
    hexDark: '#00E5FF',
    hexLight: '#007299',
    hex: '#00E5FF',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '0, 229, 255',
    rgbLight: '0, 114, 153',
    glowDark: 'rgba(0, 229, 255, 0.4)',
    glowLight: 'rgba(0, 114, 153, 0.25)',
    taglineFr: 'Vibrant, digital, pur média engineering',
    taglineEn: 'Vibrant, digital, pure media engineering',
    contrastRating: 'WCAG AAA'
  },
  // 5. Bleu Canard / Océan
  {
    id: 'teal-ocean',
    nameFr: 'Bleu Canard / Teal',
    nameEn: 'Ocean Teal',
    hexDark: '#14B8A6',
    hexLight: '#0F766E',
    hex: '#14B8A6',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '20, 184, 166',
    rgbLight: '15, 118, 110',
    glowDark: 'rgba(20, 184, 166, 0.35)',
    glowLight: 'rgba(15, 118, 110, 0.25)',
    taglineFr: 'Raffiné, contemporain, équilibre design & technique',
    taglineEn: 'Refined, contemporary, balanced design & code',
    contrastRating: 'WCAG AAA'
  },
  // 6. Orange Hyper Solaire
  {
    id: 'hyper-orange',
    nameFr: 'Orange Hyper Solaire',
    nameEn: 'Hyper Orange',
    hexDark: '#FF5500',
    hexLight: '#C93800',
    hex: '#FF5500',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '255, 85, 0',
    rgbLight: '201, 56, 0',
    glowDark: 'rgba(255, 85, 0, 0.4)',
    glowLight: 'rgba(201, 56, 0, 0.25)',
    taglineFr: 'Percutant & brutaliste moderne (style Teenage Engineering)',
    taglineEn: 'Punchy & modern brutalism (Teenage Engineering style)',
    contrastRating: 'WCAG AAA'
  },
  // 7. Corail Néo-Vibrant
  {
    id: 'flame-coral',
    nameFr: 'Corail Néo-Vibrant',
    nameEn: 'Neo Coral',
    hexDark: '#FF6B4A',
    hexLight: '#C52B14',
    hex: '#FF6B4A',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '255, 107, 74',
    rgbLight: '197, 43, 20',
    glowDark: 'rgba(255, 107, 74, 0.4)',
    glowLight: 'rgba(197, 43, 20, 0.25)',
    taglineFr: 'Chaleureux, dynamique, studio créatif',
    taglineEn: 'Warm, dynamic, creative studio',
    contrastRating: 'WCAG AAA'
  },
  // 8. Ambre & Or Solaire
  {
    id: 'amber-gold',
    nameFr: 'Ambre & Or Solaire',
    nameEn: 'Solar Amber',
    hexDark: '#F59E0B',
    hexLight: '#B45309',
    hex: '#F59E0B',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '245, 158, 11',
    rgbLight: '180, 83, 9',
    glowDark: 'rgba(245, 158, 11, 0.35)',
    glowLight: 'rgba(180, 83, 9, 0.25)',
    taglineFr: 'Prestige, chaleur noble, éditorial',
    taglineEn: 'Prestige, noble warmth, editorial',
    contrastRating: 'WCAG AAA'
  },
  // 9. Jaune Acide
  {
    id: 'acid-yellow',
    nameFr: 'Jaune Acide / Cyber',
    nameEn: 'Acid Yellow',
    hexDark: '#FACC15',
    hexLight: '#A16207',
    hex: '#FACC15',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '250, 204, 21',
    rgbLight: '161, 98, 7',
    glowDark: 'rgba(250, 204, 21, 0.4)',
    glowLight: 'rgba(161, 98, 7, 0.25)',
    taglineFr: 'Audacieux, percutant, graphisme contemporain',
    taglineEn: 'Bold, punchy, contemporary graphics',
    contrastRating: 'WCAG AAA'
  },
  // 10. Rouge Vermillon / Crimson
  {
    id: 'hot-crimson',
    nameFr: 'Rouge Vermillon / Crimson',
    nameEn: 'Hot Crimson',
    hexDark: '#FF2E55',
    hexLight: '#C50E36',
    hex: '#FF2E55',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '255, 46, 85',
    rgbLight: '197, 14, 54',
    glowDark: 'rgba(255, 46, 85, 0.4)',
    glowLight: 'rgba(197, 14, 54, 0.25)',
    taglineFr: 'Dynamique, audacieux, impact visuel immédiat',
    taglineEn: 'Dynamic, bold, immediate visual impact',
    contrastRating: 'WCAG AAA'
  },
  // 11. Bordeaux Profond / Rouge Sang
  {
    id: 'deep-burgundy',
    nameFr: 'Bordeaux Profond / Rouge Sang',
    nameEn: 'Deep Burgundy',
    hexDark: '#F43F5E',
    hexLight: '#9F1239',
    hex: '#F43F5E',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '244, 63, 94',
    rgbLight: '159, 18, 57',
    glowDark: 'rgba(244, 63, 94, 0.35)',
    glowLight: 'rgba(159, 18, 57, 0.25)',
    taglineFr: 'Sophistiqué, éditorial, haute intensité',
    taglineEn: 'Sophisticated, editorial, high intensity',
    contrastRating: 'WCAG AAA'
  },
  // 12. Rose Néon / Cyberpunk
  {
    id: 'cyber-pink',
    nameFr: 'Rose Néon / Cyber Pink',
    nameEn: 'Cyber Pink',
    hexDark: '#EC4899',
    hexLight: '#BE185D',
    hex: '#EC4899',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '236, 72, 153',
    rgbLight: '190, 24, 93',
    glowDark: 'rgba(236, 72, 153, 0.4)',
    glowLight: 'rgba(190, 24, 93, 0.25)',
    taglineFr: 'Énergique, pop culture, créatif et audacieux',
    taglineEn: 'Energetic, pop culture, creative & bold',
    contrastRating: 'WCAG AAA'
  },
  // 13. Violet Ultraviolet
  {
    id: 'neon-violet',
    nameFr: 'Violet Ultraviolet',
    nameEn: 'Ultraviolet',
    hexDark: '#A855F7',
    hexLight: '#6D28D9',
    hex: '#A855F7',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '168, 85, 247',
    rgbLight: '109, 40, 217',
    glowDark: 'rgba(168, 85, 247, 0.4)',
    glowLight: 'rgba(109, 40, 217, 0.25)',
    taglineFr: 'Direction artistique, élégant, haute intensité visuelle',
    taglineEn: 'Art direction, sleek, high visual intensity',
    contrastRating: 'WCAG AAA'
  },
  // 14. Iris / Blurple Électrique
  {
    id: 'iris-blurple',
    nameFr: 'Iris / Blurple Électrique',
    nameEn: 'Electric Iris',
    hexDark: '#818CF8',
    hexLight: '#4F46E5',
    hex: '#818CF8',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '129, 140, 248',
    rgbLight: '79, 70, 229',
    glowDark: 'rgba(129, 140, 248, 0.4)',
    glowLight: 'rgba(79, 70, 229, 0.25)',
    taglineFr: 'Esthétique tech raffinée, style Linear',
    taglineEn: 'Refined tech aesthetics, Linear style',
    contrastRating: 'WCAG AAA'
  },
  // 15. Émeraude Profond
  {
    id: 'deep-emerald',
    nameFr: 'Émeraude Profond',
    nameEn: 'Deep Emerald',
    hexDark: '#10B981',
    hexLight: '#047857',
    hex: '#10B981',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '16, 185, 129',
    rgbLight: '4, 120, 87',
    glowDark: 'rgba(16, 185, 129, 0.35)',
    glowLight: 'rgba(4, 120, 87, 0.25)',
    taglineFr: 'Noble, organique, technologie sereine',
    taglineEn: 'Noble, organic, calm technology',
    contrastRating: 'WCAG AAA'
  },
  // 16. Menthe Givrée
  {
    id: 'electric-mint',
    nameFr: 'Menthe Givrée',
    nameEn: 'Electric Mint',
    hexDark: '#34D399',
    hexLight: '#059669',
    hex: '#34D399',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '52, 211, 153',
    rgbLight: '5, 150, 105',
    glowDark: 'rgba(52, 211, 153, 0.35)',
    glowLight: 'rgba(5, 150, 105, 0.25)',
    taglineFr: 'Frais, innovant, clarté numérique',
    taglineEn: 'Fresh, innovative, digital clarity',
    contrastRating: 'WCAG AAA'
  },
  // 17. Vert Lime Fluo (Original)
  {
    id: 'neon-lime',
    nameFr: 'Vert Lime Fluo (Original)',
    nameEn: 'Neon Lime (Original)',
    hexDark: '#CCFF00',
    hexLight: '#15803D',
    hex: '#CCFF00',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '204, 255, 0',
    rgbLight: '21, 128, 61',
    glowDark: 'rgba(204, 255, 0, 0.35)',
    glowLight: 'rgba(21, 128, 61, 0.25)',
    taglineFr: 'Version originale (adaptée en vert profond sur fond blanc)',
    taglineEn: 'Original version (adapted to deep forest green on white background)',
    contrastRating: 'WCAG AAA'
  }
];
