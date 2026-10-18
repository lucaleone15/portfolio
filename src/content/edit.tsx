import { createContext, useContext, type ReactNode } from 'react';

/**
 * Hooks the admin's Page mode into the real site components. Outside the admin there is no
 * provider: every helper renders nothing extra, so the public HTML stays exactly the same.
 *   edit(path)  → data-edit="<path>" on the element showing that part of the content
 *   EditWrap    → wraps a block in a <div data-edit> (admin only)
 *   EditSlot    → the "+" between two blocks of a section (admin only)
 * Paths are those of the stored content: "study.title", "study.sections.2.content.1"…
 */

interface EditApi {
  onInsert: (section: number, at: number) => void;
}

const EditContext = createContext<EditApi | null>(null);
/** The path of the block being rendered (set by EditWrap), for paths relative to it */
const EditBase = createContext('');

export function EditProvider({ value, children }: { value: EditApi | null; children: ReactNode }) {
  return <EditContext.Provider value={value}>{children}</EditContext.Provider>;
}

const none = () => ({});

/** In the admin's preview: lets a component split a line into separately editable parts */
export const useEditing = () => !!useContext(EditContext);

/** Call once per component, then spread edit(path) on each element */
export function useEditAttrs(): (path: string) => { 'data-edit'?: string } {
  return useContext(EditContext) ? (path) => ({ 'data-edit': path }) : none;
}

/** Inside a block: edit('items.0.label') → data-edit="<block path>.items.0.label" */
export function useEditAt(): (rel: string) => { 'data-edit'?: string } {
  const base = useContext(EditBase);
  return useContext(EditContext) ? (rel) => ({ 'data-edit': `${base}.${rel}` }) : none;
}

export function EditWrap({ path, children }: { path: string; children: ReactNode; key?: string | number }) {
  if (!useContext(EditContext)) return <>{children}</>;
  return (
    <EditBase.Provider value={path}>
      <div data-edit={path} className="admin-editable">
        {children}
      </div>
    </EditBase.Provider>
  );
}

export function EditSlot({ section, at }: { section: number; at: number; key?: string | number }) {
  const ctx = useContext(EditContext);
  if (!ctx) return null;
  return (
    <div className="admin-slot flex justify-center py-1">
      <button
        type="button"
        data-slot=""
        aria-label="Ajouter un bloc ici"
        onClick={() => ctx.onInsert(section, at)}
        className="grid size-8 place-items-center rounded-full border-2 border-dashed border-[var(--accent)] text-lg font-bold leading-none text-[var(--accent)] opacity-60 transition hover:scale-110 hover:opacity-100"
      >
        +
      </button>
    </div>
  );
}
