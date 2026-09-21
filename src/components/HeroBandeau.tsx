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
    <div className="w-full mt-6 sm:mt-10 select-none space-y-3 sm:space-y-4">
      {/* 1. Dedicated, crystal-clear Competencies Marquee Tape */}
      <div className="relative py-2.5 sm:py-3 bg-black/[0.02] dark:bg-white/[0.02] border-y border-black/[0.06] dark:border-white/[0.06] overflow-hidden">
        <div className="mask-marquee-edges w-full overflow-hidden">
          <div className="animate-marquee flex items-center gap-6 sm:gap-10 whitespace-nowrap">
            {[...competencies, ...competencies, ...competencies].map((item, idx) => (
              <div key={`comp-tape-${idx}`} className="inline-flex items-center gap-6 sm:gap-10">
                <span className="font-syne font-bold text-xs sm:text-sm tracking-[0.14em] uppercase text-neutral-800 dark:text-neutral-200">
                  {item}
                </span>
                <span className="text-neutral-400 dark:text-[#CCFF00] font-bold text-xs sm:text-sm select-none">
                  ✦
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Tools Marquee with clean floating logos and name tag floating directly ABOVE the icon */}
      <div className="relative py-1 bg-transparent">
        <div className="mask-marquee-edges w-full overflow-hidden">
          <div className="animate-marquee-reverse flex items-center gap-10 sm:gap-14 whitespace-nowrap pt-7 pb-3 sm:pt-8 sm:pb-4">
            {[...tools, ...tools, ...tools].map((tool, idx) => (
              <div
                key={`tool-logo-${idx}`}
                className="relative group shrink-0 flex flex-col items-center justify-center cursor-pointer"
              >
                {/* Floating Name Badge right ABOVE the icon */}
                <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 translate-y-1.5 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 pointer-events-none z-30">
                  <div className="relative px-2.5 py-1 rounded-md bg-neutral-900/95 dark:bg-[#18181B]/95 backdrop-blur-md border border-black/10 dark:border-white/20 shadow-[0_8px_20px_rgba(0,0,0,0.4)] dark:shadow-[0_8px_20px_rgba(0,0,0,0.8)] flex items-center justify-center whitespace-nowrap">
                    <span className="text-[11px] sm:text-xs font-syne font-bold tracking-wide text-white select-none">
                      {tool.name}
                    </span>
                    {/* Small downward indicator triangle */}
                    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-neutral-900 dark:bg-[#18181B] border-r border-b border-black/10 dark:border-white/20 rotate-45" />
                  </div>
                </div>

                {/* Logo Image */}
                <div className="opacity-80 group-hover:opacity-100 transition-all duration-200 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center group-hover:scale-110">
                  {tool.id === 'capcut' ? (
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-2 flex items-center justify-center shadow-xs">
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
                      className="w-full h-full max-w-[42px] max-h-[42px] sm:max-w-[48px] sm:max-h-[48px] object-contain select-none drop-shadow-xs"
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
