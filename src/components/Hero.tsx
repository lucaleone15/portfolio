import { motion } from 'motion/react';
import { HeroBandeau, CompetenciesMarquee } from './HeroBandeau';
import { useLanguage } from '../context/LanguageContext';

export function Hero() {
  const { lang, t } = useLanguage();

  const scrollToProjects = () => {
    const el = document.getElementById('projets');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100dvh] pt-16 sm:pt-20 pb-2 sm:pb-6 border-b border-white/[0.06] overflow-hidden flex flex-col justify-between bg-[#0A0A0C]">
      {/* Background static subtle texture (competencies text in background with very light opacity) */}
      <CompetenciesMarquee />

      {/* Main Content Area - Vertically centered in the available space */}
      <div className="relative z-10 max-w-7xl mx-auto px-5 sm:px-10 w-full my-auto py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl space-y-6 sm:space-y-8"
        >
          {/* Subtle greeting with contrasting serif typography */}
          <div className="flex items-center gap-3">
            <p className="font-serif italic text-lg sm:text-xl md:text-2xl text-[#A1A1AA]/80 font-normal tracking-wide select-none">
              {lang === 'fr' ? 'Salut, je suis Luca Leone' : 'Hi, I’m Luca Leone'}
            </p>
          </div>

          {/* Main Title with enhanced desktop and tablet scale for commanding presence */}
          <h1 className="text-[2rem] leading-[1.22] sm:text-4xl md:text-5xl lg:text-[3.5rem] xl:text-[4rem] sm:leading-[1.18] lg:leading-[1.14] text-white/95 tracking-tight font-normal">
            {lang === 'fr' ? (
              <>
                Étudiant en{' '}
                <span className="font-extrabold text-[#CCFF00] inline-block cursor-default whitespace-nowrap">
                  ingénierie des médias
                </span>{' '}
                à la <span className="font-extrabold text-[#CCFF00] inline-block cursor-default whitespace-nowrap">HEIG-VD,</span>{' '}
                je conçois des projets numériques où{' '}
                <span className="font-extrabold text-[#CCFF00] inline-block cursor-default whitespace-nowrap">créativité,</span>{' '}
                <span className="font-extrabold text-[#CCFF00] inline-block cursor-default whitespace-nowrap">design</span> et{' '}
                <span className="font-extrabold text-[#CCFF00] inline-block cursor-default whitespace-nowrap">technologies web</span>{' '}
                se rencontrent.
              </>
            ) : (
              <>
                <span className="font-extrabold text-[#CCFF00] inline-block cursor-default whitespace-nowrap">
                  Media Engineering
                </span>{' '}
                student at <span className="font-extrabold text-[#CCFF00] inline-block cursor-default whitespace-nowrap">HEIG-VD,</span>{' '}
                I craft digital projects bridging{' '}
                <span className="font-extrabold text-[#CCFF00] inline-block cursor-default whitespace-nowrap">creativity,</span>{' '}
                <span className="font-extrabold text-[#CCFF00] inline-block cursor-default whitespace-nowrap">design,</span> and{' '}
                <span className="font-extrabold text-[#CCFF00] inline-block cursor-default whitespace-nowrap">web technologies.</span>
              </>
            )}
          </h1>

          {/* Subtitle with increased desktop presence and comfort */}
          <p className="max-w-3xl text-base sm:text-lg md:text-xl lg:text-2xl text-[#A1A1AA] leading-relaxed font-normal">
            {lang === 'fr' ? (
              "De l’idée à la réalisation : stratégie de communication, identité visuelle, création de contenus et développement web."
            ) : (
              "From concept to deployment: communication strategy, visual identity, content creation, and web development."
            )}
          </p>

          {/* CTA Buttons - Syne typography with proportional touch targets */}
          <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3.5 sm:gap-4">
            <button
              onClick={scrollToProjects}
              className="py-4 px-8 sm:px-9 rounded-full bg-white text-black hover:bg-[#CCFF00] text-sm sm:text-base font-syne font-bold transition-all duration-200 inline-flex items-center justify-center cursor-pointer shadow-xs active:scale-98"
            >
              <span>{t('hero.ctaProjects')}</span>
            </button>

            <a
              href="#contact"
              className="py-4 px-8 sm:px-9 rounded-full bg-white/[0.06] hover:bg-white/15 text-white border border-white/20 text-sm sm:text-base font-syne font-bold backdrop-blur-xl transition-all duration-200 cursor-pointer active:scale-98 inline-flex items-center justify-center shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]"
            >
              <span>{t('hero.ctaContact')}</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Double Bandeau: Competencies Ticker + Tool Brand Logos */}
      <HeroBandeau />
    </section>
  );
}
