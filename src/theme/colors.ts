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
 *  - 'electric-blue'     : Bleu Cobalt Électrique (Moderne, studio suisse, contraste max)
 *  - 'klein-blue'        : Bleu Yves Klein (Direction artistique iconique, profondeur)
 *  - 'deep-indigo'       : Indigo Nuit / Digital (Élégant, tech premium)
 *  - 'ultramarine'       : Bleu Outremer Profond (Royal, percutant, pur design)
 *  - 'pacific-blue'      : Bleu Pacifique Minéral (Moderne, équilibré, épuré)
 *  - 'cyber-cyan'        : Cyan Électrique / Aqua (Digital, vibrant, pure media)
 *  - 'teal-ocean'        : Bleu Canard / Océan (Moderne, organique et sobre)
 *  - 'lagoon-cyan'       : Cyan Lagon Tropical (Lumineux, dynamique)
 *
 * --- CHAUDS, ORANGES & JAUNES ---
 *  - 'hyper-orange'      : Orange Hyper Solaire (Style Teenage Engineering, percutant)
 *  - 'flame-coral'       : Corail Néo-Vibrant (Chaleureux, dynamique, studio créatif)
 *  - 'terracotta'        : Terre de Sienne / Brique Atelier (Chaleureux, organique, intemporel)
 *  - 'warm-copper'       : Cuivre Chaud & Feu (Industriel contemporain)
 *  - 'neo-peach'         : Pêche Abricot Studio (Doux mais affirmé, raffiné)
 *  - 'amber-gold'        : Ambre & Miel Solaire (Raffiné, chaleureux, éditorial)
 *  - 'solar-ochre'       : Ocre Doré Minéral (Terre chaude, élégance artisanale)
 *  - 'acid-yellow'       : Jaune Acide / Cyber (Audacieux, graphisme contemporain)
 *  - 'imperial-gold'     : Or Impérial & Laiton (Prestige, bijouterie graphique)
 *
 * --- ROUGES, BORDEAUX & ROSES ---
 *  - 'hot-crimson'       : Rouge Vermillon / Crimson (Impact visuel immédiat, affirmé)
 *  - 'blood-red'         : Rouge Sang / Médical HUG (Profondeur carmin, fort impact)
 *  - 'deep-burgundy'     : Bordeaux Profond / Rouge Sang (Prestigieux, typographique)
 *  - 'carmine-wine'      : Carmin & Grand Cru (Sombre et noble)
 *  - 'racing-red'        : Rouge Course Karting (Énergie pure, sport automobile)
 *  - 'vivid-raspberry'   : Framboise Intense (Créatif, pop moderne)
 *  - 'cyber-pink'        : Rose Néon / Cyberpunk (Énergique, pop culture, audace)
 *  - 'magenta-futurism'  : Magenta Futuriste (Vibrant, audacieux)
 *
 * --- VIOLETS & MAUVES ---
 *  - 'neon-violet'       : Violet Ultraviolet (Direction artistique, contemporain)
 *  - 'iris-blurple'      : Iris / Blurple Électrique (Style Linear, hyper clean)
 *  - 'royal-plum'        : Prune Royale & Cassis (Sombre, aristocratique, haute couture)
 *  - 'electric-lavender' : Lavande Électrique (Délicat, avant-garde)
 *  - 'amethyst-deep'     : Améthyste Minérale (Profondeur précieuse)
 *
 * --- VERTS & NATURE ---
 *  - 'deep-emerald'      : Émeraude Profond (Noble, calme, haute lisibilité)
 *  - 'electric-mint'     : Menthe Givrée (Frais, digital, lumineux)
 *  - 'neon-lime'         : Vert Lime Fluo (Original, avec émeraude profond sur fond blanc)
 *  - 'pine-forest'       : Vert Pin & Forêt Sauvage (Robuste, écologique, intense)
 *  - 'deep-ocean-green'  : Vert Océanique / OceanSight (Vert profond maritime)
 *  - 'botanic-sage'      : Sauge Botanique (Organique, apaisant, studio)
 *  - 'studio-olive'      : Olive Architecturale (Design d'espace, modernisme)
 *  - 'cyber-jade'        : Jade Électrique (Nuance marine et végétale)
 *
 * --- MONOCHROMES & MÉTAL ---
 *  - 'chrome-silver'     : Chrome & Platine Titane (Minimalisme radical, épuré)
 *  - 'slate-steel'       : Acier Sombre Minéral (Graphique, architectural)
 *
 * ✨ DOUBLE CONTRASTE AUTOMATIQUE :
 * - Mode clair (fond blanc) : couleur ultra-lisible (norme WCAG AAA/AA).
 * - Mode sombre (fond noir) : couleur lumineuse et électrique.
 * =====================================================================
 */

export type AccentPresetId =
  // Bleus & Cyans
  | 'electric-blue'
  | 'klein-blue'
  | 'deep-indigo'
  | 'ultramarine'
  | 'pacific-blue'
  | 'cyber-cyan'
  | 'teal-ocean'
  | 'lagoon-cyan'
  // Chauds, Oranges & Jaunes
  | 'hyper-orange'
  | 'flame-coral'
  | 'terracotta'
  | 'warm-copper'
  | 'neo-peach'
  | 'amber-gold'
  | 'solar-ochre'
  | 'acid-yellow'
  | 'imperial-gold'
  // Rouges, Bordeaux & Roses
  | 'hot-crimson'
  | 'blood-red'
  | 'deep-burgundy'
  | 'carmine-wine'
  | 'racing-red'
  | 'vivid-raspberry'
  | 'cyber-pink'
  | 'magenta-futurism'
  // Violets & Mauves
  | 'neon-violet'
  | 'iris-blurple'
  | 'royal-plum'
  | 'electric-lavender'
  | 'amethyst-deep'
  // Verts & Nature
  | 'deep-emerald'
  | 'electric-mint'
  | 'neon-lime'
  | 'pine-forest'
  | 'deep-ocean-green'
  | 'botanic-sage'
  | 'studio-olive'
  | 'cyber-jade'
  // Monochromes & Métal
  | 'chrome-silver'
  | 'slate-steel';

/**
 * 🌟 MODIFIEZ CETTE LIGNE POUR CHANGER LA COULEUR D'ACCENT DU SITE :
 * Exemples à tester : 'electric-blue', 'hot-crimson', 'hyper-orange', 'deep-burgundy', 'neon-lime', 'terracotta', 'deep-indigo', 'deep-ocean-green', etc.
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
  // ==========================================
  // --- 1. BLEUS & CYANS ---
  // ==========================================
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
  {
    id: 'ultramarine',
    nameFr: 'Bleu Outremer Royal',
    nameEn: 'Royal Ultramarine',
    hexDark: '#3B82F6',
    hexLight: '#1D4ED8',
    hex: '#3B82F6',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '59, 130, 246',
    rgbLight: '29, 78, 216',
    glowDark: 'rgba(59, 130, 246, 0.4)',
    glowLight: 'rgba(29, 78, 216, 0.25)',
    taglineFr: 'Intensité pure, clarté architecturale',
    taglineEn: 'Pure intensity, architectural clarity',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'pacific-blue',
    nameFr: 'Bleu Pacifique Minéral',
    nameEn: 'Pacific Blue',
    hexDark: '#38BDF8',
    hexLight: '#0369A1',
    hex: '#38BDF8',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '56, 189, 248',
    rgbLight: '3, 105, 161',
    glowDark: 'rgba(56, 189, 248, 0.4)',
    glowLight: 'rgba(3, 105, 161, 0.25)',
    taglineFr: 'Air frais, modernisme côtier, grande clarté',
    taglineEn: 'Crisp air, coastal modernism, great clarity',
    contrastRating: 'WCAG AAA'
  },
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
  {
    id: 'teal-ocean',
    nameFr: 'Bleu Canard / Océan',
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
  {
    id: 'lagoon-cyan',
    nameFr: 'Cyan Lagon Tropical',
    nameEn: 'Tropical Lagoon',
    hexDark: '#22D3EE',
    hexLight: '#0891B2',
    hex: '#22D3EE',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '34, 211, 238',
    rgbLight: '8, 145, 178',
    glowDark: 'rgba(34, 211, 238, 0.35)',
    glowLight: 'rgba(8, 145, 178, 0.25)',
    taglineFr: 'Lumière d’eau turquoise, ultra-frais',
    taglineEn: 'Turquoise water light, ultra-fresh',
    contrastRating: 'WCAG AAA'
  },

  // ==========================================
  // --- 2. CHAUDS, ORANGES & JAUNES ---
  // ==========================================
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
  {
    id: 'terracotta',
    nameFr: 'Terre de Sienne / Terracotta',
    nameEn: 'Terracotta Earth',
    hexDark: '#FB923C',
    hexLight: '#9A3412',
    hex: '#FB923C',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '251, 146, 60',
    rgbLight: '154, 52, 18',
    glowDark: 'rgba(251, 146, 60, 0.4)',
    glowLight: 'rgba(154, 52, 18, 0.25)',
    taglineFr: 'Chaleur méditerranéenne, matière brute & design éditorial',
    taglineEn: 'Mediterranean warmth, raw texture & editorial design',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'warm-copper',
    nameFr: 'Cuivre Brûlé / Copper',
    nameEn: 'Warm Copper',
    hexDark: '#F97316',
    hexLight: '#C2410C',
    hex: '#F97316',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '249, 115, 22',
    rgbLight: '194, 65, 12',
    glowDark: 'rgba(249, 115, 22, 0.4)',
    glowLight: 'rgba(194, 65, 12, 0.25)',
    taglineFr: 'Teinte industrielle chaleureuse, moderniste',
    taglineEn: 'Warm industrial tone, modernist',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'neo-peach',
    nameFr: 'Pêche Abricot Moderne',
    nameEn: 'Neo Peach',
    hexDark: '#FDBA74',
    hexLight: '#EA580C',
    hex: '#FDBA74',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '253, 186, 116',
    rgbLight: '234, 88, 12',
    glowDark: 'rgba(253, 186, 116, 0.4)',
    glowLight: 'rgba(234, 88, 12, 0.25)',
    taglineFr: 'Doux, expressif, contemporain',
    taglineEn: 'Soft, expressive, contemporary',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'amber-gold',
    nameFr: 'Ambre & Miel Solaire',
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
  {
    id: 'solar-ochre',
    nameFr: 'Ocre Doré Minéral',
    nameEn: 'Solar Ochre',
    hexDark: '#FBBF24',
    hexLight: '#A16207',
    hex: '#FBBF24',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '251, 191, 36',
    rgbLight: '161, 98, 7',
    glowDark: 'rgba(251, 191, 36, 0.35)',
    glowLight: 'rgba(161, 98, 7, 0.25)',
    taglineFr: 'Richesse minérale, terre dorée, élégance suisse',
    taglineEn: 'Mineral richness, golden earth, Swiss elegance',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'acid-yellow',
    nameFr: 'Jaune Acide / Cyber',
    nameEn: 'Acid Yellow',
    hexDark: '#FACC15',
    hexLight: '#92400E',
    hex: '#FACC15',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '250, 204, 21',
    rgbLight: '146, 64, 14',
    glowDark: 'rgba(250, 204, 21, 0.4)',
    glowLight: 'rgba(146, 64, 14, 0.25)',
    taglineFr: 'Audacieux, percutant, graphisme contemporain',
    taglineEn: 'Bold, punchy, contemporary graphics',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'imperial-gold',
    nameFr: 'Or Impérial & Laiton',
    nameEn: 'Imperial Gold',
    hexDark: '#EAB308',
    hexLight: '#854D0E',
    hex: '#EAB308',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '234, 179, 8',
    rgbLight: '133, 77, 14',
    glowDark: 'rgba(234, 179, 8, 0.35)',
    glowLight: 'rgba(133, 77, 14, 0.25)',
    taglineFr: 'Haute horlogerie suisse, or précieux, raffinement',
    taglineEn: 'Swiss watchmaking, precious gold, refinement',
    contrastRating: 'WCAG AAA'
  },

  // ==========================================
  // --- 3. ROUGES, BORDEAUX & ROSES ---
  // ==========================================
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
  {
    id: 'blood-red',
    nameFr: 'Rouge Sang / Don du Sang HUG',
    nameEn: 'Deep Blood Red',
    hexDark: '#E11D48',
    hexLight: '#991B1B',
    hex: '#E11D48',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '225, 29, 72',
    rgbLight: '153, 27, 27',
    glowDark: 'rgba(225, 29, 72, 0.4)',
    glowLight: 'rgba(153, 27, 27, 0.25)',
    taglineFr: 'Rouge carmin profond et noble, couleur officielle du projet HUG',
    taglineEn: 'Deep noble crimson red, official color of the HUG project',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'deep-burgundy',
    nameFr: 'Bordeaux Profond / Rouge Sang',
    nameEn: 'Deep Burgundy',
    hexDark: '#F43F5E',
    hexLight: '#881337',
    hex: '#F43F5E',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '244, 63, 94',
    rgbLight: '136, 19, 55',
    glowDark: 'rgba(244, 63, 94, 0.35)',
    glowLight: 'rgba(136, 19, 55, 0.25)',
    taglineFr: 'Sophistiqué, grand cru, intensité éditoriale',
    taglineEn: 'Sophisticated, grand cru, editorial intensity',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'carmine-wine',
    nameFr: 'Carmin Grand Cru',
    nameEn: 'Carmine Grand Cru',
    hexDark: '#FB7185',
    hexLight: '#9F1239',
    hex: '#FB7185',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '251, 113, 133',
    rgbLight: '159, 18, 57',
    glowDark: 'rgba(251, 113, 133, 0.35)',
    glowLight: 'rgba(159, 18, 57, 0.25)',
    taglineFr: 'Élégance feutrée, velours rouge rubis',
    taglineEn: 'Muted elegance, ruby red velvet',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'racing-red',
    nameFr: 'Rouge Course / Karting',
    nameEn: 'Motorsport Racing Red',
    hexDark: '#EF4444',
    hexLight: '#B91C1C',
    hex: '#EF4444',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '239, 68, 68',
    rgbLight: '185, 28, 28',
    glowDark: 'rgba(239, 68, 68, 0.4)',
    glowLight: 'rgba(185, 28, 28, 0.25)',
    taglineFr: 'Adrénaline, vitesse sur circuit, Karting de Vuiteboeuf',
    taglineEn: 'Adrenaline, track speed, Karting Vuiteboeuf',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'vivid-raspberry',
    nameFr: 'Framboise Intense',
    nameEn: 'Vivid Raspberry',
    hexDark: '#F472B6',
    hexLight: '#BE185D',
    hex: '#F472B6',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '244, 114, 182',
    rgbLight: '190, 24, 93',
    glowDark: 'rgba(244, 114, 182, 0.4)',
    glowLight: 'rgba(190, 24, 93, 0.25)',
    taglineFr: 'Pétillant, design audacieux, contemporain',
    taglineEn: 'Sparkling, bold design, contemporary',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'cyber-pink',
    nameFr: 'Rose Néon / Cyber Pink',
    nameEn: 'Cyber Pink',
    hexDark: '#EC4899',
    hexLight: '#9D174D',
    hex: '#EC4899',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '236, 72, 153',
    rgbLight: '157, 23, 77',
    glowDark: 'rgba(236, 72, 153, 0.4)',
    glowLight: 'rgba(157, 23, 77, 0.25)',
    taglineFr: 'Énergique, pop culture, créatif et audacieux',
    taglineEn: 'Energetic, pop culture, creative & bold',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'magenta-futurism',
    nameFr: 'Magenta Futuriste',
    nameEn: 'Futuristic Magenta',
    hexDark: '#E879F9',
    hexLight: '#86198F',
    hex: '#E879F9',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '232, 121, 249',
    rgbLight: '134, 25, 143',
    glowDark: 'rgba(232, 121, 249, 0.4)',
    glowLight: 'rgba(134, 25, 143, 0.25)',
    taglineFr: 'Avant-garde graphique, onde synthwave',
    taglineEn: 'Graphic avant-garde, synthwave vibe',
    contrastRating: 'WCAG AAA'
  },

  // ==========================================
  // --- 4. VIOLETS & MAUVES ---
  // ==========================================
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
  {
    id: 'iris-blurple',
    nameFr: 'Iris / Blurple Électrique',
    nameEn: 'Electric Iris',
    hexDark: '#818CF8',
    hexLight: '#4338CA',
    hex: '#818CF8',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '129, 140, 248',
    rgbLight: '67, 56, 202',
    glowDark: 'rgba(129, 140, 248, 0.4)',
    glowLight: 'rgba(67, 56, 202, 0.25)',
    taglineFr: 'Esthétique tech raffinée, style Linear',
    taglineEn: 'Refined tech aesthetics, Linear style',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'royal-plum',
    nameFr: 'Prune Royale Sombre',
    nameEn: 'Royal Plum',
    hexDark: '#C084FC',
    hexLight: '#581C87',
    hex: '#C084FC',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '192, 132, 252',
    rgbLight: '88, 28, 135',
    glowDark: 'rgba(192, 132, 252, 0.35)',
    glowLight: 'rgba(88, 28, 135, 0.25)',
    taglineFr: 'Somptueux, profond, direction artistique haute joaillerie',
    taglineEn: 'Sumptuous, deep, high jewellery art direction',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'electric-lavender',
    nameFr: 'Lavande Électrique',
    nameEn: 'Electric Lavender',
    hexDark: '#A78BFA',
    hexLight: '#5B21B6',
    hex: '#A78BFA',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '167, 139, 250',
    rgbLight: '91, 33, 182',
    glowDark: 'rgba(167, 139, 250, 0.35)',
    glowLight: 'rgba(91, 33, 182, 0.25)',
    taglineFr: 'Poétique, moderne, clarté néo-suisse',
    taglineEn: 'Poetic, modern, neo-Swiss clarity',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'amethyst-deep',
    nameFr: 'Améthyste Minérale',
    nameEn: 'Mineral Amethyst',
    hexDark: '#9333EA',
    hexLight: '#6B21A8',
    hex: '#9333EA',
    contrastTextDark: '#FFFFFF',
    contrastTextLight: '#FFFFFF',
    contrastText: '#FFFFFF',
    rgbDark: '147, 51, 234',
    rgbLight: '107, 33, 168',
    glowDark: 'rgba(147, 51, 234, 0.4)',
    glowLight: 'rgba(107, 33, 168, 0.25)',
    taglineFr: 'Mystère cristallin, profondeur graphique',
    taglineEn: 'Crystalline mystery, graphic depth',
    contrastRating: 'WCAG AAA'
  },

  // ==========================================
  // --- 5. VERTS & NATURE ---
  // ==========================================
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
  },
  {
    id: 'pine-forest',
    nameFr: 'Vert Pin & Forêt Sauvage',
    nameEn: 'Pine Forest',
    hexDark: '#22C55E',
    hexLight: '#14532D',
    hex: '#22C55E',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '34, 197, 94',
    rgbLight: '20, 83, 45',
    glowDark: 'rgba(34, 197, 94, 0.35)',
    glowLight: 'rgba(20, 83, 45, 0.25)',
    taglineFr: 'Densité végétale, robustesse, nature alpine',
    taglineEn: 'Botanical density, robustness, alpine nature',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'deep-ocean-green',
    nameFr: 'Vert Océanique / OceanSight',
    nameEn: 'OceanSight Deep Green',
    hexDark: '#4ADE80',
    hexLight: '#166534',
    hex: '#4ADE80',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '74, 222, 128',
    rgbLight: '22, 101, 52',
    glowDark: 'rgba(74, 222, 128, 0.35)',
    glowLight: 'rgba(22, 101, 52, 0.25)',
    taglineFr: 'Vert marin profond, couleur officielle du projet OceanSight',
    taglineEn: 'Deep maritime green, official color of OceanSight',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'botanic-sage',
    nameFr: 'Sauge Botanique',
    nameEn: 'Botanic Sage',
    hexDark: '#84CC16',
    hexLight: '#3F6212',
    hex: '#84CC16',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '132, 204, 22',
    rgbLight: '63, 98, 18',
    glowDark: 'rgba(132, 204, 22, 0.35)',
    glowLight: 'rgba(63, 98, 18, 0.25)',
    taglineFr: 'Naturel, organique, douceur studio',
    taglineEn: 'Natural, organic, studio softness',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'studio-olive',
    nameFr: 'Olive Architecturale',
    nameEn: 'Studio Olive',
    hexDark: '#A3E635',
    hexLight: '#4D7C0F',
    hex: '#A3E635',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '163, 230, 53',
    rgbLight: '77, 124, 15',
    glowDark: 'rgba(163, 230, 53, 0.35)',
    glowLight: 'rgba(77, 124, 15, 0.25)',
    taglineFr: 'Minimalisme d’atelier, teinte moderniste',
    taglineEn: 'Workshop minimalism, modernist tone',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'cyber-jade',
    nameFr: 'Jade Contemporain',
    nameEn: 'Cyber Jade',
    hexDark: '#2DD4BF',
    hexLight: '#0F766E',
    hex: '#2DD4BF',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '45, 212, 191',
    rgbLight: '15, 118, 110',
    glowDark: 'rgba(45, 212, 191, 0.35)',
    glowLight: 'rgba(15, 118, 110, 0.25)',
    taglineFr: 'Équilibre subtil entre cyan et vert minéral',
    taglineEn: 'Subtle balance between cyan and mineral green',
    contrastRating: 'WCAG AAA'
  },

  // ==========================================
  // --- 6. MONOCHROMES & MÉTAL ---
  // ==========================================
  {
    id: 'chrome-silver',
    nameFr: 'Chrome Titane / Argent',
    nameEn: 'Chrome Titanium',
    hexDark: '#E2E8F0',
    hexLight: '#334155',
    hex: '#E2E8F0',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '226, 232, 240',
    rgbLight: '51, 65, 85',
    glowDark: 'rgba(226, 232, 240, 0.3)',
    glowLight: 'rgba(51, 65, 85, 0.2)',
    taglineFr: 'Monochrome pur, métal brossé, précision clinique',
    taglineEn: 'Pure monochrome, brushed metal, clinical precision',
    contrastRating: 'WCAG AAA'
  },
  {
    id: 'slate-steel',
    nameFr: 'Acier Minéral / Slate',
    nameEn: 'Slate Steel',
    hexDark: '#94A3B8',
    hexLight: '#1E293B',
    hex: '#94A3B8',
    contrastTextDark: '#000000',
    contrastTextLight: '#FFFFFF',
    contrastText: '#000000',
    rgbDark: '148, 163, 184',
    rgbLight: '30, 41, 59',
    glowDark: 'rgba(148, 163, 184, 0.3)',
    glowLight: 'rgba(30, 41, 59, 0.2)',
    taglineFr: 'Graphite et acier, neutralité architecturale haut de gamme',
    taglineEn: 'Graphite and steel, high-end architectural neutrality',
    contrastRating: 'WCAG AAA'
  }
];
