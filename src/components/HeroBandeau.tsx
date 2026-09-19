import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';

interface ToolLogo {
  id: string;
  name: string;
  defaultSrc: string;
}

export function HeroBandeau() {
  const { t } = useLanguage();

  const competencies: string[] = (t('marquee.competencies') as unknown as string[]) || [
    'UI / UX DESIGN',
    'DÉVELOPPEMENT WEB',
    'COMMUNICATION DIGITALE',
    'STRATÉGIE DE MARQUE & BRANDING',
    'CRÉATION DE CONTENUS & SOCIAL MEDIA',
    'PRODUCTION VIDÉO & MONTAGE',
    'PHOTOGRAPHIE & RETOUCHE',
    'DESIGN SYSTEM & PROTOTYPAGE',
    'COMMUNITY MANAGEMENT'
  ];

  // Comprehensive tool list mapped to all assets in /public/tools/
  const tools: ToolLogo[] = [
    { id: 'figma', name: 'Figma', defaultSrc: '/tools/figma.webp' },
    { id: 'photoshop', name: 'Adobe Photoshop', defaultSrc: '/tools/photoshop.webp' },
    { id: 'illustrator', name: 'Adobe Illustrator', defaultSrc: '/tools/illustrator.webp' },
    { id: 'indesign', name: 'Adobe InDesign', defaultSrc: '/tools/indesign.webp' },
    { id: 'premiere', name: 'Adobe Premiere Pro', defaultSrc: '/tools/premiere.webp' },
    { id: 'vue', name: 'Vue.js', defaultSrc: '/tools/vue.webp' },
    { id: 'wordpress', name: 'WordPress', defaultSrc: '/tools/wordpress.webp' },
    { id: 'laravel', name: 'Laravel', defaultSrc: '/tools/laravel.webp' },
    { id: 'php', name: 'PHP', defaultSrc: '/tools/php.webp' },
    { id: 'javascript', name: 'JavaScript', defaultSrc: '/tools/javascript.webp' },
    { id: 'html5', name: 'HTML5', defaultSrc: '/tools/html5.webp' },
    { id: 'css', name: 'CSS3', defaultSrc: '/tools/css.webp' },
    { id: 'java', name: 'Java', defaultSrc: '/tools/java.png' },
    { id: 'jira', name: 'Jira', defaultSrc: '/tools/jira.svg' },
    { id: 'notion', name: 'Notion', defaultSrc: '/tools/notion.webp' },
    { id: 'canva', name: 'Canva', defaultSrc: '/tools/canva.png' },
    { id: 'capcut', name: 'CapCut', defaultSrc: '/tools/capcut.png' }
  ];

  return (
    <div className="w-full mt-8 sm:mt-12 select-none space-y-4">
      {/* Bandeau 1: Clean Dark Marquee with normal font weight (not bold) */}
      <div className="relative py-3.5 bg-[#0E0E12] border-y border-white/[0.08] overflow-hidden">
        <div className="mask-marquee-edges w-full overflow-hidden">
          <div className="animate-marquee flex items-center gap-10 sm:gap-14 whitespace-nowrap">
            {[...competencies, ...competencies, ...competencies].map((item, idx) => (
              <span
                key={`comp-marquee-${idx}`}
                className="font-sans font-normal text-xs sm:text-sm tracking-[0.18em] text-white/75 uppercase hover:text-white transition-colors"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bandeau 2: Tools Marquee with Liquid Glass hover tooltip below logo */}
      <div className="relative py-1 bg-transparent">
        <div className="mask-marquee-edges w-full overflow-hidden">
          <div className="animate-marquee-reverse flex items-center gap-10 sm:gap-14 whitespace-nowrap pt-2 pb-8 sm:pb-10">
            {[...tools, ...tools, ...tools].map((tool, idx) => (
              <div
                key={`tool-logo-${idx}`}
                className="relative group shrink-0 flex flex-col items-center justify-center cursor-pointer"
              >
                {/* Logo Image with uniform dimensioning */}
                <div className="opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-200 w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center">
                  {tool.id === 'capcut' ? (
                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1.5 flex items-center justify-center shadow-xs">
                      <img
                        src={tool.defaultSrc}
                        alt={tool.name}
                        className="w-full h-full object-contain select-none"
                        loading="lazy"
                      />
                    </div>
                  ) : (
                    <img
                      src={tool.defaultSrc}
                      alt={tool.name}
                      className="w-full h-full max-w-[40px] max-h-[40px] sm:max-w-[44px] sm:max-h-[44px] object-contain select-none drop-shadow-sm"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Stylish Liquid Glass Tooltip on Hover - Name only, no green dot, completely unclipped */}
                <div className="absolute top-full mt-2.5 left-1/2 -translate-x-1/2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-30">
                  <div className="relative px-3.5 py-1 rounded-full bg-white/[0.14] backdrop-blur-2xl border border-white/[0.22] shadow-[0_8px_32px_0_rgba(0,0,0,0.6),inset_0_1px_1px_0_rgba(255,255,255,0.35)] flex items-center justify-center whitespace-nowrap">
                    <span className="text-[11px] font-semibold tracking-wide text-white drop-shadow-sm select-none">
                      {tool.name}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
