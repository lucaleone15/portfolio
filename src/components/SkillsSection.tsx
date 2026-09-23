import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface SkillItem {
  id: string;
  number: string;
  titleFr: string;
  titleEn: string;
  descFr: string;
  descEn: string;
  tools: string[];
}

const SKILLS_DATA: SkillItem[] = [
  {
    id: 'ui-ux',
    number: '01',
    titleFr: 'UI/UX Design',
    titleEn: 'UI/UX Design',
    descFr: "Conception d'interfaces intuitives et ergonomiques, wireframes, prototypes interactifs haute fidélité et design systems modulaires.",
    descEn: 'Designing intuitive and ergonomic interfaces, wireframes, high-fidelity interactive prototypes, and modular design systems.',
    tools: ['Figma', 'Prototypage', 'Design Systems', 'Tests utilisateurs', 'Design Thinking', 'Auto-Layout']
  },
  {
    id: 'web-dev',
    number: '02',
    titleFr: 'Développement Web',
    titleEn: 'Web Development',
    descFr: "Intégration et développement d'applications web sur mesure, modernes, véloces et pensées pour répondre précisément aux besoins de chaque projet.",
    descEn: 'Developing modern, fast, and tailored web applications crafted to match the specific requirements of each project.',
    tools: ['Vue.js', 'Laravel', 'JavaScript', 'PHP', 'Tailwind CSS', 'WordPress', 'MySQL']
  },
  {
    id: 'comm-digitale',
    number: '03',
    titleFr: 'Communication Digitale',
    titleEn: 'Digital Communication',
    descFr: 'Élaboration de stratégies de contenu numérique, gestion de communautés et déploiement de campagnes multicanales engageantes.',
    descEn: 'Developing digital content strategies, managing social channels, and launching engaging multi-platform campaigns.',
    tools: ['Instagram', 'TikTok', 'Social Media', 'Stratégie de marque', 'Storytelling', 'Community Management']
  },
  {
    id: 'dir-art',
    number: '04',
    titleFr: 'Direction Artistique',
    titleEn: 'Art Direction',
    descFr: "Création d'identités visuelles singulières, déclinaison de chartes graphiques, typographie soignée et cohérence de marque.",
    descEn: 'Crafting distinctive brand identities, editorial visual guidelines, refined typography, and overall brand coherence.',
    tools: ['Illustrator', 'Photoshop', 'InDesign', 'Typographie', 'Identité visuelle', 'Grilles & Layouts']
  },
  {
    id: 'prod-video',
    number: '05',
    titleFr: 'Production Audiovisuelle',
    titleEn: 'Audiovisual Production',
    descFr: 'Captation photo, tournage et montage vidéo dynamique sur le terrain, étalonnage et formats courts optimisés pour le web et les réseaux.',
    descEn: 'Photography, dynamic on-site video filming and editing, color grading, and short-form storytelling tailored for social platforms.',
    tools: ['Premiere Pro', 'CapCut', 'Photo & Vidéo', 'Étalonnage', 'Reels', 'Prise de son']
  },
  {
    id: 'gest-projet',
    number: '06',
    titleFr: 'Gestion de Projet Média',
    titleEn: 'Media Project Management',
    descFr: "Coordination d'initiatives pluridisciplinaires, méthodologies agiles, cadrage des besoins et pilotage rigoureux du brief à la livraison.",
    descEn: 'Coordinating cross-functional media initiatives with agile workflows, scoping requirements from brief to final delivery.',
    tools: ['Notion', 'Jira', 'Agile / Scrum', 'Cahier des charges', 'Coordination', 'Planning']
  }
];

export function SkillsSection() {
  const { lang } = useLanguage();
  const [activeSkillId, setActiveSkillId] = useState<string | null>(null);

  const toggleSkill = (id: string) => {
    setActiveSkillId((prev) => (prev === id ? null : id));
  };

  return (
    <section
      id="competences"
      className="relative py-20 sm:py-28 bg-[#F9F9FB] dark:bg-[#0A0A0C] border-b border-black/[0.06] dark:border-white/[0.06] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Section Header with smooth entrance */}
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl mb-12 sm:mb-16"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-syne font-bold uppercase tracking-widest text-neutral-500 dark:text-[#CCFF00]">
              {lang === 'fr' ? 'Compétences' : 'Skills & Capabilities'}
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-[1.18]">
            {lang === 'fr' ? (
              <>
                Savoir-faire alliant{' '}
                <span className="text-neutral-950 dark:text-[#CCFF00]">créativité</span> et{' '}
                <span className="text-neutral-950 dark:text-[#CCFF00]">technique</span>.
              </>
            ) : (
              <>
                Expertise bridging{' '}
                <span className="text-neutral-950 dark:text-[#CCFF00]">design</span> and{' '}
                <span className="text-neutral-950 dark:text-[#CCFF00]">technology</span>.
              </>
            )}
          </h2>
        </motion.div>

        {/* Interactive Skills List: Only Number + Title visible by default; Description & Tags appear on hover / click */}
        <div className="divide-y divide-black/10 dark:divide-white/10 border-y border-black/10 dark:border-white/10">
          {SKILLS_DATA.map((skill, index) => {
            const isHoveredOrActive = activeSkillId === skill.id;

            return (
              <motion.div
                key={skill.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.05,
                  ease: [0.16, 1, 0.3, 1]
                }}
                onMouseEnter={() => setActiveSkillId(skill.id)}
                onMouseLeave={() => setActiveSkillId(null)}
                className={`group transition-all duration-300 ${
                  isHoveredOrActive ? 'bg-black/[0.02] dark:bg-white/[0.02]' : ''
                }`}
              >
                <div
                  onClick={() => toggleSkill(skill.id)}
                  className="py-7 sm:py-8 cursor-pointer select-none"
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleSkill(skill.id);
                    }
                  }}
                  aria-expanded={isHoveredOrActive}
                >
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 lg:gap-10 items-start">
                    {/* Index + Titre principal */}
                    <div className="lg:col-span-5 flex items-baseline gap-4 sm:gap-6">
                      <span
                        className={`font-syne font-bold text-xs sm:text-sm transition-colors duration-200 select-none ${
                          isHoveredOrActive
                            ? 'text-neutral-900 dark:text-[#CCFF00]'
                            : 'text-neutral-400 dark:text-white/40 group-hover:text-neutral-900 dark:group-hover:text-[#CCFF00]'
                        }`}
                      >
                        {skill.number}
                      </span>
                      <h3
                        className={`text-xl sm:text-2xl lg:text-3xl font-extrabold font-syne tracking-tight transition-colors duration-200 ${
                          isHoveredOrActive
                            ? 'text-neutral-900 dark:text-[#CCFF00]'
                            : 'text-neutral-900 dark:text-white group-hover:text-black dark:group-hover:text-[#CCFF00]'
                        }`}
                      >
                        {lang === 'fr' ? skill.titleFr : skill.titleEn}
                      </h3>
                    </div>

                    {/* Description et tags qui apparaissent UNIQUEMENT quand on va dessus */}
                    <div className="lg:col-span-7">
                      <AnimatePresence>
                        {isHoveredOrActive ? (
                          <motion.div
                            key="content"
                            initial={{ opacity: 0, y: -6, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -6, height: 0 }}
                            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-4 overflow-hidden"
                          >
                            <p className="text-sm sm:text-base text-neutral-600 dark:text-[#A1A1AA] leading-relaxed max-w-2xl">
                              {lang === 'fr' ? skill.descFr : skill.descEn}
                            </p>

                            {/* Tags des outils */}
                            <div className="flex flex-wrap gap-2 pt-1 pb-1">
                              {skill.tools.map((tool) => (
                                <span
                                  key={tool}
                                  className="h-7 px-3 rounded-full text-xs font-syne font-medium inline-flex items-center bg-black/[0.05] text-neutral-800 dark:bg-white/[0.08] dark:text-neutral-200"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        ) : (
                          // Hint discret sur desktop quand pas survolé
                          <div className="hidden lg:flex items-center h-8 text-xs font-syne text-neutral-400 dark:text-neutral-600 group-hover:text-neutral-600 dark:group-hover:text-neutral-400 transition-colors">
                            <span>{lang === 'fr' ? 'Survoler pour afficher' : 'Hover to reveal'}</span>
                          </div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
