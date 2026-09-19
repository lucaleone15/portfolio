import { motion } from 'motion/react';
import { HeroBandeau } from './HeroBandeau';
import { useLanguage } from '../context/LanguageContext';

export function Hero() {
  const { lang, t } = useLanguage();

  const scrollToProjects = () => {
    const el = document.getElementById('projets');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-[100dvh] pt-20 sm:pt-24 pb-2 sm:pb-6 border-b border-white/[0.06] overflow-hidden flex flex-col justify-between">
      {/* Subtle ambient lighting - neutral dark canvas */}
      <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Main Content Area - Vertically centered in the available space above bandeau */}
      <div className="max-w-7xl mx-auto px-5 sm:px-10 w-full my-auto py-5 sm:py-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl space-y-5 sm:space-y-5"
        >
          {/* Main Title with enhanced mobile font sizing for high impact and great readability */}
          <h1 className="text-[1.85rem] leading-[1.25] sm:text-3xl md:text-4xl lg:text-[2.6rem] sm:leading-[1.28] text-white/95 tracking-tight font-normal">
            {lang === 'fr' ? (
              <>
                Étudiant en{' '}
                <span className="font-extrabold text-[#CCFF00] hover:brightness-125 transition-all duration-300 inline-block cursor-default whitespace-nowrap">
                  ingénierie des médias
                </span>{' '}
                <span className="whitespace-nowrap">
                  à la <span className="font-extrabold text-white hover:text-[#CCFF00] transition-colors duration-300 inline-block cursor-default">HEIG-VD</span>,
                </span>{' '}
                je conçois des projets numériques où{' '}
                <span className="font-extrabold text-[#CCFF00] hover:brightness-125 transition-all duration-300 inline-block cursor-default">créativité</span>,{' '}
                <span className="font-extrabold text-white hover:text-[#CCFF00] transition-colors duration-300 inline-block cursor-default">design</span> et{' '}
                <span className="font-extrabold text-[#CCFF00] hover:brightness-125 transition-all duration-300 inline-block cursor-default">technologies web</span>{' '}
                se rencontrent.
              </>
            ) : (
              <>
                <span className="font-extrabold text-[#CCFF00] hover:brightness-125 transition-all duration-300 inline-block cursor-default whitespace-nowrap">
                  Media Engineering
                </span>{' '}
                <span className="whitespace-nowrap">
                  student at <span className="font-extrabold text-white hover:text-[#CCFF00] transition-colors duration-300 inline-block cursor-default">HEIG-VD</span>,
                </span>{' '}
                I craft digital projects bridging{' '}
                <span className="font-extrabold text-[#CCFF00] hover:brightness-125 transition-all duration-300 inline-block cursor-default">creativity</span>,{' '}
                <span className="font-extrabold text-white hover:text-[#CCFF00] transition-colors duration-300 inline-block cursor-default">design</span>, and{' '}
                <span className="font-extrabold text-[#CCFF00] hover:brightness-125 transition-all duration-300 inline-block cursor-default">web technologies</span>.
              </>
            )}
          </h1>

          {/* Subtitle with high readability on mobile */}
          <p className="max-w-3xl text-base sm:text-base md:text-lg text-[#A1A1AA] leading-relaxed font-normal">
            {lang === 'fr' ? (
              "De l’idée à la réalisation : stratégie de communication, identité visuelle, création de contenus et développement web."
            ) : (
              "From concept to deployment: communication strategy, visual identity, content creation, and web development."
            )}
          </p>

          {/* CTA Buttons - Clean styling with proportional mobile touch targets */}
          <div className="pt-2 sm:pt-2 flex flex-wrap items-center gap-3 sm:gap-3.5">
            <button
              onClick={scrollToProjects}
              className="py-3.5 px-7 sm:px-8 rounded-full bg-white text-black hover:bg-[#CCFF00] text-xs sm:text-xs font-bold transition-colors duration-200 inline-flex items-center justify-center cursor-pointer shadow-xs active:scale-98"
            >
              <span>{t('hero.ctaProjects')}</span>
            </button>

            <a
              href="#contact"
              className="py-3.5 px-7 sm:px-8 rounded-full bg-white/[0.04] hover:bg-white/10 text-white border border-white/10 text-xs sm:text-xs font-semibold backdrop-blur-md transition-colors duration-200 cursor-pointer active:scale-98 inline-flex items-center justify-center"
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
