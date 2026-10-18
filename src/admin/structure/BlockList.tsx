import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core';
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Block } from '../../content/schema';
import { BLOCK_TYPES, blockSummary } from './blockTemplates';

/** A section's blocks in the plan: drag them (handle) or move them with the arrows */
export function BlockList({
  section,
  blocks,
  selection,
  onSelect,
  onReorder,
}: {
  section: number;
  blocks: Block[];
  selection: string;
  onSelect: (path: string) => void;
  onReorder: (blocks: Block[]) => void;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 180, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );
  const ids = blocks.map((_, i) => `s${section}b${i}`);
  const move = (from: number, to: number) => {
    onReorder(arrayMove(blocks, from, to));
    onSelect(`study.sections.${section}.content.${to}`);
  };
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (over && active.id !== over.id) move(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)));
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={ids} strategy={verticalListSortingStrategy}>
        <ol className="mt-1 space-y-1 pl-2">
          {blocks.map((block, i) => (
            <BlockRow
              key={ids[i]}
              id={ids[i]}
              path={`study.sections.${section}.content.${i}`}
              block={block}
              selected={selection === `study.sections.${section}.content.${i}` || selection.startsWith(`study.sections.${section}.content.${i}.`)}
              first={i === 0}
              last={i === blocks.length - 1}
              onSelect={onSelect}
              onUp={() => move(i, i - 1)}
              onDown={() => move(i, i + 1)}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

function BlockRow(props: {
  key?: string;
  id: string;
  path: string;
  block: Block;
  selected: boolean;
  first: boolean;
  last: boolean;
  onSelect: (path: string) => void;
  onUp: () => void;
  onDown: () => void;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id: props.id });
  const label = BLOCK_TYPES.find((b) => b.type === props.block.type)?.label ?? props.block.type;
  const arrow = 'grid size-8 shrink-0 place-items-center rounded-full text-xs text-neutral-500 disabled:opacity-20';
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-1 rounded-xl border bg-white pr-1 dark:bg-white/[0.03] ${props.selected ? 'border-[var(--accent)] shadow-[0_0_0_3px_rgba(var(--accent-rgb),0.12)]' : 'border-[var(--color-border)] dark:border-white/10'} ${isDragging ? 'z-10 shadow-xl' : ''}`}
    >
      <button ref={setActivatorNodeRef} {...attributes} {...listeners} type="button" aria-label={`Déplacer le bloc ${label}`} className="grid h-11 w-7 shrink-0 cursor-grab touch-none place-items-center text-neutral-400">
        ⋮⋮
      </button>
      <button type="button" data-outline={props.path} onClick={() => props.onSelect(props.path)} className="flex min-h-11 min-w-0 flex-1 items-center gap-2 text-left">
        <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${props.selected ? 'bg-[rgba(var(--accent-rgb),0.12)] text-[var(--accent)]' : 'bg-[var(--color-surface)] text-neutral-500 dark:bg-white/10'}`}>{label}</span>
        <span className="truncate text-xs text-neutral-600 dark:text-[#A1A1AA]">{blockSummary(props.block)}</span>
      </button>
      <button type="button" className={arrow} aria-label="Monter le bloc" disabled={props.first} onClick={props.onUp}>
        ↑
      </button>
      <button type="button" className={arrow} aria-label="Descendre le bloc" disabled={props.last} onClick={props.onDown}>
        ↓
      </button>
    </li>
  );
}
