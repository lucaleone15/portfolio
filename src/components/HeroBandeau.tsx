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
    <div 
      className="absolute inset-0 pointer-events-none select-none overflow-hidden z-0 flex flex-col justify-center items-end pr-4 sm:pr-10 lg:pr-16 pl-6 py-6 opacity-[0.065]"
      aria-hidden="true"
    >
      {/* Background static typographic texture - right-aligned, larger, perfectly uncropped */}
      <div className="w-full max-w-5xl flex flex-wrap justify-end items-center gap-x-6 sm:gap-x-10 gap-y-4 sm:gap-y-6 text-right">
        {competencies.map((item, idx) => (
          <div key={`bg-comp-${idx}`} className="inline-flex items-center gap-5 sm:gap-8 justify-end">
            <span className="text-white font-syne font-black text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] tracking-[0.08em] uppercase leading-tight">
              {item}
            </span>
            <span className="text-[#CCFF00] font-black text-2xl sm:text-3xl">·</span>
          </div>
        ))}
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
      {/* Tools Marquee with clean floating logos and name tag floating directly ABOVE the icon */}
      <div className="relative py-1 bg-transparent">
        <div className="mask-marquee-edges w-full overflow-hidden">
          <div className="animate-marquee-reverse flex items-center gap-10 sm:gap-14 whitespace-nowrap pt-8 pb-4 sm:pt-9 sm:pb-5">
            {[...tools, ...tools, ...tools].map((tool, idx) => (
              <div
                key={`tool-logo-${idx}`}
                className="relative group shrink-0 flex flex-col items-center justify-center cursor-pointer"
              >
                {/* Floating Name Badge right ABOVE the icon */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-30">
                  <div className="relative px-2.5 py-1 rounded-md bg-[#18181B]/95 backdrop-blur-md border border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex items-center justify-center whitespace-nowrap">
                    <span className="text-[11px] sm:text-xs font-syne font-bold tracking-wide text-white select-none">
                      {tool.name}
                    </span>
                    {/* Small downward indicator triangle */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#18181B] border-r border-b border-white/20 rotate-45" />
                  </div>
                </div>

                {/* Logo Image */}
                <div className="opacity-80 group-hover:opacity-100 transition-all duration-200 w-14 h-14 sm:w-16 sm:h-16 flex items-center justify-center group-hover:scale-110">
                  {tool.id === 'capcut' ? (
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white p-2 flex items-center justify-center shadow-sm">
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
                      className="w-full h-full max-w-[48px] max-h-[48px] sm:max-w-[56px] sm:max-h-[56px] object-contain select-none drop-shadow-md"
                      loading="lazy"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
