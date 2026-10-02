import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react';
import { Project } from '../types';
import { projectAccentVars } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';
import { Link, projectPath, useRouter } from '../router';
import { projectMediaTransition } from '../viewTransitions';
import { ProjectStory } from './ProjectStory';
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
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Reset the gallery when switching project (the router handles scrolling)
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [project?.id]);

  const imageCount = project?.images?.length || 1;

  // Keyboard: ←/→ browse the gallery, Alt+←/→ switch project, Escape goes back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!project) return;
      if (e.key === 'Escape') {
        navigate(backHref);
      } else if (e.key === 'ArrowLeft' && !e.altKey && !e.metaKey && !e.ctrlKey) {
        setCurrentImageIndex((i) => (i === 0 ? imageCount - 1 : i - 1));
      } else if (e.key === 'ArrowRight' && !e.altKey && !e.metaKey && !e.ctrlKey) {
        setCurrentImageIndex((i) => (i === imageCount - 1 ? 0 : i + 1));
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

  const projectImages: string[] = (project.images && project.images.length > 0)
    ? project.images
    : [project.imageUrl];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? projectImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === projectImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <div
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
            className="font-syne group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-full bg-black/[0.04] hover:bg-neutral-900 hover:text-white dark:bg-white/[0.06] dark:hover:bg-[var(--accent-primary)] dark:hover:text-[var(--accent-text)] border border-black/15 dark:border-white/15 text-neutral-900 dark:text-white text-xs sm:text-sm font-bold transition duration-200 cursor-pointer active:scale-[0.97] shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
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
              className="font-syne inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.12] border border-black/15 dark:border-white/15 text-neutral-800 dark:text-white/90 hover:text-black dark:hover:text-white text-xs font-semibold transition cursor-pointer group active:scale-[0.97]"
              title={prevProject.name}
              aria-label={`${lang === 'fr' ? 'Projet précédent' : 'Previous project'} : ${prevProject.name}`}
            >
              <ChevronLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
              <span className="hidden md:inline">{lang === 'fr' ? 'Projet précédent' : 'Previous project'}</span>
            </Link>

            {/* Next Project Button */}
            <Link
              href={nextHref}
              rel="next"
              className="font-syne inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/[0.04] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.12] border border-black/15 dark:border-white/15 text-neutral-800 dark:text-white/90 hover:text-black dark:hover:text-white text-xs font-semibold transition cursor-pointer group active:scale-[0.97]"
              title={nextProject.name}
              aria-label={`${lang === 'fr' ? 'Projet suivant' : 'Next project'} : ${nextProject.name}`}
            >
              <span className="hidden md:inline">{lang === 'fr' ? 'Projet suivant' : 'Next project'}</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Project Meta Info Header */}
        <div className="space-y-4 mb-8 sm:mb-10">
          <div className="flex flex-wrap items-center gap-3">
            <span
              className="font-syne font-bold px-4 py-1.5 rounded-full text-xs tracking-wide shadow-xs transition-colors text-white"
              style={{ backgroundColor: 'var(--pa)' }}
            >
              {project.category}
            </span>
            {project.role && (
              <span className="font-semibold px-3 py-1 rounded-full text-xs tracking-wide bg-neutral-100 dark:bg-white/10 text-neutral-800 dark:text-[#E4E4E7]">
                {project.role}
              </span>
            )}
            <span
              className="flex items-center gap-1.5 text-xs font-bold"
              style={{ color: 'var(--pa-text)' }}
            >
              <Calendar className="w-3.5 h-3.5" />
              {project.year}
            </span>
            {project.client && (
              <span className="flex items-center gap-1.5 text-xs text-neutral-500 dark:text-[#A1A1AA] font-medium">
                <User className="w-3.5 h-3.5 text-neutral-400 dark:text-white/50" />
                {project.client}
              </span>
            )}
          </div>

          {/* Proper-case name in the DOM (what search engines read), uppercase on screen */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-neutral-900 dark:text-white tracking-tight leading-tight uppercase">
            {project.name}
          </h1>

          <p className="text-lg sm:text-xl text-neutral-600 dark:text-[#A1A1AA] font-normal max-w-4xl">
            {project.subtitle}
          </p>

          {/* Fait avec / Collaborateurs - Sans cadre ni icône, sobre et aéré */}
          {project.team && (
            <p className="text-sm sm:text-base text-neutral-600 dark:text-[#A1A1AA] pt-1">
              <span className="font-bold text-neutral-900 dark:text-white">
                {lang === 'fr' ? 'Fait avec :' : 'Made with:'}{' '}
              </span>
              <span className="font-medium text-neutral-700 dark:text-[#E4E4E7]">
                {project.team.replace(/^Fait avec\s*:\s*/i, '').replace(/^Made with\s*:\s*/i, '')}
              </span>
            </p>
          )}
        </div>

        {/* Main Gallery Showcase (16/9 ratio, Carousel & Thumbnails) */}
        <div className="space-y-4 mb-12 sm:mb-16">
          {/* Shares its view-transition name with this project's card: the card image morphs into it */}
          <div
            style={projectMediaTransition(project.id)}
            className="relative aspect-[16/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden bg-neutral-200 dark:bg-[#141418] border border-black/10 dark:border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.15)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.8)] group"
          >
            {/* Crossfade: old and new image overlap (no blank gap between them) */}
            <AnimatePresence initial={false}>
              <motion.img
                key={projectImages[currentImageIndex]}
                src={projectImages[currentImageIndex]}
                srcSet={imageSrcSet(projectImages[currentImageIndex])}
                sizes="(min-width: 1152px) 1088px, 100vw"
                fetchPriority={currentImageIndex === 0 ? 'high' : 'auto'}
                alt={`${project.name} – ${lang === 'fr' ? 'visuel' : 'image'} ${currentImageIndex + 1}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover object-center select-none"
              />
            </AnimatePresence>

            {/* Gallery Arrows if multiple images */}
            {projectImages.length > 1 && (
              <>
                <button
                  onClick={handlePrevImage}
                  className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md opacity-90 hover:opacity-100 transition cursor-pointer shadow-lg active:scale-[0.97]"
                  aria-label={lang === 'fr' ? 'Image précédente' : 'Previous image'}
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                <button
                  onClick={handleNextImage}
                  className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md opacity-90 hover:opacity-100 transition cursor-pointer shadow-lg active:scale-[0.97]"
                  aria-label={lang === 'fr' ? 'Image suivante' : 'Next image'}
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>

                {/* Counter Pill */}
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-0.5 pl-2 pr-3.5 py-0.5 rounded-full bg-black/70 border border-white/20 backdrop-blur-md">
                  {projectImages.map((_, idx) => (
                    // 24px touch target (buttons side by side, no overlap); the dot is the inner span
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className="group/dot w-6 h-6 shrink-0 cursor-pointer inline-flex items-center justify-center"
                      aria-label={lang === 'fr' ? `Aller à l'image ${idx + 1}` : `Go to image ${idx + 1}`}
                      aria-current={currentImageIndex === idx ? 'true' : undefined}
                    >
                      <span
                        className={`block transition-all rounded-full ${
                          currentImageIndex === idx ? 'w-6 h-1.5' : 'w-1.5 h-1.5 bg-white/40 group-hover/dot:bg-white/80'
                        }`}
                        style={currentImageIndex === idx ? { backgroundColor: 'var(--pa-dark)' } : undefined}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-sans font-medium text-white/80 ml-1.5">
                    {currentImageIndex + 1}/{projectImages.length}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Thumbnails row */}
          {projectImages.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto py-2 px-1">
              {projectImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentImageIndex(idx)}
                  className={`relative w-24 sm:w-32 h-16 sm:h-20 rounded-xl overflow-hidden shrink-0 transition duration-200 cursor-pointer ${
                    currentImageIndex === idx
                      ? 'ring-2 opacity-100'
                      : 'border border-black/15 dark:border-white/20 opacity-60 hover:opacity-100 hover:border-black/30 dark:hover:border-white/40'
                  }`}
                  style={currentImageIndex === idx ? {
                    borderColor: 'var(--pa-text)',
                    boxShadow: '0 0 14px color-mix(in srgb, var(--pa-text) 40%, transparent)'
                  } : undefined}
                >
                  <img
                    src={smallImage(img)}
                    alt={`${project.name} – ${lang === 'fr' ? 'miniature' : 'thumbnail'} ${idx + 1}`}
                    width="128"
                    height="80"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Case study told while scrolling */}
        <ProjectStory key={`${project.id}-${lang}`} project={project} />

        {/* Bottom Carousel Project Bar (Loop through projects) */}
        <div className="mt-16 sm:mt-24 pt-8 border-t border-black/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link
            href={prevHref}
            style={projectAccentVars(prevProject)}
            className="project-accent w-full sm:w-auto inline-flex items-center justify-center sm:justify-start gap-3 px-6 py-4 rounded-2xl bg-black/[0.03] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.1] border border-black/10 dark:border-white/15 transition cursor-pointer group text-left"
          >
            <ChevronLeft
              className="w-5 h-5 group-hover:-translate-x-1 transition-transform"
              style={{ color: 'var(--pa-text)' }}
            />
            <div>
              <p className="text-xs text-neutral-500 dark:text-[#A1A1AA] uppercase font-semibold">
                {lang === 'fr' ? 'Projet précédent' : 'Previous'}
              </p>
              <p className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white line-clamp-1">
                {prevProject.title}
              </p>
            </div>
          </Link>

          {/* End of a case study: back to the list of projects (the card morphs back) */}
          <Link
            href={backHref}
            className="font-syne group inline-flex items-center gap-2 px-6 py-3 rounded-full bg-neutral-900 text-white hover:bg-[var(--accent)] hover:text-[var(--accent-contrast-text)] dark:bg-white dark:text-black dark:hover:bg-[var(--accent)] dark:hover:text-[var(--accent-contrast-text)] text-xs sm:text-sm font-bold transition active:scale-[0.97] cursor-pointer shadow-xs"
          >
            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" aria-hidden="true" />
            {lang === 'fr' ? 'Retour aux projets' : 'Back to projects'}
          </Link>

          <Link
            href={nextHref}
            style={projectAccentVars(nextProject)}
            className="project-accent w-full sm:w-auto inline-flex items-center justify-center sm:justify-end gap-3 px-6 py-4 rounded-2xl bg-black/[0.03] hover:bg-black/[0.08] dark:bg-white/[0.04] dark:hover:bg-white/[0.1] border border-black/10 dark:border-white/15 transition cursor-pointer group text-right"
          >
            <div>
              <p className="text-xs text-neutral-500 dark:text-[#A1A1AA] uppercase font-semibold">
                {lang === 'fr' ? 'Projet suivant' : 'Next'}
              </p>
              <p className="text-sm sm:text-base font-bold text-neutral-900 dark:text-white line-clamp-1">
                {nextProject.title}
              </p>
            </div>
            <ChevronRight
              className="w-5 h-5 group-hover:translate-x-1 transition-transform"
              style={{ color: 'var(--pa-text)' }}
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
