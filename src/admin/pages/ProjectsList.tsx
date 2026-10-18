import { useState } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PROJECT_ID_RE, type StoredProject } from '../../content/schema';
import { isEnglishReady } from '../../content/localize';
import { projectRef } from '../../content/pages';
import { PROJECT_KIND_LABEL } from '../../data/portfolioData';
import { ApiError, deleteProject, renameProject } from '../api';
import { slugify } from '../slug';
import { newProject } from '../templates';
import { adminNavigate } from '../nav';
import { useDraftClient, useDraftState, useStaged } from '../DraftContext';
import { Button, Dialog, Pill, fieldClass, labelClass } from '../ui';
import { ContentTabs } from './SiteEditor';

const RENAME_ERRORS: Record<string, string> = {
  taken: 'Cette adresse est déjà prise (par un projet ou une ancienne adresse).',
  'invalid-id': 'Seulement des minuscules, des chiffres et des tirets, ex. mon-projet.',
  missing: 'Ce projet n’existe plus.',
};

export function ProjectsList() {
  const client = useDraftClient();
  const state = useDraftState();
  const { preview } = useStaged();
  const [creating, setCreating] = useState(false);
  const [renaming, setRenaming] = useState<StoredProject | null>(null);
  const [deleting, setDeleting] = useState<StoredProject | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  if (!state.loaded) return <p className="px-4 py-10 text-sm text-neutral-500 md:px-8">Chargement…</p>;
  const { index, projects } = state.content;
  const order = index.order.filter((id) => projects[id]);

  const move = (from: number, to: number) => client.update<typeof index>('index', (i) => void (i.order = arrayMove(i.order.filter((id) => projects[id]), from, to)));
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) move(order.indexOf(String(active.id)), order.indexOf(String(over.id)));
  };
  const toggleHidden = (id: string) =>
    client.update<typeof index>('index', (i) => void (i.hidden = i.hidden.includes(id) ? i.hidden.filter((x) => x !== id) : [...i.hidden, id]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 md:px-8 md:py-10">
      <ContentTabs current="projets" />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-[var(--accent)]">Contenu</p>
          <h1 className="mt-2 font-syne text-3xl font-extrabold tracking-tight md:text-4xl">Tes projets</h1>
          <p className="mt-1 text-sm text-neutral-500 dark:text-[#A1A1AA]">
            Glisse-les (ou utilise les flèches) pour changer leur ordre sur l’accueil.
          </p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          + Nouveau projet
        </Button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={order} strategy={verticalListSortingStrategy}>
          <ol className="mt-8 space-y-3">
            {order.map((id, i) => (
              <ProjectRow
                key={id}
                project={projects[id]}
                cover={projects[id].imageUrl ? preview(projects[id].imageUrl) : ''}
                hidden={index.hidden.includes(id)}
                changed={state.changed.has(projectRef(id)) || state.pending.has(projectRef(id))}
                first={i === 0}
                last={i === order.length - 1}
                onUp={() => move(i, i - 1)}
                onDown={() => move(i, i + 1)}
                onToggle={() => toggleHidden(id)}
                onRename={() => setRenaming(projects[id])}
                onDelete={() => setDeleting(projects[id])}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>

      <NewProjectDialog open={creating} onClose={() => setCreating(false)} />
      {renaming && <RenameDialog project={renaming} onClose={() => setRenaming(null)} />}
      {deleting && <DeleteDialog project={deleting} onClose={() => setDeleting(null)} />}
    </div>
  );
}

function ProjectRow(props: {
  key?: string;
  project: StoredProject;
  cover: string;
  hidden: boolean;
  changed: boolean;
  first: boolean;
  last: boolean;
  onUp: () => void;
  onDown: () => void;
  onToggle: () => void;
  onRename: () => void;
  onDelete: () => void;
}) {
  const { project: p } = props;
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: p.id });
  const [menu, setMenu] = useState(false);
  const arrow = 'grid size-11 place-items-center rounded-full text-lg text-neutral-500 hover:bg-[var(--color-surface)] disabled:opacity-25 dark:text-[#A1A1AA] dark:hover:bg-white/5';

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`relative flex items-center gap-2 rounded-2xl border bg-white p-2 pr-3 transition-shadow dark:bg-white/[0.03] sm:gap-3 ${isDragging ? 'z-10 border-[var(--accent)] shadow-xl' : 'border-[var(--color-border)] dark:border-white/10'} ${props.hidden ? 'opacity-60' : ''}`}
    >
      <button
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        type="button"
        aria-label={`Déplacer ${p.name}`}
        className="grid h-14 w-8 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-neutral-400 active:cursor-grabbing"
      >
        <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor" aria-hidden="true">
          {[3, 10, 17].flatMap((y) => [<circle key={`a${y}`} cx="3" cy={y} r="1.6" />, <circle key={`b${y}`} cx="9" cy={y} r="1.6" />])}
        </svg>
      </button>

      <button type="button" onClick={() => adminNavigate(`/projets/${p.id}`)} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span className="h-12 w-16 shrink-0 overflow-hidden rounded-xl sm:h-14 sm:w-20 bg-[var(--color-surface)] dark:bg-white/10">
          {props.cover && <img src={props.cover} alt="" className="size-full object-cover" loading="lazy" />}
        </span>
        <span className="min-w-0">
          <span className="line-clamp-2 block text-[15px] font-bold leading-tight sm:font-syne sm:text-base sm:font-extrabold">{p.name}</span>
          <span className="block truncate text-xs text-neutral-500 dark:text-[#A1A1AA]">
            {p.year} · {PROJECT_KIND_LABEL[p.kind].fr}
          </span>
          <span className="mt-1 flex flex-wrap gap-1">
            {props.hidden && <Pill>Masqué</Pill>}
            {!isEnglishReady(p) && <Pill tone="warn">FR seulement</Pill>}
            {props.changed && <Pill tone="accent">Modifié</Pill>}
          </span>
        </span>
      </button>

      <div className="hidden items-center sm:flex">
        <button type="button" className={arrow} disabled={props.first} onClick={props.onUp} aria-label="Monter">
          ↑
        </button>
        <button type="button" className={arrow} disabled={props.last} onClick={props.onDown} aria-label="Descendre">
          ↓
        </button>
      </div>

      <label className="flex shrink-0 cursor-pointer items-center gap-2" title={props.hidden ? 'Masqué du site' : 'Visible sur le site'}>
        <span className="sr-only">Visible sur le site</span>
        <input type="checkbox" role="switch" checked={!props.hidden} onChange={props.onToggle} className="peer sr-only" />
        <span className="relative h-7 w-12 rounded-full bg-neutral-300 transition after:absolute after:left-1 after:top-1 after:size-5 after:rounded-full after:bg-white after:shadow after:transition peer-checked:bg-[var(--accent)] peer-checked:after:translate-x-5 peer-focus-visible:ring-4 peer-focus-visible:ring-[rgba(var(--accent-rgb),0.25)] dark:bg-white/20" />
      </label>

      <div className="relative">
        <button type="button" onClick={() => setMenu((m) => !m)} aria-expanded={menu} aria-label={`Plus d’actions pour ${p.name}`} className={arrow}>
          ⋯
        </button>
        {menu && (
          <div
            className="absolute right-0 top-12 z-20 w-56 overflow-hidden rounded-2xl border border-[var(--color-border)] bg-white py-1 shadow-xl dark:border-white/10 dark:bg-[#1A1A1E]"
            onMouseLeave={() => setMenu(false)}
          >
            <div className="flex sm:hidden">
              <button type="button" disabled={props.first} onClick={() => (props.onUp(), setMenu(false))} className="min-h-11 flex-1 text-sm font-semibold disabled:opacity-30">
                ↑ Monter
              </button>
              <button type="button" disabled={props.last} onClick={() => (props.onDown(), setMenu(false))} className="min-h-11 flex-1 text-sm font-semibold disabled:opacity-30">
                ↓ Descendre
              </button>
            </div>
            <button type="button" onClick={() => (props.onRename(), setMenu(false))} className="block min-h-11 w-full px-4 text-left text-sm font-semibold hover:bg-[var(--color-surface)] dark:hover:bg-white/5">
              Changer l’adresse
            </button>
            <button type="button" onClick={() => (props.onDelete(), setMenu(false))} className="block min-h-11 w-full px-4 text-left text-sm font-semibold text-[var(--accent)] hover:bg-[var(--color-surface)] dark:hover:bg-white/5">
              Supprimer
            </button>
          </div>
        )}
      </div>
    </li>
  );
}

function NewProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const client = useDraftClient();
  const state = useDraftState();
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [idTouched, setIdTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const slug = idTouched ? id : slugify(name);
  const taken = !!state.content?.projects[slug] || Object.hasOwn(state.content?.index.redirects ?? {}, slug);
  const valid = name.trim() !== '' && PROJECT_ID_RE.test(slug) && !taken;

  const create = async () => {
    setBusy(true);
    client.set(projectRef(slug), newProject(slug, name.trim(), state.content));
    await client.flush();
    await client.load();
    setBusy(false);
    onClose();
    setName('');
    setIdTouched(false);
    adminNavigate(`/projets/${slug}`);
  };

  return (
    <Dialog open={open} title="Nouveau projet" onClose={onClose}>
      <label className={labelClass} htmlFor="np-name">
        Nom du projet
      </label>
      <input id="np-name" className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="ex. OceanSight" autoFocus />
      <label className={`${labelClass} mt-5`} htmlFor="np-id">
        Adresse
      </label>
      <input
        id="np-id"
        className={fieldClass}
        value={slug}
        onChange={(e) => {
          setIdTouched(true);
          setId(e.target.value.toLowerCase());
        }}
      />
      <p className={`mt-1.5 text-xs ${taken || (slug && !PROJECT_ID_RE.test(slug)) ? 'font-semibold text-[var(--accent)]' : 'text-neutral-500 dark:text-[#A1A1AA]'}`}>
        {taken ? RENAME_ERRORS.taken : slug && !PROJECT_ID_RE.test(slug) ? RENAME_ERRORS['invalid-id'] : `luca-leone.ch/projets/${slug || '…'}`}
      </p>
      <p className="mt-4 text-sm text-neutral-600 dark:text-[#A1A1AA]">Le projet s’ouvre avec la structure de tes études de cas, prête à remplir. Il reste en brouillon jusqu’à ce que tu publies.</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="primary" disabled={!valid || busy} onClick={create}>
          Créer
        </Button>
      </div>
    </Dialog>
  );
}

function RenameDialog({ project, onClose }: { project: StoredProject; onClose: () => void }) {
  const client = useDraftClient();
  const [to, setTo] = useState(project.id);
  const [error, setError] = useState('');
  const save = async () => {
    try {
      await client.flush();
      await renameProject(project.id, to);
      await client.load();
      onClose();
    } catch (err) {
      setError(err instanceof ApiError ? RENAME_ERRORS[(err.body as { error?: string })?.error ?? ''] ?? 'Impossible de changer l’adresse.' : 'Connexion impossible.');
    }
  };
  return (
    <Dialog open title={`Adresse de ${project.name}`} onClose={onClose}>
      <label className={labelClass} htmlFor="rn-id">
        Nouvelle adresse
      </label>
      <input id="rn-id" className={fieldClass} value={to} onChange={(e) => (setTo(e.target.value.toLowerCase()), setError(''))} autoFocus />
      <p className="mt-1.5 text-xs text-neutral-500 dark:text-[#A1A1AA]">luca-leone.ch/projets/{to || '…'} — l’ancienne adresse redirigera vers la nouvelle.</p>
      <p role="alert" className="mt-3 min-h-5 text-sm font-semibold text-[var(--accent)]">
        {error}
      </p>
      <div className="mt-4 flex justify-end gap-3">
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="primary" disabled={to === project.id} onClick={save}>
          Changer
        </Button>
      </div>
    </Dialog>
  );
}

function DeleteDialog({ project, onClose }: { project: StoredProject; onClose: () => void }) {
  const client = useDraftClient();
  const [typed, setTyped] = useState('');
  const remove = async () => {
    await client.flush();
    await deleteProject(project.id);
    await client.load();
    onClose();
  };
  return (
    <Dialog open title={`Supprimer ${project.name} ?`} onClose={onClose}>
      <p className="text-sm text-neutral-600 dark:text-[#A1A1AA]">
        Le projet disparaîtra du site à la prochaine publication. Pour le cacher sans le perdre, utilise plutôt l’interrupteur « Visible sur le site ».
      </p>
      <label className={`${labelClass} mt-5`} htmlFor="del-name">
        Tape « {project.name} » pour confirmer
      </label>
      <input id="del-name" className={fieldClass} value={typed} onChange={(e) => setTyped(e.target.value)} />
      <div className="mt-6 flex justify-end gap-3">
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="danger" disabled={typed.trim() !== project.name} onClick={remove}>
          Supprimer
        </Button>
      </div>
    </Dialog>
  );
}
