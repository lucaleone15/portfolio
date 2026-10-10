import { createPortal } from 'react-dom';
import { Language } from '../types';
import {
  EDUCATION_TIMELINE,
  EDUCATION_TIMELINE_EN,
  EXPERIENCE_TIMELINE,
  EXPERIENCE_TIMELINE_EN,
  LANGUAGES,
  PROJECTS_EN,
  PROJECTS_FR,
  USER_INFO,
} from '../data/portfolioData';
import { SITE_URL } from '../seo';
import { projectPath } from '../router';

/**
 * What the home page prints (easter egg for whoever prints or saves it as a PDF): a clean
 * one-page profile instead of the screen layout. Rendered just before printing (App.tsx,
 * beforeprint) next to #root, which print CSS then hides; never in the page otherwise.
 */
export function PrintSheet({ lang, bio }: { lang: Language; bio: string }) {
  const fr = lang === 'fr';
  const projects = fr ? PROJECTS_FR : PROJECTS_EN;
  const education = fr ? EDUCATION_TIMELINE : EDUCATION_TIMELINE_EN;
  const experience = fr ? EXPERIENCE_TIMELINE : EXPERIENCE_TIMELINE_EN;
  const site = SITE_URL.replace('https://', '');
  const h2 = 'text-[9pt] font-bold uppercase tracking-[0.18em] text-[#C50E36] mb-[2mm]';

  return createPortal(
    <div className="print-sheet text-[9.5pt] leading-[1.45] text-[#1A1A1A] bg-white font-sans">
      <header className="flex items-end justify-between border-b-2 border-[#C50E36] pb-[3mm] mb-[5mm]">
        <div>
          <p className="font-serif text-[26pt] font-extrabold leading-none tracking-tight">
            Luca Leone<span className="text-[#C50E36]">.</span>
          </p>
          <p className="mt-[2mm] text-[10.5pt] text-[#444]">
            {fr ? 'Étudiant en ingénierie des médias, HEIG-VD' : 'Media Engineering student, HEIG-VD'} ·{' '}
            {fr ? 'Communication digitale, UX/UI, développement web' : 'Digital communication, UX/UI, web development'}
          </p>
        </div>
        <p className="text-right text-[8.5pt] text-[#444]">
          {USER_INFO.email}
          <br />
          {USER_INFO.phone}
          <br />
          {site} · linkedin.com/in/leone-luca
        </p>
      </header>

      <p className="mb-[5mm] rounded-[2mm] bg-[#F6E3E7] px-[3mm] py-[2mm] text-[9.5pt]">
        <strong>{fr ? 'Disponible pour un travail de Bachelor' : 'Looking for a Bachelor thesis'}</strong>{' '}
        {fr ? '— je cherche une entreprise avec un sujet en communication digitale, UX/UI ou web.' : '— a company with a topic in digital communication, UX/UI or web.'}
      </p>

      <p className="mb-[5mm] text-[#333]">{bio.split('\n\n')[0]}</p>

      <section className="mb-[5mm]">
        <h2 className={h2}>{fr ? 'Projets' : 'Projects'}</h2>
        <ol className="grid grid-cols-2 gap-x-[6mm] gap-y-[3mm]">
          {projects.map((p) => (
            <li key={p.id} className="break-inside-avoid">
              <p className="font-bold">
                {p.name} <span className="font-normal text-[#666]">· {p.year} · {p.badge ?? p.category}</span>
              </p>
              <p className="text-[#333]">{p.subtitle}</p>
              <p className="text-[8pt] text-[#C50E36]">{site}{projectPath(lang, p.id)}</p>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid grid-cols-2 gap-x-[6mm]">
        <section className="mb-[5mm]">
          <h2 className={h2}>{fr ? 'Expérience' : 'Experience'}</h2>
          {experience.map((e) => (
            <div key={e.title} className="mb-[2.5mm] break-inside-avoid">
              <p className="font-bold">{e.title}</p>
              <p className="text-[#666]">{e.company} · {e.period}</p>
            </div>
          ))}
          <h2 className={`${h2} mt-[4mm]`}>{fr ? 'Langues' : 'Languages'}</h2>
          <p>{LANGUAGES[lang].map((l) => `${l.name} (${l.level})`).join(' · ')}</p>
        </section>
        <section className="mb-[5mm]">
          <h2 className={h2}>{fr ? 'Formation' : 'Education'}</h2>
          {education.map((e) => (
            <div key={e.title} className="mb-[2.5mm] break-inside-avoid">
              <p className="font-bold">{e.title}</p>
              <p className="text-[#666]">{e.institution} · {e.period}</p>
            </div>
          ))}
        </section>
      </div>

      <p className="mt-[4mm] border-t border-[#ddd] pt-[2mm] text-[8pt] text-[#888]">
        {fr ? 'Imprimé depuis' : 'Printed from'} {site} — {fr ? 'le portfolio complet, avec les études de cas, est en ligne.' : 'the full portfolio, with the case studies, is online.'}
      </p>
    </div>,
    document.body,
  );
}
