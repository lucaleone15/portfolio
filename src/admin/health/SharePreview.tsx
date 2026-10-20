import { useEffect, useRef, useState, type ReactNode } from 'react';
import type { Language } from '../../types';
import type { Site, StoredProject } from '../../content/schema';
import { personalCardInputs, shareCardInputs } from '../../content/og';
import { PersonalShareCard, ProjectShareCard } from '../../content/ShareCard';

/** A 1200×630 card drawn at the width available */
function Scaled({ children }: { children: ReactNode }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 1200));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={box} className="relative w-full overflow-hidden" style={{ aspectRatio: '1200 / 630' }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${scale})` }}>
        {children}
      </div>
    </div>
  );
}

export const PORTRAIT_CUTOUT = '/images/portrait-cutout.webp';

/** The personal share image (every page but the projects), as the build will draw it */
export function PersonalSharePreview({ site, lang }: { site: Site; lang: Language }) {
  return (
    <Scaled>
      <PersonalShareCard {...personalCardInputs(site, lang)} portrait={PORTRAIT_CUTOUT} />
    </Scaled>
  );
}

/** The project's share image as the build will draw it */
export function SharePreview({ project, lang, site, preview }: { project: StoredProject; lang: Language; site: Site; preview: (src: string) => string }) {
  if (!project.imageUrl) {
    return (
      <>
        <p className="mb-2 text-xs text-neutral-500">Sans couverture, la page utilise ton image personnelle :</p>
        <PersonalSharePreview site={site} lang={lang} />
      </>
    );
  }
  const i = shareCardInputs(project, lang);
  return (
    <Scaled>
      <ProjectShareCard
        hook={i.hook}
        name={i.name}
        role={i.role}
        year={i.year}
        cover={preview(project.imageUrl)}
        logo={project.logo ? { src: preview(project.logo.srcDark), width: project.logo.width, height: project.logo.height } : undefined}
      />
    </Scaled>
  );
}
