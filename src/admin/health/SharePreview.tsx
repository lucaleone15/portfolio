import { useEffect, useRef, useState } from 'react';
import type { Language } from '../../types';
import type { StoredProject } from '../../content/schema';
import { shareCardInputs } from '../../content/og';
import { ShareCard } from '../../content/ShareCard';
import { PROJECT_KIND_LABEL } from '../../data/portfolioData';

/** The project's share image as the build will draw it, scaled to the space available */
export function SharePreview({ project, lang, preview }: { project: StoredProject; lang: Language; preview: (src: string) => string }) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.4);
  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setScale(el.clientWidth / 1200));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  if (!project.imageUrl) {
    return <p className="text-sm text-neutral-500">Sans couverture, la page utilise ton image de partage personnelle.</p>;
  }
  const inputs = shareCardInputs(project, lang);
  return (
    <div ref={box} className="relative w-full" style={{ aspectRatio: '1200 / 630' }}>
      <div className="absolute left-0 top-0 origin-top-left" style={{ transform: `scale(${scale})` }}>
        <ShareCard
          name={inputs.name}
          hook={inputs.hook}
          label={inputs.label}
          kindLabel={PROJECT_KIND_LABEL[project.kind][lang]}
          year={inputs.year}
          accent={project.accentColor ?? '#C50E36'}
          cover={preview(project.imageUrl)}
          logo={project.logo ? { src: preview(project.logo.srcDark), width: project.logo.width, height: project.logo.height } : undefined}
          monogram="/favicon.svg"
        />
      </div>
    </div>
  );
}
