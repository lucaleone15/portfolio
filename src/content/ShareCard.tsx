/**
 * A project's share image (1200×630): its cover, darkened on the text side; the LL monogram and
 * the address; the project's logo or name; its hook; its role / category and year; a band in
 * the project's colour. Drawn by satori at build time (scripts/share-images.mjs) and shown, at
 * a smaller scale, in the atelier's "Santé de la page". Only layout satori supports: flex boxes,
 * absolute positioning, gradients, images.
 */

export interface ShareCardProps {
  name: string;
  hook: string;
  /** Role or category, e.g. "Community manager" */
  label: string;
  kindLabel: string;
  year: string;
  accent: string;
  cover: string;
  /** The logo's version for dark backgrounds, if the project has one */
  logo?: { src: string; width: number; height: number };
  monogram: string;
}

// The names satori registers first; the site's variable fonts for the atelier's preview
const SANS = '"Plus Jakarta Sans", "Plus Jakarta Sans Variable", sans-serif';
const DISPLAY = 'Syne, "Syne Variable", sans-serif';

const W = 1200;
const H = 630;

export function ShareCard({ name, hook, label, kindLabel, year, accent, cover, logo, monogram }: ShareCardProps) {
  const logoHeight = logo ? Math.min(78, Math.round((440 / logo.width) * logo.height)) : 0;
  const logoWidth = logo ? Math.round((logo.width / logo.height) * logoHeight) : 0;
  const long = hook.length > 70;
  return (
    <div style={{ width: W, height: H, display: 'flex', position: 'relative', backgroundColor: '#0A0A0C', fontFamily: SANS }}>
      <img src={cover} width={W} height={H} style={{ position: 'absolute', top: 0, left: 0, width: W, height: H, objectFit: 'cover' }} />
      {/* Dark on the text side, the visual still showing on the right */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: W,
          height: H,
          display: 'flex',
          backgroundImage: 'linear-gradient(90deg, rgba(10,10,12,0.95) 0%, rgba(10,10,12,0.9) 52%, rgba(10,10,12,0.45) 100%)',
        }}
      />
      <div style={{ position: 'absolute', top: 0, left: 0, width: 14, height: H, display: 'flex', backgroundColor: accent }} />

      <div style={{ position: 'absolute', top: 56, left: 78, right: 70, bottom: 54, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={monogram} width={52} height={52} style={{ borderRadius: 12 }} />
            <span style={{ marginLeft: 18, fontSize: 26, fontWeight: 600, color: 'rgba(255,255,255,0.88)' }}>luca-leone.ch</span>
          </div>
          <span
            style={{
              display: 'flex',
              padding: '10px 22px',
              borderRadius: 999,
              backgroundColor: accent,
              color: '#FFFFFF',
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: 22,
            }}
          >
            {kindLabel}
          </span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
          {logo ? (
            <img src={logo.src} width={logoWidth} height={logoHeight} style={{ marginBottom: 28 }} />
          ) : (
            <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: hook ? 40 : 76, color: '#FFFFFF', marginBottom: 22, lineHeight: 1.05 }}>{name}</span>
          )}
          {hook && <span style={{ fontWeight: 800, fontSize: long ? 50 : 60, lineHeight: 1.1, letterSpacing: -1.2, color: '#FFFFFF' }}>{hook}</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', fontSize: 26, color: 'rgba(255,255,255,0.78)' }}>
          <span style={{ fontWeight: 700, color: '#FFFFFF' }}>{year}</span>
          <span style={{ display: 'flex', width: 6, height: 6, borderRadius: 3, margin: '0 16px', backgroundColor: 'rgba(255,255,255,0.5)' }} />
          <span style={{ fontWeight: 500 }}>{label}</span>
        </div>
      </div>
    </div>
  );
}

export const SHARE_CARD_SIZE = { width: W, height: H };
