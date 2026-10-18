import type { Content, StoredProject } from '../content/schema';
import { setEn } from '../content/txt';

/**
 * A new project, laid out like the six existing case studies: the same key facts, the same
 * brief, and the sections they all share. Every text starts empty or as [À COMPLÉTER]: the
 * dashboard never writes in Luca's place.
 */

const empty = () => ({ fr: '', en: '' });
const todo = () => ({ fr: '[À COMPLÉTER]', en: '' });
/** A fixed label already written in both languages (its English is up to date) */
const fixed = (fr: string, en: string) => setEn({ fr, en: '' }, en);

export function newProject(id: string, name: string, content: Content): StoredProject {
  const numbers = Object.values(content.projects).map((p) => Number(p.number) || 0);
  const number = String(Math.max(0, ...numbers) + 1).padStart(2, '0');
  const section = (sid: string, fr: string) => ({ id: sid, nav: { fr, en: '' }, title: { fr, en: '' }, content: [{ type: 'text' as const, text: todo() }] });

  return {
    id,
    kind: 'school',
    name,
    number,
    year: String(new Date().getFullYear()),
    imageUrl: '',
    stack: [],
    card: { subtitle: empty(), category: empty(), summary: todo(), overview: todo() },
    seo: { title: empty(), description: empty() },
    study: {
      kicker: todo(),
      title: todo(),
      hook: todo(),
      intro: todo(),
      meta: [
        { label: fixed('Contexte', 'Context'), value: todo() },
        { label: fixed('Année', 'Year'), value: { fr: String(new Date().getFullYear()), en: '' } },
        { label: fixed('Durée', 'Duration'), value: todo() },
        { label: fixed('Mon rôle', 'My role'), value: todo() },
      ],
      brief: [
        { label: fixed('Le problème', 'The problem'), text: todo() },
        { label: fixed('Ma réponse', 'My answer'), text: todo() },
        { label: fixed('Le résultat', 'The result'), text: todo() },
      ],
      sections: [section('idee', 'L’idée'), section('resultats', 'Les résultats'), section('retenu', 'Ce que je retiens')],
      credits: [{ name: 'Luca Leone', role: todo() }],
    },
  };
}
