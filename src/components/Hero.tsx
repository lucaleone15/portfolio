import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { HeroBandeau } from './HeroBandeau';

export function Hero() {
  const { lang, t } = useLanguage();

  const scrollToProjects = () => {
    const el = document.getElementById('projets');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[90dvh] pt-24 sm:pt-32 pb-10 sm:pb-14 border-b border-black/[0.06] dark:border-white/[0.06] overflow-hidden flex flex-col justify-between bg-[#F9F9FB] dark:bg-[#0A0A0C] transition-colors duration-300">
      {/* Main Content Area - Clean, airy, zero clutter */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-10 w-full py-8 sm:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl space-y-6 sm:space-y-8"
        >
          {/* Main Title with enhanced typography and neon in dark mode */}
          <h1 className="text-[2.1rem] leading-[1.2] sm:text-4xl md:text-5xl lg:text-[3.6rem] xl:text-[4.1rem] sm:leading-[1.16] lg:leading-[1.12] text-neutral-900 dark:text-white/95 tracking-tight font-normal">
            <span className="block font-sans font-light text-xl sm:text-2xl md:text-3xl text-neutral-600 dark:text-neutral-300 tracking-normal mb-3 sm:mb-4">
              {lang === 'fr' ? (
                <>
                  Salut, je suis <span className="font-medium text-neutral-950 dark:text-white">Luca</span>,
                </>
              ) : (
                <>
                  Hi, I'm <span className="font-medium text-neutral-950 dark:text-white">Luca</span>,
                </>
              )}
            </span>
            {lang === 'fr' ? (
              <>
                Étudiant en{' '}
                <span className="font-extrabold text-neutral-950 dark:text-[#CCFF00] inline-block cursor-default whitespace-nowrap">
                  ingénierie des médias
                </span>{' '}
                à la <span className="font-extrabold text-neutral-950 dark:text-[#CCFF00] inline-block cursor-default whitespace-nowrap">HEIG-VD,</span>{' '}
                je conçois des projets où{' '}
                <span className="font-extrabold text-neutral-950 dark:text-[#CCFF00] inline-block cursor-default whitespace-nowrap">créativité,</span>{' '}
                <span className="font-extrabold text-neutral-950 dark:text-[#CCFF00] inline-block cursor-default whitespace-nowrap">design</span> et{' '}
                <span className="font-extrabold text-neutral-950 dark:text-[#CCFF00] inline-block cursor-default whitespace-nowrap">technologies web</span>{' '}
                se rencontrent.
              </>
            ) : (
              <>
                Media Engineering student at{' '}
                <span className="font-extrabold text-neutral-950 dark:text-[#CCFF00] inline-block cursor-default whitespace-nowrap">HEIG-VD,</span>{' '}
                crafting digital projects where{' '}
                <span className="font-extrabold text-neutral-950 dark:text-[#CCFF00] inline-block cursor-default whitespace-nowrap">creativity,</span>{' '}
                <span className="font-extrabold text-neutral-950 dark:text-[#CCFF00] inline-block cursor-default whitespace-nowrap">design,</span> and{' '}
                <span className="font-extrabold text-neutral-950 dark:text-[#CCFF00] inline-block cursor-default whitespace-nowrap">web technologies</span> meet.
              </>
            )}
          </h1>

          {/* Subtitle with increased desktop presence and comfort */}
          <p className="max-w-3xl text-base sm:text-lg md:text-xl lg:text-2xl text-neutral-600 dark:text-[#A1A1AA] leading-relaxed font-normal">
            {lang === 'fr' ? (
              "De l’idée à la réalisation : stratégie de communication, identité visuelle, création de contenus et développement web."
            ) : (
              "From concept to deployment: communication strategy, visual identity, content creation, and web development."
            )}
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 sm:pt-4 flex flex-wrap items-center gap-3.5 sm:gap-4">
            <button
              onClick={scrollToProjects}
              className="py-4 px-8 sm:px-9 rounded-full bg-neutral-900 text-white hover:bg-black dark:bg-white dark:text-black dark:hover:bg-[#CCFF00] dark:hover:text-black text-sm sm:text-base font-syne font-bold transition-all duration-200 inline-flex items-center justify-center cursor-pointer shadow-xs active:scale-98"
            >
              <span>{t('hero.ctaProjects')}</span>
            </button>

            <a
              href="#contact"
              className="py-4 px-8 sm:px-9 rounded-full bg-black/[0.04] hover:bg-black/[0.08] text-neutral-900 border border-black/15 dark:bg-white/[0.06] dark:hover:bg-white/15 dark:text-white dark:border-white/20 text-sm sm:text-base font-syne font-bold backdrop-blur-xl transition-all duration-200 cursor-pointer active:scale-98 inline-flex items-center justify-center shadow-xs"
            >
              <span>{t('hero.ctaContact')}</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Scrolling competencies & tools logos marquee */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="w-full mt-6"
      >
        <HeroBandeau />
      </motion.div>
    </section>
  );
}

