import { useLanguage } from '../context/LanguageContext';

interface ToolLogo {
  id: string;
  name: string;
  defaultSrc: string;
}

export function CompetenciesMarquee() {
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

  return (
    <div className="relative w-full py-2 sm:py-3 overflow-hidden select-none">
      <div className="mask-marquee-edges w-full overflow-hidden">
        <div className="animate-marquee flex items-center gap-10 sm:gap-14 whitespace-nowrap">
          {[...competencies, ...competencies, ...competencies].map((item, idx) => (
            <span
              key={`comp-marquee-${idx}`}
              className="font-syne font-extrabold text-[13px] sm:text-[15px] tracking-[0.16em] text-white hover:text-[#CCFF00] uppercase transition-colors duration-200 cursor-default"
            >
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HeroBandeau() {
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
    <div className="w-full mt-4 sm:mt-6 select-none">
      {/* Tools Marquee with clean floating logos and liquid glass hover lens */}
      <div className="relative py-1 bg-transparent">
        <div className="mask-marquee-edges w-full overflow-hidden">
          <div className="animate-marquee-reverse flex items-center gap-10 sm:gap-14 whitespace-nowrap py-4 sm:py-5">
            {[...tools, ...tools, ...tools].map((tool, idx) => (
              <div
                key={`tool-logo-${idx}`}
                className="relative group shrink-0 flex items-center justify-center cursor-pointer"
              >
                {/* Logo Image without weird box border */}
                <div className="opacity-80 group-hover:opacity-100 transition-all duration-200 w-11 h-11 sm:w-13 sm:h-13 flex items-center justify-center group-hover:scale-110">
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
                      className="w-full h-full max-w-[38px] max-h-[38px] sm:max-w-[44px] sm:max-h-[44px] object-contain select-none drop-shadow-sm"
                      loading="lazy"
                    />
                  )}
                </div>

                {/* Liquid Glass Lens over the symbol on hover */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100 transition-all duration-200 pointer-events-none z-20">
                  <div className="relative px-3.5 py-1.5 rounded-full bg-black/85 backdrop-blur-xl border border-white/25 shadow-[0_12px_28px_rgba(0,0,0,0.85)] flex items-center justify-center whitespace-nowrap">
                    <span className="text-[11px] sm:text-xs font-syne font-bold tracking-wider text-white select-none drop-shadow-sm">
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
