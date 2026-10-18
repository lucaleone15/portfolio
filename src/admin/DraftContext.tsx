import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as api from './api';
import { createDraftClient, useDraft, type DraftClient, type DraftState } from './store';

/** The draft client and the uploads not published yet, for every admin screen */
const Ctx = createContext<{ client: DraftClient; staged: Set<string>; addStaged: (src: string) => void } | null>(null);

export function DraftProvider({ children }: { children: ReactNode }) {
  const [staged, setStaged] = useState<Set<string>>(new Set());
  const client = useMemo(
    () =>
      createDraftClient(
        {
          getContent: async () => {
            const r = await api.getContent();
            setStaged(new Set(r.staged));
            return r;
          },
          savePage: api.savePage,
        },
        { debounceMs: 800, retryMs: 3000 },
      ),
    [],
  );
  useEffect(() => {
    void client.load();
    return () => client.dispose();
  }, [client]);
  const value = useMemo(() => ({ client, staged, addStaged: (src: string) => setStaged((s) => new Set(s).add(src)) }), [client, staged]);
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

function useCtx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('DraftProvider missing');
  return ctx;
}

export const useDraftClient = () => useCtx().client;
export const useDraftState = (): DraftState => useDraft(useCtx().client);
export const useStaged = () => {
  const { staged, addStaged } = useCtx();
  return { staged, addStaged, preview: (src: string) => api.previewSrc(src, staged) };
};
