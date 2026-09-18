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
    <section className="relative pt-24 sm:pt-32 pb-4 sm:pb-8 border-b border-white/[0.06] overflow-hidden">
      {/* Subtle ambient lighting - neutral dark canvas */}
      <div className="absolute -top-32 left-1/4 w-[500px] h-[500px] bg-[#CCFF00]/5 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Main Hero Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-4xl space-y-4 sm:space-y-6"
        >
          {/* Main Title with selective green & bold highlights and dynamic text shine */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.6rem] leading-[1.28] text-white/90 tracking-tight font-normal">
            {lang === 'fr' ? (
              <>
                Étudiant en{' '}
                <span className="font-extrabold text-[#CCFF00] hover:brightness-125 transition-all duration-300 inline-block cursor-default">
                  ingénierie des médias
                </span>{' '}
                à la <span className="font-extrabold text-white hover:text-[#CCFF00] transition-colors duration-300 inline-block cursor-default">HEIG-VD</span>, je
                conçois des projets numériques où{' '}
                <span className="font-extrabold text-[#CCFF00] hover:brightness-125 transition-all duration-300 inline-block cursor-default">créativité</span>,{' '}
                <span className="font-extrabold text-white hover:text-[#CCFF00] transition-colors duration-300 inline-block cursor-default">design</span> et{' '}
                <span className="font-extrabold text-[#CCFF00] hover:brightness-125 transition-all duration-300 inline-block cursor-default">technologies web</span>{' '}
                se rencontrent.
              </>
            ) : (
              <>
                <span className="font-extrabold text-[#CCFF00] hover:brightness-125 transition-all duration-300 inline-block cursor-default">
                  Media Engineering
                </span>{' '}
                student at <span className="font-extrabold text-white hover:text-[#CCFF00] transition-colors duration-300 inline-block cursor-default">HEIG-VD</span>, I
                craft digital projects bridging{' '}
                <span className="font-extrabold text-[#CCFF00] hover:brightness-125 transition-all duration-300 inline-block cursor-default">creativity</span>,{' '}
                <span className="font-extrabold text-white hover:text-[#CCFF00] transition-colors duration-300 inline-block cursor-default">design</span>, and{' '}
                <span className="font-extrabold text-[#CCFF00] hover:brightness-125 transition-all duration-300 inline-block cursor-default">web technologies</span>.
              </>
            )}
          </h1>

          {/* Subtitle with unbolded normal weight as requested */}
          <p className="max-w-3xl text-sm sm:text-base md:text-lg text-[#A1A1AA] leading-relaxed font-normal">
            {lang === 'fr' ? (
              "De l’idée à la réalisation : stratégie de communication, identité visuelle, création de contenus et développement web."
            ) : (
              "From concept to deployment: communication strategy, visual identity, content creation, and web development."
            )}
          </p>

          {/* CTA Buttons - Clean styling with no icons */}
          <div className="pt-2 flex flex-wrap items-center gap-3.5">
            <button
              onClick={scrollToProjects}
              className="py-3.5 px-8 rounded-full bg-white text-black hover:bg-[#CCFF00] text-xs font-bold transition-colors duration-200 inline-flex items-center justify-center cursor-pointer shadow-xs active:scale-98"
            >
              <span>{t('hero.ctaProjects')}</span>
            </button>

            <a
              href="#contact"
              className="py-3.5 px-8 rounded-full bg-white/[0.04] hover:bg-white/10 text-white border border-white/10 text-xs font-semibold backdrop-blur-md transition-colors duration-200 cursor-pointer active:scale-98 inline-flex items-center justify-center"
            >
              <span>{t('hero.ctaContact')}</span>
            </a>
          </div>
        </motion.div>
      </div>

      {/* Double Bandeau: Competencies Ticker + Tool Brand Logos with User Upload Directory Support */}
      <HeroBandeau />
    </section>
  );
}
