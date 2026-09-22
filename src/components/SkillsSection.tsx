import { motion } from 'motion/react';
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
    descFr: "Conception d'interfaces intuitives et ergonomiques, wireframes, prototypes interactifs et design systems modulaires.",
    descEn: 'Designing intuitive and ergonomic interfaces, wireframes, interactive prototypes, and modular design systems.',
    tools: ['Figma', 'Prototypage', 'Design Systems', 'Tests utilisateurs', 'Design Thinking']
  },
  {
    id: 'web-dev',
    number: '02',
    titleFr: 'Développement Web',
    titleEn: 'Web Development',
    descFr: "Intégration et développement d'applications web sur mesure, modernes, véloces et pensées pour répondre précisément aux besoins de chaque projet.",
    descEn: 'Developing modern, fast, and tailored web applications crafted to match the specific requirements of each project.',
    tools: ['Vue.js', 'Laravel', 'TypeScript', 'PHP', 'Tailwind CSS', 'WordPress']
  },
  {
    id: 'comm-digitale',
    number: '03',
    titleFr: 'Communication Digitale',
    titleEn: 'Digital Communication',
    descFr: 'Élaboration de stratégies de contenu numérique, gestion de communautés et déploiement de campagnes multicanales engageantes.',
    descEn: 'Developing digital content strategies, managing social channels, and launching engaging multi-platform campaigns.',
    tools: ['Instagram', 'TikTok', 'Social Media', 'Stratégie de marque', 'Storytelling']
  },
  {
    id: 'dir-art',
    number: '04',
    titleFr: 'Direction Artistique',
    titleEn: 'Art Direction',
    descFr: "Création d'identités visuelles singulières, déclinaison de chartes graphiques, typographie soignée et cohérence de marque.",
    descEn: 'Crafting distinctive brand identities, editorial visual guidelines, refined typography, and overall brand coherence.',
    tools: ['Illustrator', 'Photoshop', 'InDesign', 'Typographie', 'Identité visuelle']
  },
  {
    id: 'prod-video',
    number: '05',
    titleFr: 'Production Audiovisuelle',
    titleEn: 'Audiovisual Production',
    descFr: 'Captation photo, tournage et montage vidéo dynamique, étalonnage et formats courts optimisés pour le web et les réseaux.',
    descEn: 'Photography, dynamic video filming and editing, color grading, and short-form storytelling tailored for social platforms.',
    tools: ['Premiere Pro', 'CapCut', 'Photo & Vidéo', 'Étalonnage', 'Reels']
  },
  {
    id: 'gest-projet',
    number: '06',
    titleFr: 'Gestion de Projet Média',
    titleEn: 'Media Project Management',
    descFr: "Coordination d'initiatives pluridisciplinaires, méthodologies agiles, cadrage des besoins et pilotage du brief à la livraison.",
    descEn: 'Coordinating cross-functional media initiatives with agile workflows, scoping requirements from brief to final delivery.',
    tools: ['Notion', 'Jira', 'Agile / Scrum', 'Cahier des charges', 'Coordination']
  }
];

export function SkillsSection() {
  const { lang } = useLanguage();

  return (
    <section
      id="competences"
      className="relative py-16 sm:py-24 bg-[#F9F9FB] dark:bg-[#0A0A0C] border-b border-black/[0.06] dark:border-white/[0.06] transition-colors duration-300"
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-2xl mb-12 sm:mb-16"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-syne font-bold uppercase tracking-widest text-neutral-500 dark:text-[#CCFF00]">
              {lang === 'fr' ? 'Compétences & Savoir-faire' : 'Skills & Capabilities'}
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
          <p className="mt-4 text-base sm:text-lg text-neutral-600 dark:text-[#A1A1AA] leading-relaxed">
            {lang === 'fr'
              ? "Une vision globale du numérique, de la conception visuelle jusqu'à la mise en production."
              : 'A 360° perspective on digital media, from visual concept to technical production.'}
          </p>
        </motion.div>

        {/* Liste Éditoriale + Outils discrets */}
        <div className="divide-y divide-black/10 dark:divide-white/10 border-y border-black/10 dark:border-white/10">
          {SKILLS_DATA.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-30px' }}
              transition={{ duration: 0.45, delay: index * 0.04, ease: [0.16, 1, 0.3, 1] }}
              className="py-7 sm:py-9 transition-colors duration-200"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-6 lg:gap-10 items-baseline">
                {/* Index + Titre */}
                <div className="lg:col-span-5 flex items-baseline gap-4 sm:gap-6">
                  <span className="font-syne font-bold text-xs sm:text-sm text-neutral-400 dark:text-white/40 select-none">
                    {skill.number}
                  </span>
                  <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold font-syne text-neutral-900 dark:text-white tracking-tight">
                    {lang === 'fr' ? skill.titleFr : skill.titleEn}
                  </h3>
                </div>

                {/* Description + Outils légers */}
                <div className="lg:col-span-7 space-y-3">
                  <p className="text-sm sm:text-base text-neutral-600 dark:text-[#A1A1AA] leading-relaxed max-w-2xl">
                    {lang === 'fr' ? skill.descFr : skill.descEn}
                  </p>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-neutral-500 dark:text-white/50 font-medium">
                    {skill.tools.map((tool, idx) => (
                      <span key={tool} className="inline-flex items-center">
                        {idx > 0 && <span className="mr-3 opacity-40">·</span>}
                        <span>{tool}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
