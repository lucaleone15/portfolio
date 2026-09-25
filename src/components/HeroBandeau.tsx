interface ToolLogo {
  id: string;
  name: string;
  defaultSrc: string;
}

const TOOLS: ToolLogo[] = [
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

function ToolItem({ tool }: { tool: ToolLogo; key?: string | number }) {
  return (
    <div className="relative group shrink-0 flex flex-col items-center justify-center cursor-pointer">
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
      <div className="opacity-75 group-hover:opacity-100 transition-all duration-200 w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center group-hover:scale-110">
        {tool.id === 'capcut' ? (
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white p-2 flex items-center justify-center shadow-xs">
            <img
              src={tool.defaultSrc}
              alt={tool.name}
              width="44"
              height="44"
              decoding="async"
              className="w-full h-full object-contain select-none"
              loading="lazy"
            />
          </div>
        ) : (
          <img
            src={tool.defaultSrc}
            alt={tool.name}
            width="46"
            height="46"
            decoding="async"
            className="w-full h-full max-w-[40px] max-h-[40px] sm:max-w-[46px] sm:max-h-[46px] object-contain select-none drop-shadow-xs"
            loading="lazy"
          />
        )}
      </div>
    </div>
  );
}

export function HeroBandeau() {
  // Duplicating the list inside each track guarantees ample items on any screen width
  const trackItems = [...TOOLS, ...TOOLS];

  return (
    <div className="w-full select-none">
      {/* Software, Tools & Programming Languages Infinite Continuous Marquee */}
      <div className="relative py-2 bg-transparent">
        <div className="mask-marquee-edges w-full overflow-hidden">
          <div className="flex w-max animate-marquee pt-7 pb-2 sm:pt-8 sm:pb-3">
            {/* Primary Track: exact twin of Clone Track for seamless looping without any cut */}
            <div className="flex items-center gap-10 sm:gap-14 shrink-0 pr-10 sm:pr-14">
              {trackItems.map((tool, idx) => (
                <ToolItem key={`track1-${tool.id}-${idx}`} tool={tool} />
              ))}
            </div>

            {/* Twin Clone Track: seamlessly enters as Track 1 exits */}
            <div className="flex items-center gap-10 sm:gap-14 shrink-0 pr-10 sm:pr-14" aria-hidden="true">
              {trackItems.map((tool, idx) => (
                <ToolItem key={`track2-${tool.id}-${idx}`} tool={tool} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
