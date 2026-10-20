import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { z } from 'zod';
import type { Language } from '../../types';
import { SiteSchema, type Content, type Site } from '../../content/schema';
import { fillTemplate } from '../../content/derived';
import { toSite } from '../../content/localize';
import { Hero } from '../../components/Hero';
import { skipIntro } from '../../components/IntroCurtain';
import { AboutSection } from '../../components/AboutSection';
import { SkillsSection } from '../../components/SkillsSection';
import { homePath } from '../../router';
import { upload } from '../api';
import { FieldEditor, MediaContext, type Media } from '../fields/FieldEditor';
import { EditablePreview } from '../page/EditablePreview';
import { withPreviewSrcs } from '../page/PageView';
import { EditorBar, type Mode } from './ProjectEditor';
import { useDraftClient, useDraftState, useStaged } from '../DraftContext';
import { HealthCard } from '../health/HealthCard';
import { PersonalSharePreview } from '../health/SharePreview';
import { siteHealth } from '../../content/health';
import { pageClass } from '../ui';
import { adminNavigate } from '../nav';

// No intro curtain in the admin: the hero shows at once
skipIntro();

/** The site's fixed texts, one tab each; Contact and SEO are forms only (no page to click) */
export type SiteTab = 'hero' | 'a-propos' | 'competences' | 'contact' | 'seo';

const TABS: Record<SiteTab, { label: string; key: keyof Site; page?: () => ReactNode }> = {
  hero: { label: 'Hero', key: 'hero', page: () => <Hero /> },
  'a-propos': { label: 'À propos', key: 'about', page: () => <AboutSection /> },
  competences: { label: 'Compétences', key: 'skills', page: () => <SkillsSection /> },
  contact: { label: 'Contact', key: 'contact' },
  seo: { label: 'SEO des pages', key: 'seo' },
};

export const isSiteTab = (t: string): t is SiteTab => t in TABS;

/** Projects + the site's tabs, at the top of every Contenu screen */
export function ContentTabs({ current }: { current: 'projets' | SiteTab }) {
  const items: ['projets' | SiteTab, string, string][] = [['projets', 'Projets', '/'], ...Object.entries(TABS).map(([id, t]) => [id as SiteTab, t.label, `/site/${id}`] as ['projets' | SiteTab, string, string])];
  return (
    <nav aria-label="Contenu" className="-mx-4 mb-6 flex gap-1 overflow-x-auto px-4 pb-1 md:mx-0 md:px-0">
      {items.map(([id, label, to]) => (
        <button
          key={id}
          type="button"
          onClick={() => adminNavigate(to)}
          aria-current={current === id ? 'page' : undefined}
          className={`min-h-10 shrink-0 rounded-full px-4 text-sm font-semibold transition ${current === id ? 'bg-neutral-900 text-white dark:bg-white dark:text-neutral-900' : 'text-neutral-600 hover:bg-[var(--color-surface)] dark:text-[#A1A1AA] dark:hover:bg-white/5'}`}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}

/** The form and the page of one tab, without the draft plumbing (tested on its own) */
export function SiteEditorView({
  tab,
  mode,
  lang,
  content,
  onChange,
  onOpen,
}: {
  tab: SiteTab;
  mode: Mode;
  lang: Language;
  content: Content;
  onChange: (key: keyof Site, value: unknown) => void;
  onOpen?: (path: string) => void;
}) {
  const { key, page } = TABS[tab];
  const site = content.site;
  const schema = SiteSchema.shape[key] as z.ZodTypeAny;

  if (mode === 'page' && page) {
    return (
      <EditablePreview
        doc={site}
        content={content}
        url={homePath(lang)}
        lang={lang}
        onEdit={(path, value) => {
          const [k, ...rest] = path.split('.');
          const copy = structuredClone(site[k as keyof Site]) as Record<string, unknown>;
          let o: Record<string, unknown> = copy;
          rest.slice(0, -1).forEach((p) => (o = o[p] as Record<string, unknown>));
          if (rest.length) o[rest[rest.length - 1]] = value;
          onChange(k as keyof Site, rest.length ? copy : value);
        }}
        onOpen={(path) => onOpen?.(path)}
      >
        <div className="bg-[var(--color-paper)] text-neutral-900 dark:bg-[#0A0A0C] dark:text-white">{page()}</div>
      </EditablePreview>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      {tab === 'seo' && (
        <p className="rounded-2xl bg-[rgba(var(--accent-rgb),0.07)] px-4 py-3 text-sm leading-relaxed">
          Dans ces textes, <strong>{'{N}'}</strong> devient le nombre de projets visibles en toutes lettres et <strong>{'{names}'}</strong> leur liste. Aujourd’hui, la description de la page Projets donne :
          <br />
          <em>« {fillTemplate(toSite(site, lang, true).seo.projets.description, content, lang)} »</em>
        </p>
      )}
      <FieldEditor schema={schema} value={site[key]} lang={lang} path={key} bare onChange={(v) => onChange(key, v)} />
    </div>
  );
}

export function SiteEditor({ tab, query }: { key?: string; tab: SiteTab; query: URLSearchParams }) {
  const client = useDraftClient();
  const state = useDraftState();
  const { preview, addStaged } = useStaged();
  const [mode, setMode] = useState<Mode>(TABS[tab].page && !query.get('path') && query.get('mode') !== 'structure' ? 'page' : 'structure');
  const [lang, setLang] = useState<Language>(query.get('lang') === 'en' ? 'en' : 'fr');
  const [drawer, setDrawer] = useState<string | null>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const media: Media = useMemo(
    () => ({
      preview,
      upload: async (file, kind) => {
        const out = await upload(file, kind, '');
        addStaged(out.src);
        return out;
      },
    }),
    [preview, addStaged],
  );

  // A field pointed at (from Page mode or the publish panel) scrolls into view
  const target = drawer ?? query.get('path');
  useEffect(() => {
    if (!target) return;
    const t = setTimeout(() => document.querySelector(`[data-path="${CSS.escape(target)}"]`)?.scrollIntoView({ block: 'center' }), 50);
    return () => clearTimeout(t);
  }, [target, mode]);

  if (!state.loaded) return <p className="px-4 py-10 text-sm text-neutral-500 md:px-8">Chargement…</p>;
  const content = { ...state.content, site: withPreviewSrcs(state.content.site, preview) };
  const onChange = (key: keyof Site, value: unknown) => client.update<Site>('site', (s) => void ((s as Record<string, unknown>)[key] = value));

  return (
    <MediaContext.Provider value={media}>
      <div className={pageClass}>
        <ContentTabs current={tab} />
        <EditorBar title={TABS[tab].label} back={() => adminNavigate('/')} mode={mode} lang={lang} onMode={setMode} onLang={setLang} pageMode={!!TABS[tab].page} />
        {tab === 'seo' && (
          <HealthCard
            health={siteHealth(state.content.site, lang, state.content)}
            lang={lang}
            onGo={(path) => document.querySelector(`[data-path="${path}"]`)?.scrollIntoView({ block: 'center' })}
            google={{
              title: fillTemplate(state.content.site.seo.home.title[lang], state.content, lang),
              url: lang === 'fr' ? 'luca-leone.ch' : 'luca-leone.ch › en',
              description: fillTemplate(state.content.site.seo.home.description[lang], state.content, lang),
            }}
            share={<PersonalSharePreview site={state.content.site} lang={lang} />}
          />
        )}
        <SiteEditorView tab={tab} mode={mode} lang={lang} content={mode === 'page' ? content : state.content} onChange={onChange} onOpen={setDrawer} />
        {mode === 'page' && drawer && (
          <div className="fixed inset-0 z-40 flex justify-end bg-black/20" onClick={(e) => e.target === e.currentTarget && setDrawer(null)}>
            <aside ref={drawerRef} className="h-full w-full overflow-y-auto bg-[var(--color-paper)] px-5 pb-24 pt-5 shadow-2xl dark:bg-[#0F0F12] sm:max-w-xl sm:px-8">
              <button type="button" onClick={() => setDrawer(null)} className="mb-4 min-h-11 font-syne text-sm font-bold text-[var(--accent)]">
                Fermer ✕
              </button>
              <SiteEditorView tab={tab} mode="structure" lang={lang} content={state.content} onChange={onChange} />
            </aside>
          </div>
        )}
      </div>
    </MediaContext.Provider>
  );
}
