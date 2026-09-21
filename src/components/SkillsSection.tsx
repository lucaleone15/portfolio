import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

export function SkillsSection() {
  const { lang } = useLanguage();

  const skills = [
    {
      title: lang === 'fr' ? 'UI/UX Design' : 'UI/UX Design',
      description:
        lang === 'fr'
          ? "Conception d'interfaces intuitives et ergonomiques, wireframes, prototypes interactifs et design systems modulaires."
          : 'Designing intuitive and ergonomic interfaces, wireframes, interactive prototypes, and modular design systems.',
    },
    {
      title: lang === 'fr' ? 'Développement Web' : 'Web Development',
      description:
        lang === 'fr'
          ? "Intégration d'applications web modernes et réactives avec TypeScript, React et Tailwind CSS, optimisées pour tous les écrans."
          : 'Building modern and responsive web applications with TypeScript, React, and Tailwind CSS, optimized for every screen.',
    },
    {
      title: lang === 'fr' ? 'Communication Digitale' : 'Digital Communication',
      description:
        lang === 'fr'
          ? "Élaboration de stratégies de contenu numérique, gestion de communautés et déploiement de campagnes multicanales engageantes."
          : 'Developing digital content strategies, managing social channels, and launching engaging multi-platform campaigns.',
    },
    {
      title: lang === 'fr' ? 'Direction Artistique' : 'Art Direction',
      description:
        lang === 'fr'
          ? "Création d'identités visuelles singulières, déclinaison de chartes graphiques, typographie soignée et cohérence de marque."
          : 'Crafting distinctive brand identities, editorial visual guidelines, refined typography, and overall brand coherence.',
    },
    {
      title: lang === 'fr' ? 'Production Audiovisuelle' : 'Audiovisual Production',
      description:
        lang === 'fr'
          ? "Captation photo, tournage et montage vidéo dynamique, étalonnage et formats courts optimisés pour le web et les réseaux."
          : 'Photography, dynamic video filming and editing, color grading, and short-form storytelling tailored for social platforms.',
    },
    {
      title: lang === 'fr' ? 'Gestion de Projet Média' : 'Media Project Management',
      description:
        lang === 'fr'
          ? "Coordination d'initiatives pluridisciplinaires, méthodologies agiles, cadrage des besoins et pilotage du brief à la livraison."
          : 'Coordinating cross-functional media initiatives with agile workflows, scoping requirements from brief to final delivery.',
    },
  ];

  return (
    <section id="competences" className="relative py-16 sm:py-24 bg-[#F9F9FB] dark:bg-[#0A0A0C] border-b border-black/[0.06] dark:border-white/[0.06] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Section Header - Clean, direct typography */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.18]">
            {lang === 'fr' ? (
              <>
                Savoir-faire alliant{' '}
                <span className="text-neutral-950 dark:text-[#CCFF00]">
                  créativité
                </span>{' '}
                et{' '}
                <span className="text-neutral-950 dark:text-[#CCFF00]">
                  technique
                </span>
                .
              </>
            ) : (
              <>
                Expertise bridging{' '}
                <span className="text-neutral-950 dark:text-[#CCFF00]">
                  design
                </span>{' '}
                and{' '}
                <span className="text-neutral-950 dark:text-[#CCFF00]">
                  technology
                </span>
                .
              </>
            )}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-[#A1A1AA] leading-relaxed">
            {lang === 'fr'
              ? "Une vision globale du numérique, de la conception visuelle jusqu'à la mise en production."
              : 'A 360° perspective on digital media, from visual concept to technical production.'}
          </p>
        </motion.div>

        {/* Frameless, clean typographic grid with just Title and Description */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-12 sm:gap-x-14 gap-y-10 sm:gap-y-14">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: index * 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col"
            >
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900 dark:text-white mb-2.5">
                {skill.title}
              </h3>
              <p className="text-sm sm:text-base text-neutral-600 dark:text-[#A1A1AA] leading-relaxed">
                {skill.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
