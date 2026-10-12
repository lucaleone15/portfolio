import { useEffect } from 'react';
import { ArrowLeft01Icon, ArrowLeft02Icon, ArrowRight01Icon, ArrowRight02Icon } from '@hugeicons/core-free-icons';
import { Icon } from './Icon';
import { ProjectLogo } from './ProjectLogo';
import { Project } from '../types';
import { projectAccentVars } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { Link, projectPath, useRouter } from '../router';
import { projectMediaTransition } from '../viewTransitions';
import { CaseStudy } from './CaseStudy';
import { getCaseStudy } from '../data/caseStudies';
import { imageSrcSet, smallImage } from '../data/images';

interface ProjectDetailViewProps {
  project: Project | null;
  projects: Project[];
  /** Where "Back to projects" leads: the projects section of the home page */
  backHref: string;
}

export function ProjectDetailView({
  project,
  projects,
  backHref
}: ProjectDetailViewProps) {
  const { lang } = useLanguage();
  const { navigate } = useRouter();

  // Keyboard: Alt+←/→ switch project, Escape goes back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!project) return;
      if (e.key === 'Escape') {
        navigate(backHref);
      } else if (e.key === 'ArrowLeft' && e.altKey) {
        navigate(prevHref);
      } else if (e.key === 'ArrowRight' && e.altKey) {
        navigate(nextHref);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!project) return null;

  // Find index of current project to allow cycling: 0 -> 1 -> 2 -> 3 -> 0
  const currentIndex = projects.findIndex((p) => p.id === project.id);
  const prevProject = currentIndex > 0 ? projects[currentIndex - 1] : projects[projects.length - 1];
  const nextProject = currentIndex < projects.length - 1 ? projects[currentIndex + 1] : projects[0];

  const prevHref = projectPath(lang, prevProject.id);
  const nextHref = projectPath(lang, nextProject.id);

  // Every project has one (App treats a project without a case study as not found)
  const caseStudy = getCaseStudy(project.id, lang);
  if (!caseStudy) return null;

  return (
    <main
      id="main-content"
      style={projectAccentVars(project)}
      className="project-accent min-h-screen bg-[#F9F9FB] text-neutral-900 dark:bg-[#0A0A0C] dark:text-white pt-24 sm:pt-28 pb-20 sm:pb-32 transition-colors duration-300"
    >
      <div className="max-w-6xl mx-auto px-5 sm:px-8 lg:px-12">
        {/* Sticky-friendly Navigation Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 dark:border-white/10 pb-6 mb-8 sm:mb-12">
          {/* Back button */}
          <Link
            href={backHref}
            className="glass font-syne group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full text-neutral-900 dark:text-white text-xs sm:text-sm font-bold cursor-pointer active:scale-[0.97]"
          >
            <Icon icon={ArrowLeft02Icon} className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            <span>{lang === 'fr' ? 'Retour aux projets' : 'Back to projects'}</span>
          </Link>

          {/* Project Carousel Switcher Bar */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="text-xs sm:text-sm font-sans font-medium text-neutral-500 dark:text-[#A1A1AA] mr-1 hidden sm:inline">
              {currentIndex + 1} / {projects.length}
            </span>

            {/* Previous Project Button */}
            <Link
              href={prevHref}
              rel="prev"
              className="glass font-syne inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-neutral-800 dark:text-white/90 hover:text-black dark:hover:text-white text-xs font-semibold cursor-pointer group active:scale-[0.97]"
              title={prevProject.name}
              aria-label={`${lang === 'fr' ? 'Projet précédent' : 'Previous project'} : ${prevProject.name}`}
            >
              <Icon icon={ArrowLeft01Icon} className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden md:inline">{lang === 'fr' ? 'Projet précédent' : 'Previous project'}</span>
            </Link>

            {/* Next Project Button */}
            <Link
              href={nextHref}
              rel="next"
              className="glass font-syne inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-neutral-800 dark:text-white/90 hover:text-black dark:hover:text-white text-xs font-semibold cursor-pointer group active:scale-[0.97]"
              title={nextProject.name}
              aria-label={`${lang === 'fr' ? 'Projet suivant' : 'Next project'} : ${nextProject.name}`}
            >
              <span className="hidden md:inline">{lang === 'fr' ? 'Projet suivant' : 'Next project'}</span>
              <Icon icon={ArrowRight01Icon} className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        <CaseStudy key={`${project.id}-${lang}`} project={project} study={caseStudy} />

        {/* End of the case study: a preview of the next project (its image morphs into that
            project's main visual), then the way back */}
        <nav
          aria-label={lang === 'fr' ? 'Autres projets' : 'More projects'}
          className="mt-16 sm:mt-24 pt-10 sm:pt-14 border-t border-black/10 dark:border-white/10"
        >
          <Link
            href={nextHref}
            style={projectAccentVars(nextProject)}
            className="project-accent group grid sm:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] items-center gap-6 sm:gap-10 p-3 sm:p-4 rounded-3xl bg-black/[0.03] hover:bg-black/[0.06] dark:bg-white/[0.04] dark:hover:bg-white/[0.07] transition-colors cursor-pointer"
          >
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-neutral-200 dark:bg-[#121215]">
              <div
                className="w-full h-full"
                style={nextProject.id !== project.id ? projectMediaTransition(nextProject.id) : undefined}
              >
                <img
                  src={smallImage(nextProject.imageUrl)}
                  srcSet={imageSrcSet(nextProject.imageUrl)}
                  sizes="(min-width: 640px) 50vw, 100vw"
                  alt=""
                  width={640}
                  height={400}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                />
              </div>
            </div>

            <div className="px-3 pb-4 sm:p-0 sm:pr-8 min-w-0">
              <p className="eyebrow sm:text-sm" style={{ color: 'var(--pa-text)' }}>
                {lang === 'fr' ? 'Projet suivant' : 'Next project'}
                <span className="text-neutral-600 dark:text-white/60"> · {nextProject.number}</span>
              </p>
              <p className="mt-4 text-3xl sm:text-4xl lg:text-5xl font-extrabold uppercase tracking-tight leading-[1.05] text-neutral-900 dark:text-white break-words">
                <ProjectLogo project={nextProject} scale={1.8} />
              </p>
              <p className="mt-3 text-sm sm:text-base text-neutral-600 dark:text-[#A1A1AA] leading-relaxed">
                {nextProject.subtitle}
              </p>
              <span className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-neutral-900 dark:text-white">
                {lang === 'fr' ? 'Voir le projet' : 'View project'}
                <span
                  className="inline-flex items-center justify-center w-9 h-9 rounded-full transition-transform duration-300 ease-out group-hover:translate-x-1"
                  style={{ backgroundColor: 'var(--pa)', color: 'var(--pa-on)' }}
                  aria-hidden="true"
                >
                  <Icon icon={ArrowRight02Icon} className="w-4 h-4" />
                </span>
              </span>
            </div>
          </Link>

          <div className="mt-6 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
            <Link
              href={prevHref}
              className="group inline-flex items-center gap-2 min-h-11 px-2 text-sm text-neutral-600 dark:text-[#A1A1AA] hover:text-neutral-900 dark:hover:text-white transition-colors"
            >
              <Icon icon={ArrowLeft01Icon} className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              {lang === 'fr' ? 'Projet précédent' : 'Previous project'}
              <span className="font-bold uppercase text-neutral-900 dark:text-white">{prevProject.name}</span>
            </Link>

            {/* Back to the list of projects (the card morphs back): same button as at the top */}
            <Link
              href={backHref}
              className="glass font-syne group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full text-neutral-900 dark:text-white text-xs sm:text-sm font-bold cursor-pointer active:scale-[0.97]"
            >
              <Icon icon={ArrowLeft02Icon} className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
              {lang === 'fr' ? 'Retour aux projets' : 'Back to projects'}
            </Link>
          </div>
        </nav>
      </div>
    </main>
  );
}
