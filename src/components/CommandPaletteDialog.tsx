import { useState } from 'react';
import { Command } from 'cmdk';
import { ArrowUpRight, Copy, FileDown, FolderOpen, Hash, Languages, Linkedin, Moon, Sun } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { getCustomProjects } from '../data/projectsStorage';
import { USER_INFO } from '../data/portfolioData';
import { alternatePath, projectPath, sectionPath, useRouter } from '../router';

/**
 * The ⌘K dialog itself (cmdk). Loaded on first open by CommandPalette, so cmdk and its
 * dependencies stay out of the initial bundle.
 */
export default function CommandPaletteDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const setOpen = onOpenChange;
  const [copied, setCopied] = useState(false);
  const { lang } = useLanguage();
  const { theme, toggleTheme } = useTheme();
  const { route, navigate } = useRouter();
  const projects = lang === 'fr' ? getCustomProjects().fr : getCustomProjects().en;

  const run = (action: () => void) => {
    setOpen(false);
    action();
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(USER_INFO.email);
      setCopied(true);
      // Keep the palette open a beat so the confirmation is seen
      setTimeout(() => {
        setCopied(false);
        setOpen(false);
      }, 700);
    } catch {
      run(() => (window.location.href = `mailto:${USER_INFO.email}`));
    }
  };

  const sections = [
    { id: 'projets', fr: 'Projets', en: 'Projects' },
    { id: 'a-propos', fr: 'À propos', en: 'About' },
    { id: 'contact', fr: 'Contact', en: 'Contact' },
  ];

  const item =
    'flex items-center gap-3 px-3 h-11 rounded-xl text-sm text-neutral-700 dark:text-[#D4D4D8] cursor-pointer data-[selected=true]:bg-black/[0.06] dark:data-[selected=true]:bg-white/[0.08] data-[selected=true]:text-neutral-900 dark:data-[selected=true]:text-white';
  const group =
    '[&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:pt-3 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[11px] [&_[cmdk-group-heading]]:font-bold [&_[cmdk-group-heading]]:uppercase [&_[cmdk-group-heading]]:tracking-wider [&_[cmdk-group-heading]]:text-neutral-500 dark:[&_[cmdk-group-heading]]:text-[#71717A]';

  return (
    <Command.Dialog
      open={open}
      onOpenChange={setOpen}
      label={lang === 'fr' ? 'Barre de commande' : 'Command menu'}
      overlayClassName="fixed inset-0 z-[200] bg-black/40 backdrop-blur-[2px]"
      contentClassName="fixed z-[201] left-1/2 top-[18vh] -translate-x-1/2 w-[min(560px,calc(100vw-2rem))] rounded-2xl border border-black/10 dark:border-white/10 bg-white/95 dark:bg-[#121216]/95 backdrop-blur-xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.45)] overflow-hidden"
    >
      <div className="flex items-center gap-3 px-4 border-b border-black/10 dark:border-white/10">
        <Hash className="w-4 h-4 text-neutral-400 dark:text-[#71717A]" aria-hidden="true" />
        <Command.Input
          autoFocus
          placeholder={lang === 'fr' ? 'Rechercher un projet, une action…' : 'Search a project, an action…'}
          className="flex-1 h-14 bg-transparent text-base text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-[#71717A] outline-none"
        />
        <kbd className="hidden sm:inline-flex h-6 px-2 items-center rounded-md border border-black/10 dark:border-white/15 text-[11px] text-neutral-500 dark:text-[#A1A1AA]">
          Esc
        </kbd>
      </div>

      <Command.List className="max-h-[min(420px,60vh)] overflow-y-auto p-2 scroll-py-2">
        <Command.Empty className="py-10 text-center text-sm text-neutral-500 dark:text-[#A1A1AA]">
          {lang === 'fr' ? 'Aucun résultat.' : 'No results.'}
        </Command.Empty>

        <Command.Group heading={lang === 'fr' ? 'Projets' : 'Projects'} className={group}>
          {projects.map((p) => (
            <Command.Item
              key={p.id}
              value={`${p.name} ${p.category} ${p.subtitle}`}
              onSelect={() => run(() => navigate(projectPath(lang, p.id)))}
              className={item}
            >
              <FolderOpen className="w-4 h-4 shrink-0 opacity-60" aria-hidden="true" />
              <span className="font-semibold">{p.name}</span>
              <span className="ml-auto text-xs text-neutral-400 dark:text-[#71717A] truncate">{p.category}</span>
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading={lang === 'fr' ? 'Aller à' : 'Go to'} className={group}>
          {sections.map((s) => (
            <Command.Item key={s.id} value={`${s.fr} ${s.en}`} onSelect={() => run(() => navigate(sectionPath(lang, s.id)))} className={item}>
              <Hash className="w-4 h-4 shrink-0 opacity-60" aria-hidden="true" />
              {lang === 'fr' ? s.fr : s.en}
            </Command.Item>
          ))}
        </Command.Group>

        <Command.Group heading="Actions" className={group}>
          <Command.Item value="copy email copier" onSelect={copyEmail} className={item}>
            <Copy className="w-4 h-4 shrink-0 opacity-60" aria-hidden="true" />
            {copied ? (
              <span className="font-semibold text-[var(--accent)]">{lang === 'fr' ? 'Email copié !' : 'Email copied!'}</span>
            ) : (
              <>
                {lang === 'fr' ? "Copier l'email" : 'Copy email'}
                <span className="ml-auto text-xs text-neutral-400 dark:text-[#71717A]">{USER_INFO.email}</span>
              </>
            )}
          </Command.Item>
          <Command.Item value="theme thème dark light sombre clair" onSelect={() => run(toggleTheme)} className={item}>
            {theme === 'dark' ? <Sun className="w-4 h-4 shrink-0 opacity-60" /> : <Moon className="w-4 h-4 shrink-0 opacity-60" />}
            {theme === 'dark'
              ? lang === 'fr' ? 'Passer en mode clair' : 'Switch to light mode'
              : lang === 'fr' ? 'Passer en mode sombre' : 'Switch to dark mode'}
          </Command.Item>
          <Command.Item
            value="language langue english français"
            onSelect={() => run(() => navigate(alternatePath(route, lang === 'fr' ? 'en' : 'fr'), { keepScroll: true }))}
            className={item}
          >
            <Languages className="w-4 h-4 shrink-0 opacity-60" aria-hidden="true" />
            {lang === 'fr' ? 'Switch to English' : 'Passer en français'}
          </Command.Item>
          <Command.Item
            value="cv curriculum resume télécharger download"
            onSelect={() =>
              run(() => {
                const a = document.createElement('a');
                a.href = USER_INFO.cv;
                a.download = '';
                a.click();
              })
            }
            className={item}
          >
            <FileDown className="w-4 h-4 shrink-0 opacity-60" aria-hidden="true" />
            {lang === 'fr' ? 'Télécharger le CV' : 'Download CV'}
            <span className="ml-auto text-xs text-neutral-400 dark:text-[#71717A]">PDF</span>
          </Command.Item>
          <Command.Item value="linkedin" onSelect={() => run(() => window.open(USER_INFO.linkedin, '_blank', 'noopener'))} className={item}>
            <Linkedin className="w-4 h-4 shrink-0 opacity-60" aria-hidden="true" />
            LinkedIn
            <ArrowUpRight className="w-3.5 h-3.5 ml-auto opacity-50" aria-hidden="true" />
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  );
}
