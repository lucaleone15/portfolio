import { useEffect, useState, MouseEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '../types';
import { PROJECTS_FR, PROJECTS_EN } from '../data/portfolioData';
import { useLanguage } from '../context/LanguageContext';

interface ProjectModalProps {
  project: Project | null;
  onClose: () => void;
}

export function ProjectModal({ project, onClose }: ProjectModalProps) {
  const { lang, t } = useLanguage();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    setCurrentImageIndex(0);
  }, [project?.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (project) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [project, onClose]);

  if (!project) return null;

  // Retrieve localized project data according to current language
  const localizedList = lang === 'fr' ? PROJECTS_FR : PROJECTS_EN;
  const activeProject = localizedList.find((p) => p.id === project.id) || project;

  // Multi-image gallery support
  const projectImages: string[] = (activeProject.images && activeProject.images.length > 0)
    ? activeProject.images
    : [activeProject.imageUrl];

  const handlePrevImage = (e: MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? projectImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e: MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === projectImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-[#000000]/80 backdrop-blur-md cursor-pointer"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-4xl bg-[#0E0E12] border border-white/10 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] z-10 my-8 overflow-hidden max-h-[90vh] flex flex-col text-white"
        >
          {/* Top Bar */}
          <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between bg-white/[0.02] shrink-0">
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/[0.06] text-white border border-white/10">
                {activeProject.category}
              </span>
              <span className="text-[#CCFF00] font-bold">{activeProject.year}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white/[0.05] hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 sm:p-10 overflow-y-auto space-y-8">
            {/* Multi-Image Gallery with Carousel Controls */}
            <div className="relative aspect-16/9 w-full rounded-2xl overflow-hidden bg-[#18181B] border border-white/10 shadow-xs group">
              <img
                key={projectImages[currentImageIndex]}
                src={projectImages[currentImageIndex]}
                alt={`${activeProject.title} ${currentImageIndex + 1}`}
                className="w-full h-full object-cover transition-opacity duration-300"
              />

              {/* Navigation arrows if multiple images */}
              {projectImages.length > 1 && (
                <>
                  <button
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md opacity-80 hover:opacity-100 transition-all cursor-pointer shadow-md"
                    aria-label="Image précédente"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>

                  <button
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white border border-white/20 backdrop-blur-md opacity-80 hover:opacity-100 transition-all cursor-pointer shadow-md"
                    aria-label="Image suivante"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>

                  {/* Dot indicators & Counter */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-md">
                    {projectImages.map((_, idx) => (
                      <button
                        key={idx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setCurrentImageIndex(idx);
                        }}
                        className={`transition-all rounded-full cursor-pointer ${
                          currentImageIndex === idx
                            ? 'w-6 h-1.5 bg-[#CCFF00]'
                            : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                        }`}
                        aria-label={`Aller à l'image ${idx + 1}`}
                      />
                    ))}
                    <span className="text-[11px] font-mono text-white/80 ml-1">
                      {currentImageIndex + 1}/{projectImages.length}
                    </span>
                  </div>
                </>
              )}
            </div>

            {/* Thumbnail Row if multiple images */}
            {projectImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-2 -mt-4">
                {projectImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImageIndex(idx)}
                    className={`relative w-20 sm:w-24 h-14 rounded-xl overflow-hidden shrink-0 border transition-all cursor-pointer ${
                      currentImageIndex === idx
                        ? 'border-[#CCFF00] scale-102 ring-2 ring-[#CCFF00]/30'
                        : 'border-white/15 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="Miniature" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Header info */}
            <div>
              <div className="flex items-center justify-between text-xs text-[#A1A1AA] mb-2">
                <span className="font-bold text-white">{activeProject.client}</span>
                <span className="font-semibold text-white bg-white/[0.05] px-3 py-1 rounded-full border border-white/10">
                  {activeProject.role}
                </span>
              </div>
              <h2 className="text-3xl sm:text-4xl text-white tracking-tight font-extrabold">
                {activeProject.title}
              </h2>
              <div className="flex items-baseline gap-2.5 mt-2">
                <span className="text-xs font-bold text-[#CCFF00] tracking-wider">{activeProject.year}</span>
                <p className="text-base text-[#A1A1AA]">
                  {activeProject.subtitle}
                </p>
              </div>
            </div>

            {/* Description & Overview (Clean single presentation - No challenges/solutions clutter as requested) */}
            <div className="p-6 sm:p-8 bg-white/[0.03] rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-lg sm:text-xl font-bold text-white">
                {t('modal.overview')}
              </h3>
              <p className="text-base text-[#E4E4E7] leading-relaxed font-medium">
                {activeProject.summary}
              </p>
              <p className="text-sm sm:text-base text-[#A1A1AA] leading-relaxed">
                {activeProject.overview}
              </p>
            </div>

            {/* Stack & Action */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-2">
                {activeProject.stack.map((tech) => (
                  <span
                    key={tech}
                    className="text-xs px-3.5 py-1.5 bg-white/[0.05] border border-white/10 rounded-full text-white font-medium"
                  >
                    {tech}
                  </span>
                ))}
              </div>

              <button
                onClick={onClose}
                className="px-6 py-2.5 rounded-full bg-white text-black hover:bg-[#CCFF00] font-bold text-xs transition-colors cursor-pointer shadow-xs"
              >
                {t('modal.close')}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
