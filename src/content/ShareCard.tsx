/**
 * The share images (1200×630), in the brand charter: near-black backgrounds, the two reds
 * (#C50E36 / #FF2E55), white Plus Jakarta headings, the "Luca Leone." wordmark and the LL tile.
 * Drawn by satori at build time (src/content/shareImages.ts) and shown smaller in the atelier.
 * Only layout satori supports: flex boxes, absolute positioning, gradients, images (the glows
 * and the tile are SVG images).
 */

// The names satori registers first; the site's variable fonts for the atelier's preview
const SANS = '"Plus Jakarta Sans", "Plus Jakarta Sans Variable", sans-serif';
const DISPLAY = 'Syne, "Syne Variable", sans-serif';
const DEEP = '#C50E36';
const BRIGHT = '#FF2E55';
const W = 1200;
const H = 630;

const svg = (body: string) => `data:image/svg+xml;utf8,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`)}`;

const box = { width: W, height: H, display: 'flex', position: 'relative' as const, fontFamily: SANS, color: '#FFFFFF', backgroundColor: '#0A0A0C' };
const layer = { position: 'absolute' as const, top: 0, left: 0, width: W, height: H };

/** "Luca Leone." with the red dot, as in the charter */
function Wordmark() {
  return (
    <div style={{ display: 'flex', fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, letterSpacing: -0.6 }}>
      <span>Luca Leone</span>
      <span style={{ color: BRIGHT }}>.</span>
    </div>
  );
}

/** The LL tile (public/favicon.svg) */
const MONOGRAM = `data:image/svg+xml;utf8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="64" height="64"><clipPath id="t"><rect width="64" height="64" rx="14"/></clipPath><g clip-path="url(#t)"><path fill="${BRIGHT}" d="M0 0H64V64H0Z"/><path fill="${DEEP}" d="M0 0H20L44 64H0Z"/><path fill="#FFFFFF" d="M10 10H19V45H33V54H10Z"/><path fill="#FFFFFF" d="M54 54H45V19H31V10H54Z"/></g></svg>`,
)}`;

/** The LL tile and the site's address */
function SiteLink() {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img src={MONOGRAM} width={48} height={48} />
      <span style={{ marginLeft: 18, fontSize: 24, fontWeight: 700 }}>luca-leone.ch</span>
    </div>
  );
}

/** The project's name when it has no logo, as the site's labels: written as typed */
function Eyebrow({ children }: { children: string }) {
  return <span style={{ fontSize: 24, fontWeight: 700, color: '#FFFFFF' }}>{children}</span>;
}

export interface ProjectShareCardProps {
  hook: string;
  name: string;
  role: string;
  year: string;
  cover: string;
  /** The logo's version for dark backgrounds, if the project has one */
  logo?: { src: string; width: number; height: number };
}

/** The 16:10 cover, larger than the frame and pushed right: the device sits in the right half */
function Cover({ src }: { src: string }) {
  const h = Math.round(H * 1.18);
  const w = Math.round(h * 1.6);
  return <img src={src} width={w} height={h} style={{ position: 'absolute', top: Math.round((H - h) / 2), left: W - w + Math.round(w * 0.16), width: w, height: h }} />;
}

export function ProjectShareCard({ hook, name, role, year, cover, logo }: ProjectShareCardProps) {
  const text = hook || name;
  const size = text.length > 46 ? 50 : 58;
  const logoH = logo ? Math.min(54, Math.round((280 / logo.width) * logo.height)) : 0;
  const logoW = logo ? Math.round((logo.width / logo.height) * logoH) : 0;
  return (
    <div style={box}>
      <Cover src={cover} />
      <div style={{ ...layer, display: 'flex', backgroundImage: 'linear-gradient(90deg, rgba(10,10,12,0.96) 0%, rgba(10,10,12,0.9) 36%, rgba(10,10,12,0.35) 62%, rgba(10,10,12,0.1) 100%)' }} />
      <div style={{ position: 'absolute', left: 72, top: 64, bottom: 58, width: 560, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <Wordmark />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {logo ? <img src={logo.src} width={logoW} height={logoH} style={{ marginBottom: 26 }} /> : <Eyebrow>{name}</Eyebrow>}
          <span style={{ fontSize: size, fontWeight: 800, lineHeight: 1.06, letterSpacing: -1.8, marginTop: logo ? 0 : 18 }}>{text}</span>
          <span style={{ marginTop: 22, fontSize: 20, fontWeight: 600, color: 'rgba(255,255,255,0.8)' }}>{`${year} · ${role}`}</span>
        </div>
        <SiteLink />
      </div>
    </div>
  );
}

export interface PersonalShareCardProps {
  before: string;
  accent: string;
  joiner: string;
  outcome: string;
  portrait: string;
}

/** The charter's dark "aurora": near black, deep red glows top right and low left */
const aurora = svg(
  `<defs><radialGradient id="a" cx="0.8" cy="0.05" r="0.75"><stop offset="0" stop-color="${DEEP}" stop-opacity="0.75"/><stop offset="1" stop-color="${DEEP}" stop-opacity="0"/></radialGradient>` +
    `<radialGradient id="b" cx="0.05" cy="0.9" r="0.6"><stop offset="0" stop-color="${DEEP}" stop-opacity="0.35"/><stop offset="1" stop-color="${DEEP}" stop-opacity="0"/></radialGradient></defs>` +
    `<rect width="${W}" height="${H}" fill="#110D10"/><rect width="${W}" height="${H}" fill="url(#a)"/><rect width="${W}" height="${H}" fill="url(#b)"/>`,
);

/** The cut-out portrait (860×1200), drawn large and cut at the chest, above the crossed arms */
export const PORTRAIT_SIZE = { width: 792, height: 1105 };

/** Every page but the projects: like the charter's portrait post, the name, the hero's sentence, the portrait */
export function PersonalShareCard({ before, accent, joiner, outcome, portrait }: PersonalShareCardProps) {
  const words = (text: string, color?: string) =>
    text
      .split(/\s+/)
      .filter(Boolean)
      .map((w, i) => (
        <span key={`${text}-${i}`} style={{ marginRight: 10, color, fontWeight: color ? 700 : 500 }}>
          {w}
        </span>
      ));
  return (
    <div style={box}>
      <img src={aurora} width={W} height={H} style={layer} />
      <img src={portrait} width={PORTRAIT_SIZE.width} height={PORTRAIT_SIZE.height} style={{ position: 'absolute', top: -144, left: 500, ...PORTRAIT_SIZE }} />
      <div style={{ position: 'absolute', left: 72, top: 64, bottom: 58, width: 600, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <span />
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', fontSize: 104, fontWeight: 800, letterSpacing: -4.5, lineHeight: 1 }}>
            <span>Luca Leone</span>
            {/* satori keeps the tracking after the last letter: pull the dot back */}
            <span style={{ color: BRIGHT, marginLeft: -16 }}>.</span>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 30, fontSize: 36, lineHeight: 1.3, color: 'rgba(255,255,255,0.88)' }}>
            {words(before)}
            {words(accent, BRIGHT)}
            {words(joiner)}
            {words(`${outcome}.`)}
          </div>
        </div>
        <SiteLink />
      </div>
    </div>
  );
}
