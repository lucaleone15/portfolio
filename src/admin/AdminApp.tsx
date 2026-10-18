import { useEffect, useState } from 'react';
import { logout, me } from './api';
import { Login } from './Login';
import { Shell } from './Shell';
import { Button, Dialog, SaveIndicator } from './ui';
import { PublishPanel } from './publish/PublishPanel';
import { getPublish, resolveConflict, startPublish } from './api';
import { adminNavigate, useAdminPath } from './nav';
import { DraftProvider, useDraftClient, useDraftState } from './DraftContext';
import { ProjectsList } from './pages/ProjectsList';
import { ProjectEditor } from './pages/ProjectEditor';
import { SiteEditor, isSiteTab } from './pages/SiteEditor';

export function AdminApp() {
  const [signedIn, setSignedIn] = useState<boolean | null>(null);

  useEffect(() => {
    me().then(setSignedIn, () => setSignedIn(false));
  }, []);

  if (signedIn === null) return <div className="min-h-dvh bg-[var(--color-paper)] dark:bg-[#0A0A0C]" />;
  if (!signedIn) return <Login onSignedIn={() => setSignedIn(true)} />;

  return (
    <DraftProvider>
      <Workspace
        onSignOut={async () => {
          await logout().catch(() => {});
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

  let page = <ProjectsList />;
  const project = /^\/projets\/([a-z0-9-]+)$/.exec(path);
  if (project) page = <ProjectEditor key={project[1]} id={project[1]} query={query} />;
  const siteTab = /^\/site\/([a-z-]+)$/.exec(path)?.[1];
  if (siteTab && isSiteTab(siteTab)) page = <SiteEditor key={siteTab} tab={siteTab} query={query} />;

  return (
    <Shell
      onSignOut={onSignOut}
      status={<SaveIndicator state={state.saveState} onReload={() => void client.load()} />}
      publish={
        <Button variant="primary" disabled={!changes} onClick={() => setPublishing(true)}>
          Publier{changes ? ` · ${changes}` : ''}
        </Button>
      }
    >
      {page}
      {state.saveState === 'signedOut' && <Login overlay onSignedIn={() => void client.resumeAfterLogin()} />}
      <Dialog open={publishing} title="Publier" onClose={() => setPublishing(false)}>
        {publishing && state.loaded && (
          <PublishPanel
            api={{ getPublish, startPublish, resolveConflict }}
            flush={client.flush}
            navigate={(to) => {
              setPublishing(false);
              adminNavigate(to);
            }}
            content={state.content}
            onClose={() => setPublishing(false)}
            onPublished={() => void client.load()}
          />
        )}
      </Dialog>
    </Shell>
  );
}
