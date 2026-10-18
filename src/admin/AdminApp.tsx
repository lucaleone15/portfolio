import { useEffect, useState } from 'react';
import { adminConfigured, logout, me } from './api';
import { Monogram } from './ui';
import { Login } from './Login';
import { Shell, type Section } from './Shell';
import { Button, Dialog, SaveIndicator } from './ui';
import { PublishPanel, waitForPublish } from './publish/PublishPanel';
import { discardDraft, getPublish, resolveConflict, startPublish } from './api';
import { adminNavigate, useAdminPath } from './nav';
import { DraftProvider, useDraftClient, useDraftState } from './DraftContext';
import { signOutAfterSaving } from './store';
import { ProjectsList } from './pages/ProjectsList';
import { ProjectEditor } from './pages/ProjectEditor';
import { SiteEditor, isSiteTab } from './pages/SiteEditor';
import { StatsPage } from './pages/StatsPage';
import { MessagesPage, getUnread } from './pages/MessagesPage';

export function AdminApp() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    me().then(setSignedIn, () => setSignedIn(false));
  }, []);

  if (!adminConfigured()) return <NotSetUp />;

  if (signedIn === null) return <div className="min-h-dvh bg-[var(--color-paper)] dark:bg-[#0A0A0C]" />;
  if (!signedIn) return <Login onSignedIn={() => setSignedIn(true)} />;

  return (
    <DraftProvider>
      <Workspace
        onSignOut={() => {
          setSignedIn(false);
        }}
      />
    </DraftProvider>
  );
}

function Workspace({ onSignOut }: { onSignOut: () => void }) {
  const client = useDraftClient();
  const state = useDraftState();
  const { path, query } = useAdminPath();
  const changes = new Set([...state.changed, ...state.pending]).size;
  const [publishing, setPublishing] = useState(false);
  // Closed while a publish runs: follow it, then reload the draft (revisions, "Publier · N")
  const [backgroundFailed, setBackgroundFailed] = useState(false);
  const closePublishing = () => {
    setPublishing(false);
    void getPublish().then(
      (r) =>
        r.status.state === 'running' &&
        waitForPublish(getPublish).then((end) => {
          if (end === 'failed') setBackgroundFailed(true);
          // What was typed meanwhile is sent first: the reload never drops it
          return client.saveThenReload();
        }),
      () => {},
    );
  };
  const [unread, setUnread] = useState(0);

  // New messages, for the tab's badge
  useEffect(() => {
    const check = () => getUnread().then((r) => setUnread(r.unread), () => {});
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  let page = <ProjectsList />;
  const project = /^\/projets\/([a-z0-9-]+)$/.exec(path);
  if (project) page = <ProjectEditor key={project[1]} id={project[1]} query={query} />;
  const siteTab = /^\/site\/([a-z-]+)$/.exec(path)?.[1];
  if (siteTab && isSiteTab(siteTab)) page = <SiteEditor key={siteTab} tab={siteTab} query={query} />;
  let section: Section = 'contenu';
  if (path === '/stats') {
    page = <StatsPage />;
    section = 'stats';
  }
  if (path === '/messages') {
    page = <MessagesPage onUnread={setUnread} />;
    section = 'messages';
  }

  return (
    <Shell
      section={section}
      unread={unread}
      onSignOut={() => void signOutAfterSaving(client, () => logout().catch(() => {})).then(onSignOut)}
      status={<SaveIndicator state={state.saveState} onReload={() => void client.load()} />}
      publish={
        <Button variant="primary" disabled={!changes} onClick={() => setPublishing(true)}>
          Publier{changes ? ` · ${changes}` : ''}
        </Button>
      }
    >
      {page}
      {backgroundFailed && (
        <div role="alert" className="fixed inset-x-4 bottom-20 z-40 mx-auto flex max-w-lg items-center gap-3 rounded-2xl bg-neutral-900 px-4 py-3 text-sm text-white shadow-xl dark:bg-white dark:text-neutral-900 md:bottom-6">
          <span className="flex-1">La publication a échoué. Ouvre « Publier » pour voir pourquoi.</span>
          <button type="button" className="font-bold underline" onClick={() => (setBackgroundFailed(false), setPublishing(true))}>
            Voir
          </button>
          <button type="button" aria-label="Fermer" onClick={() => setBackgroundFailed(false)}>
            ✕
          </button>
        </div>
      )}
      {state.saveState === 'signedOut' && <Login overlay onSignedIn={() => void client.resumeAfterLogin()} />}
      <Dialog open={publishing} title="Publier" onClose={closePublishing}>
        {publishing && state.loaded && (
          <PublishPanel
            api={{
              getPublish,
              startPublish,
              resolveConflict,
              discard: async () => {
                client.dropPending();
                await discardDraft();
              },
            }}
            flush={client.flush}
            navigate={(to) => {
              setPublishing(false);
              adminNavigate(to);
            }}
            content={state.content}
            onClose={closePublishing}
            onPublished={() => void client.load()}
            onDiscarded={() => void client.load()}
          />
        )}
      </Dialog>
    </Shell>
  );
}

/** The page was reached without the server's admin (no ADMIN_* settings, or not under ADMIN_PATH) */
function NotSetUp() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[var(--color-paper)] px-4 text-neutral-900 dark:bg-[#0A0A0C] dark:text-white">
      <div className="max-w-md">
        <Monogram size={44} />
        <h1 className="mt-6 font-syne text-2xl font-extrabold">L’atelier n’est pas configuré ici</h1>
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 dark:text-[#A1A1AA]">
          Lance <code>npm run build && npm run admin:setup</code>, copie les lignes affichées dans <code>.env</code> avec une adresse, par exemple{' '}
          <code>ADMIN_PATH=/atelier</code>, relance <code>npm run dev</code>, puis ouvre cette adresse (avec le <code>/</code> final).
        </p>
      </div>
    </div>
  );
}
